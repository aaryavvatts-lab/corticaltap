import Link from "next/link";
import Reveal from "@/components/Reveal";
import ToolList from "@/components/ToolList";
import styles from "./home.module.css";

/* The dark room: one dim field, and in it, lit things. The first screen is the study's own
   electrode map; the page then walks past the findings, the figures and the tools. Every number
   on this page is the one the study produced (see /findings for the controls behind each). */
export default function Home() {
  return (
    <>
      <section className={styles.hero} aria-label="Introduction">
        <div className={styles.heroPic} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="only-light" src="/pictures/electrodes-light.png" alt="" width={1200} height={1500} fetchPriority="high" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="only-dark" src="/pictures/electrodes-dark.png" alt="" width={1200} height={1500} fetchPriority="high" />
        </div>
        <div className={`wrap ${styles.card}`}>
          <h1 className="lines">
            <span className="line"><span data-line style={{ ["--i" as string]: 0 }}>What your brain</span></span>
            <span className="line"><span data-line style={{ ["--i" as string]: 1 }}>does next</span></span>
          </h1>
          <p className={styles.facts} data-rise style={{ ["--i" as string]: 2 }}>
            Eight patients. 735 electrodes on the surface of the brain. 57 minutes of
            recording, all public.
          </p>
          <p className={`lead ${styles.lede}`} data-rise style={{ ["--i" as string]: 3 }}>
            Same idea as the models that finish your sentences, pointed at electrodes
            sitting on the surface of the brain. Instead of the next word it predicts the
            next tenth of a second of brain activity.
          </p>
          <div className={styles.ctas} data-rise style={{ ["--i" as string]: 4 }}>
            <Link href="/explore" className="btn btn-primary">Open the brain map</Link>
            <Link href="/findings" className="textbtn">Read what happened</Link>
          </div>
        </div>
      </section>

      <Reveal className={`wrap ${styles.statement}`} aria-label="The short version">
        <p>
          It learned to do that well. Then almost everything I hoped it would give me
          failed its own control test, and the one result that survived pointed the wrong way.
        </p>
      </Reveal>

      <Reveal className={`wrap ${styles.what}`}>
        <div className={styles.whatPic}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/pictures/ecog-grid-blausen.png" alt="Medical illustration of an electrode grid resting on the surface of the brain under the skull" width={1500} height={1500} loading="lazy" decoding="async" />
          <p className="small">
            An electrode grid on the brain surface, drawn by Blausen Medical. Not one of these
            patients.
          </p>
        </div>
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
      </Reveal>

      <section className={`wrap ${styles.findings}`} id="findings">
        <h2>Three things worth knowing</h2>
        <div className={styles.findGrid}>
          <Reveal as="article" index={0} className={styles.find}>
            <h3>A plain linear decoder beat the transformer</h3>
            <p>
              Logistic regression on every frequency band scored 0.879. The transformer scored
              0.858. Those two are close enough to call a tie, and the tie goes to the
              method that needs no training run and no GPU.
            </p>
            <p className={styles.verdict}>Did not hold up.</p>
          </Reveal>
          <Reveal as="article" index={1} className={styles.find}>
            <h3>Training on other patients made it worse, not better</h3>
            <p>
              The whole point was to cut the setup time for a new person. I trained on
              seven patients and tested on the eighth. A model with random weights in the
              middle did better, in all eight patients. Not a wash. A reversal.
            </p>
            <p className={styles.verdict}>Backfired.</p>
          </Reveal>
          <Reveal as="article" index={2} className={styles.find}>
            <h3>Moving makes the brain easier to predict</h3>
            <p>
              I expected movement to surprise the model. It does the opposite. Prediction
              error drops about half a second after each tap, in every patient. Steady
              tapping makes the signal regular, and regular is easy. That gives a movement
              detector needing no labels at all.
            </p>
            <p className={styles.verdict}>Held up, backwards.</p>
          </Reveal>
        </div>
        <p className={styles.more}>
          <Link href="/findings">All the numbers, with the controls that produced them</Link>
        </p>
      </section>

      <Reveal className={`wrap ${styles.figures}`} aria-label="Figures from the study">
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/figures/fig1_decoders.png" alt="Bar chart comparing balanced accuracy of the linear decoders, the pretrained transformer and the untrained network" width={1400} height={700} loading="lazy" decoding="async" />
          <figcaption>Every decoder scored the same way: balanced accuracy, eight patients, blocked cross validation.</figcaption>
        </figure>
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/figures/fig3_surprise.png" alt="Line chart of the model's prediction error around each finger tap, dropping about half a second after the tap" width={1400} height={700} loading="lazy" decoding="async" />
          <figcaption>Prediction error around each tap. It falls about half a second after the finger moves, in every patient.</figcaption>
        </figure>
      </Reveal>

      <section className={`wrap ${styles.numbers}`} aria-labelledby="numbers-h">
        <h2 id="numbers-h" className={styles.srOnly}>The numbers</h2>
        <Reveal as="div">
          <p>
            <span>735</span> electrode contacts, all real, recorded <span>1,515</span> finger
            taps. The forecaster was <span>9.6%</span> better than assuming nothing changes,
            and pretraining made things worse in <span>8 of 8</span> patients.
          </p>
        </Reveal>
      </section>

      <Reveal className={`wrap ${styles.tools}`} id="tools">
        <h2>Five things you can do here</h2>
        <p className={styles.toolsLede}>
          Every tool runs on real recordings from the study. Nothing you load or type is
          sent anywhere.
        </p>
        <ToolList />
      </Reveal>

      <Reveal className={`wrap ${styles.split}`}>
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
      </Reveal>
    </>
  );
}
