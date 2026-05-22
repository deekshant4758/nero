import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useWeekData, DateFilter } from "../hooks/useTracker";
import { Card, SectionHeader, SkeletonCard, SkeletonBar } from "../components/ui";

interface Props { date: DateFilter; }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-md)", padding: "8px 12px", fontSize: 12,
      boxShadow: "var(--shadow-md)",
    }}>
      <p style={{ fontWeight: 500, marginBottom: 4 }}>{label}</p>
      <p style={{ color: "var(--text-2)" }}>
        {Math.floor(payload[0].value / 3600)}h {Math.floor((payload[0].value % 3600) / 60)}m active
      </p>
    </div>
  );
};

export default function Weekly({ date }: Props) {
  const { summary, loading } = useWeekData(date);

  const maxSecs = Math.max(...(summary?.days.map(d => d.active_secs) ?? [1]));

  return (
    <div className="animate-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {loading ? [1,2,3,4].map(i => <SkeletonCard key={i} height={90} />) :
          [
            { label: "Total active",   value: summary?.total_active_time ?? "—" },
            { label: "Total idle",     value: summary?.total_idle_time ?? "—"   },
            { label: "Avg per day",    value: summary?.avg_daily_time ?? "—"    },
            { label: "Top app",        value: (summary?.most_used_app ?? "—").replace(".exe", "") },
          ].map(({ label, value }) => (
            <Card key={label} style={{ padding: "16px 20px" }}>
              <p style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 8 }}>{label}</p>
              <p style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.3px", fontFamily: "var(--font-sans)" }}>{value}</p>
            </Card>
          ))
        }
      </div>

      {/* Bar chart */}
      {loading ? <SkeletonBar height={260} /> : (
        <Card>
          <SectionHeader
            title={summary?.week_label ?? "This week"}
            subtitle="Active time per day"
          />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={summary?.days ?? []}
              barSize={36}
              margin={{ top: 0, right: 0, left: -24, bottom: 0 }}
            >
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="label"
                tickLine={false} axisLine={false}
                tick={{ fontSize: 12, fill: "var(--text-3)", fontFamily: "var(--font-sans)" }}
              />
              <YAxis
                tickLine={false} axisLine={false}
                tick={{ fontSize: 11, fill: "var(--text-3)", fontFamily: "var(--font-sans)" }}
                tickFormatter={v => `${Math.floor(v / 3600)}h`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.02)" }} />
              <Bar dataKey="active_secs" fill="#111110" radius={[4, 4, 2, 2]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Day breakdown */}
      {loading ? <SkeletonCard height={300} /> : (
        <Card>
          <SectionHeader title="Day breakdown" subtitle="Per-day summary" />

          <div style={{
            display: "grid",
            gridTemplateColumns: "60px 100px 1fr 120px",
            gap: 14, padding: "0 0 10px",
            borderBottom: "1px solid var(--border)",
            fontSize: 11, color: "var(--text-3)", fontWeight: 500,
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}>
            <span>Day</span>
            <span>Active</span>
            <span>Relative</span>
            <span>Top app</span>
          </div>

          {(summary?.days ?? []).map((day, idx, arr) => (
            <div key={day.date} style={{
              display: "grid",
              gridTemplateColumns: "60px 100px 1fr 120px",
              gap: 14, padding: "13px 0", alignItems: "center",
              borderBottom: idx < arr.length - 1 ? "1px solid var(--border)" : "none",
            }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{day.label}</span>
              <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "var(--text-2)" }}>
                {day.active_time}
              </span>
              <div style={{ background: "var(--surface-2)", borderRadius: 999, height: 5, overflow: "hidden" }}>
                <div style={{
                  width: `${(day.active_secs / maxSecs) * 100}%`,
                  height: "100%", background: "#111110", borderRadius: 999,
                  transition: "width 0.5s ease",
                }} />
              </div>
              <span style={{ fontSize: 12, color: "var(--text-3)" }}>
                {(day.top_app ?? "—").replace(".exe", "")}
              </span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}