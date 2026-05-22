import { useState } from "react";
import {
  BarChart3, Clock, AlignLeft, CalendarDays,
  Settings, Monitor, ChevronLeft, ChevronRight, RefreshCw,
} from "lucide-react";
import { useTrackerStatus } from "./hooks/useTracker";
import Dashboard from "./pages/Dashboard";
import Apps      from "./pages/Apps";
import Timeline  from "./pages/Timeline";
import Weekly    from "./pages/Weekly";
import SettingsPage from "./pages/Settings";

type Page = "dashboard" | "apps" | "timeline" | "weekly" | "settings";
type DateFilter = "today" | "yesterday" | string;

const NAV_ITEMS: { id: Page; icon: typeof BarChart3; label: string }[] = [
  { id: "dashboard", icon: BarChart3,    label: "Stats"    },
  { id: "apps",      icon: Clock,        label: "Apps"     },
  { id: "timeline",  icon: AlignLeft,    label: "Timeline" },
  { id: "weekly",    icon: CalendarDays, label: "Week"     },
  { id: "settings",  icon: Settings,     label: "Settings" },
];

const PAGE_TITLES: Record<Page, string> = {
  dashboard: "Screen Time",
  apps:      "Applications",
  timeline:  "Timeline",
  weekly:    "Weekly Report",
  settings:  "Settings",
};

const PAGE_SUBTITLES: Record<Page, string> = {
  dashboard: "Your daily app usage at a glance",
  apps:      "Full application usage breakdown",
  timeline:  "Chronological activity log",
  weekly:    "Week-over-week productivity view",
  settings:  "Configuration and tracker status",
};

function formatDate(date: DateFilter): string {
  if (date === "today")     return "Today";
  if (date === "yesterday") return "Yesterday";
  try {
    const d = new Date(date + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  } catch {
    return date;
  }
}

function stepDate(date: DateFilter, direction: -1 | 1): DateFilter {
  const now   = new Date(); now.setHours(0,0,0,0);
  const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);

  let current: Date;
  if (date === "today")     current = new Date(now);
  else if (date === "yesterday") current = new Date(yesterday);
  else { current = new Date(date + "T00:00:00"); }

  current.setDate(current.getDate() + direction);

  const newDate = current.toISOString().slice(0, 10);
  const todayStr = now.toISOString().slice(0, 10);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  if (newDate === todayStr)     return "today";
  if (newDate === yesterdayStr) return "yesterday";
  if (current > now)            return "today"; // don't go into future
  return newDate;
}

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [date, setDate] = useState<DateFilter>("today");
  const { status } = useTrackerStatus();

  const showDateNav = page !== "settings" && page !== "weekly";
  const isToday = date === "today";

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      overflow: "hidden",
      background: "var(--bg)",
      fontFamily: "var(--font-sans)",
    }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside style={{
        width: 72,
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px 0",
        gap: 0,
        flexShrink: 0,
        zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{
          width: 38, height: 38,
          background: "#111110", borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 28,
        }}>
          <Monitor size={17} color="#fff" />
        </div>

        {/* Nav */}
        <nav style={{
          display: "flex", flexDirection: "column",
          gap: 2, width: "100%", padding: "0 8px", flex: 1,
        }}>
          {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
            const active = page === id;
            return (
              <button
                key={id}
                onClick={() => setPage(id)}
                title={label}
                style={{
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  gap: 5, padding: "10px 0",
                  borderRadius: "var(--radius-md)", border: "none",
                  cursor: "pointer",
                  background: active ? "var(--surface-2)" : "transparent",
                  color: active ? "var(--text-1)" : "var(--text-3)",
                  fontSize: 10, fontWeight: 500,
                  fontFamily: "var(--font-sans)",
                  transition: "all 0.12s ease",
                  width: "100%",
                }}
                onMouseEnter={e => {
                  if (!active) (e.currentTarget as HTMLElement).style.color = "var(--text-2)";
                }}
                onMouseLeave={e => {
                  if (!active) (e.currentTarget as HTMLElement).style.color = "var(--text-3)";
                }}
              >
                <Icon size={17} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Tracking indicator */}
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: status?.is_running ? "#22c55e" : "#d1d5db",
          marginBottom: 4,
          boxShadow: status?.is_running ? "0 0 0 3px rgba(34,197,94,0.2)" : "none",
          transition: "all 0.3s",
        }} title={status?.is_running ? "Tracking active" : "Tracker stopped"} />
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header */}
        <header style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          padding: "0 28px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div>
            <h1 style={{ fontSize: 17, fontWeight: 600, margin: 0, letterSpacing: "-0.2px" }}>
              {PAGE_TITLES[page]}
            </h1>
            <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0, lineHeight: 1 }}>
              {PAGE_SUBTITLES[page]}
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {/* Tracking badge */}
            <div style={{
              background: "var(--surface-2)", borderRadius: 999,
              padding: "5px 11px", fontSize: 12,
              display: "flex", alignItems: "center", gap: 6,
              border: "1px solid var(--border)",
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: status?.is_running ? "#22c55e" : "#d1d5db",
                display: "inline-block",
              }} />
              {status?.is_running ? "Tracking" : "Stopped"}
            </div>

            {/* Date navigator (hidden on Settings + Weekly pages) */}
            {showDateNav && (
              <div style={{
                display: "flex", alignItems: "center",
                border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
                overflow: "hidden",
              }}>
                <button
                  onClick={() => setDate(d => stepDate(d, -1))}
                  style={navBtnStyle}
                  title="Previous day"
                >
                  <ChevronLeft size={14} />
                </button>
                <div style={{
                  padding: "5px 14px", fontSize: 13, fontWeight: 500,
                  borderLeft: "1px solid var(--border)",
                  borderRight: "1px solid var(--border)",
                  minWidth: 100, textAlign: "center",
                  background: "var(--surface)",
                  userSelect: "none",
                }}>
                  {formatDate(date)}
                </div>
                <button
                  onClick={() => !isToday && setDate(d => stepDate(d, 1))}
                  style={{ ...navBtnStyle, opacity: isToday ? 0.35 : 1, cursor: isToday ? "default" : "pointer" }}
                  title="Next day"
                  disabled={isToday}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}

            {/* Today shortcut */}
            {showDateNav && !isToday && (
              <button
                onClick={() => setDate("today")}
                style={outlineBtnStyle}
              >
                <RefreshCw size={13} /> Today
              </button>
            )}
          </div>
        </header>

        {/* Page content */}
        <main style={{
          flex: 1, overflowY: "auto",
          padding: 24,
        }}>
          {page === "dashboard" && <Dashboard date={date} onNavigate={p => setPage(p as Page)} />}
          {page === "apps"      && <Apps      date={date} />}
          {page === "timeline"  && <Timeline  date={date} />}
          {page === "weekly"    && <Weekly    date={date} />}
          {page === "settings"  && <SettingsPage />}
        </main>
      </div>
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  background: "var(--surface)", border: "none",
  cursor: "pointer", padding: "6px 10px",
  color: "var(--text-2)", display: "flex", alignItems: "center",
  transition: "background 0.1s",
};

const outlineBtnStyle: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 5,
  padding: "6px 12px", fontSize: 12, fontWeight: 500,
  background: "var(--surface)", border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)", cursor: "pointer",
  color: "var(--text-2)", fontFamily: "var(--font-sans)",
  transition: "all 0.1s",
};