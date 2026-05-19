//! Analytics engine.
//!
//! Computes structured reports from reconstructed sessions.
//! All computation is pure Rust — no SQL, no OS calls.
//! The DB layer runs queries to fetch events; this module turns those events
//! into insight.
//!
//! Design principle: analytics functions take `&[TrackerSession]` and return
//! simple data structures. The CLI and (future) UI format them for display.

use std::collections::HashMap;

use chrono::{DateTime, Datelike, Duration, NaiveDate, Utc};

use crate::{
    events::TimestampMs,
    session::{AppSpan, TrackerSession},
};

// ── Output types ─────────────────────────────────────────────────────────────

/// Per-app summary for a time period.
#[derive(Debug, Clone)]
pub struct AppSummary {
    pub app_name:      String,
    /// Total active (non-idle) seconds.
    pub active_secs:   u64,
    /// Number of distinct focus spans.
    pub focus_count:   u32,
    /// Longest single focus span, in seconds.
    pub longest_span_secs: u64,
}

/// A daily activity report.
#[derive(Debug, Clone)]
pub struct DailyReport {
    pub date:           NaiveDate,
    /// Total active seconds across all apps.
    pub total_active_secs: u64,
    /// Total idle seconds.
    pub total_idle_secs:   u64,
    /// Total sleep seconds.
    pub total_sleep_secs:  u64,
    /// Per-app breakdown, sorted by active_secs descending.
    pub app_summaries:     Vec<AppSummary>,
    /// Longest uninterrupted focus block (any app), in seconds.
    pub longest_focus_block_secs: u64,
}

/// A weekly aggregate built from daily reports.
#[derive(Debug, Clone)]
pub struct WeeklyReport {
    /// Monday of the week (ISO 8601).
    pub week_start:         NaiveDate,
    pub daily_reports:      Vec<DailyReport>,
    pub total_active_secs:  u64,
    pub total_idle_secs:    u64,
    pub most_used_app:      Option<String>,
    /// Average active hours per day.
    pub avg_daily_active_secs: u64,
}

/// A single entry in a timeline view.
#[derive(Debug, Clone)]
pub struct TimelineEntry {
    pub start_ms:    TimestampMs,
    pub end_ms:      TimestampMs,
    pub kind:        TimelineKind,
    pub label:       String,
}

#[derive(Debug, Clone, PartialEq)]
pub enum TimelineKind {
    Active,
    Idle,
    Sleep,
    TrackerOff, // gap between sessions where tracker wasn't running
}

// ── Core analytics functions ──────────────────────────────────────────────────

/// Compute per-app summaries for a time window.
///
/// Spans are clamped to `[from_ms, to_ms]` before aggregation.
pub fn app_summaries(
    sessions: &[TrackerSession],
    from_ms: TimestampMs,
    to_ms: TimestampMs,
) -> Vec<AppSummary> {
    // (app_name → (total_secs, span_count, longest_span_secs))
    let mut map: HashMap<String, (u64, u32, u64)> = HashMap::new();

    for session in sessions {
        for span in &session.app_spans {
            let clamped = clamp_span(span, from_ms, to_ms);
            if let Some(secs) = clamped {
                if secs == 0 { continue; }
                let entry = map.entry(span.app_name.clone()).or_insert((0, 0, 0));
                entry.0 += secs;
                entry.1 += 1;
                entry.2 = entry.2.max(secs);
            }
        }
    }

    let mut summaries: Vec<AppSummary> = map
        .into_iter()
        .map(|(app_name, (active_secs, focus_count, longest_span_secs))| AppSummary {
            app_name,
            active_secs,
            focus_count,
            longest_span_secs,
        })
        .collect();

    summaries.sort_by(|a, b| b.active_secs.cmp(&a.active_secs));
    summaries
}

/// Build a daily report for a specific calendar date (UTC).
pub fn daily_report(sessions: &[TrackerSession], date: NaiveDate) -> DailyReport {
    let from_ms = date_to_ms(date);
    let to_ms   = date_to_ms(date + Duration::days(1));

    let total_active_secs = sessions
        .iter()
        .flat_map(|s| &s.app_spans)
        .filter_map(|span| clamp_span(span, from_ms, to_ms))
        .sum();

    let total_idle_secs = sessions
        .iter()
        .flat_map(|s| &s.idle_spans)
        .filter_map(|span| {
            clamp_duration(span.start_ms, span.end_ms?, from_ms, to_ms)
        })
        .sum();

    let total_sleep_secs = sessions
        .iter()
        .flat_map(|s| &s.sleep_spans)
        .filter_map(|span| {
            clamp_duration(span.sleep_ms, span.resume_ms?, from_ms, to_ms)
        })
        .sum();

    let longest_focus_block_secs = sessions
        .iter()
        .flat_map(|s| &s.app_spans)
        .filter_map(|span| clamp_span(span, from_ms, to_ms))
        .max()
        .unwrap_or(0);

    DailyReport {
        date,
        total_active_secs,
        total_idle_secs,
        total_sleep_secs,
        app_summaries: app_summaries(sessions, from_ms, to_ms),
        longest_focus_block_secs,
    }
}

