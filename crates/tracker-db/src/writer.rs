//! Append-only event writer with batching.
//!
//! # Why batching matters
//!
//! SQLite's bottleneck for writes is not CPU or disk throughput — it's
//! transaction overhead. Each `COMMIT` requires an fsync (or equivalent),
//! which takes ~5–15ms on a typical HDD and ~1ms on SSD.
//!
//! Inserting events one-by-one at 1 event/second = 1 fsync/second = fine.
//! But during busy periods (rapid window switching) you might emit 20
//! events/second. One transaction per event = 20 fsyncs/second = noticeable
//! CPU and disk load for no benefit.
//!
//! The BatchWriter buffers events in memory and flushes them in a single
//! transaction when either:
//! - The buffer reaches `BATCH_SIZE` events, OR
//! - `FLUSH_INTERVAL_MS` milliseconds have elapsed since the last flush
//!
//! This means worst-case latency from "event emitted" to "event on disk"
//! is `FLUSH_INTERVAL_MS` (500ms). Acceptable for an activity tracker.
//!
//! # Crash safety
//!
//! If the process crashes between flushes, buffered events are lost.
//! This is acceptable — we lose at most 500ms of data, and the session
//! reconstruction engine handles the resulting gap gracefully (it will
//! mark the session as crashed and attribute usage up to the last
//! persisted event).
//!
//! On clean shutdown, the writer flushes its buffer before closing.

use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};

use rusqlite::{Connection, params};

use tracker_core::Event;

use crate::errors::DbError;

/// Flush after this many buffered events.
const BATCH_SIZE: usize = 50;

/// Flush after this many milliseconds regardless of batch size.
const FLUSH_INTERVAL_MS: u64 = 500;

/// Inner state, protected by a Mutex so the writer can be shared across
/// async tasks via Arc<BatchWriter>.
struct WriterState {
    buffer:        Vec<Event>,
    last_flush_at: Instant,
}

/// Batching event writer. Wrap in `Arc` to share across tasks.
///
/// ```rust,ignore
/// let writer = Arc::new(BatchWriter::new(conn));
/// writer.push(event)?;          // fast — just buffers
/// writer.flush_if_due()?;       // call periodically from async task
/// writer.flush()?;              // call on shutdown
/// ```
pub struct BatchWriter {
    conn:  Arc<Mutex<Connection>>,
    state: Mutex<WriterState>,
}

impl BatchWriter {
    pub fn new(conn: Arc<Mutex<Connection>>) -> Self {
        Self {
            conn,
            state: Mutex::new(WriterState {
                buffer:        Vec::with_capacity(BATCH_SIZE * 2),
                last_flush_at: Instant::now(),
            }),
        }
    }

    /// Buffer an event. Flushes automatically if the batch is full.
    /// This is the hot path — called for every event emitted.
    pub fn push(&self, event: Event) -> Result<(), DbError> {
        let should_flush = {
            let mut state = self.state.lock().unwrap();
            state.buffer.push(event);
            state.buffer.len() >= BATCH_SIZE
        };

        if should_flush {
            self.flush()?;
        }
        Ok(())
    }

    /// Flush if the time interval has elapsed. Call this from a periodic
    /// background task (e.g. every 100ms) to ensure timely persistence.
    pub fn flush_if_due(&self) -> Result<(), DbError> {
        let due = {
            let state = self.state.lock().unwrap();
            state.last_flush_at.elapsed() >= Duration::from_millis(FLUSH_INTERVAL_MS)
                && !state.buffer.is_empty()
        };

        if due {
            self.flush()?;
        }
        Ok(())
    }

    /// Force-flush all buffered events to SQLite in a single transaction.
    /// Called on clean shutdown and when the batch is full.
    pub fn flush(&self) -> Result<(), DbError> {
        let events: Vec<Event> = {
            let mut state = self.state.lock().unwrap();
            if state.buffer.is_empty() {
                return Ok(());
            }
            let drained: Vec<Event> = state.buffer.drain(..).collect();
            state.last_flush_at = Instant::now();
            drained
        };

        let conn = self.conn.lock().unwrap();
        insert_batch(&conn, &events)?;
        Ok(())
    }

    /// How many events are currently buffered (not yet on disk).
    pub fn buffered_count(&self) -> usize {
        self.state.lock().unwrap().buffer.len()
    }
}

/// Insert a slice of events in a single transaction.
/// This is the only function that writes to the events table.
fn insert_batch(conn: &Connection, events: &[Event]) -> Result<(), DbError> {
    if events.is_empty() {
        return Ok(());
    }

    let now_ms = chrono_now_ms();

    // Prepare once, execute many. The prepare cost is amortized across
    // the whole batch.
    let tx = conn.unchecked_transaction()?;
    {
        let mut stmt = tx.prepare_cached(
            "INSERT INTO events
                (timestamp_ms, sequence, session_id, kind, payload, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        )?;

        for event in events {
            let payload = serde_json::to_string(&event.kind)
                .map_err(DbError::Serialization)?;

            stmt.execute(params![
                event.timestamp_ms,
                event.sequence as i64,
                event.session_id.to_string(),
                event.kind_str(),
                payload,
                now_ms,
            ])?;
        }
    }
    tx.commit()?;
    Ok(())
}

fn chrono_now_ms() -> i64 {
    use std::time::{SystemTime, UNIX_EPOCH};
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0)
}