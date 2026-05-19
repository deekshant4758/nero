//! Window focus collector.
//!
//! Polls the platform for the focused window at a configurable interval
//! and emits a `WindowFocus` event only when the window *changes*.
//! "Changes" means: different app_name OR different process_id.
//! Title-only changes (e.g. browser tab switch) do NOT emit a new event —
//! that would be too noisy. Browser URL tracking will come via extension.
//!
//! # Polling vs hooking
//!
//! Windows provides `SetWinEventHook` for event-driven focus notifications.
//! We use polling instead because:
//! - Hooks require a message pump on a dedicated thread (complex).
//! - Some focus changes (e.g. UAC dialogs, game captures) don't fire hooks.
//! - 500ms polling is imperceptible to users and uses < 0.1% CPU.
//!
//! This decision can be revisited later without changing the event model.

use std::sync::Arc;

use tokio::sync::mpsc;
use tokio::time::{Duration, interval};
use tracing::{debug, warn};

use tracker_core::{EventKind, WindowFocusData};

use crate::errors::CollectorError;
use crate::platform::{PlatformCollector, WindowSnapshot};

/// How often to poll for window changes.
const POLL_INTERVAL_MS: u64 = 500;

/// Drives the window collector loop.
///
/// Runs until `shutdown` is cancelled. Sends `EventKind` values into
/// `tx` on every window change.
pub async fn run_window_collector(
    platform: Arc<dyn PlatformCollector>,
    tx: mpsc::Sender<EventKind>,
    mut shutdown: tokio::sync::watch::Receiver<bool>,
) -> Result<(), CollectorError> {
    let mut ticker = interval(Duration::from_millis(POLL_INTERVAL_MS));
    let mut last_snapshot: Option<WindowSnapshot> = None;

    loop {
        tokio::select! {
            _ = ticker.tick() => {
                match platform.focused_window() {
                    Ok(Some(snapshot)) => {
                        if should_emit(&last_snapshot, &snapshot) {
                            debug!(
                                app = %snapshot.app_name,
                                pid = snapshot.process_id,
                                "window focus changed"
                            );
                            let kind = EventKind::WindowFocus(WindowFocusData {
                                app_name:     snapshot.app_name.clone(),
                                window_title: snapshot.window_title.clone(),
                                process_id:   snapshot.process_id,
                                exe_path:     snapshot.exe_path.clone(),
                            });
                            // If receiver is gone (shutdown in progress), stop.
                            if tx.send(kind).await.is_err() {
                                break;
                            }
                            last_snapshot = Some(snapshot);
                        }
                    }
                    Ok(None) => {
                        // Desktop focused — no active window. Clear last snapshot
                        // so next real focus triggers a new event.
                        last_snapshot = None;
                    }
                    Err(e) => {
                        // Log but don't crash. Transient API failures happen
                        // (e.g. process exits between our calls).
                        warn!("window poll error: {}", e);
                    }
                }
            }
            _ = shutdown.changed() => {
                if *shutdown.borrow() {
                    debug!("window collector shutting down");
                    break;
                }
            }
        }
    }

    Ok(())
}

/// Returns true if the new snapshot represents a meaningful focus change.
/// We ignore title-only changes to avoid noise from browser tab switches.
fn should_emit(last: &Option<WindowSnapshot>, current: &WindowSnapshot) -> bool {
    match last {
        None => true, // first event ever
        Some(prev) => {
            prev.app_name != current.app_name
                || prev.process_id != current.process_id
        }
    }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use crate::platform::WindowSnapshot;

    fn snap(app: &str, pid: u32) -> WindowSnapshot {
        WindowSnapshot {
            app_name:     app.to_string(),
            window_title: "title".to_string(),
            process_id:   pid,
            exe_path:     None,
        }
    }

    #[test]
    fn emits_on_first_snapshot() {
        assert!(should_emit(&None, &snap("code.exe", 1)));
    }

    #[test]
    fn no_emit_on_same_app_and_pid() {
        let last = Some(snap("code.exe", 1));
        assert!(!should_emit(&last, &snap("code.exe", 1)));
    }

    #[test]
    fn emits_on_app_change() {
        let last = Some(snap("code.exe", 1));
        assert!(should_emit(&last, &snap("chrome.exe", 1)));
    }

    #[test]
    fn emits_on_pid_change_same_app() {
        // Two different terminal windows, same app name.
        let last = Some(snap("wt.exe", 100));
        assert!(should_emit(&last, &snap("wt.exe", 200)));
    }

    #[test]
    fn no_emit_on_title_only_change() {
        // Browser tab switch — same app, same pid, different title.
        let last = Some(WindowSnapshot {
            app_name:     "chrome.exe".to_string(),
            window_title: "GitHub".to_string(),
            process_id:   42,
            exe_path:     None,
        });
        let current = WindowSnapshot {
            app_name:     "chrome.exe".to_string(),
            window_title: "Stack Overflow".to_string(),
            process_id:   42,
            exe_path:     None,
        };
        assert!(!should_emit(&last, &current));
    }
}