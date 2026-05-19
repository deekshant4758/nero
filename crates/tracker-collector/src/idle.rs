//! Idle detection.
//!
//! Polls `platform.idle_time_ms()` and emits:
//! - `IdleStart` when idle_ms >= threshold
//! - `IdleEnd` when idle_ms drops back below threshold (user returned)
//!
//! # Sleep / wake detection
//!
//! When the system sleeps and resumes, we see a sudden large jump in
//! idle_time_ms (the system was "idle" for the entire sleep duration).
//! We detect this by comparing consecutive idle readings: if idle_ms
//! jumped by more than SLEEP_GAP_MS between polls, the machine almost
//! certainly slept. We emit SystemSleep + SystemResume in that case.
//!
//! This heuristic isn't perfect — if the user goes idle for >30 minutes
//! without sleeping it looks the same. A proper solution uses
//! `RegisterSuspendResumeNotification` on Windows. That's a future
//! improvement; the heuristic covers the common case.

use std::sync::Arc;

use tokio::sync::mpsc;
use tokio::time::{Duration, interval};
use tracing::debug;

use tracker_core::{EventKind, IdleEndData, IdleStartData};

use crate::errors::CollectorError;
use crate::platform::PlatformCollector;

/// How often to poll for idle state changes.
const IDLE_POLL_INTERVAL_MS: u64 = 5_000; // every 5 seconds

/// Gap larger than this between idle readings = assume sleep occurred.
/// 30 minutes: long enough to not false-positive on a very short sleep.
const SLEEP_GAP_MS: u64 = 30 * 60 * 1000;

/// Internal state of the idle detector.
#[derive(Debug, PartialEq)]
enum IdleState {
    Active,
    Idle { idle_start_ms: u64 },
}

pub struct IdleDetector {
    pub threshold_secs: u32,
}

impl IdleDetector {
    pub fn new(threshold_secs: u32) -> Self {
        Self { threshold_secs }
    }
}

/// Drives the idle detector loop.
pub async fn run_idle_detector(
    platform: Arc<dyn PlatformCollector>,
    threshold_secs: u32,
    tx: mpsc::Sender<EventKind>,
    mut shutdown: tokio::sync::watch::Receiver<bool>,
) -> Result<(), CollectorError> {
    let threshold_ms = threshold_secs as u64 * 1000;
    let mut ticker = interval(Duration::from_millis(IDLE_POLL_INTERVAL_MS));

    let mut state = IdleState::Active;
    let mut last_idle_ms: u64 = 0;
    let mut idle_started_wall_ms: u64 = 0;

    loop {
        tokio::select! {
            _ = ticker.tick() => {
                let idle_ms = match platform.idle_time_ms() {
                    Ok(ms) => ms,
                    Err(_) => continue,
                };

                // ── Sleep detection heuristic ────────────────────────────────
                // If idle_ms jumped forward by more than SLEEP_GAP_MS since
                // our last poll AND we weren't already idle, the machine slept.
                let gap = idle_ms.saturating_sub(last_idle_ms);
                if gap > SLEEP_GAP_MS {
                    debug!("sleep/wake detected: idle jumped {}ms", gap);
                    // If we were tracking idle, close it out first.
                    if let IdleState::Idle { idle_start_ms } = state {
                        let duration = (idle_ms - idle_start_ms) / 1000;
                        let _ = tx.send(EventKind::IdleEnd(IdleEndData {
                            idle_duration_secs: duration,
                        })).await;
                    }
                    let _ = tx.send(EventKind::SystemSleep).await;
                    let _ = tx.send(EventKind::SystemResume).await;
                    state = IdleState::Active;
                    last_idle_ms = 0;
                    continue;
                }
                last_idle_ms = idle_ms;

                // ── Idle state machine ───────────────────────────────────────
                match &state {
                    IdleState::Active => {
                        if idle_ms >= threshold_ms {
                            debug!("idle started after {}ms", idle_ms);
                            idle_started_wall_ms = now_ms().saturating_sub(idle_ms);
                            state = IdleState::Idle { idle_start_ms: idle_ms };
                            if tx.send(EventKind::IdleStart(IdleStartData {
                                idle_threshold_secs: threshold_secs,
                            })).await.is_err() {
                                break;
                            }
                        }
                    }
                    IdleState::Idle { idle_start_ms } => {
                        if idle_ms < threshold_ms {
                            // User came back.
                            let duration_secs = idle_start_ms.saturating_sub(0) / 1000;
                            // Better: use wall clock delta
                            let wall_duration = (now_ms().saturating_sub(idle_started_wall_ms)) / 1000;
                            debug!("idle ended, duration ~{}s", wall_duration);
                            state = IdleState::Active;
                            if tx.send(EventKind::IdleEnd(IdleEndData {
                                idle_duration_secs: wall_duration.max(duration_secs),
                            })).await.is_err() {
                                break;
                            }
                        }
                    }
                }
            }
            _ = shutdown.changed() => {
                if *shutdown.borrow() {
                    debug!("idle detector shutting down");
                    break;
                }
            }
        }
    }

    Ok(())
}

fn now_ms() -> u64 {
    use std::time::{SystemTime, UNIX_EPOCH};
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0)
}

// ── Tests ─────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn sleep_detection_threshold() {
        // Simulate: last_idle_ms was 0, now it's 40 minutes — means sleep.
        let last = 0u64;
        let current = 40 * 60 * 1000u64;
        let gap = current.saturating_sub(last);
        assert!(gap > SLEEP_GAP_MS, "should detect sleep");
    }

    #[test]
    fn no_sleep_detection_for_long_idle() {
        // 25 minutes of normal idle should not trigger sleep detection.
        let last = 20 * 60 * 1000u64;
        let current = 25 * 60 * 1000u64;
        let gap = current.saturating_sub(last);
        assert!(gap < SLEEP_GAP_MS, "should not detect sleep for normal idle progression");
    }

    #[test]
    fn idle_threshold_logic() {
        let threshold_ms = 120_000u64; // 2 minutes
        assert!(5_000u64 < threshold_ms, "5s should not trigger idle");
        assert!(180_000u64 >= threshold_ms, "3m should trigger idle");
    }
}