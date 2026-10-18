"use client";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import Sparkline from "@/components/Sparkline";
import { getElectrodes, getErp, type Electrode, type ElectrodeFile } from "@/lib/data";
import { fmt } from "@/lib/dsp";
import styles from "./explore.module.css";

const BrainCanvas = dynamic(() => import("@/components/BrainCanvas"), {
  ssr: false,
  loading: () => <p className={styles.loading}>Loading electrode positions…</p>,
});

type Mode = "resp" | "attr" | "subject";

const MODES: { id: Mode; label: string; help: string }[] = [
  { id: "resp", label: "Tap response", help: "Change in high gamma power around a tap. Warm means the contact got busier." },
  { id: "attr", label: "Model weight", help: "How heavily the trained model leaned on that contact when reading movement." },
  { id: "subject", label: "Patient", help: "One colour per patient, so you can see how the grids were laid out." },
];

export default function ExploreClient() {
  const [file, setFile] = useState<ElectrodeFile | null>(null);
  const [erp, setErp] = useState<Float32Array | null>(null);
  const [mode, setMode] = useState<Mode>("resp");
  const [sub, setSub] = useState("all");
  const [sel, setSel] = useState<number | null>(null);
  const [glass, setGlass] = useState(true);

  useEffect(() => {
    getElectrodes().then(setFile);
    getErp().then(setErp);
  }, []);

  const shown = useMemo(() => {
    if (!file) return [];
    return sub === "all" ? file.electrodes : file.electrodes.filter((e) => e.sub === sub);
  }, [file, sub]);

  const withPos = useMemo(() => shown.filter((e) => e.x != null), [shown]);
  useEffect(() => setSel(null), [sub]);

  const chosen: Electrode | null = sel != null ? withPos[sel] ?? null : null;
  const chosenIdx = chosen && file ? file.electrodes.indexOf(chosen) : -1;

  const curve = useMemo(() => {
    if (!erp || !file || chosenIdx < 0) return null;
    const n = file.pre + file.post;
    return Array.from(erp.slice(chosenIdx * n, chosenIdx * n + n));
  }, [erp, file, chosenIdx]);

  const top = useMemo(
    () => [...shown].sort((a, b) => b.resp - a.resp).slice(0, 8),
    [shown]
  );

  return (
    <>
      <section className={`wrap page-head ${styles.head}`}>
        <h1>Where movement shows up</h1>
        <p className={`prose ${styles.lede}`}>
          Every dot is a real electrode contact resting on the surface of someone&apos;s
          brain. Eight patients, {file ? file.electrodes.length : 735} contacts, all on
          the left side. Drag to turn the map, scroll to zoom, and click a dot to see what
          that spot did when the patient tapped a finger.
        </p>
      </section>

      <section className={`wrap ${styles.layout}`}>
        <div className={styles.stage}>
          <BrainCanvas electrodes={withPos} mode={mode} selected={sel}
            onSelect={setSel} showGlass={glass} />
          <div className={styles.hint}>drag to turn · scroll to zoom · click a dot</div>
          {mode !== "subject" && (
            <div className={styles.legend} aria-hidden="true">
              <span>quiet</span>
              <span className={styles.ramp} />
              <span>busier</span>
            </div>
          )}
        </div>

        <aside className={styles.panel}>
          <div className="card pad">
            <h2 className={styles.h3}>Colour the dots by</h2>
            <div className={styles.modes} role="group" aria-label="Colour rule">
              {MODES.map((m) => (
                <button key={m.id} className="btn" aria-pressed={mode === m.id}
                  onClick={() => setMode(m.id)}>{m.label}</button>
              ))}
            </div>
            <p className={styles.help}>{MODES.find((m) => m.id === mode)!.help}</p>

            <label className={styles.field}>
              <span>Patient</span>
              <select value={sub} onChange={(e) => setSub(e.target.value)}>
                <option value="all">All eight</option>
                {Array.from({ length: 8 }, (_, i) => `sub-0${i + 1}`).map((s) => (
                  <option key={s} value={s}>{s.replace("sub-", "Patient ")}</option>
                ))}
              </select>
            </label>

            <label className={styles.check}>
              <input type="checkbox" checked={glass}
                onChange={(e) => setGlass(e.target.checked)} />
              <span>Show head outline</span>
            </label>
            <p className={styles.note}>
              The shell is a rough guide, not a scan of any patient. Dot positions are the
              real coordinates that came with the recordings.
            </p>
          </div>

          <div className="card pad">
            <h2 className={styles.h3}>{chosen ? `Contact ${chosen.name}` : "Pick a contact"}</h2>
            {chosen ? (
              <>
                <dl className={styles.dl}>
                  <div><dt>Patient</dt><dd className="mono">{chosen.sub.replace("sub-", "")}</dd></div>
                  <div><dt>Tap response</dt><dd className="mono">{fmt(chosen.resp, 3)}</dd></div>
                  <div><dt>Model weight</dt><dd className="mono">{fmt(chosen.attr, 3)}</dd></div>
                  <div><dt>Position</dt>
                    <dd className="mono">{chosen.x}, {chosen.y}, {chosen.z}</dd></div>
                </dl>
                {curve && (
                  <>
                    <p className={styles.chartTitle}>High gamma power around a tap</p>
                    <Sparkline values={curve} zeroAt={file!.pre} height={80}
                      label={`High gamma power at contact ${chosen.name} from one second before to two seconds after a tap`} />
                    <div className={styles.axis}>
                      <span>−1 s</span><span>tap</span><span>+2 s</span>
                    </div>
                    <p className={styles.help}>
                      Averaged over every tap this patient made, with the second before
                      each tap subtracted off.
                    </p>
                  </>
                )}
              </>
            ) : (
              <p className={styles.help}>
                Click any dot in the map. You will get its position, how much it reacted
                to tapping, and its average trace around a tap.
              </p>
            )}
          </div>

          <div className="card pad">
            <h2 className={styles.h3}>Strongest responders</h2>
            <ol className={styles.top}>
              {top.map((e) => (
                <li key={`${e.sub}-${e.name}`}>
                  <button className={styles.topBtn}
                    onClick={() => setSel(withPos.indexOf(e))}>
                    <span className="mono">{e.sub.replace("sub-", "")} {e.name}</span>
                    <span className={styles.bar} aria-hidden="true">
                      <span style={{ width: `${Math.min(100, (e.resp / (top[0]?.resp || 1)) * 100)}%` }} />
                    </span>
                    <span className="mono">{fmt(e.resp, 2)}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </section>

      <section className={`wrap ${styles.readout}`}>
        <div className="prose">
          <h2>What you are looking at</h2>
          <p>
            These patients were in hospital for epilepsy monitoring. Surgeons placed grids
            of electrodes directly on the brain surface to find where seizures start. While
            the grids were in, the patients played a matching game that needed quick finger
            taps, and the recording kept running.
          </p>
          <p>
            High gamma power is the part of the signal between about 70 and 150 hertz. It
            tracks how hard a small patch of cortex is working. When a hand moves, high
            gamma near the hand area of motor cortex goes up within a few tenths of a
            second. That is the rise you see in the trace when you click a strong responder.
          </p>
          <p>
            Contacts marked bad by the clinical team, either from noise or because they sat
            in the seizure zone, were dropped before any of this was worked out. What is
            left is {file ? file.electrodes.length : 735} usable contacts.
          </p>
        </div>
      </section>
    </>
  );
}
