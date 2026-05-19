//! tracker — local-first activity tracker
//!
//! Usage:
//!   tracker start                  Start tracking in the foreground
//!   tracker stats today            Daily report for today
//!   tracker stats yesterday        Daily report for yesterday
//!   tracker stats week             Weekly report
//!   tracker stats 2024-03-15       Report for a specific date
//!   tracker timeline today         Visual timeline for today
//!   tracker timeline yesterday     Visual timeline for yesterday
//!   tracker events [N]             Inspect last N raw events (default 50)
//!   tracker status                 Database health and totals
//!   tracker help                   Show this message

mod commands;
mod processor;

use std::path::PathBuf;
use std::sync::Arc;

use tokio::signal;
use tracing::info;
use tracing_subscriber::EnvFilter;

use tracker_core::EventBuilder;
use tracker_db::Database;
use tracker_collector::{CollectorConfig, start_collectors};

const VERSION: &str = "0.1.0";

/// Resolve the database path.
/// Uses TRACKER_DB env var if set, otherwise ~/.tracker/tracker.db
fn db_path() -> PathBuf {
    if let Ok(path) = std::env::var("TRACKER_DB") {
        return PathBuf::from(path);
    }
    let home = dirs_next_home();
    home.join(".tracker").join("tracker.db")
}

fn dirs_next_home() -> PathBuf {
    // Avoid a full dirs crate dep — use env vars directly.
    #[cfg(target_os = "windows")]
    {
        std::env::var("USERPROFILE")
            .or_else(|_| std::env::var("HOMEDRIVE").and_then(|d| {
                std::env::var("HOMEPATH").map(|p| format!("{}{}", d, p))
            }))
            .map(PathBuf::from)
            .unwrap_or_else(|_| PathBuf::from("C:\\Users\\Default"))
    }
    #[cfg(not(target_os = "windows"))]
    {
        std::env::var("HOME")
            .map(PathBuf::from)
            .unwrap_or_else(|_| PathBuf::from("/tmp"))
    }
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialise tracing. RUST_LOG=debug for verbose output.
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| EnvFilter::new("info"))
        )
        .with_target(false)
        .with_thread_ids(false)
        .compact()
        .init();

    let args: Vec<String> = std::env::args().collect();
    let subcommand = args.get(1).map(String::as_str).unwrap_or("help");

    match subcommand {
        "start" => cmd_start().await?,
        "stats" => {
            let period = args.get(2).map(String::as_str).unwrap_or("today");
            let db = open_db()?;
            commands::cmd_stats(&db, period)?;
        }
        "timeline" => {
            let period = args.get(2).map(String::as_str).unwrap_or("today");
            let db = open_db()?;
            commands::cmd_timeline(&db, period)?;
        }
        "events" => {
            let limit = args.get(2)
                .and_then(|s| s.parse::<usize>().ok())
                .unwrap_or(50);
            let db = open_db()?;
            commands::cmd_events(&db, limit)?;
        }
        "status" => {
            let db = open_db()?;
            commands::cmd_status(&db)?;
        }
        "version" => {
            println!("tracker v{}", VERSION);
        }
        "help" | "--help" | "-h" | _ => {
            print_help();
        }
    }

    Ok(())
}

/// `tracker start` — the main tracking loop.
async fn cmd_start() -> anyhow::Result<()> {
    let db_path = db_path();

    // Create the data directory if needed.
    if let Some(parent) = db_path.parent() {
        std::fs::create_dir_all(parent)?;
    }

    info!("tracker v{} starting", VERSION);
    info!("database: {}", db_path.display());

    let db = Database::open(&db_path)?;
    let total = db.read(|r| r.total_event_count())?;
    info!("database open — {} events on record", total);

    // Set up graceful shutdown: Ctrl+C or SIGTERM both work.
    let (shutdown_tx, shutdown_rx) = tokio::sync::watch::channel(false);

    // Build the event builder (owns the session UUID).
    let mut builder = EventBuilder::new(VERSION);

    // Write the TrackerStart event immediately.
    {
        let writer = db.batch_writer();
        let start_event = builder.tracker_start_event();
        writer.push(start_event)?;
        writer.flush()?;
        info!("session {} started", builder.session_id());
    }

    // Start collectors — they write EventKind into a channel.
    let config = CollectorConfig {
        idle_threshold_secs: idle_threshold_from_env(),
    };
    let event_rx = start_collectors(config, shutdown_rx.clone());

    // Start the event processor — reads from channel, writes to DB.
    let writer = Arc::new(db.batch_writer());
    let processor_db = db.clone();
    let processor_handle = tokio::spawn(processor::run_processor(
        event_rx,
        Arc::clone(&writer),
        builder,
        processor_db,
    ));

    info!("tracking started. Press Ctrl+C to stop.");

    // Wait for Ctrl+C.
    signal::ctrl_c().await?;
    info!("shutting down…");

    // Signal collectors to stop.
    let _ = shutdown_tx.send(true);

    // Wait for the processor to drain the channel and flush.
    let _ = processor_handle.await;

    info!("tracker stopped cleanly");
    Ok(())
}

fn open_db() -> anyhow::Result<Database> {
    let path = db_path();
    if !path.exists() {
        anyhow::bail!(
            "No database found at {}.\nRun 'tracker start' first to begin tracking.",
            path.display()
        );
    }
    Ok(Database::open(&path)?)
}

fn idle_threshold_from_env() -> u32 {
    std::env::var("TRACKER_IDLE_SECS")
        .ok()
        .and_then(|s| s.parse().ok())
        .unwrap_or(120) // 2 minutes default
}

fn print_help() {
    println!(r#"
tracker v{VERSION} — local-first activity tracker

USAGE:
    tracker <command> [args]

COMMANDS:
    start                   Start tracking (runs in foreground, Ctrl+C to stop)
    stats today             App usage summary for today
    stats yesterday         App usage summary for yesterday
    stats week              App usage summary for this week
    stats <YYYY-MM-DD>      App usage summary for a specific date
    timeline today          Visual timeline for today
    timeline yesterday      Visual timeline for yesterday
    timeline <YYYY-MM-DD>   Visual timeline for a specific date
    events [N]              Inspect last N raw events (default: 50)
    status                  Database health check and event count
    version                 Print version
    help                    Show this message

ENVIRONMENT:
    TRACKER_DB              Override database path (default: ~/.tracker/tracker.db)
    TRACKER_IDLE_SECS       Idle threshold in seconds (default: 120)
    RUST_LOG                Log level: error, warn, info, debug (default: info)

EXAMPLES:
    tracker start
    tracker stats today
    tracker timeline yesterday
    tracker events 100
    TRACKER_IDLE_SECS=60 tracker start
"#);
}
