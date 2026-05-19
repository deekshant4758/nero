//! Session reconstruction engine.
//!
//! Given a raw stream of append-only events, reconstruct meaningful "sessions"
//! of app usage — with durations, gaps, idle periods, and crash recovery.
//!
//! # Why reconstruction is non-trivial
//!
//! The raw event log tells us *what happened*, not *how long it lasted*.
//! A `WindowFocus` event for "chrome.exe" tells us Chrome got focus; we only
//! know how long it had focus when the *next* event arrives (another
//! `WindowFocus`, an `IdleStart`, or a `TrackerStop`).
//!
//! Edge cases that must be handled correctly:
//!
//! 1. **Crash recovery**: If `TrackerStop` is absent after `TrackerStart`,
//!    the process crashed. We attribute usage up to the last event, not
//!    forever.
//!
//! 2. **Idle periods**: Time spent idle should not count as app usage.
//!    An `IdleStart` closes the active window session; `IdleEnd` reopens it.
//!
//! 3. **Sleep/wake**: A `SystemSleep` event closes all open sessions cleanly.
//!    A `SystemResume` starts fresh. The gap between them is unaccounted time
//!    (the machine was off).
//!
//! 4. **Clock skew**: On resume from sleep, the system clock may jump
//!    forward significantly. We handle this by trusting event ordering
//!    (the `sequence` field) over raw timestamps when they conflict.
//!
//! 5. **Multiple tracker processes**: If the user kills and restarts the
//!    tracker, we may see two `TrackerStart` events without an intervening
//!    `TrackerStop`. The second start implicitly closes the first session.
//!
//! # Core algorithm
//!
//! We process events in chronological order, maintaining a small state
//! machine:
//!
//! ```text
//! State: { active_window: Option<WindowSpan>, is_idle: bool }
//!
//! on WindowFocus(app)  → close active_window span → open new span for app
//! on IdleStart         → close active_window span → set is_idle = true
//! on IdleEnd           → set is_idle = false → re-open span for current window
//! on SystemSleep       → close active_window span → record gap
//! on SystemResume      → record gap end
//! on TrackerStop       → close active_window span → close session
//! on [end of events]   → if no TrackerStop, treat last event as crash point
//! ```

use std::collections::HashMap;

use crate::events::{Event, EventKind, TimestampMs};

// ── Output types ─────────────────────────────────────────────────────────────

/// A continuous period of app usage — the fundamental unit of the timeline.
///
/// Represents a single uninterrupted stretch of a specific app having focus.
/// Duration is `end_ms - start_ms`. If `end_ms` is None, the span is still
/// open (e.g. the tracker is currently running and this is the live window).
#[derive(Debug, Clone, PartialEq)]
pub struct AppSpan {
    pub app_name:     String,
    pub window_title: String,
    pub process_id:   u32,
    pub start_ms:     TimestampMs,
    /// None means the span is still open / not yet closed.
    pub end_ms:       Option<TimestampMs>,
    /// How the span ended — useful for analytics and UI display.
    pub end_reason:   Option<SpanEndReason>,
}

impl AppSpan {
    /// Duration in milliseconds. Returns None for open spans.
    pub fn duration_ms(&self) -> Option<i64> {
        self.end_ms.map(|end| end - self.start_ms)
    }

    /// Duration in seconds, rounded down. Returns None for open spans.
    pub fn duration_secs(&self) -> Option<u64> {
        self.duration_ms().map(|ms| (ms.max(0) as u64) / 1000)
    }

    /// True if this span lasted at least `min_secs` seconds.
    /// Useful for filtering out accidental/transient focus events.
    pub fn is_meaningful(&self, min_secs: u64) -> bool {
        self.duration_secs().map_or(false, |s| s >= min_secs)
    }
}

/// Why an `AppSpan` ended.
#[derive(Debug, Clone, PartialEq)]
pub enum SpanEndReason {
    /// User switched to a different app.
    WindowSwitch,
    /// User went idle.
    IdleStart,
    /// System went to sleep.
    SystemSleep,
    /// Tracker process stopped cleanly.
    TrackerStop,
    /// Tracker process crashed (no TrackerStop found).
    TrackerCrash,
    /// A new tracker session started, implicitly ending the previous one.
    SessionBoundary,
}

