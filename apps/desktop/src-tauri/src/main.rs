//! Tauri backend — bridges tracker-core/db/collector to the React frontend.
//!
//! Each #[tauri::command] is callable from the frontend via:
//!   import { invoke } from "@tauri-apps/api/tauri";
//!   const data = await invoke("get_daily_stats", { date: "2024-03-12" });

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::{Arc, Mutex};

use chrono::{Local, NaiveDate};
use serde::{Deserialize, Serialize};
use tauri::{Manager, State};

use tracker_core::{
    analytics::{app_summaries, daily_report, format_duration, timeline, weekly_report},
    session::reconstruct_sessions,
};
use tracker_db::Database;

// ── Shared app state ──────────────────────────────────────────────────────────

struct AppState {
    db: Database,
}

// ── Serializable response types (sent to React as JSON) ───────────────────────

#[derive(Serialize)]
pub struct StatCardData {
    pub total_screen_time:  String,
    pub productive_time:    String,
    pub idle_time:          String,
    pub event_count:        u64,
    pub total_active_secs:  u64,
    pub productive_secs:    u64,
    pub idle_secs:          u64,
}

#[derive(Serialize)]
pub struct AppUsageItem {
    pub app_name:          String,
    pub active_time:       String,
    pub active_secs:       u64,
    pub focus_count:       u32,
    pub longest_span:      String,
    pub longest_span_secs: u64,
    pub percentage:        u8,
}

#[derive(Serialize)]
pub struct HourlyBucket {
    pub hour:       String,
    pub active_min: u32,
    pub idle_min:   u32,
}

#[derive(Serialize)]
pub struct TimelineItem {
    pub start_ms:  i64,
    pub end_ms:    i64,
    pub kind:      String,
    pub label:     String,
    pub duration:  String,
}

#[derive(Serialize)]
pub struct WeekDay {
    pub date:         String,
    pub label:        String,
    pub active_secs:  u64,
    pub active_time:  String,
    pub top_app:      Option<String>,
}

#[derive(Serialize)]
pub struct WeeklySummary {
    pub week_label:          String,
    pub total_active_time:   String,
    pub total_idle_time:     String,
    pub avg_daily_time:      String,
    pub most_used_app:       Option<String>,
    pub days:                Vec<WeekDay>,
}

#[derive(Serialize)]
pub struct TrackerStatus {
    pub is_running:    bool,
    pub total_events:  u64,
    pub last_event_at: Option<String>,
    pub db_path:       String,
}

// ── Tauri commands ────────────────────────────────────────────────────────────

/// Get summary stats for a specific date (YYYY-MM-DD) or "today"/"yesterday".
#[tauri::command]
fn get_daily_stats(date: &str, state: State<AppState>) -> Result<StatCardData, String> {
    let day = parse_date(date)?;
    let (from_ms, to_ms) = day_range_ms(day);

    let events = state.db.read(|r| r.events_in_range(from_ms, to_ms))
        .map_err(|e| e.to_string())?;

    let sessions = reconstruct_sessions(&events);
    let report   = daily_report(&sessions, day);
    let count    = events.len() as u64;

    Ok(StatCardData {
        total_screen_time: format_duration(report.total_active_secs + report.total_idle_secs),
        productive_time:   format_duration(report.total_active_secs),
        idle_time:         format_duration(report.total_idle_secs),
        event_count:       count,
        total_active_secs: report.total_active_secs,
        productive_secs:   report.total_active_secs,
        idle_secs:         report.total_idle_secs,
    })
}

/// Get per-app usage breakdown for a date.
#[tauri::command]
fn get_app_usage(date: &str, state: State<AppState>) -> Result<Vec<AppUsageItem>, String> {
    let day = parse_date(date)?;
    let (from_ms, to_ms) = day_range_ms(day);

    let events   = state.db.read(|r| r.events_in_range(from_ms, to_ms))
        .map_err(|e| e.to_string())?;
    let sessions = reconstruct_sessions(&events);
    let summaries = app_summaries(&sessions, from_ms, to_ms);

    let max_secs = summaries.first().map(|s| s.active_secs).unwrap_or(1).max(1);

    let items = summaries.into_iter().map(|s| {
        let pct = ((s.active_secs as f64 / max_secs as f64) * 100.0).round() as u8;
        AppUsageItem {
            app_name:          s.app_name,
            active_time:       format_duration(s.active_secs),
            active_secs:       s.active_secs,
            focus_count:       s.focus_count,
            longest_span:      format_duration(s.longest_span_secs),
            longest_span_secs: s.longest_span_secs,
            percentage:        pct,
        }
    }).collect();

    Ok(items)
}

