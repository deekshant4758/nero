//! Platform abstraction layer.

use crate::errors::CollectorError;

#[derive(Debug, Clone, PartialEq)]
pub struct WindowSnapshot {
    pub app_name:     String,
    pub window_title: String,
    pub process_id:   u32,
    pub exe_path:     Option<String>,
}

pub trait PlatformCollector: Send + Sync {
    fn focused_window(&self) -> Result<Option<WindowSnapshot>, CollectorError>;
    fn idle_time_ms(&self) -> Result<u64, CollectorError>;
}

pub fn create_platform_collector() -> Box<dyn PlatformCollector> {
    #[cfg(target_os = "windows")]
    {
        Box::new(crate::platform_impl::windows::WindowsCollector::new())
    }
    #[cfg(not(target_os = "windows"))]
    {
        Box::new(crate::platform_impl::stub::StubCollector::new())
    }
}