/// Build a weekly report starting from the Monday of the week containing `any_day`.
pub fn weekly_report(sessions: &[TrackerSession], any_day: NaiveDate) -> WeeklyReport {
    // Find the Monday of the week.
    let days_from_monday = any_day.weekday().num_days_from_monday();
    let week_start = any_day - Duration::days(days_from_monday as i64);

    let daily_reports: Vec<DailyReport> = (0..7)
        .map(|i| daily_report(sessions, week_start + Duration::days(i)))
        .collect();

    let total_active_secs: u64 = daily_reports.iter().map(|d| d.total_active_secs).sum();
    let total_idle_secs: u64   = daily_reports.iter().map(|d| d.total_idle_secs).sum();

    let avg_daily_active_secs = if daily_reports.is_empty() {
        0
    } else {
        total_active_secs / daily_reports.len() as u64
    };

    // Most-used app across the week.
    let from_ms = date_to_ms(week_start);
    let to_ms   = date_to_ms(week_start + Duration::days(7));
    let most_used_app = app_summaries(sessions, from_ms, to_ms)
        .into_iter()
        .next()
        .map(|s| s.app_name);

    WeeklyReport {
        week_start,
        daily_reports,
        total_active_secs,
        total_idle_secs,
        most_used_app,
        avg_daily_active_secs,
    }
}

/// Build a timeline for a given time window.
///
/// Returns a chronologically sorted list of entries covering the window,
/// including gaps where the tracker wasn't running.
pub fn timeline(
    sessions: &[TrackerSession],
    from_ms: TimestampMs,
    to_ms: TimestampMs,
) -> Vec<TimelineEntry> {
    let mut entries: Vec<TimelineEntry> = Vec::new();

    for session in sessions {
        // Active spans
        for span in &session.app_spans {
            let start = span.start_ms.max(from_ms);
            let end   = span.end_ms.unwrap_or(to_ms).min(to_ms);
            if end <= start { continue; }
            entries.push(TimelineEntry {
                start_ms: start,
                end_ms:   end,
                kind:     TimelineKind::Active,
                label:    span.app_name.clone(),
            });
        }

        // Idle spans
        for span in &session.idle_spans {
            let start = span.start_ms.max(from_ms);
            let end   = span.end_ms.unwrap_or(to_ms).min(to_ms);
            if end <= start { continue; }
            entries.push(TimelineEntry {
                start_ms: start,
                end_ms:   end,
                kind:     TimelineKind::Idle,
                label:    "Idle".into(),
            });
        }

        // Sleep spans
        for span in &session.sleep_spans {
            let start = span.sleep_ms.max(from_ms);
            let end   = span.resume_ms.unwrap_or(to_ms).min(to_ms);
            if end <= start { continue; }
            entries.push(TimelineEntry {
                start_ms: start,
                end_ms:   end,
                kind:     TimelineKind::Sleep,
                label:    "Sleep".into(),
            });
        }
    }

    // Find gaps between sessions within the window and mark them as TrackerOff.
    let mut session_coverage: Vec<(TimestampMs, TimestampMs)> = sessions
        .iter()
        .filter_map(|s| Some((s.start_ms, s.end_ms?)))
        .collect();
    session_coverage.sort_by_key(|(start, _)| *start);

    let mut cursor = from_ms;
    for (session_start, session_end) in &session_coverage {
        let gap_start = cursor.max(from_ms);
        let gap_end   = (*session_start).min(to_ms);
        if gap_end > gap_start {
            entries.push(TimelineEntry {
                start_ms: gap_start,
                end_ms:   gap_end,
                kind:     TimelineKind::TrackerOff,
                label:    "Tracker off".into(),
            });
        }
        cursor = (*session_end).max(cursor);
    }
    // Trailing gap after the last session.
    if cursor < to_ms {
        entries.push(TimelineEntry {
            start_ms: cursor,
            end_ms:   to_ms,
            kind:     TimelineKind::TrackerOff,
            label:    "Tracker off".into(),
        });
    }

    entries.sort_by_key(|e| e.start_ms);
    entries
}

/// Format seconds into a human-readable string: "2h 34m", "45m", "30s".
pub fn format_duration(secs: u64) -> String {
    if secs >= 3600 {
        let h = secs / 3600;
        let m = (secs % 3600) / 60;
        if m == 0 { format!("{}h", h) } else { format!("{}h {}m", h, m) }
    } else if secs >= 60 {
        let m = secs / 60;
        let s = secs % 60;
        if s == 0 { format!("{}m", m) } else { format!("{}m {}s", m, s) }
    } else {
        format!("{}s", secs)
    }
}