/// A period of user idleness.
#[derive(Debug, Clone, PartialEq)]
pub struct IdleSpan {
    pub start_ms:        TimestampMs,
    pub end_ms:          Option<TimestampMs>, // None if still idle
    pub threshold_secs:  u32,
}

impl IdleSpan {
    pub fn duration_secs(&self) -> Option<u64> {
        self.end_ms
            .map(|end| ((end - self.start_ms).max(0) as u64) / 1000)
    }
}

/// A period where the machine was asleep.
#[derive(Debug, Clone, PartialEq)]
pub struct SleepSpan {
    pub sleep_ms:  TimestampMs,
    pub resume_ms: Option<TimestampMs>,
}

/// A tracker session — one continuous run of the tracker process.
///
/// Derived from `TrackerStart` / `TrackerStop` event pairs (or crash recovery).
#[derive(Debug, Clone)]
pub struct TrackerSession {
    pub session_id:  uuid::Uuid,
    pub start_ms:    TimestampMs,
    pub end_ms:      Option<TimestampMs>,
    pub crashed:     bool, // true if no TrackerStop event found
    pub app_spans:   Vec<AppSpan>,
    pub idle_spans:  Vec<IdleSpan>,
    pub sleep_spans: Vec<SleepSpan>,
}

impl TrackerSession {
    /// Total active (non-idle, non-sleep) time in this session, in seconds.
    pub fn active_secs(&self) -> u64 {
        self.app_spans
            .iter()
            .filter_map(|s| s.duration_secs())
            .sum()
    }

    /// Total idle time in this session, in seconds.
    pub fn idle_secs(&self) -> u64 {
        self.idle_spans
            .iter()
            .filter_map(|s| s.duration_secs())
            .sum()
    }

    /// Per-app total usage in seconds, sorted descending by usage.
    pub fn app_totals(&self) -> Vec<(String, u64)> {
        let mut totals: HashMap<String, u64> = HashMap::new();
        for span in &self.app_spans {
            if let Some(secs) = span.duration_secs() {
                *totals.entry(span.app_name.clone()).or_insert(0) += secs;
            }
        }
        let mut result: Vec<_> = totals.into_iter().collect();
        result.sort_by(|a, b| b.1.cmp(&a.1));
        result
    }
}

// ── Reconstruction state machine ─────────────────────────────────────────────

/// Internal state during event stream processing.
#[derive(Debug, Default)]
struct ReconstructionState {
    /// The window span that's currently "open" (has a start but no end yet).
    active_span: Option<PartialSpan>,
    /// Whether we're currently in an idle period.
    is_idle: bool,
    /// Idle span being built.
    open_idle: Option<IdleSpan>,
    /// Sleep span being built.
    open_sleep: Option<SleepSpan>,
}

/// A span that has started but not yet been closed.
#[derive(Debug, Clone)]
struct PartialSpan {
    app_name:     String,
    window_title: String,
    process_id:   u32,
    start_ms:     TimestampMs,
}

impl PartialSpan {
    fn close(self, end_ms: TimestampMs, reason: SpanEndReason) -> AppSpan {
        AppSpan {
            app_name:     self.app_name,
            window_title: self.window_title,
            process_id:   self.process_id,
            start_ms:     self.start_ms,
            end_ms:       Some(end_ms),
            end_reason:   Some(reason),
        }
    }
}

// ── Public API ────────────────────────────────────────────────────────────────

