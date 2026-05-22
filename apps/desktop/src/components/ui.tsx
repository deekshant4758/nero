import { ReactNode } from "react";
import { LucideIcon, ArrowUp, ArrowDown } from "lucide-react";

// ── Card ──────────────────────────────────────────────────────────────────────

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Card({ children, style }: CardProps) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      padding: "20px 22px",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────

export function SectionHeader({
  title, subtitle, action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
      <div>
        <p style={{ fontWeight: 500, fontSize: 13, margin: 0 }}>{title}</p>
        {subtitle && <p style={{ color: "var(--text-2)", fontSize: 12, marginTop: 2 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  delta?: string;
  deltaUp?: boolean;
  deltaPositive?: boolean; // whether "up" is good (default true)
}

export function StatCard({ label, value, icon: Icon, delta, deltaUp, deltaPositive = true }: StatCardProps) {
  const isGood = deltaPositive ? deltaUp : !deltaUp;
  const deltaColor = isGood ? "var(--green)" : "var(--amber)";

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 12, color: "var(--text-2)" }}>{label}</span>
        <Icon size={14} color="var(--text-3)" />
      </div>
      <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.4px", marginBottom: 8, fontFamily: "var(--font-sans)" }}>
        {value}
      </div>
      {delta && (
        <div style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 3, color: deltaColor }}>
          {deltaUp ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
          {delta} vs yesterday
        </div>
      )}
    </Card>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────────

export function SkeletonCard({ height = 120 }: { height?: number }) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      padding: "20px 22px",
      height,
    }}>
      <div className="skeleton" style={{ height: 12, width: "40%", marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 28, width: "60%", marginBottom: 12 }} />
      <div className="skeleton" style={{ height: 10, width: "30%" }} />
    </div>
  );
}

export function SkeletonBar({ height = 200 }: { height?: number }) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      padding: "20px 22px",
      height,
    }}>
      <div className="skeleton" style={{ height: 12, width: "30%", marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 10, width: "50%", marginBottom: 24 }} />
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: height - 90 }}>
        {[60, 85, 95, 80, 50, 70, 90, 75, 65, 45, 30].map((h, i) => (
          <div key={i} className="skeleton" style={{ flex: 1, height: `${h}%`, borderRadius: 4 }} />
        ))}
      </div>
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────

export function ProgressBar({ value, max = 100, color = "var(--accent)" }: {
  value: number; max?: number; color?: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ background: "var(--surface-2)", borderRadius: 999, height: 5, overflow: "hidden" }}>
      <div style={{
        width: `${pct}%`, height: "100%",
        background: color, borderRadius: 999,
        transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
      }} />
    </div>
  );
}

// ── App icon ─────────────────────────────────────────────────────────────────

const APP_ICONS: Record<string, string> = {
  "code.exe":    "⬛",
  "chrome.exe":  "🌐",
  "firefox.exe": "🦊",
  "slack.exe":   "💬",
  "figma.exe":   "🎨",
  "spotify.exe": "🎵",
  "outlook.exe": "📧",
  "teams.exe":   "💼",
  "discord.exe": "🎮",
  "notion.exe":  "📝",
  "obsidian.exe":"🪨",
  "terminal":    "⬛",
  "wt.exe":      "⬛",
};

export function AppIcon({ appName }: { appName: string }) {
  const emoji = APP_ICONS[appName.toLowerCase()] ?? "🖥️";
  return (
    <div style={{
      width: 36, height: 36,
      borderRadius: "var(--radius-md)",
      background: "var(--surface-2)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 16, flexShrink: 0,
      border: "1px solid var(--border)",
    }}>
      {emoji}
    </div>
  );
}

// ── Dot legend ────────────────────────────────────────────────────────────────

export function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-2)" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block" }} />
      {label}
    </span>
  );
}

// ── Pill badge ────────────────────────────────────────────────────────────────

export function Pill({ children, color = "var(--surface-2)", textColor = "var(--text-2)" }: {
  children: ReactNode; color?: string; textColor?: string;
}) {
  return (
    <span style={{
      background: color, color: textColor,
      fontSize: 11, fontWeight: 500,
      padding: "3px 8px", borderRadius: 999,
      letterSpacing: "0.01em",
    }}>
      {children}
    </span>
  );
}

// ── Ghost button ──────────────────────────────────────────────────────────────

export function GhostButton({ children, onClick, style }: {
  children: ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <button onClick={onClick} style={{
      background: "none", border: "none",
      cursor: "pointer", color: "var(--text-2)",
      fontSize: 12, display: "flex", alignItems: "center", gap: 4,
      padding: "4px 8px", borderRadius: "var(--radius-sm)",
      fontFamily: "var(--font-sans)",
      transition: "background 0.1s, color 0.1s",
      ...style,
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--surface-2)"; (e.currentTarget as HTMLElement).style.color = "var(--text-1)"; }}
    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; (e.currentTarget as HTMLElement).style.color = "var(--text-2)"; }}
    >
      {children}
    </button>
  );
}