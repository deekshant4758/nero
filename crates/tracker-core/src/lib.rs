//! `tracker-core` — pure domain logic for the activity tracker.
//!
//! This crate has zero OS dependencies and zero SQLite dependencies.
//! It must compile on any platform (Linux, macOS, Windows) without
//! platform-specific features. This is enforced by keeping all OS
//! interaction in `tracker-collector` and all persistence in `tracker-db`.
//!
//! # Public API
//!
//! - [`events`] — Event types, the append-only event model
//! - [`session`] — Session reconstruction from raw event streams
//! - [`analytics`] — Aggregation and reporting
//! - [`errors`] — Shared error types

pub mod analytics;
pub mod error;
pub mod events;
pub mod session;

// Re-export the most commonly used types so callers can write
// `use tracker_core::Event` instead of `use tracker_core::events::Event`.
pub use events::{
    Event, EventBuilder, EventError, EventId, EventKind, IdleEndData, IdleStartData,
    SessionId, TimestampMs, TrackerStartData, TrackerStopData, WindowFocusData,
};
pub use session::{
    AppSpan, IdleSpan, SleepSpan, SpanEndReason, TrackerSession,
    aggregate_app_usage, reconstruct_sessions,
};
pub use analytics::{
    AppSummary, DailyReport, TimelineEntry, TimelineKind, WeeklyReport,
    app_summaries, daily_report, format_duration, timeline, weekly_report,
};
pub use error::CoreError;