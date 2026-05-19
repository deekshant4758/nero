//! Event processing pipeline.
//!
//! The processor is the central coordinator:
//!
//!   [WindowCollector] ──┐
//!                        ├──► [mpsc channel] ──► [EventProcessor] ──► [BatchWriter] ──► SQLite
//!   [IdleCollector]  ────┘
//!
//! Responsibilities:
//! - Receive raw EventKind values from collectors
//! - Wrap them in full Event envelopes (timestamp, session_id, sequence)
//! - Hand them to the BatchWriter
//! - Periodically call flush_if_due so events reach disk within 500ms
//! - On shutdown: flush remaining buffer, write TrackerStop event

use std::sync::Arc;
use std::time::Instant;

use tokio::sync::mpsc;
use tokio::time::{Duration, interval};
use tracing::{debug, info};

use tracker_core::{EventBuilder, EventKind};
use tracker_db::{Database, writer::BatchWriter};

/// Runs the event processing loop.
///
/// Consumes `rx` until it closes (all senders dropped = collectors shut down).
/// Flushes the writer and writes a TrackerStop event before returning.
pub async fn run_processor(
    mut rx: mpsc::Receiver<EventKind>,
    writer: Arc<BatchWriter>,
    mut builder: EventBuilder,
    db: Database,
) {
    let started_at = Instant::now();
    let mut event_count: u64 = 0;

    // Periodic flush ticker — ensures events reach disk within FLUSH_INTERVAL_MS
    // even when the batch hasn't filled up.
    let mut flush_ticker = interval(Duration::from_millis(100));

    loop {
        tokio::select! {
            // Bias toward draining the channel over flushing.
            biased;

            maybe_kind = rx.recv() => {
                match maybe_kind {
                    Some(kind) => {
                        let event = builder.build(kind);
                        debug!(kind = %event.kind_str(), seq = event.sequence, "processing event");
                        if let Err(e) = writer.push(event) {
                            tracing::error!("writer push failed: {}", e);
                        }
                        event_count += 1;
                    }
                    None => {
                        // Channel closed — all collectors have stopped.
                        debug!("event channel closed, processor stopping");
                        break;
                    }
                }
            }

            _ = flush_ticker.tick() => {
                if let Err(e) = writer.flush_if_due() {
                    tracing::error!("flush error: {}", e);
                }
            }
        }
    }

    // ── Clean shutdown ────────────────────────────────────────────────────────

    // Flush everything remaining in the buffer.
    if let Err(e) = writer.flush() {
        tracing::error!("final flush error: {}", e);
    }

    // Write the TrackerStop event.
    let session_secs = started_at.elapsed().as_secs();
    let stop_event = builder.tracker_stop_event(session_secs, event_count);
    let stop_writer = db.batch_writer();
    if let Err(e) = stop_writer.push(stop_event) {
        tracing::error!("failed to write TrackerStop: {}", e);
    }
    if let Err(e) = stop_writer.flush() {
        tracing::error!("failed to flush TrackerStop: {}", e);
    }

    // WAL checkpoint on clean shutdown — keeps the DB file compact.
    if let Err(e) = db.checkpoint() {
        tracing::warn!("checkpoint failed (non-fatal): {}", e);
    }

    info!(
        session_secs,
        event_count,
        "processor shut down cleanly"
    );
}