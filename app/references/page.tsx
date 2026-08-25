import type { Metadata } from "next";
import styles from "./references.module.css";

export const metadata: Metadata = {
  title: "References",
  description:
    "The dataset and the published work this project builds on, with links to every source.",
};

type Ref = { authors: string; year: string; title: string; venue: string; doi: string; note: string };

const DATASET: Ref = {
  authors: "Ueda R, Uda H, Hatano K, Sakakura K, Kuroda N, Kitazawa Y, Kanno A, Lee M-H, Jeong J-W, Luat AF, Asano E",
  year: "2025",
  title: "Dataset of intracranial EEG from human epilepsy patients performing a visuomotor task (ds005931)",
  venue: "OpenNeuro, shared under CC0",
  doi: "https://doi.org/10.18112/openneuro.ds005931.v1.0.0",
  note: "Every recording, electrode position and tap marker used on this site comes from here. I had no part in collecting it.",
};

const GROUPS: { title: string; blurb: string; refs: Ref[] }[] = [
  {
    title: "Reading movement from the brain surface",
    blurb: "Why high gamma power is the standard place to look, and what has already been decoded this way.",
    refs: [
      { authors: "Volkova K, Lebedev MA, Kaplan A, Ossadtchi A", year: "2019",
        title: "Decoding movement from electrocorticographic activity: a review",
        venue: "Frontiers in Neuroinformatics 13:74",
        doi: "https://doi.org/10.3389/fninf.2019.00074",
        note: "Broad survey of the field. Useful for seeing how ordinary the linear high gamma decoder used here is as a baseline." },
      { authors: "Miller KJ, Hermes D, Staff NP", year: "2020",
        title: "The current state of electrocorticography-based brain–computer interfaces",
        venue: "Neurosurgical Focus 49(1):E2",
        doi: "https://doi.org/10.3171/2020.4.focus20185",
        note: "Where this kind of recording sits on the road to something clinically usable." },
      { authors: "Merk T, Peterson V, Lipski WJ, et al.", year: "2022",
        title: "Electrocorticography is superior to subthalamic local field potentials for movement decoding in Parkinson's disease",
        venue: "eLife 11:e75126",
        doi: "https://doi.org/10.7554/elife.75126",
        note: "Direct comparison of decoding methods on surface recordings, including how far simple models get." },
      { authors: "Stolk A, Brinkman L, Vansteensel MJ, et al.", year: "2019",
        title: "Electrocorticographic dissociation of alpha and beta rhythmic activity in the human sensorimotor system",
        venue: "eLife 8:e48065",
        doi: "https://doi.org/10.7554/elife.48065",
        note: "Explains why beta tends to fall during movement while high gamma rises, which you can watch happen in the signal lab." },
    ],
  },
  {
    title: "Why steady movement might be easier to predict",
    blurb: "Background for the one result here that held up, and pointed the opposite way to expectation.",
    refs: [
      { authors: "Hermes D, Siero JCW, Aarnoutse EJ, Leijten FSS, Petridou N, Ramsey NF", year: "2012",
        title: "Dissociation between neuronal activity in sensorimotor cortex and hand movement revealed as a function of movement rate",
        venue: "Journal of Neuroscience 32(28):9736–9744",
        doi: "https://doi.org/10.1523/jneurosci.0357-12.2012",
        note: "Found that repeating a hand movement faster suppresses high gamma even though the movement itself stays the same. Consistent with the idea that repeated tapping settles into something more stereotyped, though this study measured power rather than predictability." },
    ],
  },
  {
    title: "Pretrained models for brain data",
    blurb: "The line of work this project was testing on a small dataset.",
    refs: [
      { authors: "Wang C, Subramaniam V, Yaari AU, et al.", year: "2023",
        title: "BrainBERT: self-supervised representation learning for intracranial recordings",
        venue: "arXiv preprint",
        doi: "https://doi.org/10.48550/arxiv.2302.14367",
        note: "The closest comparison. Trains on the same kind of recording and reports that it carries over to new people with electrodes in new places, using far more data than was available here." },
      { authors: "Ye J, Collinger JL, Wehbe L, Gaunt R", year: "2023",
        title: "Neural Data Transformer 2: multi-context pretraining for neural spiking activity",
        venue: "bioRxiv preprint",
        doi: "https://doi.org/10.1101/2023.09.18.558113",
        note: "Pretraining across sessions, people and tasks for implanted interfaces, aimed squarely at cutting setup time." },
      { authors: "Ortega Caro J, Fonseca AHO, Averill C, et al.", year: "2023",
        title: "BrainLM: a foundation model for brain activity recordings",
        venue: "bioRxiv preprint",
        doi: "https://doi.org/10.1101/2023.09.12.557460",
        note: "Same idea at a much larger scale, on a different imaging method. A useful sense of how much data these methods usually need." },
    ],
  },
  {
    title: "Setup time, and why transfer is not guaranteed",
    blurb: "The problem this project set out to help with, and prior warnings that it is harder than it looks.",
    refs: [
      { authors: "Lotte F, Bougrain L, Cichocki A, et al.", year: "2018",
        title: "A review of classification algorithms for EEG-based brain–computer interfaces: a 10 year update",
        venue: "Journal of Neural Engineering 15(3):031005",
        doi: "https://doi.org/10.1088/1741-2552/aab2f2",
        note: "Notes that transfer learning can help but that the benefit is hard to predict in advance, and that deep models had not clearly beaten established methods. That matches what happened here." },
      { authors: "Krauledat M, Tangermann M, Blankertz B, Müller K-R", year: "2008",
        title: "Towards zero training for brain-computer interfacing",
        venue: "PLoS ONE 3(8):e2967",
        doi: "https://doi.org/10.1371/journal.pone.0002967",
        note: "Early attempt at removing the setup session by reusing patterns from previous sessions." },
      { authors: "Kwon OY, Lee MH, Guan C, Lee SW", year: "2019",
        title: "Subject-independent brain–computer interfaces based on deep convolutional neural networks",
        venue: "IEEE Transactions on Neural Networks and Learning Systems 31(10):3839–3852",
        doi: "https://doi.org/10.1109/tnnls.2019.2946869",
        note: "Puts a number on the setup burden: roughly twenty to thirty minutes of data per person before the system is usable." },
    ],
  },
];

