import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./methods.module.css";

export const metadata: Metadata = {
  title: "Methods",
  description:
    "How the recordings were cleaned, how the transformer was built and trained, and every choice that had to be made along the way, including the ones that would break the results if you got them wrong.",
};

export default function Page() {
  return (
    <>
      <section className={`wrap ${styles.head}`}>
        <p className="eyebrow">Methods</p>
        <h1>How it was actually done</h1>
        <p className={`prose ${styles.lede}`}>
          Enough detail to rebuild this from the public files. Where a choice could have
          gone another way, the reason is written down, including three places where the
          obvious choice quietly produces wrong answers.
        </p>
      </section>

      <section className={`wrap ${styles.body}`}>
        <div className={styles.toc} aria-label="On this page">
          <p className={styles.tocH}>On this page</p>
          <a href="#data">The recordings</a>
          <a href="#traps">Three traps</a>
          <a href="#clean">Cleaning</a>
          <a href="#features">Turning signal into input</a>
          <a href="#model">The model</a>
          <a href="#train">Training</a>
          <a href="#eval">Testing</a>
          <a href="#repro">Running it yourself</a>
        </div>

        <div className={styles.prose}>
          <h2 id="data">The recordings</h2>
          <p>
            Eight patients, aged nine to twenty, all being monitored for epilepsy with
            electrode grids resting on the surface of the left half of the brain. Each
            played Speed Match, a matching game from the Lumosity platform that needs a
            quick finger tap whenever two cards agree. Recording ran at 1000 samples a
            second throughout.
          </p>
          <p>
            After dropping contacts the clinical team marked as bad, either noisy or
            sitting in the seizure zone, 735 usable contacts remain across the eight
            patients, between 64 and 114 each. Total usable recording is about 57 minutes,
            with 1,515 taps.
          </p>
          <figure className={styles.fig}>
            <Image src="/figures/fig0_data.png" width={1470} height={700}
              alt="High gamma power across forty electrodes over a whole recording, with taps marked below in red and the movement and rest labels shaded." />
            <figcaption>
              One patient, start to finish. The game runs in five blocks with rest in
              between, and nothing happens for the first fifty seconds.
            </figcaption>
          </figure>

          <h2 id="traps">Three traps in the files</h2>
          <p>
            Each of these was found by reading the raw recording bytes rather than trusting
            the folder layout, and each one silently ruins the results if you miss it.
          </p>

          <div className={styles.trap}>
            <h3>The two folders are not two sessions</h3>
            <p>
              Every patient has folders named for session one and session two. They are not
              separate sessions. They are two halves of the same recording, split by
              electrode bank. The tap timestamps match exactly, the contact names never
              overlap, and putting the two lists together gives back precisely the contact
              list the dataset declares.
            </p>
            <p>
              They have to be joined side by side, as more electrodes at the same moments.
              Stacking them end to end as if they were separate sessions puts the same
              seconds of brain activity into training and testing at the same time, and
              every score after that is meaningless. The loading code checks all three
              properties and refuses to continue if any fails.
            </p>
          </div>

          <div className={styles.trap}>
            <h3>There is no events file</h3>
            <p>
              The dataset ships no separate list of when taps happened. The markers live
              inside the recording file as annotations labelled Trigger-101. Standard
              tooling that expects a separate events file finds nothing and quietly reports
              zero taps.
            </p>
          </div>

          <div className={styles.trap}>
            <h3>Rest is all at the front</h3>
            <p>
              Tapping does not start until between fifty two and a hundred and twelve
              seconds in, and the game runs in solid blocks. Cut the timeline at seventy
              percent in the usual way and the test half ends up badly lopsided, down to
              22 percent of the rarer class. Shuffling moments at random fixes the balance
              and creates a worse problem, because neighbouring moments are nearly
              identical and end up split across training and test.
            </p>
            <p>
              You can try both and watch them fail on the <Link href="/splits">split test
              page</Link>.
            </p>
          </div>

          <h2 id="clean">Cleaning</h2>
          <p>
            Mains hum was notched out at 60, 120 and 180 hertz. Every contact then had the
            average across all good contacts subtracted from it, which removes whatever the
            whole grid picked up in common and leaves what is local to each spot. Contacts
            with no variation at all were dropped, since they break the standardisation
            step later.
          </p>

          <h2 id="features">Turning signal into something a model can eat</h2>
          <p>
            Reading the brief literally would mean thinning the raw voltage down and asking
            the model to predict it under squared error. That does not work on this kind of
            recording, and the reason is worth stating plainly.
          </p>
          <div className={styles.callout}>
            <p>
              Raw brain voltage is dominated by big, slow waves. The part that tracks
              movement, activity between roughly 70 and 150 hertz, is small by comparison.
              A model scored on squared error spends everything it has chasing the slow
              waves and learns to ignore the exact band that carries the answer.
            </p>
          </div>
          <p>
            So the hundredfold thinning happens in frequency instead. Each contact is
            filtered into seven bands, the strength of each band is tracked over time, and
            those strengths are averaged into bins of a tenth of a second. That takes 1000
            samples a second down to 10, keeps the fast activity a plain thinning would
            destroy, and gives a target smooth enough for squared error to be a sensible
            thing to measure.
          </p>
          <p>
            The seven bands are delta 1 to 4, theta 4 to 8, alpha 8 to 13, beta 13 to 30,
            low gamma 30 to 55, and high gamma split into 70 to 110 and 110 to 150. Each
            band gets its own filter rather than a single shared window, because a window
            short enough to follow fast activity cannot resolve delta at all.
          </p>
          <p>
            Values are standardised per contact using the median and spread rather than the
            mean, so occasional epileptic spikes do not drag the scale around.
          </p>

          <h2 id="model">The model</h2>
          <p>
            A causal transformer, the same recipe behind text models: pre normalisation
            blocks, rotary position encoding, masked attention so nothing can see the
            future, and next step prediction. 1.78 million parameters in the shared middle,
            four layers, 192 wide, six heads, looking back 6.4 seconds.
          </p>
          <p>
            The only real change is what a token is. Instead of a word piece it is a tenth
            of a second of activity across every contact, and instead of choosing from a
            vocabulary the output is a set of numbers.
          </p>
          <p>
            Since patients have different numbers of contacts in different places, the
            network is in three parts: a small input layer specific to each patient, a
            middle shared by everyone, and a small output layer specific to each patient
            again. Only the middle is expected to carry anything general. That split is
            also what makes the transfer test possible, since adapting to a new person
            means fitting a fresh input layer while the middle stays frozen.
          </p>

          <h2 id="train">Training</h2>
          <p>
            The objective is simply to predict the next tenth of a second, scored with a
            loss that shrugs off outliers, which matters in a group of patients whose
            recordings contain epileptic spikes by definition. No labels are used anywhere
            in this stage. The model is never told when a tap happened.
          </p>
          <p>
            Windows are sampled every eight steps rather than every step. A causal model
            already learns from all 64 positions inside each window, so stepping one at a
            time reprocesses each moment 64 times for almost no gain and dominated the
            runtime.
          </p>
          <p>
            Nine models were trained in total: one on all eight patients, and eight more
            each leaving one patient out entirely for the transfer test. Training ran on a
            laptop GPU and took a few hours in total.
          </p>

          <h2 id="eval">Testing</h2>
          <p>
            Every result uses blocked cross validation. The recording is cut into ten
            blocks, two non adjacent blocks are held out, the model is fitted on the other
            eight, and the whole thing repeats five times so every block is tested once.
            Test moments are far enough in time from training moments to be genuinely new,
            and each test set covers both an early and a late stretch.
          </p>
          <p>
            Moments too close to a tap to count as rest but not inside the movement window
            are dropped rather than forced into a class. Since the classes are uneven,
            balanced accuracy is reported instead of plain accuracy. Paired comparisons use
            a signed rank test across the eight patients.
          </p>
          <p>
            Two controls do most of the work. An untrained network of the same shape shows
            whether training mattered or whether the architecture alone was doing the job.
            And in the transfer test, an arm identical in every way except that the middle
            is left random shows whether pretraining on other patients was worth anything.
            The second control is the one that changed the conclusion.
          </p>

          <h2 id="repro">Running it yourself</h2>
          <p>
            The data is public and free. Everything here comes out of one command against
            the raw files, on an ordinary laptop, in roughly three hours.
          </p>
          <div className={styles.code}>
            <pre><code>{`# get the recordings (about 830 MB)
datalad install https://github.com/OpenNeuroDatasets/ds005931.git
datalad get ds005931

# set up and run everything
uv venv --python 3.11
uv pip install torch numpy scipy mne pandas scikit-learn matplotlib pyyaml
python scripts/run_all.py`}</code></pre>
          </div>
          <p>
            The tests are the part worth reading first. They check that the two electrode
            banks really do line up, that no block appears in both training and testing,
            and that the moving average used for the simple decoder never reaches forward
            in time.
          </p>
        </div>
      </section>
    </>
  );
}
