"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Sparkline from "@/components/Sparkline";
import TraceExtractor from "@/components/TraceExtractor";
import { bandPower, fmt, parseTable, pickSignalColumn, rhythm, spectrum } from "@/lib/dsp";
import styles from "./analyze.module.css";

type Mode = "file" | "tap" | "image";

/* ---------------------------------------------------------------- file mode */
function FileMode() {
  const [headers, setHeaders] = useState<string[]>([]);
  const [cols, setCols] = useState<number[][]>([]);
  const [col, setCol] = useState(0);
  const [fs, setFs] = useState(100);
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [drag, setDrag] = useState(false);

  const load = useCallback((text: string, fname: string) => {
    const { headers, cols } = parseTable(text);
    if (!cols.length) {
      setErr("No numeric columns found. The file needs at least one column of numbers with more than eight rows.");
      setHeaders([]); setCols([]);
      return;
    }
    if (cols[0].length > 200000) {
      setErr("That file has over 200,000 rows. Trim it and try again so the page stays responsive.");
      return;
    }
    setErr(""); setHeaders(headers); setCols(cols);
    setCol(pickSignalColumn(cols)); setName(fname);
  }, []);

  const onFile = useCallback((f: File) => {
    if (f.size > 25 * 1024 * 1024) { setErr("Files over 25 MB are not accepted."); return; }
    f.text().then((t) => load(t, f.name)).catch(() => setErr("That file could not be read as text."));
  }, [load]);

  function demo() {
    // A made up pulse trace at 72 beats a minute, roughly the shape of a finger
    // pulse sensor. Labelled as an example so nobody mistakes it for real data.
    const fsDemo = 100, beat = 60 / 72, n = 3000;
    const out: string[] = ["time,example pulse"];
    for (let i = 0; i < n; i++) {
      const t = i / fsDemo;
      const phase = (t % beat) / beat;
      const v =
        Math.exp(-Math.pow((phase - 0.12) / 0.055, 2)) * 1.0 +   // main upstroke
        Math.exp(-Math.pow((phase - 0.34) / 0.085, 2)) * 0.32 +  // reflected wave
        Math.sin(2 * Math.PI * 0.2 * t) * 0.06 +                 // slow drift
        (Math.random() - 0.5) * 0.05;
      out.push(`${t.toFixed(3)},${v.toFixed(5)}`);
    }
    load(out.join("\n"), "example-pulse.csv");
    setFs(fsDemo);
  }

  const series = cols[col] ?? [];
  const spec = useMemo(() => (series.length > 16 ? spectrum(series, fs) : null), [series, fs]);
  const bands = useMemo(() => (spec ? bandPower(spec.freq, spec.power) : null), [spec]);
  const beat = useMemo(() => (series.length > 32 ? rhythm(series, fs) : null), [series, fs]);

  const specPlot = useMemo(() => {
    if (!spec) return [];
    const out: number[] = [];
    const top = Math.min(spec.freq.length - 1, Math.round((Math.min(fs / 2, 160) / (fs / 2)) * (spec.freq.length - 1)));
    const bins = 220, stepN = Math.max(1, Math.floor(top / bins));
    for (let i = 1; i < top; i += stepN) {
      let m = 0;
      for (let j = i; j < Math.min(top, i + stepN); j++) m = Math.max(m, spec.power[j]);
      out.push(Math.log10(m + 1e-14));
    }
    return out;
  }, [spec, fs]);

  const maxBand = bands ? Math.max(...bands.map((b) => b.power)) || 1 : 1;

  return (
    <>
      <div
        className={`${styles.drop} ${drag ? styles.dropOn : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault(); setDrag(false);
          const f = e.dataTransfer.files[0]; if (f) onFile(f);
        }}
      >
        <p className={styles.dropTitle}>Drop a CSV or TSV here</p>
        <p className={styles.dropSub}>
          One column per signal, one row per sample. Works with EEG exports, phone
          accelerometer logs, heart rate traces, sensor readings, anything sampled evenly
          over time.
        </p>
        <div className={styles.dropRow}>
          <label className="btn btn-primary">
            Choose a file
            <input type="file" accept=".csv,.tsv,.txt,text/csv,text/plain"
              className={styles.hiddenInput}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
          </label>
          <button className="btn" onClick={demo}>Try an example pulse trace</button>
        </div>
        <p className={styles.privacy}>
          Your file is read in the page and never uploaded. Close the tab and it is gone.
        </p>
      </div>

      {err && <p className={styles.err} role="alert">{err}</p>}

      {cols.length > 0 && (
        <>
          <div className={styles.setup}>
            <label className={styles.field}>
              <span>Column</span>
              <select value={col} onChange={(e) => setCol(+e.target.value)}>
                {headers.map((h, i) => <option key={h + i} value={i}>{h}</option>)}
              </select>
            </label>
            <label className={styles.field}>
              <span>Samples per second</span>
              <input type="number" min={1} max={20000} value={fs}
                onChange={(e) => setFs(Math.max(1, Math.min(20000, +e.target.value || 1)))} />
            </label>
            <p className={styles.meta}>
              <span className="mono">{name}</span> · {series.length} rows ·{" "}
              {(series.length / fs).toFixed(1)} seconds
            </p>
          </div>

          <div className={styles.results}>
            <div className="card pad">
              <h3 className={styles.h3}>The signal</h3>
              <Sparkline values={series.slice(0, 3000)} height={110} color="var(--ink)"
                label="Your signal over time" />
              <p className={styles.cap}>
                First {Math.min(3000, series.length)} samples, about{" "}
                {(Math.min(3000, series.length) / fs).toFixed(1)} seconds.
              </p>
            </div>

            <div className="card pad">
              <h3 className={styles.h3}>Frequency content</h3>
              <Sparkline values={specPlot} height={110} color="var(--steel)"
                label="Power against frequency, log scale" />
              <div className={styles.axisRow}>
                <span className="mono">0 Hz</span>
                <span className="mono">{Math.min(fs / 2, 160).toFixed(0)} Hz</span>
              </div>
              <p className={styles.cap}>
                Peaks mark frequencies that repeat strongly. Log scale, so small bumps
                still show.
              </p>
            </div>

            <div className="card pad">
              <h3 className={styles.h3}>Power by band</h3>
              {bands && (
                <ul className={styles.bands}>
                  {bands.map((b) => (
                    <li key={b.name}>
                      <span>{b.name}</span>
                      <span className={styles.bTrack} aria-hidden="true">
                        <span style={{ width: `${(b.power / maxBand) * 100}%` }} />
                      </span>
                      <span className="mono">{b.power.toExponential(1)}</span>
                    </li>
                  ))}
                </ul>
              )}
              <p className={styles.cap}>
                Same bands the study used. Bands above half your sampling rate cannot be
                measured and will read near zero.
              </p>
            </div>

            <div className="card pad">
              <h3 className={styles.h3}>Repeating rhythm</h3>
              {beat && beat.bpm ? (
                <>
                  <p className={styles.big}>
                    <span className="mono">{beat.bpm.toFixed(1)}</span>
                    <span className={styles.bigUnit}> per minute</span>
                  </p>
                  <p className={styles.cap}>
                    Strength {fmt(beat.strength, 2)} on a scale where 1 is a perfect
                    repeat. Found by checking how well the signal lines up with a shifted
                    copy of itself.
                  </p>
                </>
              ) : (
                <p className={styles.cap}>
                  No clear repeating pattern between 15 and 240 times a minute. That is
                  normal for signals that are not rhythmic.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

/* ----------------------------------------------------------------- tap mode */
function TapMode() {
  const [taps, setTaps] = useState<number[]>([]);
  const [armed, setArmed] = useState(false);
  const start = useRef(0);

  const hit = useCallback(() => {
    if (!armed) return;
    const now = performance.now();
    if (!taps.length) start.current = now;
    setTaps((t) => [...t, (now - start.current) / 1000]);
  }, [armed, taps.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && armed) { e.preventDefault(); hit(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [armed, hit]);

  const stats = useMemo(() => {
    if (taps.length < 4) return null;
    const iti = taps.slice(1).map((t, i) => t - taps[i]);
    const mean = iti.reduce((a, b) => a + b, 0) / iti.length;
    const sd = Math.sqrt(iti.reduce((a, b) => a + (b - mean) ** 2, 0) / iti.length);
    const sorted = [...iti].sort((a, b) => a - b);
    const med = sorted[Math.floor(sorted.length / 2)];
    return { iti, mean, sd, med, cv: sd / mean, bpm: 60 / mean, n: taps.length };
  }, [taps]);

  // Median inter tap interval per patient, measured from the recordings. The ids are the
  // study's own patient numbers (sub-01 to sub-08), not decoration. taste-skill-ignore
  const PATIENTS = [
    { id: "01", med: 1.08 }, { id: "02", med: 1.02 }, { id: "03", med: 1.71 }, // taste-skill-ignore
    { id: "04", med: 1.11 }, { id: "05", med: 1.02 }, { id: "06", med: 0.89 }, // taste-skill-ignore
    { id: "07", med: 0.95 }, { id: "08", med: 1.07 }, // taste-skill-ignore
  ];

  return (
    <div className={styles.tapWrap}>
      <div className="card pad">
        <h3 className={styles.h3}>Tap along</h3>
        <p className={styles.cap}>
          The patients tapped a key whenever they spotted a match, roughly once a second.
          Press start, then tap the button or hit the space bar in a steady rhythm for
          fifteen seconds or so.
        </p>
        <div className={styles.tapRow}>
          <button className={armed ? "btn btn-primary" : "btn"}
            onClick={() => { setArmed(!armed); if (!armed) setTaps([]); }}>
            {armed ? "Stop" : "Start tapping"}
          </button>
          <button className="btn" onClick={() => setTaps([])} disabled={!taps.length}>
            Reset
          </button>
          <span className={styles.count}>
            <span className="mono">{taps.length}</span> taps
          </span>
        </div>
        <button className={styles.pad} onClick={hit} disabled={!armed}
          aria-label="Tap here to record a tap">
          {armed ? "TAP" : "press start first"}
        </button>
      </div>

      <div className="card pad">
        <h3 className={styles.h3}>Your rhythm</h3>
        {stats ? (
          <>
            <dl className={styles.dl}>
              <div><dt>Median gap</dt><dd className="mono">{fmt(stats.med, 2)} s</dd></div>
              <div><dt>Rate</dt><dd className="mono">{fmt(stats.bpm, 0)} / min</dd></div>
              <div><dt>Wobble</dt><dd className="mono">{fmt(stats.cv * 100, 0)}%</dd></div>
              <div><dt>Taps</dt><dd className="mono">{stats.n}</dd></div>
            </dl>
            <p className={styles.cap}>Gap between taps, in order</p>
            <Sparkline values={stats.iti} height={70} label="Time between each of your taps" />
            <p className={styles.cap}>
              Wobble is the spread of your gaps divided by the average. Lower means
              steadier. Steadier tapping is exactly what made the brain signal easier for
              the model to predict.
            </p>

            <h4 className={styles.h4}>Against the eight patients</h4>
            <ul className={styles.compare}>
              {PATIENTS.map((p) => {
                const max = 2.0;
                return (
                  <li key={p.id}>
                    <span className="mono">P{p.id}</span>
                    <span className={styles.cTrack} aria-hidden="true">
                      <span className={styles.cBar} style={{ width: `${(p.med / max) * 100}%` }} />
                    </span>
                    <span className="mono">{p.med.toFixed(2)}s</span>
                  </li>
                );
              })}
              <li className={styles.you}>
                <span className="mono">You</span>
                <span className={styles.cTrack} aria-hidden="true">
                  <span className={styles.cBarYou}
                    style={{ width: `${Math.min(100, (stats.med / 2.0) * 100)}%` }} />
                </span>
                <span className="mono">{stats.med.toFixed(2)}s</span>
              </li>
            </ul>
          </>
        ) : (
          <p className={styles.cap}>
            Record at least four taps and the numbers will appear here.
          </p>
        )}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------- page */
export default function AnalyzeClient() {
  const [mode, setMode] = useState<Mode>("file");
  return (
    <>
      <section className={`wrap page-head ${styles.head}`}>
        <h1>Put your own data through it</h1>
        <p className={`prose ${styles.lede}`}>
          The same maths the study used, pointed at whatever you bring. Load a recorded
          signal and get its spectrum, its band powers and any repeating beat. Or tap a
          rhythm yourself and see how steady you are next to the patients. Everything runs
          in your browser and nothing is sent anywhere.
        </p>
      </section>

      <section className={`wrap ${styles.body}`}>
        <div className={styles.tabs} role="tablist" aria-label="Input type">
          <button role="tab" aria-selected={mode === "file"} className="btn"
            onClick={() => setMode("file")}>Load a signal file</button>
          <button role="tab" aria-selected={mode === "image"} className="btn"
            onClick={() => setMode("image")}>Read a chart image</button>
          <button role="tab" aria-selected={mode === "tap"} className="btn"
            onClick={() => setMode("tap")}>Tap a rhythm</button>
        </div>
        {mode === "file" && <FileMode />}
        {mode === "image" && <TraceExtractor />}
        {mode === "tap" && <TapMode />}
      </section>
    </>
  );
}
