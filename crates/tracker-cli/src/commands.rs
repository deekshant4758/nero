//! CLI command implementations.

use chrono::{Datelike, Local, NaiveDate, Duration, TimeZone};

use tracker_core::{
    analytics::{daily_report, format_duration, timeline, weekly_report},
    events::TimestampMs,
    session::reconstruct_sessions,
};
use tracker_core::analytics::TimelineKind;
use tracker_db::Database;

pub fn cmd_stats(db: &Database, period: &str) -> anyhow::Result<()> {
    let today = Local::now().date_naive();
    match period {
        "today" => {
            let events = load_day(db, today)?;
            let sessions = reconstruct_sessions(&events);
            print_daily_report(&daily_report(&sessions, today));
        }
        "yesterday" => {
            let day = today - Duration::days(1);
            let events = load_day(db, day)?;
            let sessions = reconstruct_sessions(&events);
            print_daily_report(&daily_report(&sessions, day));
        }
        "week" => {
            let events = load_week(db, today)?;
            let sessions = reconstruct_sessions(&events);
            print_weekly_report(&weekly_report(&sessions, today));
        }
        other => match NaiveDate::parse_from_str(other, "%Y-%m-%d") {
            Ok(day) => {
                let events = load_day(db, day)?;
                let sessions = reconstruct_sessions(&events);
                print_daily_report(&daily_report(&sessions, day));
            }
            Err(_) => eprintln!("Unknown period '{}'. Use: today, yesterday, week, YYYY-MM-DD", other),
        }
    }
    Ok(())
}

pub fn cmd_timeline(db: &Database, period: &str) -> anyhow::Result<()> {
    let today = Local::now().date_naive();
    let (day, events) = match period {
        "today"     => (today, load_day(db, today)?),
        "yesterday" => { let d = today - Duration::days(1); (d, load_day(db, d)?) }
        other => match NaiveDate::parse_from_str(other, "%Y-%m-%d") {
            Ok(day) => (day, load_day(db, day)?),
            Err(_)  => { eprintln!("Unknown period '{}'.", other); return Ok(()); }
        }
    };

    let sessions = reconstruct_sessions(&events);
    let from_ms = date_to_ms(day);
    let to_ms   = date_to_ms(day + Duration::days(1));
    let entries = timeline(&sessions, from_ms, to_ms);

    println!("\n── Timeline: {} ─────────────────────────────────────────────", day);
    println!("{:<10} {:<10} {:<12} {}", "Start", "End", "Duration", "Activity");
    println!("{}", "─".repeat(60));

    for e in &entries {
        let start = ms_to_time_str(e.start_ms);
        let end   = ms_to_time_str(e.end_ms);
        let dur   = format_duration(((e.end_ms - e.start_ms).max(0) as u64) / 1000);
        let icon  = match e.kind {
            TimelineKind::Active     => "▶",
            TimelineKind::Idle       => "…",
            TimelineKind::Sleep      => "Z",
            TimelineKind::TrackerOff => "○",
        };
        println!("{:<10} {:<10} {:<12} {} {}", start, end, dur, icon, e.label);
    }
    println!();
    Ok(())
}

pub fn cmd_events(db: &Database, limit: usize) -> anyhow::Result<()> {
    let today   = Local::now().date_naive();
    let from_ms = date_to_ms(today - Duration::days(1));
    let to_ms   = date_to_ms(today + Duration::days(1));
    let mut events = db.read(|r| r.events_in_range(from_ms, to_ms))?;
    events.truncate(limit);

    println!("\n── Raw events (showing up to {}) ──────────────────────────────", limit);
    println!("{:<6} {:<10} {:<6} {:<10} {}",
        "id", "time", "seq", "session", "kind");
    println!("{}", "─".repeat(60));

    for e in &events {
        println!("{:<6} {:<10} {:<6} {:<10} {}",
            e.id,
            ms_to_time_str(e.timestamp_ms),
            e.sequence,
            &e.session_id.to_string()[..8],
            e.kind_str(),
        );
    }
    println!();
    Ok(())
}