/// Get hourly activity buckets for the bar chart.
#[tauri::command]
fn get_hourly_activity(date: &str, state: State<AppState>) -> Result<Vec<HourlyBucket>, String> {
    let day = parse_date(date)?;
    let (from_ms, to_ms) = day_range_ms(day);

    let events   = state.db.read(|r| r.events_in_range(from_ms, to_ms))
        .map_err(|e| e.to_string())?;
    let sessions = reconstruct_sessions(&events);

    let mut buckets: Vec<HourlyBucket> = (0..24).map(|h| {
        let label = if h == 0 { "12a".into() }
                    else if h < 12 { format!("{}a", h) }
                    else if h == 12 { "12p".into() }
                    else { format!("{}p", h - 12) };
        HourlyBucket { hour: label, active_min: 0, idle_min: 0 }
    }).collect();

    // Aggregate app spans into hourly buckets.
    for session in &sessions {
        for span in &session.app_spans {
            let Some(end) = span.end_ms else { continue };
            distribute_into_buckets(span.start_ms, end, from_ms, |hour_idx, secs| {
                if hour_idx < 24 {
                    buckets[hour_idx].active_min += (secs / 60) as u32;
                }
            });
        }
        for span in &session.idle_spans {
            let Some(end) = span.end_ms else { continue };
            distribute_into_buckets(span.start_ms, end, from_ms, |hour_idx, secs| {
                if hour_idx < 24 {
                    buckets[hour_idx].idle_min += (secs / 60) as u32;
                }
            });
        }
    }

    // Return only hours with any activity (trim leading/trailing empty hours).
    let result: Vec<HourlyBucket> = buckets.into_iter()
        .filter(|b| b.active_min > 0 || b.idle_min > 0)
        .collect();

    Ok(result)
}

/// Get timeline entries for a date — for the timeline view.
#[tauri::command]
fn get_timeline(date: &str, state: State<AppState>) -> Result<Vec<TimelineItem>, String> {
    let day = parse_date(date)?;
    let (from_ms, to_ms) = day_range_ms(day);

    let events   = state.db.read(|r| r.events_in_range(from_ms, to_ms))
        .map_err(|e| e.to_string())?;
    let sessions = reconstruct_sessions(&events);
    let entries  = timeline(&sessions, from_ms, to_ms);

    let items = entries.into_iter().map(|e| {
        let dur_secs = ((e.end_ms - e.start_ms).max(0) as u64) / 1000;
        TimelineItem {
            start_ms: e.start_ms,
            end_ms:   e.end_ms,
            kind:     format!("{:?}", e.kind).to_lowercase(),
            label:    e.label,
            duration: format_duration(dur_secs),
        }
    }).collect();

    Ok(items)
}

/// Get weekly summary.
#[tauri::command]
fn get_weekly_stats(date: &str, state: State<AppState>) -> Result<WeeklySummary, String> {
    let any_day = parse_date(date)?;
    use chrono::{Datelike, Duration};

    let days_from_monday = any_day.weekday().num_days_from_monday();
    let monday = any_day - Duration::days(days_from_monday as i64);
    let from_ms = day_ms(monday);
    let to_ms   = day_ms(monday + Duration::days(7));

    let events   = state.db.read(|r| r.events_in_range(from_ms, to_ms))
        .map_err(|e| e.to_string())?;
    let sessions = reconstruct_sessions(&events);
    let report   = weekly_report(&sessions, any_day);

    let days = report.daily_reports.iter().map(|d| {
        let top = d.app_summaries.first().map(|s| s.app_name.clone());
        WeekDay {
            date:        d.date.to_string(),
            label:       d.date.format("%a").to_string(),
            active_secs: d.total_active_secs,
            active_time: format_duration(d.total_active_secs),
            top_app:     top,
        }
    }).collect();

    Ok(WeeklySummary {
        week_label:        format!("Week of {}", monday.format("%b %d")),
        total_active_time: format_duration(report.total_active_secs),
        total_idle_time:   format_duration(report.total_idle_secs),
        avg_daily_time:    format_duration(report.avg_daily_active_secs),
        most_used_app:     report.most_used_app,
        days,
    })
}

