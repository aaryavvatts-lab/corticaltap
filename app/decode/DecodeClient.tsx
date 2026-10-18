"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  SUBJECT_IDS, at, getDecoders, getManifest, getSignal,
  type Decoder, type Manifest, type SubjectMeta,
} from "@/lib/data";
import { fmt } from "@/lib/dsp";
import styles from "./decode.module.css";

const CTX = 64;  // the decoder averages the last 6.4 seconds, same as the study

export default function DecodeClient() {
  const [man, setMan] = useState<Manifest | null>(null);
  const [decs, setDecs] = useState<Record<string, Decoder> | null>(null);
  const [sub, setSub] = useState("sub-01");
  const [sig, setSig] = useState<Float32Array | null>(null);
  const [t, setT] = useState(900);
  const [auto, setAuto] = useState(false);
  const [log, setLog] = useState<{ t: number; p: number; truth: number }[]>([]);
  const gauge = useRef<HTMLCanvasElement>(null);

  useEffect(() => { getManifest().then(setMan); getDecoders().then(setDecs); }, []);
  useEffect(() => {
    if (!man) return;
    getSignal(sub, man.subjects[sub]).then(setSig);
    setT(900); setLog([]);
  }, [man, sub]);

  const meta: SubjectMeta | null = man ? man.subjects[sub] : null;
  const dec: Decoder | null = decs ? decs[sub] : null;

  /* The actual decoder. Average high gamma over the last 6.4 s on 16 contacts,
     standardise with the training statistics, then apply the fitted weights.
     These are the same numbers the study produced. Nothing is faked. */
  const score = useCallback((tt: number) => {
    if (!sig || !meta || !man || !dec) return null;
    const hi1 = man.bands.indexOf("hgamma1"), hi2 = man.bands.indexOf("hgamma2");
    const end = Math.round(tt), start = Math.max(0, end - CTX + 1);
    const n = end - start + 1;
    let z = dec.b;
    const feats: number[] = [];
    for (let c = 0; c < meta.n_ch; c++) {
      let s = 0;
      for (let i = start; i <= end; i++) s += (at(sig, meta, i, c, hi1) + at(sig, meta, i, c, hi2)) / 2;
      const f = s / n;
      feats.push(f);
      z += dec.w[c] * ((f - dec.mu[c]) / dec.sd[c]);
    }
    return { p: 1 / (1 + Math.exp(-z)), feats, z };
  }, [sig, meta, man, dec]);

  const out = useMemo(() => score(t), [score, t]);
  const truth = meta ? meta.labels[Math.round(t)] : -1;

  useEffect(() => {
    if (!auto || !meta) return;
    const id = setInterval(() => {
      setT((v) => {
        const nv = v + 5;
        return nv >= meta.n_steps - 1 ? CTX : nv;
      });
    }, 220);
    return () => clearInterval(id);
  }, [auto, meta]);

  useEffect(() => {
    if (!out || truth < 0) return;
    setLog((l) => [...l.slice(-59), { t, p: out.p, truth }]);
  }, [t, out?.p, truth]);

  const running = useMemo(() => {
    const scored = log.filter((l) => l.truth >= 0);
    if (!scored.length) return null;
    const hit = scored.filter((l) => (l.p > 0.5 ? 1 : 0) === l.truth).length;
    return { n: scored.length, acc: hit / scored.length };
  }, [log]);

  // gauge
  useEffect(() => {
    const cv = gauge.current;
    if (!cv || !out) return;
    const dpr = Math.min(devicePixelRatio, 2);
    const w = cv.clientWidth, h = cv.clientHeight;
    cv.width = w * dpr; cv.height = h * dpr;
    const g = cv.getContext("2d")!; g.scale(dpr, dpr); g.clearRect(0, 0, w, h);
    const css = getComputedStyle(document.body);
    const rule = css.getPropertyValue("--rule-strong").trim();
    const signal = css.getPropertyValue("--signal").trim();
    const steel = css.getPropertyValue("--steel").trim();
    const cx = w / 2, cy = h - 8, r = Math.min(w / 2 - 12, h - 20);
    g.lineWidth = 14; g.lineCap = "butt";
    g.strokeStyle = rule;
    g.beginPath(); g.arc(cx, cy, r, Math.PI, 2 * Math.PI); g.stroke();
    g.strokeStyle = out.p > 0.5 ? signal : steel;
    g.beginPath(); g.arc(cx, cy, r, Math.PI, Math.PI + Math.PI * out.p); g.stroke();
    const ang = Math.PI + Math.PI * out.p;
    g.strokeStyle = css.getPropertyValue("--ink").trim(); g.lineWidth = 2;
    g.beginPath(); g.moveTo(cx, cy);
    g.lineTo(cx + Math.cos(ang) * (r - 8), cy + Math.sin(ang) * (r - 8)); g.stroke();
  }, [out]);

  return (
    <>
      <section className={`wrap page-head ${styles.head}`}>
        <h1>Run the decoder yourself</h1>
        <p className={`prose ${styles.lede}`}>
          Pick any moment in a recording. The decoder reads high gamma power from sixteen
          electrodes over the previous 6.4 seconds and says whether it thinks the patient
          was tapping. The weights below are the real ones from the study, fitted on
          training blocks only, and the whole calculation happens on your machine.
        </p>
      </section>

      <section className={`wrap ${styles.grid}`}>
        <div className="card pad">
          <div className={styles.controls}>
            <label className={styles.field}>
              <span>Patient</span>
              <select value={sub} onChange={(e) => setSub(e.target.value)}>
                {SUBJECT_IDS.map((s) => (
                  <option key={s} value={s}>{s.replace("sub-", "Patient ")}</option>
                ))}
              </select>
            </label>
            <button className="btn" onClick={() => setAuto(!auto)}>
              {auto ? "Stop" : "Step through"}
            </button>
            <button className="btn" onClick={() => setLog([])}>Clear tally</button>
          </div>

          <label htmlFor="tt" className={styles.srOnly}>Choose a moment in the recording</label>
          <input id="tt" type="range" min={CTX} max={meta ? meta.n_steps - 1 : 100}
            value={Math.round(t)} onChange={(e) => { setAuto(false); setT(+e.target.value); }} />
          <p className={styles.time}>
            <span className="mono">{(t * 0.1).toFixed(1)} s</span> of{" "}
            <span className="mono">{meta?.duration ?? 0} s</span>
          </p>

          <div className={styles.verdict}>
            <div className={styles.gaugeBox}>
              <canvas ref={gauge} className={styles.gauge} role="img"
                aria-label={`Decoder confidence ${out ? Math.round(out.p * 100) : 0} percent`} />
              <p className={styles.pct}>
                <span className="mono">{out ? Math.round(out.p * 100) : 0}%</span>
              </p>
              <p className={styles.pctLabel}>confidence the patient was tapping</p>
            </div>

            <div className={styles.answers}>
              <div className={out && out.p > 0.5 ? styles.pillOn : styles.pill}>
                <span className={styles.pillK}>decoder says</span>
                <span className={styles.pillV}>{out && out.p > 0.5 ? "tapping" : "resting"}</span>
              </div>
              <div className={truth === 1 ? styles.pillOn : truth === 0 ? styles.pill : styles.pillDim}>
                <span className={styles.pillK}>actually</span>
                <span className={styles.pillV}>
                  {truth === 1 ? "tapping" : truth === 0 ? "resting" : "in between"}
                </span>
              </div>
              {truth >= 0 && out && (
                <p className={(out.p > 0.5 ? 1 : 0) === truth ? styles.right : styles.wrong}>
                  {(out.p > 0.5 ? 1 : 0) === truth ? "Correct" : "Wrong"}
                </p>
              )}
              {running && (
                <p className={styles.tally}>
                  Running score on this visit:{" "}
                  <strong className="mono">{Math.round(running.acc * 100)}%</strong> over{" "}
                  <span className="mono">{running.n}</span> scored moments
                </p>
              )}
            </div>
          </div>

          <p className={styles.small}>
            Moments marked <em>in between</em> are too close to a tap to count as rest but
            not inside the movement window either. They are left out of the score, the same
            way they were left out of the study.
          </p>
        </div>

        <aside className={styles.side}>
          <div className="card pad">
            <h2 className={styles.h3}>What each contact contributes</h2>
            <p className={styles.small}>
              Bars to the right push the answer toward tapping, bars to the left push
              toward rest. This is the weight times the standardised value, right now.
            </p>
            <ul className={styles.weights}>
              {dec && out && dec.channels.map((c, i) => {
                const v = dec.w[i] * ((out.feats[i] - dec.mu[i]) / dec.sd[i]);
                const mx = Math.max(...dec.w.map((w, j) =>
                  Math.abs(w * ((out.feats[j] - dec.mu[j]) / dec.sd[j])))) || 1;
                const pct = (Math.abs(v) / mx) * 50;
                return (
                  <li key={c}>
                    <span className="mono">{c}</span>
                    <span className={styles.track} aria-hidden="true">
                      <span className={styles.mid} />
                      <span className={v >= 0 ? styles.pos : styles.neg}
                        style={{ width: `${pct}%`, [v >= 0 ? "left" : "right"]: "50%" }} />
                    </span>
                    <span className="mono">{fmt(v, 2)}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="card pad">
            <h2 className={styles.h3}>How good is it</h2>
            <p className={styles.small}>
              On blocks this decoder never saw during fitting it gets{" "}
              <strong className="mono">{dec ? Math.round(dec.holdout_acc * 100) : "…"}%</strong>{" "}
              right for this patient. Across all eight patients the full version of this
              method averages 0.879 balanced accuracy.
            </p>
            <p className={styles.small}>
              That is the number the transformer had to beat, and did not. The{" "}
              <a href="/findings">findings page</a> has the comparison.
            </p>
          </div>
        </aside>
      </section>
    </>
  );
}