/// Format a `TimestampMs` as a UTC `DateTime`.
pub fn ts_to_datetime(ts_ms: TimestampMs) -> Option<DateTime<Utc>> {
    DateTime::from_timestamp_millis(ts_ms)
}

// ── Private helpers ───────────────────────────────────────────────────────────

/// Clamp an AppSpan to a time window and return its duration in seconds.
/// Returns None if the span has no end or doesn't overlap the window.
fn clamp_span(span: &AppSpan, from_ms: TimestampMs, to_ms: TimestampMs) -> Option<u64> {
    let start = span.start_ms.max(from_ms);
    let end   = span.end_ms?.min(to_ms);
    if end <= start { return None; }
    Some(((end - start).max(0) as u64) / 1000)
}

fn clamp_duration(
    start: TimestampMs,
    end: TimestampMs,
    from_ms: TimestampMs,
    to_ms: TimestampMs,
) -> Option<u64> {
    let clamped_start = start.max(from_ms);
    let clamped_end   = end.min(to_ms);
    if clamped_end <= clamped_start { return None; }
    Some(((clamped_end - clamped_start).max(0) as u64) / 1000)
}

fn date_to_ms(date: NaiveDate) -> TimestampMs {
    date.and_hms_opt(0, 0, 0)
        .and_then(|dt| dt.and_local_timezone(Utc).earliest())
        .map(|dt| dt.timestamp_millis())
        .unwrap_or(0)
}

// ── Tests ─────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{
        events::{EventBuilder, EventKind, TrackerStopData, WindowFocusData},
        session::reconstruct_sessions,
    };

    fn focus(app: &str) -> EventKind {
        EventKind::WindowFocus(WindowFocusData {
            app_name:     app.to_string(),
            window_title: format!("{} window", app),
            process_id:   1000,
            exe_path:     None,
        })
    }

    /// Build a simple two-app session starting at a fixed timestamp.
    fn two_app_session(base_ms: i64) -> Vec<TrackerSession> {
        let mut builder = EventBuilder::new("test");
        let events = vec![
            builder.build_at(EventKind::TrackerStart(crate::events::TrackerStartData {
                version: "test".into(),
            }), base_ms),
            builder.build_at(focus("code.exe"), base_ms),
            builder.build_at(focus("chrome.exe"), base_ms + 3600_000), // 1h later
            builder.build_at(EventKind::TrackerStop(TrackerStopData {
                session_duration_secs: 7200,
                event_count: 4,
            }), base_ms + 7200_000), // 2h total
        ];
        reconstruct_sessions(&events)
    }

    #[test]
    fn app_summaries_returns_sorted_by_usage() {
        let base_ms: i64 = 1_700_000_000_000;
        let sessions = two_app_session(base_ms);
        let summaries = app_summaries(&sessions, base_ms, base_ms + 7200_000);

        assert_eq!(summaries.len(), 2);
        // code.exe: 3600s, chrome.exe: 3600s — equal, order may vary
        // but both should be present
        let names: Vec<&str> = summaries.iter().map(|s| s.app_name.as_str()).collect();
        assert!(names.contains(&"code.exe"));
        assert!(names.contains(&"chrome.exe"));
        assert_eq!(summaries[0].active_secs, 3600);
    }

    #[test]
    fn daily_report_sums_correctly() {
        // Pin to a specific date so date arithmetic is deterministic.
        let date = NaiveDate::from_ymd_opt(2024, 1, 15).unwrap();
        let base_ms = date_to_ms(date);
        let sessions = two_app_session(base_ms);
        let report = daily_report(&sessions, date);

        assert_eq!(report.total_active_secs, 7200, "2 hours of active time");
        assert_eq!(report.app_summaries.len(), 2);
    }

    #[test]
    fn format_duration_covers_all_ranges() {
        assert_eq!(format_duration(30),    "30s");
        assert_eq!(format_duration(90),    "1m 30s");
        assert_eq!(format_duration(3600),  "1h");
        assert_eq!(format_duration(3660),  "1h 1m");
        assert_eq!(format_duration(7384),  "2h 3m");
    }

    #[test]
    fn timeline_includes_tracker_off_gaps() {
        let date = NaiveDate::from_ymd_opt(2024, 1, 15).unwrap();
        let base_ms = date_to_ms(date);
        let day_ms  = 86_400_000i64;

        // Session covers only 2 hours of the day.
        let sessions = two_app_session(base_ms + 3600_000); // starts 1h into the day

        let entries = timeline(&sessions, base_ms, base_ms + day_ms);

        let off_entries: Vec<_> = entries.iter().filter(|e| e.kind == TimelineKind::TrackerOff).collect();
        // Should have at least one TrackerOff entry (the first hour of the day).
        assert!(!off_entries.is_empty());
    }
}