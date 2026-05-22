import { useDayData, DateFilter } from "../hooks/useTracker";
import { Card, SectionHeader, SkeletonBar } from "../components/ui";
import { TimelineItem } from "../lib/api";

interface Props { date: DateFilter; }

const KIND_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  active:      { bg: "#111110",        text: "#ffffff",        border: "#111110"       },
  idle:        { bg: "var(--surface-2)", text: "var(--text-2)", border: "var(--border)" },
  sleep:       { bg: "#e0e7ff",        text: "#3730a3",        border: "#c7d2fe"       },
  tracker_off: { bg: "var(--surface-2)", text: "var(--text-3)", border: "var(--border)" },
};

const KIND_LABELS: Record<string, string> = {
  active:      "Active",
  idle:        "Idle",
  sleep:       "Sleep",
  tracker_off: "Tracker off",
};

function msToTime(ms: number): string {
  const d = new Date(ms);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const period = h < 12 ? "am" : "pm";
  const hour = h % 12 || 12;
  return `${hour}:${m}${period}`;
}

function TimelineRow({ item, isLast }: { item: TimelineItem; isLast: boolean }) {
  const style = KIND_COLORS[item.kind] ?? KIND_COLORS.active;
  const isActive = item.kind === "active";

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "80px 80px 100px 1fr",
      gap: 16, alignItems: "center",
      padding: "10px 0",
      borderBottom: isLast ? "none" : "1px solid var(--border)",
    }}>
      <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-2)" }}>
        {msToTime(item.start_ms)}
      </span>
      <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-3)" }}>
        {msToTime(item.end_ms)}
      </span>
      <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-2)" }}>
        {item.duration}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{
          display: "inline-block",
          padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 500,
          background: style.bg, color: style.text,
          border: `1px solid ${style.border}`,
          whiteSpace: "nowrap",
        }}>
          {KIND_LABELS[item.kind] ?? item.kind}
        </span>
        {isActive && (
          <span style={{ fontSize: 12, color: "var(--text-2)" }}>
            {item.label.replace(".exe", "")}
          </span>
        )}
      </div>
    </div>
  );
}

export default function Timeline({ date }: Props) {
  const { timeline, stats, loading } = useDayData(date);

  const totalSpans = timeline?.filter(t => t.kind === "active").length ?? 0;
  const idleSpans  = timeline?.filter(t => t.kind === "idle").length ?? 0;

  return (
    <div className="animate-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {loading ? [1,2,3].map(i => (
          <div key={i} className="skeleton" style={{ height: 80, borderRadius: "var(--radius-lg)" }} />
        )) : [
          { label: "Active spans",  value: String(totalSpans)            },
          { label: "Idle periods",  value: String(idleSpans)             },
          { label: "Active time",   value: stats?.productive_time ?? "—" },
        ].map(({ label, value }) => (
          <Card key={label} style={{ padding: "16px 20px" }}>
            <p style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 8 }}>{label}</p>
            <p style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.3px" }}>{value}</p>
          </Card>
        ))}
      </div>

      {/* Visual timeline strip */}
      {!loading && timeline && timeline.length > 0 && (
        <Card>
          <SectionHeader title="Day at a glance" subtitle="Proportional time blocks" />
          <TimelineStrip items={timeline} />
        </Card>
      )}

      {/* Detailed list */}
      {loading ? <SkeletonBar height={400} /> : (
        <Card>
          <SectionHeader
            title="Activity log"
            subtitle={`${timeline?.length ?? 0} entries`}
          />
          {/* Header row */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "80px 80px 100px 1fr",
            gap: 16, padding: "0 0 10px",
            borderBottom: "1px solid var(--border)",
            fontSize: 11, color: "var(--text-3)", fontWeight: 500,
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}>
            <span>Start</span>
            <span>End</span>
            <span>Duration</span>
            <span>Activity</span>
          </div>

          {(timeline ?? []).map((item, idx) => (
            <TimelineRow key={idx} item={item} isLast={idx === (timeline?.length ?? 0) - 1} />
          ))}
        </Card>
      )}
    </div>
  );
}

// Visual proportional strip
function TimelineStrip({ items }: { items: TimelineItem[] }) {
  const start = items[0]?.start_ms ?? 0;
  const end   = items[items.length - 1]?.end_ms ?? 1;
  const total = end - start || 1;

  return (
    <div style={{
      display: "flex", height: 32, borderRadius: "var(--radius-md)",
      overflow: "hidden", gap: 2,
    }}>
      {items.map((item, idx) => {
        const width = ((item.end_ms - item.start_ms) / total) * 100;
        const style = KIND_COLORS[item.kind] ?? KIND_COLORS.active;
        return (
          <div
            key={idx}
            title={`${KIND_LABELS[item.kind] ?? item.kind}: ${item.label} (${item.duration})`}
            style={{
              width: `${width}%`, minWidth: width > 1 ? 2 : 0,
              background: style.bg,
              borderRadius: 3,
              flexShrink: 0,
              transition: "opacity 0.15s",
              cursor: "default",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.7"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
          />
        );
      })}
    </div>
  );
}