"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Sparkline from "@/components/Sparkline";
import { bandPower, fmt, rhythm, spectrum } from "@/lib/dsp";
import styles from "./TraceExtractor.module.css";

type RGB = [number, number, number];

/** Pulls a data series out of a picture of a chart.
 *  For every column of pixels it finds the row whose colour is closest to the
 *  one you clicked on, which is where the line sits in that column. */
export default function TraceExtractor() {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [pick, setPick] = useState<RGB | null>(null);
  const [tol, setTol] = useState(90);
  const [series, setSeries] = useState<number[] | null>(null);
  const [yMin, setYMin] = useState(0);
  const [yMax, setYMax] = useState(1);
  const [dur, setDur] = useState(10);
  const [err, setErr] = useState("");
  const canvas = useRef<HTMLCanvasElement>(null);
  const raw = useRef<ImageData | null>(null);

  const onFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) { setErr("That is not an image file."); return; }
    if (f.size > 12 * 1024 * 1024) { setErr("Images over 12 MB are not accepted."); return; }
    const url = URL.createObjectURL(f);
    const im = new Image();
    im.onload = () => {
      setErr(""); setImg(im); setPick(null); setSeries(null);
      URL.revokeObjectURL(url);
    };
    im.onerror = () => { setErr("That image could not be opened."); URL.revokeObjectURL(url); };
    im.src = url;
  }, []);

  // paint the image, scaled to fit
  useEffect(() => {
    if (!img || !canvas.current) return;
    const cv = canvas.current;
    const maxW = 720;
    const scale = Math.min(1, maxW / img.width);
    cv.width = Math.round(img.width * scale);
    cv.height = Math.round(img.height * scale);
    const g = cv.getContext("2d", { willReadFrequently: true })!;
    g.drawImage(img, 0, 0, cv.width, cv.height);
    raw.current = g.getImageData(0, 0, cv.width, cv.height);
  }, [img]);

  const extract = useCallback((colour: RGB, tolerance: number) => {
    const d = raw.current;
    if (!d) return;
    const { width: w, height: h, data } = d;
    const out: number[] = [];
    let found = 0;
    for (let x = 0; x < w; x++) {
      let bestY = -1, bestDist = Infinity;
      for (let y = 0; y < h; y++) {
        const i = (y * w + x) * 4;
        if (data[i + 3] < 128) continue;
        const dist = Math.sqrt(
          (data[i] - colour[0]) ** 2 + (data[i + 1] - colour[1]) ** 2 + (data[i + 2] - colour[2]) ** 2
        );
        if (dist < bestDist) { bestDist = dist; bestY = y; }
      }
      if (bestY >= 0 && bestDist <= tolerance) { out.push(1 - bestY / (h - 1)); found++; }
      else out.push(NaN);
    }
    if (found < w * 0.15) {
      setErr("The line was only found in a few columns. Try clicking directly on it, or raise the tolerance.");
      setSeries(null);
      return;
    }
    // bridge short gaps so the series is continuous
    for (let i = 0; i < out.length; i++) {
      if (!Number.isNaN(out[i])) continue;
      let a = i - 1; while (a >= 0 && Number.isNaN(out[a])) a--;
      let b = i + 1; while (b < out.length && Number.isNaN(out[b])) b++;
      if (a < 0 && b >= out.length) out[i] = 0.5;
      else if (a < 0) out[i] = out[b];
      else if (b >= out.length) out[i] = out[a];
      else out[i] = out[a] + ((out[b] - out[a]) * (i - a)) / (b - a);
    }
    setErr("");
    setSeries(out);
  }, []);

  function onCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const cv = canvas.current!, d = raw.current;
    if (!d) return;
    const r = cv.getBoundingClientRect();
    const x = Math.round(((e.clientX - r.left) / r.width) * cv.width);
    const y = Math.round(((e.clientY - r.top) / r.height) * cv.height);
    const i = (y * d.width + x) * 4;
    const c: RGB = [d.data[i], d.data[i + 1], d.data[i + 2]];
    setPick(c);
    extract(c, tol);
  }

  useEffect(() => { if (pick) extract(pick, tol); }, [tol, pick, extract]);

  const scaled = series ? series.map((v) => yMin + v * (yMax - yMin)) : null;
  const fsEff = series ? series.length / Math.max(0.001, dur) : 1;
  const beat = scaled && scaled.length > 32 ? rhythm(scaled, fsEff) : null;
  const spec = scaled && scaled.length > 16 ? spectrum(scaled, fsEff) : null;
  const bands = spec ? bandPower(spec.freq, spec.power) : null;
  const maxBand = bands ? Math.max(...bands.map((b) => b.power)) || 1 : 1;

  function download() {
    if (!scaled) return;
    const rows = ["time_s,value", ...scaled.map((v, i) => `${(i / fsEff).toFixed(4)},${v.toFixed(6)}`)];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "extracted-trace.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.left}>
        <div className="card pad">
          <h3 className={styles.h3}>1. Load a picture of a chart</h3>
          <p className={styles.cap}>
            A screenshot of a plotted line works: a heart trace, an EEG readout, a graph
            from a paper. Clean single colour lines on a pale background come out best.
          </p>
          <label className="btn btn-primary">
            Choose an image
            <input type="file" accept="image/*" className={styles.hidden}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
          </label>

          {img && (
            <>
              <h3 className={styles.h3} style={{ marginTop: 22 }}>2. Click on the line</h3>
              <p className={styles.cap}>
                Click anywhere along the line you want. Its colour becomes the target and
                every column of the picture is searched for the closest match.
              </p>
              <canvas ref={canvas} className={styles.canvas} onClick={onCanvasClick}
                role="img" aria-label="Your chart image. Click on the line you want to read off." />
              <label className={styles.range}>
                <span>Colour tolerance <span className="mono">{tol}</span></span>
                <input type="range" min={20} max={220} value={tol}
                  onChange={(e) => setTol(+e.target.value)} />
              </label>
              {pick && (
                <p className={styles.picked}>
                  <span className={styles.swatch}
                    style={{ background: `rgb(${pick[0]},${pick[1]},${pick[2]})` }} />
                  targeting <span className="mono">rgb({pick.join(", ")})</span>
                </p>
              )}
            </>
          )}
          {err && <p className={styles.err} role="alert">{err}</p>}
        </div>
      </div>

      <div className={styles.right}>
        {series ? (
          <>
            <div className="card pad">
              <h3 className={styles.h3}>3. Tell it what the axes mean</h3>
              <div className={styles.calib}>
                <label><span>Value at the bottom</span>
                  <input type="number" value={yMin} onChange={(e) => setYMin(+e.target.value)} /></label>
                <label><span>Value at the top</span>
                  <input type="number" value={yMax} onChange={(e) => setYMax(+e.target.value)} /></label>
                <label><span>Seconds across</span>
                  <input type="number" min={0.1} step={0.1} value={dur}
                    onChange={(e) => setDur(Math.max(0.1, +e.target.value))} /></label>
              </div>
              <p className={styles.cap}>
                These turn pixel positions into real units. Leave them alone and the
                readings come out between 0 and 1 across 10 seconds.
              </p>
            </div>

            <div className="card pad">
              <h3 className={styles.h3}>What came out</h3>
              <Sparkline values={scaled!} height={110} color="var(--signal)"
                label="The series read off your chart image" />
              <div className={styles.axisRow}>
                <span className="mono">0 s</span>
                <span className="mono">{dur} s</span>
              </div>
              <dl className={styles.dl}>
                <div><dt>Points</dt><dd className="mono">{series.length}</dd></div>
                <div><dt>Rate</dt><dd className="mono">{fmt(fsEff, 1)} / s</dd></div>
                <div><dt>Lowest</dt><dd className="mono">{fmt(Math.min(...scaled!), 2)}</dd></div>
                <div><dt>Highest</dt><dd className="mono">{fmt(Math.max(...scaled!), 2)}</dd></div>
              </dl>
              <button className="btn" onClick={download}>Download as CSV</button>
            </div>

            <div className="card pad">
              <h3 className={styles.h3}>Rhythm and frequency</h3>
              {beat?.bpm ? (
                <p className={styles.big}>
                  <span className="mono">{beat.bpm.toFixed(1)}</span>
                  <span className={styles.bigUnit}> per minute, strength {fmt(beat.strength, 2)}</span>
                </p>
              ) : (
                <p className={styles.cap}>No steady repeat found in this trace.</p>
              )}
              {bands && (
                <ul className={styles.bands}>
                  {bands.map((b) => (
                    <li key={b.name}>
                      <span>{b.name}</span>
                      <span className={styles.bTrack} aria-hidden="true">
                        <span style={{ width: `${(b.power / maxBand) * 100}%` }} />
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <p className={styles.cap}>
                Reading a line off a picture is always rough. Where the line is thick,
                crosses gridlines or overlaps another line, the value is a best guess.
                Treat what comes out as an estimate, not a measurement.
              </p>
            </div>
          </>
        ) : (
          <div className="card pad">
            <h3 className={styles.h3}>Nothing read yet</h3>
            <p className={styles.cap}>
              Load an image and click on the line. The series, a rhythm estimate and a
              download will appear here.
            </p>
            <p className={styles.cap}>
              This is handy when you have a picture of a chart but not the numbers behind
              it, which happens constantly with figures in papers and screenshots from
              monitoring equipment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