function Row({ r }: { r: Ref }) {
  return (
    <li className={styles.ref}>
      <p className={styles.rTitle}>
        <a href={r.doi} target="_blank" rel="noopener noreferrer">{r.title}</a>
      </p>
      <p className={styles.rMeta}>
        {r.authors} · {r.year} · <em>{r.venue}</em>
      </p>
      <p className={styles.rNote}>{r.note}</p>
    </li>
  );
}

export default function Page() {
  return (
    <>
      <section className={`wrap ${styles.head}`}>
        <p className="eyebrow">References</p>
        <h1>What this is built on</h1>
        <p className={`prose ${styles.lede}`}>
          Every source below is a real published paper or dataset and every link goes to
          the record itself. Where a paper is used to support a point on this site, the
          note says exactly what it does and does not show.
        </p>
      </section>

      <section className={`wrap ${styles.body}`}>
        <div className={styles.datasetBox}>
          <p className={styles.dsLabel}>The data</p>
          <p className={styles.rTitle}>
            <a href={DATASET.doi} target="_blank" rel="noopener noreferrer">{DATASET.title}</a>
          </p>
          <p className={styles.rMeta}>{DATASET.authors} · {DATASET.year} · <em>{DATASET.venue}</em></p>
          <p className={styles.rNote}>{DATASET.note}</p>
        </div>

        {GROUPS.map((g) => (
          <div key={g.title} className={styles.group}>
            <h2>{g.title}</h2>
            <p className={styles.blurb}>{g.blurb}</p>
            <ul className={styles.list}>{g.refs.map((r) => <Row key={r.doi} r={r} />)}</ul>
          </div>
        ))}

        <div className={styles.honesty}>
          <h2>A note on how these are used</h2>
          <p>
            This is a student project, not a peer reviewed study, and it should be read as
            one. The papers above are context and comparison. None of them endorse the
            results here, and where my findings disagree with published work, as they do on
            whether pretraining carries over between people, the likeliest explanation is
            that fifty seven minutes of recording is far too little rather than that the
            published work is wrong.
          </p>
          <p>
            If you spot an error in how something is described, the code and the numbers
            are all public so it can be checked.
          </p>
        </div>
      </section>
    </>
  );
}
