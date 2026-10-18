"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import BarChart from "@/components/BarChart";
import styles from "./findings.module.css";

export default function FindingsClient() {
  const [res, setRes] = useState<any>(null);
  useEffect(() => { fetch("/data/results.json").then((r) => r.json()).then(setRes); }, []);

  const per = (v: string) =>
    res?.per_subject?.probes?.filter((r: any) => r.variant === v).map((r: any) => r.bal_acc) ?? [];
  const d = (k: string) => res?.decoding?.[k]?.bal_acc_mean ?? 0;

  return (
    <>
      <section className={`wrap page-head ${styles.head}`}>
        <h1>What held up and what did not</h1>
        <p className={`prose ${styles.lede}`}>
          Each claim below is paired with the control that could have proved it wrong.
          That pairing is the whole point. Three of the four claims did not survive, and
          saying so is more useful than a page of wins.
        </p>
      </section>

      <section className={`wrap ${styles.gate}`}>
        <div className={styles.gateCard}>
          <span className={`${styles.chip} ${styles.good}`}>passed</span>
          <h2>First, does it forecast at all?</h2>
          <p>
            Before anything else the model had to beat a stubborn opponent: guessing that
            the next tenth of a second looks exactly like the current one. On a smooth
            signal that is hard to beat.
          </p>
          <p className={styles.stat}>
            <span className="mono">{res ? res.ssl.improvement_pct.toFixed(1) : "9.6"}%</span>
            <span> better than that guess, and all nine training runs beat it by between
            seven and seventeen percent.</span>
          </p>
          <p className={styles.note}>
            So the forecasting works. Everything below asks whether that skill was worth
            anything.
          </p>
        </div>
      </section>

      <section className={`wrap ${styles.result}`}>
        <div className={styles.rHead}>
          <span className={`${styles.chip} ${styles.bad}`}>did not hold up</span>
          <h2>Claim one: the transformer beats a simple decoder</h2>
        </div>
        <div className={styles.rBody}>
          <div className={styles.rText}>
            <p>
              The pretrained model does beat the textbook approach, high gamma power over
              half a second, by a real margin. It also clearly beats an untrained network
              with the same shape, which tells us the training was doing something.
            </p>
            <p>
              Then you give logistic regression every frequency band over the same window
              the transformer sees, and it edges ahead. The gap is small and not
              statistically meaningful, which is the polite way of saying 1.78 million
              parameters bought nothing here.
            </p>
            <ul className={styles.pvals}>
              <li>versus untrained network: <strong className="mono">p = 0.008</strong>, a real win</li>
              <li>versus high gamma only: <strong className="mono">p = 0.008</strong>, a real win</li>
              <li>versus all bands: <strong className="mono">p = 0.38</strong>, a tie</li>
            </ul>
          </div>
          <div className={styles.rChart}>
            <BarChart min={0.5} max={1.0} caption="Balanced accuracy, eight patients, blocked cross validation. Dots are individual patients."
              rows={[
                { label: "Linear, all bands", value: d("E0c_allbands_ctx_aligned"), points: per("E0c_allbands_ctx_aligned"), tone: "bad" },
                { label: "Transformer, pretrained", value: d("E1_pretrained"), points: per("E1_pretrained"), tone: "accent" },
                { label: "Linear, high gamma", value: d("E0a_highgamma_0.5s_aligned"), points: per("E0a_highgamma_0.5s_aligned"), tone: "steel" },
                { label: "Untrained network", value: d("E2_randominit"), points: per("E2_randominit"), tone: "steel" },
              ]} />
          </div>
        </div>
      </section>

      <section className={`wrap ${styles.result}`}>
        <div className={styles.rHead}>
          <span className={`${styles.chip} ${styles.bad}`}>reversed</span>
          <h2>Claim two: training on other patients helps a new one</h2>
        </div>
        <div className={styles.rBody}>
          <div className={styles.rText}>
            <p>
              This was the point of the whole exercise. Anyone using a brain interface has
              to sit through a setup session first, producing labelled examples before the
              thing works. Cutting that down matters more than a few points of accuracy.
            </p>
            <p>
              So: train on seven patients with no labels at all, freeze the middle of the
              network, then fit a small input layer and a readout on the eighth patient
              using a few seconds of labelled data.
            </p>
            <p>
              The control arm is identical except the middle of the network is left
              random. <strong>The random one won.</strong> With every label available the
              gap is small, about 0.014, but it goes the same way in all eight patients,
              which makes it real rather than noise.
            </p>
            <p>
              This also changes how to read claim one. The advantage over an untrained
              network was measured with nothing fitted at all. Once the input layer is
              fitted in both arms, the benefit of pretraining disappears. What looked like
              pretraining helping was mostly having a fitted input layer.
            </p>
          </div>
          <div className={styles.rChart}>
            <figure className={styles.fig}>
              <Image src="/figures/fig2_transfer.png" alt="Two charts. On the left, accuracy against how many seconds of labelled data were used, with the random control above the pretrained model at every point. On the right, the per patient difference, mostly below zero." width={1540} height={620} />
              <figcaption>
                Left: average over the eight leave one out splits. Right: the per patient
                difference, which is the number that matters for a paired comparison.
                Almost every point sits below zero.
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className={`wrap ${styles.result}`}>
        <div className={styles.rHead}>
          <span className={`${styles.chip} ${styles.good}`}>held up, backwards</span>
          <h2>Claim three: movement can be spotted with no labels</h2>
        </div>
        <div className={styles.rBody}>
          <div className={styles.rText}>
            <p>
              Because the model forecasts, how wrong it is at each moment is free
              information. My guess was that movement would be surprising and error would
              jump when a tap happened.
            </p>
            <p>
              It does the opposite. Error <strong>drops</strong> sharply about half a
              second after each tap, in all eight patients, giving{" "}
              <strong className="mono">0.64</strong> area under the curve for spotting
              movement without a single label used to build the signal.
            </p>
            <p>
              I checked whether that was an artefact of counting the long quiet stretch
              before the game as rest. Removing it makes the effect stronger, not weaker,
              at <strong className="mono">0.66</strong>. It is also not just amplitude:
              high gamma goes up during movement, which should make errors bigger, not
              smaller.
            </p>
            <p>
              Tapping at roughly one beat a second drives stereotyped bursts of activity.
              Regular is easy to predict. Idle cortex is the hard part. Related work has
              seen high gamma get suppressed during faster repeated movements, which fits
              the same picture.
            </p>
          </div>
          <div className={styles.rChart}>
            <figure className={styles.fig}>
              <Image src="/figures/fig3_surprise.png" alt="Left chart shows forecast error dipping after tap onset for every patient. Right chart shows detection scores per patient, all above chance." width={1540} height={590} />
              <figcaption>
                Left: forecast error lined up on tap onset, one faint line per patient.
                Right: how well error alone separates moving from resting, per patient.
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className={`wrap ${styles.result}`}>
        <div className={styles.rHead}>
          <span className={`${styles.chip} ${styles.bad}`}>did not hold up</span>
          <h2>Claim four: the learned space is better organised</h2>
        </div>
        <div className={styles.rBody}>
          <div className={styles.rText}>
            <p>
              This is the part usually shown as a scatter plot with two coloured clouds.
              Measured instead of eyeballed, the model&apos;s internal representation is
              worse separated than raw high gamma power: silhouette{" "}
              <strong className="mono">0.074</strong> against{" "}
              <strong className="mono">0.131</strong>, nearest neighbour accuracy{" "}
              <strong className="mono">0.809</strong> against{" "}
              <strong className="mono">0.839</strong>.
            </p>
            <p>
              A scatter plot of these would still show two clouds. It would just be a worse
              picture of something a band pass filter hands you for free.
            </p>
            <p>
              The anatomy check went the same way. Tracing the model&apos;s decision back
              to individual electrodes and comparing that against the measured tap
              response gives a correlation of{" "}
              <strong className="mono">0.03</strong>, significant in one patient out of
              eight. The model does not visibly rediscover the hand area, even though the
              hand area is plainly there in the raw data.
            </p>
          </div>
          <div className={styles.rChart}>
            <figure className={styles.fig}>
              <Image src="/figures/fig4_geometry.png" alt="Two scatter plots comparing the model representation against raw high gamma power. Most patients fall below the diagonal, meaning the raw signal is better organised." width={1380} height={580} />
              <figcaption>
                Each dot is a patient. Below the dashed line means the raw signal is better
                organised than what the model learned.
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className={`wrap ${styles.tableSec}`}>
        <h2>The scoreboard</h2>
        <div className="tw">
          <table>
            <caption className={styles.cap}>
              Balanced accuracy and area under the curve, averaged over eight patients,
              scored on exactly the same moments for every row.
            </caption>
            <thead>
              <tr><th scope="col">Method</th><th scope="col" className="n">Balanced accuracy</th><th scope="col" className="n">AUC</th></tr>
            </thead>
            <tbody>
              {[
                ["Linear, all bands, 6.4 s", "E0c_allbands_ctx_aligned"],
                ["Linear, high gamma, 6.4 s", "E0b_highgamma_ctx_aligned"],
                ["Transformer, pretrained", "E1_pretrained"],
                ["Linear, high gamma, 0.5 s", "E0a_highgamma_0.5s_aligned"],
                ["Untrained network (control)", "E2_randominit"],
              ].map(([label, key]) => (
                <tr key={key} className={key === "E0c_allbands_ctx_aligned" ? styles.hl : ""}>
                  <td>{label}</td>
                  <td className="n">{res ? res.decoding[key].bal_acc_mean.toFixed(3) : "…"}</td>
                  <td className="n">{res ? res.decoding[key].auc_mean.toFixed(3) : "…"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={`wrap ${styles.wrapUp}`}>
        <div className="prose">
          <h2>So what does this add up to</h2>
          <p>
            The model learned to forecast brain activity, and that part is solid across
            nine separate training runs. What it did not do is produce anything worth more
            than the band pass filter it was built on top of, and it did not learn anything
            about brain activity that carried over to a patient it had never seen.
          </p>
          <p>
            The most likely reason is size. Fifty seven minutes across eight patients is
            nowhere near the scale where this kind of pretraining starts paying off in text
            or images, and every patient has electrodes in different places, so there is
            not much shared structure for the middle of the network to hold on to. This is
            a result about this amount of data, not a claim that the approach cannot work.
          </p>
          <h3>The part I would keep</h3>
          <p>
            A weak control made pretraining look worth seven points. A matched control,
            same architecture, same fitting, only the middle randomised, showed the true
            effect was slightly negative. Same model, same data, opposite conclusion. Had I
            stopped at the first control I would have written this up as a clean success
            and believed it.
          </p>
          <h3>What could undercut all of this</h3>
          <p>
            Eight patients is a small number and every cross patient result should be read
            with that in mind, which is why per patient dots appear on every chart rather
            than just averages. These are people with epilepsy, so the tissue near the
            seizure zone is not typical, and although those contacts were dropped the rest
            is not exactly healthy cortex either. Standardisation used whole recording
            statistics, which uses no labels but does look at the test stretch. The
            transfer test used one fitting recipe for both arms, and a pretrained network
            might want different settings. The electrode attribution shows a correlation
            with a measured map, not proof of what the model actually needs.
          </p>
        </div>
      </section>
    </>
  );
}
