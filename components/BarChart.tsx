"use client";
/** Horizontal bar chart with per subject dots, used on the findings page. */
export default function BarChart({
  rows, max = 1, min = 0.4, unit = "", caption,
}: {
  rows: { label: string; value: number; points?: number[]; tone?: "accent" | "steel" | "bad" | "good" }[];
  max?: number; min?: number; unit?: string; caption?: string;
}) {
  const span = max - min;
  const pos = (v: number) => Math.max(0, Math.min(100, ((v - min) / span) * 100));
  const color = (t?: string) =>
    t === "accent" ? "var(--signal)" : t === "bad" ? "var(--bad)"
    : t === "good" ? "var(--good)" : "var(--steel)";
  return (
    <div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex",
        flexDirection: "column", gap: 12 }}>
        {rows.map((r) => (
          <li key={r.label}>
            <div style={{ display: "flex", justifyContent: "space-between",
              fontSize: "var(--step-body)", marginBottom: 4 }}>
              <span style={{ color: "var(--ink-2)" }}>{r.label}</span>
              <span className="mono" style={{ color: "var(--ink)", fontWeight: 600 }}>
                {r.value.toFixed(3)}{unit}
              </span>
            </div>
            <div style={{ position: "relative", height: 22, background: "var(--surface-2)",
              borderRadius: 0 }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0,
                width: `${pos(r.value)}%`, background: color(r.tone), opacity: .82 }} />
              {r.points?.map((p, i) => (
                <span key={i} title={`${p.toFixed(3)}`} style={{
                  position: "absolute", left: `${pos(p)}%`, top: "50%",
                  width: 6, height: 6, marginLeft: -3, marginTop: -3, borderRadius: "50%",
                  background: "var(--ink)", opacity: .5,
                }} />
              ))}
            </div>
          </li>
        ))}
      </ul>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6,
        fontSize: "var(--step-small)", color: "var(--muted)" }}>
        <span>{min.toFixed(1)}</span><span>{max.toFixed(1)}</span>
      </div>
      {caption && <p style={{ fontSize: "var(--step-small)", color: "var(--muted)", marginTop: 8 }}>{caption}</p>}
    </div>
  );
}