/// Get tracker status (running, total events, last event time).
#[tauri::command]
fn get_tracker_status(state: State<AppState>) -> Result<TrackerStatus, String> {
    let total = state.db.read(|r| r.total_event_count())
        .map_err(|e| e.to_string())?;
    let latest = state.db.read(|r| r.latest_timestamp())
        .map_err(|e| e.to_string())?;

    let last_event_at = latest.and_then(|ts| {
        chrono::DateTime::from_timestamp_millis(ts)
            .map(|dt: chrono::DateTime<chrono::Utc>| {
                dt.with_timezone(&Local).format("%Y-%m-%d %H:%M:%S").to_string()
            })
    });

    let db_path = std::env::var("TRACKER_DB")
        .unwrap_or_else(|_| "~/.tracker/tracker.db".to_string());

    Ok(TrackerStatus {
        is_running:   true,
        total_events: total,
        last_event_at,
        db_path,
    })
}

// ── Helpers ───────────────────────────────────────────────────────────────────

fn parse_date(s: &str) -> Result<NaiveDate, String> {
    match s {
        "today"     => Ok(Local::now().date_naive()),
        "yesterday" => Ok(Local::now().date_naive() - chrono::Duration::days(1)),
        other       => NaiveDate::parse_from_str(other, "%Y-%m-%d")
                           .map_err(|e| format!("Invalid date '{}': {}", other, e)),
    }
}

fn day_ms(date: NaiveDate) -> i64 {
    use chrono::TimeZone;
    Local.from_local_datetime(&date.and_hms_opt(0, 0, 0).unwrap())
        .earliest()
        .map(|dt| dt.timestamp_millis())
        .unwrap_or(0)
}

fn day_range_ms(date: NaiveDate) -> (i64, i64) {
    (day_ms(date), day_ms(date + chrono::Duration::days(1)))
}

fn distribute_into_buckets(
    start_ms: i64,
    end_ms: i64,
    day_start_ms: i64,
    mut f: impl FnMut(usize, u64),
) {
    let hour_ms = 3_600_000i64;
    let mut cursor = start_ms;
    while cursor < end_ms {
        let hour_idx = ((cursor - day_start_ms) / hour_ms) as usize;
        let next_hour = day_start_ms + (hour_idx as i64 + 1) * hour_ms;
        let chunk_end = end_ms.min(next_hour);
        let secs = ((chunk_end - cursor).max(0) as u64) / 1000;
        if secs > 0 {
            f(hour_idx, secs);
        }
        cursor = next_hour;
    }
}

// ── Entry point ───────────────────────────────────────────────────────────────

fn main() {
    let db_path = std::env::var("TRACKER_DB").unwrap_or_else(|_| {
        let home = std::env::var("USERPROFILE")
            .or_else(|_| std::env::var("HOME"))
            .unwrap_or_else(|_| ".".to_string());
        format!("{}/.tracker/tracker.db", home)
    });

    // Create data dir if needed.
    if let Some(parent) = std::path::Path::new(&db_path).parent() {
        let _ = std::fs::create_dir_all(parent);
    }

    // Open (or create) the database.
    let db = tracker_db::Database::open(&db_path)
        .expect("Failed to open tracker database");

    tauri::Builder::default()
        .manage(AppState { db })
        .invoke_handler(tauri::generate_handler![
            get_daily_stats,
            get_app_usage,
            get_hourly_activity,
            get_timeline,
            get_weekly_stats,
            get_tracker_status,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}