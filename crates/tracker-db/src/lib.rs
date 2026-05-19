//! tracker-db — SQLite persistence layer.

pub mod errors;
pub mod reader;
pub mod schema;
pub mod writer;

use std::path::Path;
use std::sync::{Arc, Mutex};

use rusqlite::Connection;

use crate::errors::DbError;
use crate::reader::EventReader;
use crate::schema::{configure_connection, run_migrations};
use crate::writer::BatchWriter;

/// The main database handle. Clone cheaply via Arc.
#[derive(Clone)]
pub struct Database {
    conn: Arc<Mutex<Connection>>,
}

impl Database {
    pub fn open(path: impl AsRef<Path>) -> Result<Self, DbError> {
        let conn = Connection::open(path)?;
        configure_connection(&conn)?;
        run_migrations(&conn)?;
        Ok(Self { conn: Arc::new(Mutex::new(conn)) })
    }

    pub fn open_in_memory() -> Result<Self, DbError> {
        let conn = Connection::open_in_memory()?;
        configure_connection(&conn)?;
        run_migrations(&conn)?;
        Ok(Self { conn: Arc::new(Mutex::new(conn)) })
    }

    pub fn batch_writer(&self) -> BatchWriter {
        BatchWriter::new(Arc::clone(&self.conn))
    }

    /// Run a read operation with access to an EventReader.
    pub fn read<T, F>(&self, f: F) -> Result<T, DbError>
    where
        F: FnOnce(EventReader) -> Result<T, DbError>,
    {
        let conn = self.conn.lock().unwrap();
        f(EventReader::new(&conn))
    }

    pub fn set_meta(&self, key: &str, value: &str) -> Result<(), DbError> {
        let conn = self.conn.lock().unwrap();
        let now_ms = now_ms();
        conn.execute(
            "INSERT INTO meta (key, value, updated_at)
             VALUES (?1, ?2, ?3)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value,
                                            updated_at = excluded.updated_at",
            rusqlite::params![key, value, now_ms],
        )?;
        Ok(())
    }

    pub fn checkpoint(&self) -> Result<(), DbError> {
        let conn = self.conn.lock().unwrap();
        conn.execute_batch("PRAGMA wal_checkpoint(TRUNCATE);")?;
        Ok(())
    }
}

fn now_ms() -> i64 {
    use std::time::{SystemTime, UNIX_EPOCH};
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0)
}

#[cfg(test)]
mod tests {
    use super::*;
    use tracker_core::{
        EventBuilder, EventKind, TrackerStartData, TrackerStopData, WindowFocusData,
        reconstruct_sessions, app_summaries,
    };

    fn focus(app: &str) -> EventKind {
        EventKind::WindowFocus(WindowFocusData {
            app_name: app.to_string(),
            window_title: format!("{} window", app),
            process_id: 1000,
            exe_path: None,
        })
    }

    #[test]
    fn open_in_memory_runs_migrations() {
        let db = Database::open_in_memory().unwrap();
        let count = db.read(|r| r.total_event_count()).unwrap();
        assert_eq!(count, 0);
    }

    #[test]
    fn migrations_are_idempotent() {
        let db = Database::open_in_memory().unwrap();
        let conn = db.conn.lock().unwrap();
        run_migrations(&conn).unwrap();
        run_migrations(&conn).unwrap();
    }

    #[test]
    fn single_event_round_trip() {
        let db = Database::open_in_memory().unwrap();
        let writer = db.batch_writer();
        let mut builder = EventBuilder::new("test");
        writer.push(builder.build(focus("code.exe"))).unwrap();
        writer.flush().unwrap();
        let count = db.read(|r| r.total_event_count()).unwrap();
        assert_eq!(count, 1);
    }

    #[test]
    fn events_round_trip_preserves_kind() {
        let db = Database::open_in_memory().unwrap();
        let writer = db.batch_writer();
        let mut builder = EventBuilder::new("test");
        let base_ms = 1_700_000_000_000i64;
        writer.push(builder.build_at(
            EventKind::TrackerStart(TrackerStartData { version: "test".into() }),
            base_ms,
        )).unwrap();
        writer.push(builder.build_at(focus("chrome.exe"), base_ms + 1000)).unwrap();
        writer.flush().unwrap();

        let events = db.read(|r| r.events_in_range(base_ms, base_ms + 5000)).unwrap();
        assert_eq!(events.len(), 2);
        assert!(matches!(events[0].kind, EventKind::TrackerStart(_)));
        assert!(matches!(events[1].kind, EventKind::WindowFocus(_)));
    }