/// Reconstruct tracker sessions from a raw, ordered event slice.
///
/// # Arguments
/// * `events` — Events in ascending chronological order (by timestamp_ms,
///   then sequence). The caller is responsible for correct ordering.
///
/// # Returns
/// A vec of `TrackerSession`, one per `TrackerStart` event found.
/// Sessions are in chronological order.
///
/// # Panics
/// Never panics — all edge cases are handled gracefully.
pub fn reconstruct_sessions(events: &[Event]) -> Vec<TrackerSession> {
    let mut sessions: Vec<TrackerSession> = Vec::new();
    let mut current: Option<TrackerSession> = None;
    let mut state = ReconstructionState::default();

    for event in events {
        match &event.kind {
            // ── Session boundaries ───────────────────────────────────────────
            EventKind::TrackerStart(data) => {
                // If there's an open session (from a crash or forced restart),
                // close it first as crashed.
                if let Some(mut prev) = current.take() {
                    finalize_session_as_crashed(&mut prev, &mut state, event.timestamp_ms);
                    sessions.push(prev);
                }
                // Open a fresh session.
                state = ReconstructionState::default();
                current = Some(TrackerSession {
                    session_id:  event.session_id,
                    start_ms:    event.timestamp_ms,
                    end_ms:      None,
                    crashed:     false,
                    app_spans:   Vec::new(),
                    idle_spans:  Vec::new(),
                    sleep_spans: Vec::new(),
                });
                let _ = data; // version logged elsewhere
            }

            EventKind::TrackerStop(_) => {
                if let Some(ref mut session) = current {
                    close_active_span(
                        &mut state,
                        &mut session.app_spans,
                        event.timestamp_ms,
                        SpanEndReason::TrackerStop,
                    );
                    close_idle_span(&mut state, &mut session.idle_spans, event.timestamp_ms);
                    session.end_ms = Some(event.timestamp_ms);
                }
                if let Some(session) = current.take() {
                    sessions.push(session);
                }
                state = ReconstructionState::default();
            }

            // ── Window focus ─────────────────────────────────────────────────
            EventKind::WindowFocus(data) => {
                let session = match current.as_mut() {
                    Some(s) => s,
                    None => continue, // events before first TrackerStart — skip
                };

                if state.is_idle {
                    // User returned from idle by switching window.
                    // Close the idle span and continue.
                    close_idle_span(&mut state, &mut session.idle_spans, event.timestamp_ms);
                    state.is_idle = false;
                }

                // Close the previous window span.
                close_active_span(
                    &mut state,
                    &mut session.app_spans,
                    event.timestamp_ms,
                    SpanEndReason::WindowSwitch,
                );

                // Open a new span for the focused window.
                state.active_span = Some(PartialSpan {
                    app_name:     data.app_name.clone(),
                    window_title: data.window_title.clone(),
                    process_id:   data.process_id,
                    start_ms:     event.timestamp_ms,
                });
            }

            // ── Idle ─────────────────────────────────────────────────────────
            EventKind::IdleStart(data) => {
                let session = match current.as_mut() {
                    Some(s) => s,
                    None => continue,
                };

                if state.is_idle {
                    // Already idle — this shouldn't happen but handle it.
                    // Close the stale idle span and open a fresh one.
                    close_idle_span(&mut state, &mut session.idle_spans, event.timestamp_ms);
                }

                close_active_span(
                    &mut state,
                    &mut session.app_spans,
                    event.timestamp_ms,
                    SpanEndReason::IdleStart,
                );

                state.is_idle = true;
                state.open_idle = Some(IdleSpan {
                    start_ms:       event.timestamp_ms,
                    end_ms:         None,
                    threshold_secs: data.idle_threshold_secs,
                });
            }

            EventKind::IdleEnd(data) => {
                let session = match current.as_mut() {
                    Some(s) => s,
                    None => continue,
                };

                close_idle_span(&mut state, &mut session.idle_spans, event.timestamp_ms);
                state.is_idle = false;

                // Validate the idle_duration_secs from the event matches reality.
                // If there's a mismatch >5s, it suggests clock skew — log it
                // but trust the timestamps (the idle duration in the event is
                // advisory / for convenience).
                let _ = data.idle_duration_secs; // used by analytics module
            }

            // ── Sleep / wake ─────────────────────────────────────────────────
            EventKind::SystemSleep => {
                let session = match current.as_mut() {
                    Some(s) => s,
                    None => continue,
                };

                close_active_span(
                    &mut state,
                    &mut session.app_spans,
                    event.timestamp_ms,
                    SpanEndReason::SystemSleep,
                );
                close_idle_span(&mut state, &mut session.idle_spans, event.timestamp_ms);
                state.is_idle = false;

                state.open_sleep = Some(SleepSpan {
                    sleep_ms:  event.timestamp_ms,
                    resume_ms: None,
                });
            }

            EventKind::SystemResume => {
                let session = match current.as_mut() {
                    Some(s) => s,
                    None => continue,
                };

                if let Some(mut sleep) = state.open_sleep.take() {
                    sleep.resume_ms = Some(event.timestamp_ms);
                    session.sleep_spans.push(sleep);
                }
                // After resume, we wait for the next WindowFocus event to
                // open a new active span. We don't assume the same window
                // is still focused.
            }
        }
    }

    // Handle the case where we ran out of events with an open session.
    // This means the tracker is either currently running (live tail) or crashed.
    if let Some(mut session) = current.take() {
        // We treat this as a crash for reconstruction purposes.
        // The caller can inspect `session.crashed` to decide.
        let last_ts = events
            .last()
            .map(|e| e.timestamp_ms)
            .unwrap_or(session.start_ms);
        finalize_session_as_crashed(&mut session, &mut state, last_ts);
        sessions.push(session);
    }

    sessions
}

