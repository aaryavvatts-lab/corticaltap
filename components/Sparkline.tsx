"use client";
/** Small line chart used for tap locked curves and quick previews. */
export default function Sparkline({
  values, width = 300, height = 90, zeroAt, color = "var(--signal)",
  label, yLabel, xLabel,
}: {
  values: number[]; width?: number; height?: number; zeroAt?: number;
  color?: string; label?: string; yLabel?: string; xLabel?: string;
}) {
  const clean = values.filter((v) => Number.isFinite(v));
  if (!clean.length) return null;
  const lo = Math.min(...clean), hi = Math.max(...clean);
  const pad = (hi - lo) * 0.14 || 0.1;
  const y0 = lo - pad, y1 = hi + pad;
  const px = (i: number) => (i / (values.length - 1)) * width;
  const py = (v: number) => height - ((v - y0) / (y1 - y0)) * height;
  const d = values.map((v, i) => `${i ? "L" : "M"}${px(i).toFixed(1)},${py(v).toFixed(1)}`).join("");
  const zeroY = y0 <= 0 && y1 >= 0 ? py(0) : null;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}
      role="img" aria-label={label ?? "line chart"} style={{ display: "block", overflow: "visible" }}>
      {zeroY != null && (
        <line x1="0" y1={zeroY} x2={width} y2={zeroY}
          stroke="var(--rule-strong)" strokeWidth="1" strokeDasharray="3 3" />
      )}
      {zeroAt != null && (
        <line x1={px(zeroAt)} y1="0" x2={px(zeroAt)} y2={height}
          stroke="var(--bad)" strokeWidth="1.4" strokeDasharray="4 3" />
      )}
      <path d={d} fill="none" stroke={color} strokeWidth="2"
        strokeLinejoin="round" strokeLinecap="round" />
      {yLabel && <text x="2" y="10" fontSize="9" fill="var(--muted)"
        fontFamily="JetBrains Mono, monospace">{yLabel}</text>}
      {xLabel && <text x={width} y={height + 12} fontSize="9" fill="var(--muted)"
        textAnchor="end" fontFamily="JetBrains Mono, monospace">{xLabel}</text>}
    </svg>
  );
}
