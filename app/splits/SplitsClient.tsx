"use client";
import { useEffect, useMemo, useState } from "react";
import { SUBJECT_IDS, getManifest, type Manifest } from "@/lib/data";
import styles from "./splits.module.css";

type Scheme = "cut" | "random" | "blocked";

export default function SplitsClient() {
  const [man, setMan] = useState<Manifest | null>(null);
  const [sub, setSub] = useState("sub-01");
  const [scheme, setScheme] = useState<Scheme>("cut");
  const [cut, setCut] = useState(70);
  const [fold, setFold] = useState(0);

  useEffect(() => { getManifest().then(setMan); }, []);
  const labels = man ? man.subjects[sub].labels : null;

  const test = useMemo(() => {
    if (!labels) return null;
    const n = labels.length;
    const isTest = new Array<boolean>(n).fill(false);
    if (scheme === "cut") {
      const start = Math.round((cut / 100) * n);
      for (let i = start; i < n; i++) isTest[i] = true;
    } else if (scheme === "random") {
      // deterministic pseudo random so the picture is stable while you read it
      let s = 12345;
      for (let i = 0; i < n; i++) {
        s = (s * 1103515245 + 12345) & 0x7fffffff;
        isTest[i] = s / 0x7fffffff < 0.3;
      }
    } else {
      const nb = 10;
      for (let i = 0; i < n; i++) {
        const b = Math.min(nb - 1, Math.floor((i / n) * nb));
        if (b === fold || b === fold + 5) isTest[i] = true;
      }
    }
    let move = 0, rest = 0;
    for (let i = 0; i < n; i++) {
      if (!isTest[i]) continue;
      if (labels[i] === 1) move++;
      else if (labels[i] === 0) rest++;
    }
    const total = move + rest;
    const minority = total ? Math.min(move, rest) / total : 0;
    const majority = total ? Math.max(move, rest) / total : 0;
    return { isTest, move, rest, total, minority, majority, n };
  }, [labels, scheme, cut, fold]);

  const bars = useMemo(() => {
    if (!labels || !test) return [];
    const W = 300;
    const per = Math.ceil(labels.length / W);
    const out: { move: number; rest: number; test: number }[] = [];
    for (let i = 0; i < W; i++) {
      let move = 0, rest = 0, tst = 0, n = 0;
      for (let j = i * per; j < Math.min(labels.length, (i + 1) * per); j++) {
        n++;
        if (labels[j] === 1) move++;
        else if (labels[j] === 0) rest++;
        if (test.isTest[j]) tst++;
      }
      out.push({ move: move / (n || 1), rest: rest / (n || 1), test: tst / (n || 1) });
    }
    return out;
  }, [labels, test]);

  const verdict =
    !test ? null
    : test.minority < 0.12 ? { tone: "bad", text: "This test set is badly lopsided. A model that always guesses the common class would look good without learning anything." }
    : scheme === "random" ? { tone: "bad", text: "The balance looks fine, but this split is leaking. Neighbouring moments are almost identical, so nearly every test point has a near copy in training. Scores come out far too high." }
    : test.minority < 0.25 ? { tone: "warn", text: "Usable, but skewed. Balanced accuracy rather than plain accuracy is the honest thing to report here." }
    : { tone: "good", text: "Reasonably balanced, and training and test come from separate stretches of the recording. This is what the study used." };

  return (
    <>
      <section className={`wrap ${styles.head}`}>
        <p className="eyebrow">Tool 5 of 5</p>
        <h1>Why splitting this data is a trap</h1>
        <p className={`prose ${styles.lede}`}>
          Before any model gets built you have to decide which parts of the recording it
          learns from and which parts you test it on. On this data the obvious choices give
          you scores that are either meaningless or far too generous. Try them and watch
          what happens.
        </p>
      </section>

      <section className={`wrap ${styles.body}`}>
        <div className={styles.controls}>
          <label className={styles.field}>
            <span>Patient</span>
            <select value={sub} onChange={(e) => setSub(e.target.value)}>
              {SUBJECT_IDS.map((s) => (
                <option key={s} value={s}>{s.replace("sub-", "Patient ")}</option>
              ))}
            </select>
          </label>
          <div className={styles.schemes} role="group" aria-label="Splitting method">
            <button className="btn" aria-pressed={scheme === "cut"}
              onClick={() => setScheme("cut")}>Cut at a point in time</button>
            <button className="btn" aria-pressed={scheme === "random"}
              onClick={() => setScheme("random")}>Shuffle at random</button>
            <button className="btn" aria-pressed={scheme === "blocked"}
              onClick={() => setScheme("blocked")}>Blocked, what we used</button>
          </div>
        </div>

        {scheme === "cut" && (
          <div className={styles.slider}>
            <label htmlFor="cutpt">Train on the first <strong className="mono">{cut}%</strong>, test on the rest</label>
            <input id="cutpt" type="range" min={40} max={90} value={cut}
              onChange={(e) => setCut(+e.target.value)} />
          </div>
        )}
        {scheme === "blocked" && (
          <div className={styles.slider}>
            <label htmlFor="foldpick">Fold <strong className="mono">{fold + 1}</strong> of 5, holding out two separated blocks</label>
            <input id="foldpick" type="range" min={0} max={4} value={fold}
              onChange={(e) => setFold(+e.target.value)} />
          </div>
        )}

        <div className={styles.chart}>
          <p className={styles.chartLabel}>The whole recording, start to finish</p>
          <div className={styles.strip} role="img"
            aria-label={`Timeline of the recording. Amber marks tapping, blue marks rest, and the band underneath marks which parts are held out for testing under the ${scheme} method.`}>
            {bars.map((b, i) => (
              <span key={i} className={styles.slot}>
                <span className={styles.moveBar} style={{ height: `${b.move * 100}%` }} />
                <span className={styles.restBar} style={{ height: `${b.rest * 100}%` }} />
              </span>
            ))}
          </div>
          <div className={styles.testStrip} aria-hidden="true">
            {bars.map((b, i) => (
              <span key={i} style={{ opacity: b.test > 0.5 ? 1 : 0.07 }} />
            ))}
          </div>
          <div className={styles.key}>
            <span><i className={styles.kMove} /> tapping</span>
            <span><i className={styles.kRest} /> resting</span>
            <span><i className={styles.kTest} /> held out for testing</span>
          </div>
        </div>

        {test && (
          <div className={styles.out}>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.sv}>{test.total}</span>
                <span className={styles.sk}>moments in the test set</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.sv}>{Math.round(test.minority * 100)}%</span>
                <span className={styles.sk}>share of the rarer class</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.sv}>{Math.round(test.majority * 100)}%</span>
                <span className={styles.sk}>score from always guessing the common class</span>
              </div>
            </div>
            {verdict && (
              <p className={
                verdict.tone === "bad" ? styles.vBad
                : verdict.tone === "warn" ? styles.vWarn : styles.vGood}>
                {verdict.text}
              </p>
            )}
          </div>
        )}

        <div className={styles.explain}>
          <div>
            <h2>Why the simple cut fails</h2>
            <p>
              Nobody taps for the first minute. The patients were being set up, so the
              recording opens with a long stretch of rest, then the game runs in blocks.
              Slice the timeline at seventy percent and the two halves end up with very
              different mixes of tapping and rest.
            </p>
            <p>
              Push the slider around and watch the rarer class share drop. When it gets
              low enough, a model that never learns anything can post a high score just by
              guessing the common answer every time.
            </p>
          </div>
          <div>
            <h2>Why shuffling is worse</h2>
            <p>
              Shuffling fixes the balance and creates a bigger problem. These measurements
              come ten times a second, so one moment looks almost exactly like the moment
              beside it. Scatter them at random and nearly every test point has a near
              twin sitting in the training set.
            </p>
            <p>
              The model can score well by recognising moments it has effectively already
              seen. This is the most common way brain decoding results get quietly
              inflated, and it is easy to do by accident.
            </p>
          </div>
          <div>
            <h2>What we did instead</h2>
            <p>
              Chop the recording into ten blocks and hold out two of them that are not
              next to each other. Train on the other eight. Repeat five times so every
              block gets tested once.
            </p>
            <p>
              Test moments are then far enough from training moments in time that they are
              genuinely new, and each test set still picks up both an early and a late
              stretch, which keeps the mix reasonable. Every number on this site comes from
              this scheme.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