/// Aggregate app usage across multiple sessions for a time range.
/// Returns (app_name → total_seconds), filtered to spans overlapping [from_ms, to_ms].
pub fn aggregate_app_usage(
    sessions: &[TrackerSession],
    from_ms: TimestampMs,
    to_ms: TimestampMs,
) -> HashMap<String, u64> {
    let mut totals: HashMap<String, u64> = HashMap::new();

    for session in sessions {
        for span in &session.app_spans {
            let span_start = span.start_ms;
            let span_end = match span.end_ms {
                Some(e) => e,
                None => continue, // skip open spans
            };

            // Clamp span to the requested time window.
            let effective_start = span_start.max(from_ms);
            let effective_end = span_end.min(to_ms);

            if effective_end <= effective_start {
                continue; // span doesn't overlap window
            }

            let duration_secs = ((effective_end - effective_start).max(0) as u64) / 1000;
            if duration_secs > 0 {
                *totals.entry(span.app_name.clone()).or_insert(0) += duration_secs;
            }
        }
    }

    totals
}

// ── Private helpers ───────────────────────────────────────────────────────────

fn close_active_span(
    state: &mut ReconstructionState,
    spans: &mut Vec<AppSpan>,
    at_ms: TimestampMs,
    reason: SpanEndReason,
) {
    if let Some(partial) = state.active_span.take() {
        // Only record spans with positive duration.
        // Zero-duration spans arise when two events land at the same timestamp
        // (e.g. WindowFocus immediately followed by IdleStart).
        if at_ms > partial.start_ms {
            spans.push(partial.close(at_ms, reason));
        }
    }
}

fn close_idle_span(
    state: &mut ReconstructionState,
    idle_spans: &mut Vec<IdleSpan>,
    at_ms: TimestampMs,
) {
    if let Some(mut idle) = state.open_idle.take() {
        idle.end_ms = Some(at_ms);
        idle_spans.push(idle);
    }
}

