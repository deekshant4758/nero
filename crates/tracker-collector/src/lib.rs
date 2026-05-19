//! tracker-collector — OS-level event collection.

pub mod errors;
pub mod idle;
pub mod platform;
pub mod window;

pub mod platform_impl {
    #[cfg(target_os = "windows")]
    pub mod windows;
    pub mod stub;
}

use std::sync::Arc;
use tokio::sync::mpsc;
use tracker_core::EventKind;
use crate::platform::PlatformCollector;

pub use platform::create_platform_collector;

pub struct CollectorConfig {
    pub idle_threshold_secs: u32,
}

impl Default for CollectorConfig {
    fn default() -> Self {
        Self { idle_threshold_secs: 120 }
    }
}

pub fn start_collectors(
    config: CollectorConfig,
    shutdown: tokio::sync::watch::Receiver<bool>,
) -> mpsc::Receiver<EventKind> {
    let (tx, rx) = mpsc::channel::<EventKind>(1000);
    let platform: Arc<dyn PlatformCollector> = Arc::from(create_platform_collector());

    {
        let platform = Arc::clone(&platform);
        let tx = tx.clone();
        let shutdown = shutdown.clone();
        tokio::spawn(async move {
            if let Err(e) = window::run_window_collector(platform, tx, shutdown).await {
                tracing::error!("window collector error: {}", e);
            }
        });
    }

    {
        let platform = Arc::clone(&platform);
        let tx = tx.clone();
        let shutdown = shutdown.clone();
        tokio::spawn(async move {
            if let Err(e) = idle::run_idle_detector(
                platform, config.idle_threshold_secs, tx, shutdown,
            ).await {
                tracing::error!("idle detector error: {}", e);
            }
        });
    }

    rx
}