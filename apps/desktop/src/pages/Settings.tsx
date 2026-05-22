import { useState } from "react";
import { Database, Clock, Activity, FolderOpen } from "lucide-react";
import { useTrackerStatus } from "../hooks/useTracker";
import { Card, SectionHeader, Pill } from "../components/ui";

export default function Settings() {
  const { status, loading } = useTrackerStatus();
  const [idleThreshold, setIdleThreshold] = useState(120);

  return (
    <div className="animate-in" style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 720 }}>

      {/* Tracker status */}
      <Card>
        <SectionHeader title="Tracker status" subtitle="Current tracking session" />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Row label="Status">
            {loading ? (
              <div className="skeleton" style={{ height: 22, width: 80 }} />
            ) : (
              <Pill
                color={status?.is_running ? "#dcfce7" : "#fee2e2"}
                textColor={status?.is_running ? "#15803d" : "#b91c1c"}
              >
                {status?.is_running ? "● Running" : "○ Stopped"}
              </Pill>
            )}
          </Row>
          <Divider />
          <Row label="Total events stored">
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>
              {loading ? "—" : (status?.total_events ?? 0).toLocaleString()}
            </span>
          </Row>
          <Divider />
          <Row label="Last event">
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-2)" }}>
              {loading ? "—" : (status?.last_event_at ?? "No events yet")}
            </span>
          </Row>
          <Divider />
          <Row label="Database path">
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 11,
              color: "var(--text-2)", wordBreak: "break-all",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <FolderOpen size={13} />
              {loading ? "—" : (status?.db_path ?? "—")}
            </span>
          </Row>
        </div>
      </Card>

      {/* Collection settings */}
      <Card>
        <SectionHeader title="Collection" subtitle="How events are captured" />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>Idle threshold</p>
                <p style={{ fontSize: 12, color: "var(--text-2)" }}>
                  Mark as idle after {idleThreshold}s of inactivity
                </p>
              </div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 500, alignSelf: "center" }}>
                {idleThreshold}s
              </span>
            </div>
            <input
              type="range" min={30} max={600} step={30}
              value={idleThreshold}
              onChange={e => setIdleThreshold(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#111110" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>
              <span>30s</span><span>5m</span><span>10m</span>
            </div>
          </div>
          <Divider />
          <Row label="Window poll interval">
            <Pill>500ms</Pill>
          </Row>
          <Divider />
          <Row label="Write batch size">
            <Pill>50 events</Pill>
          </Row>
          <Divider />
          <Row label="Write flush interval">
            <Pill>500ms</Pill>
          </Row>
        </div>
      </Card>

      {/* Privacy */}
      <Card>
        <SectionHeader title="Privacy" subtitle="All data stays on your machine" />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { icon: Database, text: "100% local SQLite storage — no cloud, no sync" },
            { icon: Activity, text: "No telemetry, no analytics sent anywhere" },
            { icon: Clock,    text: "Append-only data model — nothing is ever deleted" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "var(--radius-md)",
                background: "var(--surface-2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <Icon size={15} color="var(--text-2)" />
              </div>
              <p style={{ fontSize: 13, color: "var(--text-2)" }}>{text}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* About */}
      <Card>
        <SectionHeader title="About" />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Row label="Version"><Pill>0.1.0</Pill></Row>
          <Divider />
          <Row label="Built with">
            <span style={{ fontSize: 12, color: "var(--text-2)" }}>Rust · Tauri · React · SQLite</span>
          </Row>
          <Divider />
          <Row label="License">
            <span style={{ fontSize: 12, color: "var(--text-2)" }}>MIT</span>
          </Row>
        </div>
      </Card>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 13, color: "var(--text-2)" }}>{label}</span>
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "var(--border)" }} />;
}