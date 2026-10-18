"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  BAND_LABELS, SUBJECT_IDS, at, getError, getManifest, getSignal,
  type Manifest, type SubjectMeta,
} from "@/lib/data";
import { fmt } from "@/lib/dsp";
import styles from "./signals.module.css";

const WINDOW_S = 20;      // how much time the strip shows at once

export default function SignalsClient() {
  const [man, setMan] = useState<Manifest | null>(null);
  const [sub, setSub] = useState("sub-01");
  const [sig, setSig] = useState<Float32Array | null>(null);
  const [err, setErr] = useState<Float32Array | null>(null);
  const [t, setT] = useState(600);          // centre of view, in steps
  const [playing, setPlaying] = useState(false);
  const [band, setBand] = useState("hgamma1");
  const [showErr, setShowErr] = useState(true);
  const [busy, setBusy] = useState(true);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => { getManifest().then(setMan); }, []);

  useEffect(() => {
    if (!man) return;
    setBusy(true);
    const meta = man.subjects[sub];
    Promise.all([getSignal(sub, meta), getError(sub)]).then(([s, e]) => {
      setSig(s); setErr(e); setT(Math.min(600, meta.n_steps - 1)); setBusy(false);
    });
  }, [man, sub]);

  const meta: SubjectMeta | null = man ? man.subjects[sub] : null;

  useEffect(() => {
    if (!playing || !meta) return;
    let raf = 0, last = performance.now();
    const step = (now: number) => {
      const dt = now - last; last = now;
      setT((v) => {
        const nv = v + (dt / 1000) * 10;      // real time, 10 steps per second
        if (nv >= meta.n_steps - 1) { setPlaying(false); return meta.n_steps - 1; }
        return nv;
      });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, meta]);

  const draw = useCallback(() => {
    const cv = canvas.current;
    if (!cv || !sig || !meta || !man) return;
    const dpr = Math.min(devicePixelRatio, 2);
    const w = cv.clientWidth, h = cv.clientHeight;
    cv.width = w * dpr; cv.height = h * dpr;
    const g = cv.getContext("2d")!;
    g.scale(dpr, dpr);
    const css = getComputedStyle(document.body);
    const ink = css.getPropertyValue("--ink").trim();
    const muted = css.getPropertyValue("--muted").trim();
    const rule = css.getPropertyValue("--rule").trim();
    const signal = css.getPropertyValue("--signal").trim();
    const steel = css.getPropertyValue("--steel").trim();
    const bad = css.getPropertyValue("--bad").trim();

    g.clearRect(0, 0, w, h);
    const half = (WINDOW_S / man.hop_s) / 2;
    const t0 = Math.max(0, Math.round(t - half));
    const t1 = Math.min(meta.n_steps - 1, Math.round(t + half));
    const span = Math.max(1, t1 - t0);
    const X = (i: number) => ((i - t0) / span) * w;

    const bi = man.bands.indexOf(band);
    const lanes = meta.n_ch;
    const top = 26, bottom = showErr ? 74 : 26;
    const laneH = (h - top - bottom) / lanes;

    // shade the moments the patient was tapping
    for (let i = t0; i <= t1; i++) {
      if (meta.labels[i] === 1) {
        g.fillStyle = signal + "1F";
        g.fillRect(X(i), top, Math.max(1, w / span), h - top - bottom);
      }
    }
    // gridlines every 5 s
    g.strokeStyle = rule; g.lineWidth = 1;
    const stepPer5s = 5 / man.hop_s;
    for (let i = Math.ceil(t0 / stepPer5s) * stepPer5s; i <= t1; i += stepPer5s) {
      g.beginPath(); g.moveTo(X(i), top); g.lineTo(X(i), h - bottom); g.stroke();
      g.fillStyle = muted; g.font = "13px Erode, Georgia, serif";
      g.fillText(`${(i * man.hop_s).toFixed(0)}s`, X(i) + 3, top - 8);
    }

    // one line per electrode
    for (let c = 0; c < lanes; c++) {
      const yMid = top + laneH * (c + 0.5);
      g.strokeStyle = c % 2 ? steel : signal;
      g.globalAlpha = 0.85; g.lineWidth = 1.15;
      g.beginPath();
      for (let i = t0; i <= t1; i++) {
        const v = at(sig, meta, i, c, bi);
        const y = yMid - Math.max(-3, Math.min(3, v)) * (laneH * 0.30);
        i === t0 ? g.moveTo(X(i), y) : g.lineTo(X(i), y);
      }
      g.stroke();
      g.globalAlpha = 1;
      g.fillStyle = muted; g.font = "13px Erode, Georgia, serif";
      g.fillText(meta.channels[c], 3, yMid - laneH * 0.2);
    }

    // taps
    g.strokeStyle = bad; g.lineWidth = 1;
    g.globalAlpha = 0.5;
    for (const tap of meta.taps) {
      const i = tap / man.hop_s;
      if (i < t0 || i > t1) continue;
      g.beginPath(); g.moveTo(X(i), top); g.lineTo(X(i), h - bottom); g.stroke();
    }
    g.globalAlpha = 1;

    // forecast error strip
    if (showErr && err) {
      const eTop = h - bottom + 14, eH = 44;
      g.fillStyle = muted; g.font = "13px Erode, Georgia, serif";
      g.fillText("how wrong the forecast was", 3, eTop - 3);
      let lo = Infinity, hi = -Infinity;
      for (let i = t0; i <= t1; i++) {
        const v = err[i];
        if (v >= 0) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
      }
      if (hi > lo) {
        g.strokeStyle = ink; g.lineWidth = 1.4; g.beginPath();
        let started = false;
        for (let i = t0; i <= t1; i++) {
          const v = err[i];
          if (v < 0) { started = false; continue; }
          const y = eTop + eH - ((v - lo) / (hi - lo)) * eH;
          started ? g.lineTo(X(i), y) : g.moveTo(X(i), y);
          started = true;
        }
        g.stroke();
      }
      g.strokeStyle = rule;
      g.beginPath(); g.moveTo(0, eTop + eH); g.lineTo(w, eTop + eH); g.stroke();
    }

    // playhead
    g.strokeStyle = ink; g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(X(t), 0); g.lineTo(X(t), h); g.stroke();
  }, [sig, err, meta, man, t, band, showErr]);

  useEffect(() => { draw(); }, [draw]);
  useEffect(() => {
    const on = () => draw();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, [draw]);

  const nowLabel = meta && man ? (t * man.hop_s).toFixed(1) : "0";
  const state = meta ? meta.labels[Math.round(t)] : -1;
  const nearestTap = meta
    ? meta.taps.reduce((best, tap) =>
        Math.abs(tap - t * 0.1) < Math.abs(best - t * 0.1) ? tap : best, meta.taps[0] ?? 0)
    : 0;

  return (
    <>
      <section className={`wrap page-head ${styles.head}`}>
        <h1>A brain during a tapping game</h1>
        <p className={`prose ${styles.lede}`}>
          These are real recordings, not a simulation. Each line is one electrode. Press
          play and the strip runs at the speed the recording was made. Red marks are
          finger taps. The shaded blocks are the moments counted as movement.
        </p>
      </section>

      <section className={`wrap ${styles.tools}`}>
        <label className={styles.field}>
          <span>Patient</span>
          <select value={sub} onChange={(e) => { setPlaying(false); setSub(e.target.value); }}>
            {SUBJECT_IDS.map((s) => (
              <option key={s} value={s}>{s.replace("sub-", "Patient ")}</option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>Frequency band</span>
          <select value={band} onChange={(e) => setBand(e.target.value)}>
            {man?.bands.map((b) => (
              <option key={b} value={b}>{BAND_LABELS[b] ?? b}</option>
            ))}
          </select>
        </label>
        <button className="btn" onClick={() => setPlaying(!playing)} disabled={busy}>
          {playing ? "Pause" : "Play"}
        </button>
        <label className={styles.check}>
          <input type="checkbox" checked={showErr}
            onChange={(e) => setShowErr(e.target.checked)} />
          <span>Show forecast error</span>
        </label>
      </section>

      <section className={`wrap ${styles.stageWrap}`}>
        <div className={styles.stage}>
          {busy && <p className={styles.loading}>Loading recording…</p>}
          <canvas ref={canvas} className={styles.canvas}
            role="img"
            aria-label={`Sixteen electrode traces from ${sub}, ${BAND_LABELS[band]}, around ${nowLabel} seconds into the recording.`} />
        </div>

        <div className={styles.scrub}>
          <label htmlFor="scrub" className={styles.srOnly}>Move through the recording</label>
          <input id="scrub" type="range" min={0} max={meta ? meta.n_steps - 1 : 100}
            value={Math.round(t)} onChange={(e) => { setPlaying(false); setT(+e.target.value); }} />
          <div className={styles.readouts}>
            <span className="mono">{nowLabel} s of {meta?.duration ?? 0} s</span>
            <span className={state === 1 ? styles.moving : state === 0 ? styles.resting : styles.between}>
              {state === 1 ? "tapping" : state === 0 ? "resting" : "in between"}
            </span>
            <span className="mono">nearest tap {fmt(nearestTap, 1)} s</span>
            <span className="mono">{meta?.n_ch_total ?? 0} contacts recorded, 16 shown</span>
          </div>
        </div>
      </section>

      <section className={`wrap ${styles.notes}`}>
        <div className={styles.notesGrid}>
          <div>
            <h2>How to read the strip</h2>
            <p>
              Each trace is power in one frequency band at one electrode, updated ten
              times a second. Values are standardised per electrode, so the height shows
              how unusual that moment was for that contact rather than raw voltage.
            </p>
            <p>
              Switch to high gamma and look at the shaded blocks. On the electrodes that
              sit over hand cortex you can often see the lines lift as tapping starts.
              Beta does the opposite and tends to drop during movement.
            </p>
          </div>
          <div>
            <h2>The line at the bottom</h2>
            <p>
              That is how wrong the forecasting model was at each moment. It was trained
              only to guess the next tenth of a second, never told when taps happened.
            </p>
            <p>
              The surprise is which way it moves. Error tends to fall during tapping, not
              rise. Fast repeated tapping makes the signal more regular, and regular is
              easier to predict. That held for all eight patients.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
