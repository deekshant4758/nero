//! Stub platform collector for non-Windows targets.
//!
//! Used on Linux (CI) and as a template for future macOS/Linux ports.
//! Returns synthetic data so the rest of the system compiles and tests
//! run without OS-specific APIs.

use crate::errors::CollectorError;
use crate::platform::{PlatformCollector, WindowSnapshot};

pub struct StubCollector {
    call_count: std::sync::atomic::AtomicU64,
}

impl StubCollector {
    pub fn new() -> Self {
        Self {
            call_count: std::sync::atomic::AtomicU64::new(0),
        }
    }
}

impl PlatformCollector for StubCollector {
    fn focused_window(&self) -> Result<Option<WindowSnapshot>, CollectorError> {
        let n = self.call_count.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
        // Rotate through a few fake apps so tests get realistic event streams.
        let (app, title) = match n % 4 {
            0 => ("code.exe", "main.rs — tracker"),
            1 => ("chrome.exe", "GitHub - Google Chrome"),
            2 => ("slack.exe", "Slack"),
            _ => ("code.exe", "session.rs — tracker"),
        };
        Ok(Some(WindowSnapshot {
            app_name:     app.to_string(),
            window_title: title.to_string(),
            process_id:   1000 + (n % 3) as u32,
            exe_path:     None,
        }))
    }

    fn idle_time_ms(&self) -> Result<u64, CollectorError> {
        // Always return "not idle" so idle tests must inject fake idle time.
        Ok(0)
    }
}