pub fn cmd_status(db: &Database) -> anyhow::Result<()> {
    let total  = db.read(|r| r.total_event_count())?;
    let latest = db.read(|r| r.latest_timestamp())?;
    println!("\n── Tracker status ──────────────────────────────────────");
    println!("  Total events stored : {}", total);
    match latest {
        Some(ts) => println!("  Last event at       : {}", ms_to_datetime_str(ts)),
        None     => println!("  Last event at       : (database is empty)"),
    }
    println!();
    Ok(())
}

// ── helpers ───────────────────────────────────────────────────────────────────

pub fn load_day(db: &Database, day: NaiveDate) -> anyhow::Result<Vec<tracker_core::Event>> {
    let from = date_to_ms(day);
    let to   = date_to_ms(day + Duration::days(1));
    Ok(db.read(|r| r.events_in_range(from, to))?)
}

pub fn date_to_ms(date: NaiveDate) -> TimestampMs {
    Local.from_local_datetime(&date.and_hms_opt(0, 0, 0).unwrap())
        .earliest()
        .map(|dt| dt.timestamp_millis())
        .unwrap_or(0)
}

fn load_week(db: &Database, any_day: NaiveDate) -> anyhow::Result<Vec<tracker_core::Event>> {
    let days_from_monday = any_day.weekday().num_days_from_monday();
    let monday = any_day - Duration::days(days_from_monday as i64);
    let from = date_to_ms(monday);
    let to   = date_to_ms(monday + Duration::days(7));
    Ok(db.read(|r| r.events_in_range(from, to))?)
}

fn ms_to_time_str(ms: TimestampMs) -> String {
    match Local.timestamp_millis_opt(ms) {
        chrono::LocalResult::Single(dt) => dt.format("%H:%M:%S").to_string(),
        _ => "??:??:??".to_string(),
    }
}

fn ms_to_datetime_str(ms: TimestampMs) -> String {
    match Local.timestamp_millis_opt(ms) {
        chrono::LocalResult::Single(dt) => dt.format("%Y-%m-%d %H:%M:%S").to_string(),
        _ => "unknown".to_string(),
    }
}

fn print_daily_report(report: &tracker_core::analytics::DailyReport) {
    println!("\n── Daily report: {} ────────────────────────────────────", report.date);
    println!("  Active time   : {}", format_duration(report.total_active_secs));
    println!("  Idle time     : {}", format_duration(report.total_idle_secs));
    println!("  Longest focus : {}", format_duration(report.longest_focus_block_secs));
    if report.app_summaries.is_empty() {
        println!("  (no activity recorded)");
        return;
    }
    println!();
    println!("  {:<30} {:>10} {:>8} {:>12}", "App", "Active", "Focuses", "Longest");
    println!("  {}", "─".repeat(64));
    for s in &report.app_summaries {
        println!("  {:<30} {:>10} {:>8} {:>12}",
            trunc(&s.app_name, 30),
            format_duration(s.active_secs),
            s.focus_count,
            format_duration(s.longest_span_secs),
        );
    }
    println!();
}

fn print_weekly_report(report: &tracker_core::analytics::WeeklyReport) {
    println!("\n── Weekly report: week of {} ────────────────────────────", report.week_start);
    println!("  Total active   : {}", format_duration(report.total_active_secs));
    println!("  Total idle     : {}", format_duration(report.total_idle_secs));
    println!("  Avg active/day : {}", format_duration(report.avg_daily_active_secs));
    if let Some(app) = &report.most_used_app {
        println!("  Most used app  : {}", app);
    }
    println!();
    println!("  {:<14} {:>10} {}", "Day", "Active", "Top app");
    println!("  {}", "─".repeat(40));
    for day in &report.daily_reports {
        let top = day.app_summaries.first().map(|s| s.app_name.as_str()).unwrap_or("—");
        println!("  {:<14} {:>10} {}",
            day.date.format("%a %b %d"),
            format_duration(day.total_active_secs),
            trunc(top, 20),
        );
    }
    println!();
}

fn trunc(s: &str, max: usize) -> String {
    if s.len() <= max { s.to_string() }
    else { format!("{}…", &s[..max.saturating_sub(1)]) }
}
