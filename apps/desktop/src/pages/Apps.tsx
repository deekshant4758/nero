import { useDayData, DateFilter } from "../hooks/useTracker";
import { Card, SectionHeader, ProgressBar, AppIcon, SkeletonCard } from "../components/ui";

interface Props { date: DateFilter; }

export default function Apps({ date }: Props) {
  const { apps, stats, loading } = useDayData(date);
  const maxSecs = apps?.[0]?.active_secs ?? 1;

  return (
    <div className="animate-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Summary row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {loading ? [1,2,3].map(i => <SkeletonCard key={i} height={90} />) : [
          { label: "Apps used today", value: String(apps?.length ?? 0) },
          { label: "Total active time", value: stats?.productive_time ?? "—" },
          { label: "Avg per app",
            value: apps && apps.length > 0 && stats
              ? (() => { const s = Math.round(stats.productive_secs / apps.length); const h = Math.floor(s/3600); const m = Math.floor((s%3600)/60); return h > 0 ? `${h}h ${m}m` : `${m}m`; })()
              : "—"
          },
        ].map(({ label, value }) => (
          <Card key={label} style={{ padding: "16px 20px" }}>
            <p style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 8 }}>{label}</p>
            <p style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.3px", fontFamily: "var(--font-sans)" }}>{value}</p>
          </Card>
        ))}
      </div>

      {/* Full app list */}
      {loading ? <SkeletonCard height={500} /> : (
        <Card>
          <SectionHeader title="All applications" subtitle={`${apps?.length ?? 0} apps used today`} />

          {/* Table header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 80px 80px 80px 120px",
            gap: 12, padding: "0 0 10px",
            borderBottom: "1px solid var(--border)",
            fontSize: 11, color: "var(--text-3)", fontWeight: 500,
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}>
            <span>Application</span>
            <span style={{ textAlign: "right" }}>Time</span>
            <span style={{ textAlign: "right" }}>Focuses</span>
            <span style={{ textAlign: "right" }}>Longest</span>
            <span>Usage</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {(apps ?? []).map((app, idx) => (
              <div key={app.app_name} style={{
                display: "grid",
                gridTemplateColumns: "1fr 80px 80px 80px 120px",
                gap: 12,
                padding: "14px 0",
                borderBottom: idx < (apps?.length ?? 0) - 1 ? "1px solid var(--border)" : "none",
                alignItems: "center",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <AppIcon appName={app.app_name} />
                  <div>
                    <p style={{ fontWeight: 500, fontSize: 13, marginBottom: 2 }}>
                      {app.app_name.replace(".exe", "").replace(/^\w/, c => c.toUpperCase())}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
                      {app.app_name}
                    </p>
                  </div>
                </div>
                <span style={{ textAlign: "right", fontSize: 13, fontFamily: "var(--font-mono)", fontWeight: 500 }}>
                  {app.active_time}
                </span>
                <span style={{ textAlign: "right", fontSize: 13, color: "var(--text-2)" }}>
                  {app.focus_count}
                </span>
                <span style={{ textAlign: "right", fontSize: 13, color: "var(--text-2)", fontFamily: "var(--font-mono)" }}>
                  {app.longest_span}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <ProgressBar value={app.active_secs} max={maxSecs} />
                  </div>
                  <span style={{ fontSize: 11, color: "var(--text-3)", minWidth: 28, textAlign: "right" }}>
                    {app.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}