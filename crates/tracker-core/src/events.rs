//! Event types for the activity tracker.
//!
//! This module is the single source of truth for what an "event" means in this
//! system. Every other crate — collection, persistence, analytics — works with
//! these types. Change here carefully: the serialized form lands in SQLite and
//! must remain deserializable for the lifetime of the user's data.
//!
//! # Append-Only Invariant
//!
//! Events are NEVER mutated or deleted after creation. If a correction is needed,
//! a new corrective event is appended. This gives us:
//! - A complete audit trail
//! - Safe concurrent reads at any time
//! - Simple crash recovery (replay from last known good state)
//! - No UPDATE or DELETE SQL paths to reason about

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

// ── Type aliases ────────────────────────────────────────────────────────────

/// Database row ID. Assigned by SQLite on insert; 0 means "not yet persisted".
/// i64 matches SQLite's INTEGER PRIMARY KEY AUTOINCREMENT affinity exactly.
pub type EventId = i64;

/// Unix time in milliseconds, UTC.
///
/// Why milliseconds and not microseconds or nanoseconds?
/// - Windows `GetSystemTimeAsFileTime` has ~100ns resolution in theory but
///   ~15.6ms in practice unless `timeBeginPeriod(1)` is called (which we
///   deliberately avoid — it raises CPU clock rate and hurts battery life).
/// - Microseconds would give false precision.
/// - Milliseconds are sufficient for all analytics queries we need.
/// - Smaller values → smaller SQLite B-tree keys → faster range scans.
pub type TimestampMs = i64;

/// Session ID — a UUID generated once per tracker process run.
///
/// Every event carries the session_id of the process that emitted it.
/// This lets session reconstruction ask: "which events came from the same
/// continuous run?" If there's a TrackerStart without a matching TrackerStop,
/// we know the process crashed between those events.
pub type SessionId = Uuid;

// ── Event kind discriminants ─────────────────────────────────────────────────

/// The variant payload of an event.
///
/// Serialization strategy: serde tagged enum with `kind` as the tag field.
/// The `kind` string lands in its own SQLite column so we can
/// `WHERE kind = 'window_focus'` without parsing JSON.
///
/// ```json
/// { "kind": "window_focus", "app_name": "chrome.exe", ... }
/// ```
///
/// Adding new variants is backward compatible (old readers ignore unknown
/// `kind` values gracefully via the `#[serde(other)]` pattern if needed).
/// Removing or renaming variants is a BREAKING CHANGE — never do it without
/// a migration plan.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum EventKind {
    /// The OS focus moved to a different window or app.
    /// Emitted only on *change* — not on every poll tick.
    WindowFocus(WindowFocusData),

    /// The user has been idle (no keyboard/mouse input) for at least
    /// `idle_threshold_secs` seconds.
    IdleStart(IdleStartData),

    /// The user returned from idle. Always paired with a preceding IdleStart.
    IdleEnd(IdleEndData),

    /// The system is about to sleep / hibernate.
    /// Emitted as early as possible before the kernel suspends.
    SystemSleep,

    /// The system resumed from sleep / hibernate.
    SystemResume,

    /// Emitted as the very first event when the tracker process starts.
    /// Acts as a "session open" marker. Lets analytics detect gaps between
    /// sessions and flag them as "tracker was not running".
    TrackerStart(TrackerStartData),

    /// Emitted as the very last event on clean shutdown.
    /// If this is absent after a TrackerStart, the process crashed.
    TrackerStop(TrackerStopData),
}

impl EventKind {
    /// Returns the string discriminant used in the SQLite `kind` column.
    /// Must match the serde `rename_all = "snake_case"` output exactly.
    pub fn kind_str(&self) -> &'static str {
        match self {
            EventKind::WindowFocus(_)  => "window_focus",
            EventKind::IdleStart(_)    => "idle_start",
            EventKind::IdleEnd(_)      => "idle_end",
            EventKind::SystemSleep     => "system_sleep",
            EventKind::SystemResume    => "system_resume",
            EventKind::TrackerStart(_) => "tracker_start",
            EventKind::TrackerStop(_)  => "tracker_stop",
        }
    }
}

// ── Variant payloads ─────────────────────────────────────────────────────────

/// Data for a window focus change event.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct WindowFocusData {
    /// Executable name, e.g. `"chrome.exe"` or `"code.exe"`.
    /// Normalized to lowercase for consistent grouping.
    pub app_name: String,

    /// The window title at the moment of focus.
    /// May change rapidly (e.g. browser tab changes) — we capture it once
    /// at focus time. Future browser extension integration will provide
    /// richer URL/tab data.
    pub window_title: String,

    /// OS process ID. Useful for disambiguating multiple instances of the
    /// same app (e.g. two Terminal windows).
    pub process_id: u32,

    /// Full path to the executable, e.g. `C:\Program Files\...`.
    /// `None` if the OS denied access or the process exited before we queried.
    /// Best-effort — never required for core functionality.
    pub exe_path: Option<String>,
}

/// Data for an idle-start event.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct IdleStartData {
    /// The configured idle threshold that was breached to emit this event.
    /// Stored per-event so that analytics remain correct even if the user
    /// changes their threshold setting over time.
    pub idle_threshold_secs: u32,
}

/// Data for an idle-end event.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct IdleEndData {
    /// How long the idle period lasted, in seconds.
    /// Derived at emit time from (idle_end_timestamp - idle_start_timestamp).
    /// Stored redundantly for analytics convenience — avoids a JOIN on every
    /// "total idle time" query.
    pub idle_duration_secs: u64,
}

