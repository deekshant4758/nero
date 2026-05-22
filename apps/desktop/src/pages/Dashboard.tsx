import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";
import { ChevronRight } from "lucide-react";

import { useDayData, DateFilter } from "../hooks/useTracker";
import {
  Card, SectionHeader, ProgressBar, AppIcon,
  LegendDot, GhostButton, SkeletonCard, SkeletonBar,
} from "../components/ui";

const CATEGORY_COLORS = ["#111110", "#6b6b66", "#a3a3a0", "#d4d4cf"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-md)", padding: "8px 12px", fontSize: 12,
      boxShadow: "var(--shadow-md)",
    }}>
      <p style={{ fontWeight: 500, marginBottom: 4 }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.fill === "#111110" ? "var(--text-1)" : "var(--text-3)", margin: "2px 0" }}>
          {p.name}: {p.value}m
        </p>
      ))}
    </div>
  );
};

interface Props {
  date: DateFilter;
  onNavigate: (page: string) => void;
}

export default function Dashboard({ date, onNavigate }: Props) {
  const { apps, hourly, loading } = useDayData(date);

  // Fake category split from app usage
  const categoryData = apps ? [
    { name: "Work",          value: Math.round((apps[0]?.active_secs ?? 0) + (apps[3]?.active_secs ?? 0)) },
    { name: "Communication", value: Math.round((apps[2]?.active_secs ?? 0) + (apps[5]?.active_secs ?? 0)) },
    { name: "Entertainment", value: Math.round((apps[4]?.active_secs ?? 0)) },
    { name: "Other",         value: Math.round((apps[1]?.active_secs ?? 0)) },
  ] : [];

  const formatCatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <div className="animate-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Hourly + Category */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>

        {loading ? <SkeletonBar height={280} /> : (
          <Card>
            <SectionHeader
              title="Hourly activity"
              subtitle="Minutes used per hour"
              action={
                <div style={{ display: "flex", gap: 12 }}>
                  <LegendDot color="var(--accent)" label="Active" />
                  <LegendDot color="var(--surface-3)" label="Idle" />
                </div>
              }
            />
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hourly ?? []} barSize={18} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="hour" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--text-3)", fontFamily: "var(--font-sans)" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--text-3)", fontFamily: "var(--font-sans)" }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.02)" }} />
                <Bar dataKey="active_min" stackId="a" fill="#111110" radius={[0, 0, 2, 2]} name="active" />
                <Bar dataKey="idle_min"   stackId="a" fill="var(--surface-3)" radius={[3, 3, 0, 0]} name="idle" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {loading ? <SkeletonCard height={280} /> : (
          <Card>
            <SectionHeader title="Category split" subtitle="Time per category" />
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <PieChart width={130} height={130}>
                <Pie data={categoryData} dataKey="value" innerRadius={38} outerRadius={58} strokeWidth={3} stroke="var(--surface)">
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i]} />
                  ))}
                </Pie>
              </PieChart>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {categoryData.map(({ name, value }, i) => (
                <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: CATEGORY_COLORS[i], display: "inline-block" }} />
                    {name}
                  </span>
                  <span style={{ color: "var(--text-2)" }}>{formatCatTime(value)}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Top Apps */}
      {loading ? <SkeletonCard height={320} /> : (
        <Card>
          <SectionHeader
            title="Top applications"
            subtitle="Ranked by time used today"
            action={
              <GhostButton onClick={() => onNavigate("apps")}>
                View all <ChevronRight size={13} />
              </GhostButton>
            }
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {(apps ?? []).slice(0, 6).map((app) => (
              <div key={app.app_name} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <AppIcon appName={app.app_name} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                    <span style={{ fontWeight: 500, fontSize: 13 }}>
                      {app.app_name.replace(".exe", "")}
                    </span>
                    <span style={{ color: "var(--text-2)", fontSize: 12, fontFamily: "var(--font-mono)" }}>
                      {app.active_time}
                    </span>
                  </div>
                  <ProgressBar value={app.percentage} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}