//! Event reader for `tracker-db`.
//!
//! Provides read-only accessors used by the CLI and tests.

use rusqlite::{Connection, params, OptionalExtension};
use tracker_core::Event;

use crate::errors::DbError;

pub struct EventReader<'a> {
    conn: &'a Connection,
}

impl<'a> EventReader<'a> {
    pub fn new(conn: &'a Connection) -> Self {
        Self { conn }
    }

    pub fn total_event_count(&self) -> Result<u64, DbError> {
        let mut stmt = self.conn.prepare("SELECT COUNT(*) FROM events")?;
        let count: i64 = stmt.query_row([], |r| r.get(0))?;
        Ok(count as u64)
    }

    pub fn events_in_range(&self, from_ms: i64, to_ms: i64) -> Result<Vec<Event>, DbError> {
        let mut stmt = self.conn.prepare(
            "SELECT id, timestamp_ms, sequence, session_id, kind, payload
             FROM events
             WHERE timestamp_ms >= ?1 AND timestamp_ms <= ?2
             ORDER BY timestamp_ms, sequence",
        )?;

        let mut rows = stmt.query(params![from_ms, to_ms])?;
        let mut out: Vec<Event> = Vec::new();

        while let Some(row) = rows.next()? {
            let id: i64 = row.get(0)?;
            let timestamp_ms: i64 = row.get(1)?;
            let sequence: i64 = row.get(2)?;
            let session_id: String = row.get(3)?;
            let payload: String = row.get(5)?;

            let kind = serde_json::from_str(&payload).map_err(DbError::Serialization)?;
            let session_uuid = uuid::Uuid::parse_str(&session_id)?;

            out.push(Event {
                id,
                timestamp_ms,
                sequence: sequence as u64,
                session_id: session_uuid,
                kind,
            });
        }

        Ok(out)
    }

    pub fn get_meta(&self, key: &str) -> Result<Option<String>, DbError> {
        let mut stmt = self.conn.prepare("SELECT value FROM meta WHERE key = ?1")?;
        let res: Option<String> = stmt.query_row(params![key], |r| r.get(0)).optional()?;
        Ok(res)
    }

    pub fn latest_timestamp(&self) -> Result<Option<i64>, DbError> {
        let mut stmt = self.conn.prepare("SELECT MAX(timestamp_ms) FROM events")?;
        let res: Option<i64> = stmt.query_row([], |r| r.get(0)).optional()?;
        Ok(res)
    }
}
