// All calls to the Rust backend live here.
// The mock fallback lets the UI run in browser (npm run dev) without Tauri.

const isTauri = typeof window !== "undefined" && "__TAURI__" in window;

async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  if (isTauri) {
    const { invoke: tauriInvoke } = await import("@tauri-apps/api/core");
    return tauriInvoke<T>(cmd, args);
  }
  // Browser mock — returns realistic dummy data for development
  return mockInvoke<T>(cmd, args);
}

export interface StatCardData {
  total_screen_time: string;
  productive_time: string;
  idle_time: string;
  event_count: number;
  total_active_secs: number;
  productive_secs: number;
  idle_secs: number;
}

export interface AppUsageItem {
  app_name: string;
  active_time: string;
  active_secs: number;
  focus_count: number;
  longest_span: string;
  longest_span_secs: number;
  percentage: number;
}

export interface HourlyBucket {
  hour: string;
  active_min: number;
  idle_min: number;
}

export interface TimelineItem {
  start_ms: number;
  end_ms: number;
  kind: string;
  label: string;
  duration: string;
}

export interface WeekDay {
  date: string;
  label: string;
  active_secs: number;
  active_time: string;
  top_app: string | null;
}

export interface WeeklySummary {
  week_label: string;
  total_active_time: string;
  total_idle_time: string;
  avg_daily_time: string;
  most_used_app: string | null;
  days: WeekDay[];
}

export interface TrackerStatus {
  is_running: boolean;
  total_events: number;
  last_event_at: string | null;
  db_path: string;
}

export const api = {
  getDailyStats: (date: string) => invoke<StatCardData>("get_daily_stats", { date }),
  getAppUsage: (date: string) => invoke<AppUsageItem[]>("get_app_usage", { date }),
  getHourlyActivity: (date: string) => invoke<HourlyBucket[]>("get_hourly_activity", { date }),
  getTimeline: (date: string) => invoke<TimelineItem[]>("get_timeline", { date }),
  getWeeklyStats: (date: string) => invoke<WeeklySummary>("get_weekly_stats", { date }),
  getTrackerStatus: () => invoke<TrackerStatus>("get_tracker_status"),
};

// ── Mock data for browser dev mode ────────────────────────────────────────────

function mockInvoke<T>(cmd: string, _args?: Record<string, unknown>): Promise<T> {
  const mocks: Record<string, unknown> = {
    get_daily_stats: {
      total_screen_time: "7h 42m", productive_time: "4h 18m",
      idle_time: "1h 24m", event_count: 342,
      total_active_secs: 27720, productive_secs: 15480, idle_secs: 5040,
    } satisfies StatCardData,

    get_app_usage: [
      { app_name: "code.exe", active_time: "2h 14m", active_secs: 8040, focus_count: 12, longest_span: "47m", longest_span_secs: 2820, percentage: 92 },
      { app_name: "chrome.exe", active_time: "1h 48m", active_secs: 6480, focus_count: 28, longest_span: "22m", longest_span_secs: 1320, percentage: 74 },
      { app_name: "slack.exe", active_time: "58m", active_secs: 3480, focus_count: 34, longest_span: "8m", longest_span_secs: 480, percentage: 42 },
      { app_name: "figma.exe", active_time: "46m", active_secs: 2760, focus_count: 6, longest_span: "18m", longest_span_secs: 1080, percentage: 34 },
      { app_name: "spotify.exe", active_time: "32m", active_secs: 1920, focus_count: 4, longest_span: "14m", longest_span_secs: 840, percentage: 24 },
      { app_name: "outlook.exe", active_time: "24m", active_secs: 1440, focus_count: 11, longest_span: "6m", longest_span_secs: 360, percentage: 18 },
    ] satisfies AppUsageItem[],

    get_hourly_activity: [
      { hour: "8a", active_min: 18, idle_min: 8 },
      { hour: "9a", active_min: 42, idle_min: 6 },
      { hour: "10a", active_min: 50, idle_min: 4 },
      { hour: "11a", active_min: 46, idle_min: 10 },
      { hour: "12p", active_min: 20, idle_min: 28 },
      { hour: "1p", active_min: 30, idle_min: 18 },
      { hour: "2p", active_min: 48, idle_min: 8 },
      { hour: "3p", active_min: 44, idle_min: 12 },
      { hour: "4p", active_min: 38, idle_min: 14 },
      { hour: "5p", active_min: 22, idle_min: 22 },
      { hour: "6p", active_min: 12, idle_min: 30 },
    ] satisfies HourlyBucket[],

    get_timeline: [
      { start_ms: 1710230400000, end_ms: 1710232200000, kind: "active", label: "code.exe", duration: "30m" },
      { start_ms: 1710232200000, end_ms: 1710233100000, kind: "active", label: "chrome.exe", duration: "15m" },
      { start_ms: 1710233100000, end_ms: 1710234000000, kind: "idle", label: "Idle", duration: "15m" },
      { start_ms: 1710234000000, end_ms: 1710237600000, kind: "active", label: "code.exe", duration: "1h" },
      { start_ms: 1710237600000, end_ms: 1710239400000, kind: "active", label: "slack.exe", duration: "30m" },
      { start_ms: 1710239400000, end_ms: 1710241200000, kind: "active", label: "figma.exe", duration: "30m" },
      { start_ms: 1710241200000, end_ms: 1710243000000, kind: "idle", label: "Idle", duration: "30m" },
      { start_ms: 1710243000000, end_ms: 1710248400000, kind: "active", label: "code.exe", duration: "1h 30m" },
      { start_ms: 1710248400000, end_ms: 1710252000000, kind: "tracker_off", label: "Tracker off", duration: "1h" },
    ] satisfies TimelineItem[],

    get_weekly_stats: {
      week_label: "Week of Mar 11",
      total_active_time: "34h 12m", total_idle_time: "8h 44m",
      avg_daily_time: "4h 53m", most_used_app: "code.exe",
      days: [
        { date: "2024-03-11", label: "Mon", active_secs: 18000, active_time: "5h 0m", top_app: "code.exe" },
        { date: "2024-03-12", label: "Tue", active_secs: 15480, active_time: "4h 18m", top_app: "code.exe" },
        { date: "2024-03-13", label: "Wed", active_secs: 21600, active_time: "6h 0m", top_app: "figma.exe" },
        { date: "2024-03-14", label: "Thu", active_secs: 14400, active_time: "4h 0m", top_app: "chrome.exe" },
        { date: "2024-03-15", label: "Fri", active_secs: 16200, active_time: "4h 30m", top_app: "code.exe" },
        { date: "2024-03-16", label: "Sat", active_secs: 7200, active_time: "2h 0m", top_app: "chrome.exe" },
        { date: "2024-03-17", label: "Sun", active_secs: 3600, active_time: "1h 0m", top_app: "spotify.exe" },
      ],
    } satisfies WeeklySummary,

    get_tracker_status: {
      is_running: true, total_events: 4821,
      last_event_at: "2024-03-12 17:44:02",
      db_path: "C:\\Users\\You\\.tracker\\tracker.db",
    } satisfies TrackerStatus,
  };

  return Promise.resolve(mocks[cmd] as T);
}