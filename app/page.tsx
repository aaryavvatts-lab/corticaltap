import Link from "next/link";
import styles from "./home.module.css";

const TOOLS = [
  { href: "/explore", n: "01", title: "Brain map",
    text: "Turn a 3D map of 735 real electrodes. Click one and see what it did when the patient tapped.",
    tag: "3D, click to inspect" },
  { href: "/signals", n: "02", title: "Signal lab",
    text: "Play back a real recording. Watch seven frequency bands move, with taps marked.",
    tag: "Playback, 8 patients" },
  { href: "/decode", n: "03", title: "Live decoder",
    text: "Pick a moment and the real fitted weights decide whether the patient was moving. Runs on your machine.",
    tag: "Real inference" },
  { href: "/analyze", n: "04", title: "Check your own data",
    text: "Load any signal file for a spectrum and rhythm read, or tap a beat and compare yourself to the patients.",
    tag: "Your files, your rhythm" },
  { href: "/splits", n: "05", title: "Split test",
    text: "See how the usual training and test split quietly breaks on this data, and what fixes it.",
    tag: "Try to break it" },
];

export default function Home() {
  return (
    <>
      <section className={styles.hero}>
        <div className={`wrap ${styles.heroInner}`}>
          <p className="eyebrow">Eight patients · 735 electrodes · 57 minutes · open data</p>
          <h1 className={styles.h1}>
            A transformer that guesses what your brain does next
          </h1>
          <p className={styles.lede}>
            Same idea as the models that finish your sentences, pointed at electrodes
            sitting on the surface of the brain. Instead of the next word it predicts the
            next tenth of a second of brain activity. It learned to do that well. Then
            almost everything I hoped it would give me failed its own control test, and
            the one result that survived pointed the wrong way.
          </p>
          <div className={styles.ctas}>
            <Link href="/explore" className="btn btn-primary">Open the brain map</Link>
            <Link href="/findings" className="btn">Read what happened</Link>
          </div>
        </div>
      </section>

      <section className={styles.numbers}>
        <div className={`wrap ${styles.numGrid}`}>
          <div><span className={styles.nv}>735</span><span className={styles.nk}>electrode contacts, all real</span></div>
          <div><span className={styles.nv}>1,515</span><span className={styles.nk}>finger taps recorded</span></div>
          <div><span className={styles.nv}>+9.6%</span><span className={styles.nk}>better than assuming nothing changes</span></div>
          <div><span className={styles.nv}>8 of 8</span><span className={styles.nk}>patients where pretraining made things worse</span></div>
        </div>
      </section>

      <section className={`wrap ${styles.block}`}>
        <div className="prose">
          <h2>What this is</h2>
          <p>
            Eight young people were in hospital being monitored for epilepsy. Surgeons had
            placed grids of electrodes straight onto the surface of their brains to find
            where seizures start. While those grids were in, each of them played a matching
            game that needed fast finger taps, and the recording kept running.
          </p>
          <p>
            That data is public. I used it to test an idea that gets repeated a lot: point
            a next token transformer at brain signals, have it predict the next short slice
            instead of the next word, and it should teach itself something useful about
            movement.
          </p>
          <p>
            It half worked. The interesting part is the half that did not, and why you only
            find that out if you build the control that can prove you wrong.
          </p>
        </div>
      </section>

      <section className={`wrap ${styles.block}`}>
        <h2 className={styles.secH}>Three things worth knowing</h2>
        <div className={styles.findings}>
          <article className={styles.find}>
            <span className={`${styles.chip} ${styles.chipBad}`}>did not hold up</span>
            <h3>A plain linear decoder beat the transformer</h3>
            <p>
              Logistic regression on high gamma power scored 0.879. The transformer scored
              0.858. Those two are close enough to call a tie, and the tie goes to the
              method that needs no training run and no GPU.
            </p>
          </article>
          <article className={styles.find}>
            <span className={`${styles.chip} ${styles.chipBad}`}>backfired</span>
            <h3>Training on other patients made it worse, not better</h3>
            <p>
              The whole point was to cut the setup time for a new person. I trained on
              seven patients and tested on the eighth. A model with random weights in the
              middle did better, in all eight patients. Not a wash. A reversal.
            </p>
          </article>
          <article className={styles.find}>
            <span className={`${styles.chip} ${styles.chipGood}`}>held up, backwards</span>
            <h3>Moving makes the brain easier to predict</h3>
            <p>
              I expected movement to surprise the model. It does the opposite. Prediction
              error drops about half a second after each tap, in every patient. Steady
              tapping makes the signal regular, and regular is easy. That gives a movement
              detector needing no labels at all.
            </p>
          </article>
        </div>
        <p className={styles.more}>
          <Link href="/findings">All the numbers, with the controls that produced them →</Link>
        </p>
      </section>

      <section className={styles.toolsWrap}>
        <div className="wrap">
          <h2 className={styles.secH}>Five things you can actually do here</h2>
          <p className={styles.toolsLede}>
            Every tool runs on real recordings from the study. Nothing you load or type is
            sent anywhere.
          </p>
          <div className={styles.toolGrid}>
            {TOOLS.map((t) => (
              <Link key={t.href} href={t.href} className={styles.tool}>
                <span className={styles.toolN}>{t.n}</span>
                <h3>{t.title}</h3>
                <p>{t.text}</p>
                <span className={styles.toolTag}>{t.tag}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={`wrap ${styles.block}`}>
        <div className={styles.split}>
          <div>
            <h2>Where the data came from</h2>
            <p>
              OpenNeuro dataset ds005931, shared under CC0 by Riyo Ueda, Eishi Asano and
              colleagues at Wayne State University. Eight patients aged nine to twenty,
              recorded at 1000 samples a second, all on the left side of the brain.
            </p>
            <p>
              I did not collect this data and I am not connected to the team that did. The
              analysis, the code and any mistakes in it are mine.
            </p>
          </div>
          <div>
            <h2>Two things the files hide</h2>
            <p>
              The folders look like two sessions per patient. They are not. They are two
              halves of the same recording split by electrode bank, with matching tap
              times down to the microsecond. Stack them as if they were separate sessions
              and the same seconds of brain end up in your training and test sets at once.
            </p>
            <p>
              There is also no events file anywhere. The tap markers sit inside the
              recording file itself. A normal loader finds nothing and reports zero taps.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
