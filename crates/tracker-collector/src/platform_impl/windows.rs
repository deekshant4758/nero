//! Windows platform collector.
//!
//! Uses the Win32 API via the `windows` crate (windows-rs).
//!
//! Key APIs used:
//! - `GetForegroundWindow()` — returns the HWND of the focused window
//! - `GetWindowThreadProcessId()` — maps HWND to a PID
//! - `OpenProcess()` + `QueryFullProcessImageNameW()` — get the exe path
//! - `GetWindowTextW()` — get the window title
//! - `GetLastInputInfo()` — get milliseconds since last user input

#[cfg(target_os = "windows")]
pub mod windows_impl {
    use std::path::PathBuf;

    use windows::Win32::Foundation::{HWND, HANDLE, CloseHandle};
    use windows::Win32::System::Threading::{
        OpenProcess, QueryFullProcessImageNameW,
        PROCESS_NAME_WIN32, PROCESS_QUERY_LIMITED_INFORMATION,
    };
    use windows::Win32::UI::WindowsAndMessaging::{
        GetForegroundWindow, GetWindowTextW, GetWindowThreadProcessId,
    };
    use windows::Win32::UI::Input::KeyboardAndMouse::{GetLastInputInfo, LASTINPUTINFO};

    use crate::errors::CollectorError;
    use crate::platform::{PlatformCollector, WindowSnapshot};

    pub struct WindowsCollector;

    impl WindowsCollector {
        pub fn new() -> Self {
            Self
        }
    }

    impl PlatformCollector for WindowsCollector {
        fn focused_window(&self) -> Result<Option<WindowSnapshot>, CollectorError> {
            unsafe {
                let hwnd: HWND = GetForegroundWindow();
                // NULL hwnd means no foreground window (e.g. desktop is focused).
                if hwnd.0 == std::ptr::null_mut() {
                    return Ok(None);
                }

                // Get the process ID owning this window.
                let mut pid: u32 = 0;
                GetWindowThreadProcessId(hwnd, Some(&mut pid));
                if pid == 0 {
                    return Ok(None);
                }

                // Get the window title (up to 512 chars — plenty for any title).
                let mut title_buf = [0u16; 512];
                let title_len = GetWindowTextW(hwnd, &mut title_buf);
                let window_title = if title_len > 0 {
                    String::from_utf16_lossy(&title_buf[..title_len as usize])
                } else {
                    String::new()
                };

                // Get the full exe path.
                let (exe_path, app_name) = get_process_info(pid);

                Ok(Some(WindowSnapshot {
                    app_name,
                    window_title,
                    process_id: pid,
                    exe_path,
                }))
            }
        }

        fn idle_time_ms(&self) -> Result<u64, CollectorError> {
            unsafe {
                // GetTickCount() returns ms since system boot (wraps at ~49 days,
                // but we only ever subtract, so wrapping is fine for short periods).
                let mut lii = LASTINPUTINFO {
                    cbSize: std::mem::size_of::<LASTINPUTINFO>() as u32,
                    dwTime: 0,
                };
                // Returns FALSE only if cbSize is wrong — can't happen here.
                let _ = GetLastInputInfo(&mut lii);

                // GetTickCount returns u32 wrapping milliseconds.
                // We use wrapping_sub to handle the ~49-day rollover safely.
                let tick_now = windows::Win32::System::SystemInformation::GetTickCount();
                let idle_ms = tick_now.wrapping_sub(lii.dwTime) as u64;
                Ok(idle_ms)
            }
        }
    }

    /// Open the process and query its image name.
    /// Returns (Some(full_path), app_name_lowercase) on success,
    /// (None, "unknown") on access denied or process-already-exited.
    fn get_process_info(pid: u32) -> (Option<String>, String) {
        unsafe {
            let handle: HANDLE = match OpenProcess(
                PROCESS_QUERY_LIMITED_INFORMATION,
                false,
                pid,
            ) {
                Ok(h) => h,
                Err(_) => return (None, "unknown".to_string()),
            };

            let mut path_buf = [0u16; 1024];
            let mut size = path_buf.len() as u32;

            let ok = QueryFullProcessImageNameW(
                handle,
                PROCESS_NAME_WIN32,
                windows::core::PWSTR(path_buf.as_mut_ptr()),
                &mut size,
            );
            let _ = CloseHandle(handle);

            if ok.is_err() || size == 0 {
                return (None, "unknown".to_string());
            }

            let full_path = String::from_utf16_lossy(&path_buf[..size as usize]);
            let app_name = PathBuf::from(&full_path)
                .file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("unknown")
                .to_lowercase();

            (Some(full_path), app_name)
        }
    }
}

// Re-export so platform.rs can use it.
#[cfg(target_os = "windows")]
pub use windows_impl::WindowsCollector;