/// Data for a tracker-start event.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TrackerStartData {
    /// Tracker binary version. Useful for debugging schema/behavior changes.
    pub version: String,
}

/// Data for a tracker-stop event.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TrackerStopData {
    /// How long this session ran, in seconds.
    pub session_duration_secs: u64,

    /// How many events were emitted in this session.
    pub event_count: u64,
}

// ── Event envelope ───────────────────────────────────────────────────────────

/// The complete event record — what gets stored in SQLite row by row.
///
/// The envelope wraps the variant payload with metadata that every event
/// shares. Think of `EventKind` as the "what" and `Event` as the "what +
/// when + who + which session".
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Event {
    /// Assigned by the database on insert. Zero means "not yet persisted".
    /// Never use this field before the event is written to SQLite.
    pub id: EventId,

    /// When this event occurred, in UTC milliseconds since Unix epoch.
    /// Set by the collector at the moment of detection — not at write time.
    pub timestamp_ms: TimestampMs,

    /// Monotonically increasing counter within a session.
    /// Disambiguates events with identical timestamps (Windows clock
    /// granularity is coarse; two events can have the same ms timestamp).
    /// Also lets us detect missing events in a sequence.
    pub sequence: u64,

    /// Which tracker process run emitted this event.
    pub session_id: SessionId,

    /// The event payload — what actually happened.
    pub kind: EventKind,
}

impl Event {
    /// Convenience: the `kind` string for this event (for the SQLite column).
    pub fn kind_str(&self) -> &'static str {
        self.kind.kind_str()
    }

    /// Convenience: interpret `timestamp_ms` as a `DateTime<Utc>`.
    /// Returns `None` if the timestamp is out of range (shouldn't happen
    /// in practice but we handle it gracefully).
    pub fn timestamp(&self) -> Option<DateTime<Utc>> {
        DateTime::from_timestamp_millis(self.timestamp_ms)
    }

    /// Returns true if this event marks a session boundary (start or stop).
    pub fn is_session_boundary(&self) -> bool {
        matches!(
            self.kind,
            EventKind::TrackerStart(_) | EventKind::TrackerStop(_)
        )
    }

    /// Returns true if this is an "interruption" event — something that
    /// breaks active work time. Used by session reconstruction.
    pub fn is_interruption(&self) -> bool {
        matches!(
            self.kind,
            EventKind::IdleStart(_) | EventKind::SystemSleep
        )
    }
}

// ── Builder ──────────────────────────────────────────────────────────────────

/// Builds events with a consistent session context.
///
/// The collector creates one `EventBuilder` per process run and uses it to
/// stamp every emitted event with the session_id and an auto-incrementing
/// sequence counter. This keeps all that bookkeeping in one place.
///
/// ```rust
/// use tracker_core::events::{EventBuilder, EventKind, WindowFocusData};
///
/// let mut builder = EventBuilder::new("0.1.0");
/// let event = builder.build(
///     EventKind::WindowFocus(WindowFocusData {
///         app_name: "code.exe".into(),
///         window_title: "main.rs — tracker".into(),
///         process_id: 1234,
///         exe_path: None,
///     })
/// );
/// assert_eq!(event.sequence, 0);
/// ```
pub struct EventBuilder {
    session_id: SessionId,
    sequence:   u64,
    version:    String,
}

impl EventBuilder {
    /// Create a new builder. Generates a fresh session UUID.
    pub fn new(version: impl Into<String>) -> Self {
        Self {
            session_id: Uuid::new_v4(),
            sequence:   0,
            version:    version.into(),
        }
    }

    /// The session ID assigned to all events from this builder.
    pub fn session_id(&self) -> SessionId {
        self.session_id
    }

    /// Stamp a `TrackerStart` event. Call this once at process startup,
    /// before any other events.
    pub fn tracker_start_event(&mut self) -> Event {
        self.build(EventKind::TrackerStart(TrackerStartData {
            version: self.version.clone(),
        }))
    }

    /// Stamp a `TrackerStop` event. Call this once on clean shutdown,
    /// after all other events have been flushed.
    pub fn tracker_stop_event(&mut self, session_duration_secs: u64, event_count: u64) -> Event {
        self.build(EventKind::TrackerStop(TrackerStopData {
            session_duration_secs,
            event_count,
        }))
    }

    /// Build an event with the current session context.
    /// Timestamps to now (UTC). Increments the sequence counter.
    pub fn build(&mut self, kind: EventKind) -> Event {
        let event = Event {
            id:           0, // assigned by DB
            timestamp_ms: Utc::now().timestamp_millis(),
            sequence:     self.sequence,
            session_id:   self.session_id,
            kind,
        };
        self.sequence += 1;
        event
    }

    /// Build an event with an explicit timestamp (for testing or replay).
    pub fn build_at(&mut self, kind: EventKind, timestamp_ms: TimestampMs) -> Event {
        let event = Event {
            id:           0,
            timestamp_ms,
            sequence:     self.sequence,
            session_id:   self.session_id,
            kind,
        };
        self.sequence += 1;
        event
    }
}

// ── Error types ──────────────────────────────────────────────────────────────

/// Errors that can arise when working with events.
#[derive(Debug, thiserror::Error)]
pub enum EventError {
    #[error("JSON serialization failed: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("Invalid timestamp: {0}")]
    InvalidTimestamp(TimestampMs),
}