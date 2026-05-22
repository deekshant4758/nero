import { useState, useEffect, useCallback } from "react";
import { api, StatCardData, AppUsageItem, HourlyBucket, TimelineItem, WeeklySummary, TrackerStatus } from "../lib/api";

export type DateFilter = "today" | "yesterday" | string;

interface DayData {
  stats:   StatCardData   | null;
  apps:    AppUsageItem[] | null;
  hourly:  HourlyBucket[] | null;
  timeline:TimelineItem[] | null;
  loading: boolean;
  error:   string | null;
}

interface WeekData {
  summary: WeeklySummary | null;
  loading: boolean;
  error:   string | null;
}

export function useDayData(date: DateFilter): DayData & { refresh: () => void } {
  const [stats,    setStats]    = useState<StatCardData   | null>(null);
  const [apps,     setApps]     = useState<AppUsageItem[] | null>(null);
  const [hourly,   setHourly]   = useState<HourlyBucket[] | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[] | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, a, h, t] = await Promise.all([
        api.getDailyStats(date),
        api.getAppUsage(date),
        api.getHourlyActivity(date),
        api.getTimeline(date),
      ]);
      setStats(s);
      setApps(a);
      setHourly(h);
      setTimeline(t);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => { load(); }, [load]);

  return { stats, apps, hourly, timeline, loading, error, refresh: load };
}

export function useWeekData(date: DateFilter): WeekData & { refresh: () => void } {
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await api.getWeeklyStats(date);
      setSummary(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => { load(); }, [load]);

  return { summary, loading, error, refresh: load };
}

export function useTrackerStatus() {
  const [status,  setStatus]  = useState<TrackerStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTrackerStatus().then(s => { setStatus(s); setLoading(false); });
    // Poll every 30s
    const id = setInterval(() => {
      api.getTrackerStatus().then(setStatus);
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  return { status, loading };
}