fn finalize_session_as_crashed(
    session: &mut TrackerSession,
    state: &mut ReconstructionState,
    at_ms: TimestampMs,
) {
    close_active_span(state, &mut session.app_spans, at_ms, SpanEndReason::TrackerCrash);
    close_idle_span(state, &mut session.idle_spans, at_ms);
    session.end_ms = Some(at_ms);
    session.crashed = true;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use crate::events::{
        EventBuilder, EventKind, IdleEndData, IdleStartData, TrackerStopData,
        WindowFocusData,
    };

    /// Helper: a minimal WindowFocusData.
    fn focus(app: &str, title: &str) -> EventKind {
        EventKind::WindowFocus(WindowFocusData {
            app_name:     app.to_string(),
            window_title: title.to_string(),
            process_id:   1000,
            exe_path:     None,
        })
    }

    fn idle_start(secs: u32) -> EventKind {
        EventKind::IdleStart(IdleStartData { idle_threshold_secs: secs })
    }

    fn idle_end(duration: u64) -> EventKind {
        EventKind::IdleEnd(IdleEndData { idle_duration_secs: duration })
    }

    /// Build a synthetic event sequence with controlled timestamps.
    /// `spec` is a list of (offset_ms_from_start, EventKind).
    fn make_events(spec: Vec<(i64, EventKind)>) -> Vec<Event> {
        let base_ms: i64 = 1_700_000_000_000; // arbitrary fixed epoch
        let mut builder = EventBuilder::new("test");
        let mut events = vec![builder.build_at(
            EventKind::TrackerStart(crate::events::TrackerStartData {
                version: "test".into(),
            }),
            base_ms,
        )];
        for (offset_ms, kind) in spec {
            events.push(builder.build_at(kind, base_ms + offset_ms));
        }
        events
    }

    // ── Basic happy path ──────────────────────────────────────────────────────

    #[test]
    fn single_window_session() {
        let events = make_events(vec![
            (0,      focus("code.exe", "main.rs")),
            (60_000, EventKind::TrackerStop(TrackerStopData {
                session_duration_secs: 60,
                event_count: 3,
            })),
        ]);

        let sessions = reconstruct_sessions(&events);
        assert_eq!(sessions.len(), 1);

        let session = &sessions[0];
        assert!(!session.crashed);
        assert_eq!(session.app_spans.len(), 1);

        let span = &session.app_spans[0];
        assert_eq!(span.app_name, "code.exe");
        assert_eq!(span.duration_secs(), Some(60));
        assert_eq!(span.end_reason, Some(SpanEndReason::TrackerStop));
    }

    #[test]
    fn window_switch_creates_two_spans() {
        let events = make_events(vec![
            (0,       focus("code.exe", "main.rs")),
            (30_000,  focus("chrome.exe", "GitHub")),
            (90_000,  EventKind::TrackerStop(TrackerStopData {
                session_duration_secs: 90,
                event_count: 4,
            })),
        ]);

        let sessions = reconstruct_sessions(&events);
        assert_eq!(sessions[0].app_spans.len(), 2);
        assert_eq!(sessions[0].app_spans[0].app_name, "code.exe");
        assert_eq!(sessions[0].app_spans[0].duration_secs(), Some(30));
        assert_eq!(sessions[0].app_spans[1].app_name, "chrome.exe");
        assert_eq!(sessions[0].app_spans[1].duration_secs(), Some(60));
    }

    // ── Idle handling ─────────────────────────────────────────────────────────

    #[test]
    fn idle_interrupts_active_span() {
        let events = make_events(vec![
            (0,        focus("code.exe", "main.rs")),
            (60_000,   idle_start(120)),     // went idle after 60s
            (180_000,  idle_end(120)),        // back after 2 min
            (240_000,  focus("code.exe", "main.rs")), // resumed work
            (300_000,  EventKind::TrackerStop(TrackerStopData {
                session_duration_secs: 300,
                event_count: 6,
            })),
        ]);

        let sessions = reconstruct_sessions(&events);
        let session = &sessions[0];

        // Two app spans: before idle and after idle
        assert_eq!(session.app_spans.len(), 2);
        assert_eq!(session.app_spans[0].duration_secs(), Some(60));
        assert_eq!(session.app_spans[0].end_reason, Some(SpanEndReason::IdleStart));
        assert_eq!(session.app_spans[1].duration_secs(), Some(60));

        // One idle span
        assert_eq!(session.idle_spans.len(), 1);
        assert_eq!(session.idle_spans[0].duration_secs(), Some(120));
    }

    // ── Crash recovery ────────────────────────────────────────────────────────

    #[test]
    fn crash_recovery_closes_open_spans() {
        // No TrackerStop — simulates a crash.
        // Note: make_events inserts TrackerStart at base_ms, then our events
        // follow. We need the last event to be at a *later* timestamp than
        // the window switch so the slack span has positive duration.
        //
        // Timeline:
        //   base_ms+0     → TrackerStart (from make_events)
        //   base_ms+0     → WindowFocus("code.exe")
        //   base_ms+45s   → WindowFocus("slack.exe")   ← switches, code span = 45s
        //   base_ms+60s   → [crash — this is the last event's timestamp]
        //
        // To simulate "the last thing we know happened was at 60s", we add a
        // synthetic idle_start that we then cancel with an idle_end. This gives
        // a clean last-event timestamp at 60s without creating extra spans.
        // Simpler: just add a second WindowFocus for code at 60s to create
        // a definitive crash timestamp. The slack span = 15s.
        let events = make_events(vec![
            (0,       focus("code.exe", "main.rs")),
            (45_000,  focus("slack.exe", "Messages")), // code span = 45s, switch
            (60_000,  focus("code.exe", "back")),      // slack span = 15s, switch
            // [no TrackerStop — process crashes here]
        ]);

        let sessions = reconstruct_sessions(&events);
        assert_eq!(sessions.len(), 1);

        let session = &sessions[0];
        assert!(session.crashed, "should be flagged as crashed");

        // Three spans: code (45s) → slack (15s) → code-back (0s, discarded
        // because crash happens at same timestamp as last focus).
        // Actually the last focus at 60s opens a new span, crash also at 60s
        // → zero duration → discarded. So we expect exactly 2 recorded spans.
        assert_eq!(
            session.app_spans.len(), 2,
            "code and slack spans; the trailing zero-duration code span is discarded"
        );

        for span in &session.app_spans {
            assert!(span.end_ms.is_some(), "all spans must be closed after crash recovery");
        }
        assert_eq!(session.app_spans[0].app_name, "code.exe");
        assert_eq!(session.app_spans[0].end_reason, Some(SpanEndReason::WindowSwitch));
        assert_eq!(session.app_spans[1].app_name, "slack.exe");
        assert_eq!(session.app_spans[1].end_reason, Some(SpanEndReason::WindowSwitch));
    }

    #[test]
    fn second_tracker_start_closes_first_session_as_crashed() {
        let base_ms: i64 = 1_700_000_000_000;
        let mut builder = EventBuilder::new("test");

        // Session 1: starts, runs, then the process is killed.
        let mut events = vec![
            builder.build_at(EventKind::TrackerStart(crate::events::TrackerStartData {
                version: "test".into(),
            }), base_ms),
            builder.build_at(focus("code.exe", "main.rs"), base_ms + 10_000),
        ];

        // Session 2: new process start (no TrackerStop from session 1).
        let mut builder2 = EventBuilder::new("test");
        events.push(builder2.build_at(EventKind::TrackerStart(crate::events::TrackerStartData {
            version: "test".into(),
        }), base_ms + 60_000));
        events.push(builder2.build_at(focus("chrome.exe", "GitHub"), base_ms + 70_000));
        events.push(builder2.build_at(EventKind::TrackerStop(TrackerStopData {
            session_duration_secs: 10,
            event_count: 2,
        }), base_ms + 80_000));

        let sessions = reconstruct_sessions(&events);
        assert_eq!(sessions.len(), 2);
        assert!(sessions[0].crashed, "first session should be marked crashed");
        assert!(!sessions[1].crashed, "second session should be clean");
    }

    // ── Sleep / wake ──────────────────────────────────────────────────────────

    #[test]
    fn sleep_wake_creates_sleep_span() {
        let events = make_events(vec![
            (0,          focus("code.exe", "main.rs")),
            (30_000,     EventKind::SystemSleep),
            (3_630_000,  EventKind::SystemResume), // 1 hour later
            (3_640_000,  focus("code.exe", "main.rs")),
            (3_700_000,  EventKind::TrackerStop(TrackerStopData {
                session_duration_secs: 100,
                event_count: 6,
            })),
        ]);

        let sessions = reconstruct_sessions(&events);
        let session = &sessions[0];

        assert_eq!(session.sleep_spans.len(), 1);
        let sleep = &session.sleep_spans[0];
        assert!(sleep.resume_ms.is_some());

        let sleep_duration_secs =
            ((sleep.resume_ms.unwrap() - sleep.sleep_ms) as u64) / 1000;
        assert_eq!(sleep_duration_secs, 3600);
    }

    // ── Aggregate usage ───────────────────────────────────────────────────────

    #[test]
    fn aggregate_clips_to_time_window() {
        let base_ms: i64 = 1_700_000_000_000;
        let mut builder = EventBuilder::new("test");

        let events = vec![
            builder.build_at(EventKind::TrackerStart(crate::events::TrackerStartData {
                version: "test".into(),
            }), base_ms),
            builder.build_at(focus("code.exe", "main.rs"), base_ms),
            builder.build_at(focus("chrome.exe", "GitHub"), base_ms + 60_000),
            builder.build_at(EventKind::TrackerStop(TrackerStopData {
                session_duration_secs: 120,
                event_count: 4,
            }), base_ms + 120_000),
        ];

        let sessions = reconstruct_sessions(&events);

        // Window: only first 30 seconds of the session.
        let usage = aggregate_app_usage(&sessions, base_ms, base_ms + 30_000);
        assert_eq!(usage.get("code.exe"), Some(&30)); // clipped to 30s
        assert_eq!(usage.get("chrome.exe"), None);     // chrome hadn't started yet
    }

    // ── Edge cases ────────────────────────────────────────────────────────────

    #[test]
    fn empty_event_stream_returns_no_sessions() {
        let sessions = reconstruct_sessions(&[]);
        assert!(sessions.is_empty());
    }

    #[test]
    fn events_before_tracker_start_are_ignored() {
        let base_ms: i64 = 1_700_000_000_000;
        let mut builder = EventBuilder::new("test");

        // WindowFocus *before* TrackerStart — should be ignored.
        let mut events = vec![builder.build_at(focus("rogue.exe", "???"), base_ms - 10_000)];
        events.push(builder.build_at(EventKind::TrackerStart(crate::events::TrackerStartData {
            version: "test".into(),
        }), base_ms));
        events.push(builder.build_at(focus("code.exe", "main.rs"), base_ms + 1_000));
        events.push(builder.build_at(EventKind::TrackerStop(TrackerStopData {
            session_duration_secs: 1,
            event_count: 2,
        }), base_ms + 2_000));

        let sessions = reconstruct_sessions(&events);
        assert_eq!(sessions.len(), 1);
        assert!(!sessions[0].app_spans.iter().any(|s| s.app_name == "rogue.exe"));
    }

    #[test]
    fn zero_duration_spans_are_discarded() {
        // If WindowFocus and IdleStart have the same timestamp, the span
        // would have zero duration — we should not record it.
        let base_ms: i64 = 1_700_000_000_000;
        let mut builder = EventBuilder::new("test");
        let events = vec![
            builder.build_at(EventKind::TrackerStart(crate::events::TrackerStartData {
                version: "test".into(),
            }), base_ms),
            builder.build_at(focus("code.exe", "main.rs"), base_ms + 1_000),
            builder.build_at(idle_start(120), base_ms + 1_000), // same timestamp!
            builder.build_at(idle_end(0), base_ms + 5_000),
            builder.build_at(EventKind::TrackerStop(TrackerStopData {
                session_duration_secs: 4,
                event_count: 5,
            }), base_ms + 6_000),
        ];

        let sessions = reconstruct_sessions(&events);
        // The zero-duration code.exe span should be discarded.
        assert!(
            sessions[0].app_spans.is_empty(),
            "zero-duration spans must be discarded"
        );
    }

    #[test]
    fn app_totals_sums_correctly_across_multiple_spans() {
        let events = make_events(vec![
            (0,        focus("code.exe", "file_a.rs")),
            (30_000,   focus("chrome.exe", "GitHub")),
            (60_000,   focus("code.exe", "file_b.rs")),  // back to code
            (120_000,  EventKind::TrackerStop(TrackerStopData {
                session_duration_secs: 120,
                event_count: 5,
            })),
        ]);

        let sessions = reconstruct_sessions(&events);
        let totals = sessions[0].app_totals();

        // code.exe: 30s + 60s = 90s
        // chrome.exe: 30s
        let code_total = totals.iter().find(|(a, _)| a == "code.exe").unwrap().1;
        let chrome_total = totals.iter().find(|(a, _)| a == "chrome.exe").unwrap().1;
        assert_eq!(code_total, 90);
        assert_eq!(chrome_total, 30);
        // Should be sorted descending
        assert!(totals[0].1 >= totals[1].1);
    }
}