    #[test]
    fn time_range_excludes_outside_events() {
        let db = Database::open_in_memory().unwrap();
        let writer = db.batch_writer();
        let mut builder = EventBuilder::new("test");
        let base_ms = 1_700_000_000_000i64;
        writer.push(builder.build_at(focus("before.exe"), base_ms - 10_000)).unwrap();
        writer.push(builder.build_at(focus("inside.exe"), base_ms + 1_000)).unwrap();
        writer.push(builder.build_at(focus("after.exe"),  base_ms + 20_000)).unwrap();
        writer.flush().unwrap();

        let events = db.read(|r| r.events_in_range(base_ms, base_ms + 10_000)).unwrap();
        assert_eq!(events.len(), 1);
        if let EventKind::WindowFocus(d) = &events[0].kind {
            assert_eq!(d.app_name, "inside.exe");
        }
    }

    #[test]
    fn batch_writer_buffers_before_flush() {
        let db = Database::open_in_memory().unwrap();
        let writer = db.batch_writer();
        let mut builder = EventBuilder::new("test");
        writer.push(builder.build(focus("a.exe"))).unwrap();
        writer.push(builder.build(focus("b.exe"))).unwrap();
        assert_eq!(writer.buffered_count(), 2);
        assert_eq!(db.read(|r| r.total_event_count()).unwrap(), 0);
        writer.flush().unwrap();
        assert_eq!(writer.buffered_count(), 0);
        assert_eq!(db.read(|r| r.total_event_count()).unwrap(), 2);
    }

    #[test]
    fn flush_empty_is_safe() {
        let db = Database::open_in_memory().unwrap();
        let writer = db.batch_writer();
        writer.flush().unwrap();
        writer.flush().unwrap();
    }

    #[test]
    fn insert_100k_events_and_query() {
        let db = Database::open_in_memory().unwrap();
        let writer = db.batch_writer();
        let mut builder = EventBuilder::new("test");
        let base_ms = 1_700_000_000_000i64;
        let n = 100_000usize;
        for i in 0..n {
            let ts = base_ms + (i as i64) * 1000;
            let app = match i % 3 { 0 => "code.exe", 1 => "chrome.exe", _ => "slack.exe" };
            writer.push(builder.build_at(focus(app), ts)).unwrap();
        }
        writer.flush().unwrap();
        let count = db.read(|r| r.total_event_count()).unwrap();
        assert_eq!(count, n as u64);

        let start = std::time::Instant::now();
        let recent = db.read(|r| {
            r.events_in_range(base_ms + (n as i64 - 1000) * 1000, base_ms + n as i64 * 1000)
        }).unwrap();
        let elapsed = start.elapsed();
        assert_eq!(recent.len(), 1000);
        assert!(elapsed.as_millis() < 200, "query took {}ms", elapsed.as_millis());
    }

    #[test]
    fn end_to_end_reconstruct_from_db() {
        let db = Database::open_in_memory().unwrap();
        let writer = db.batch_writer();
        let mut builder = EventBuilder::new("test");
        let base_ms = 1_700_000_000_000i64;
        for e in vec![
            builder.build_at(EventKind::TrackerStart(TrackerStartData { version: "test".into() }), base_ms),
            builder.build_at(focus("code.exe"),   base_ms),
            builder.build_at(focus("chrome.exe"), base_ms + 3_600_000),
            builder.build_at(EventKind::TrackerStop(TrackerStopData {
                session_duration_secs: 7200, event_count: 4,
            }), base_ms + 7_200_000),
        ] { writer.push(e).unwrap(); }
        writer.flush().unwrap();

        let events = db.read(|r| r.events_in_range(base_ms, base_ms + 7_200_001)).unwrap();
        let sessions = reconstruct_sessions(&events);
        assert_eq!(sessions.len(), 1);
        assert!(!sessions[0].crashed);
        let summaries = app_summaries(&sessions, base_ms, base_ms + 7_200_001);
        let total: u64 = summaries.iter().map(|s| s.active_secs).sum();
        assert_eq!(total, 7200);
    }

    #[test]
    fn meta_read_write() {
        let db = Database::open_in_memory().unwrap();
        db.set_meta("version", "0.1.0").unwrap();
        let v = db.read(|r| r.get_meta("version")).unwrap();
        assert_eq!(v, Some("0.1.0".to_string()));
        db.set_meta("version", "0.2.0").unwrap();
        let v = db.read(|r| r.get_meta("version")).unwrap();
        assert_eq!(v, Some("0.2.0".to_string()));
    }
}