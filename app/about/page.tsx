import type { Metadata } from "next";
import Link from "next/link";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "About",
  description:
    "Who made this, why, and what it is honestly worth.",
};

export default function Page() {
  return (
    <>
      <section className={`wrap ${styles.head}`}>
        <p className="eyebrow">About</p>
        <h1>About this project</h1>
      </section>

      <section className={`wrap ${styles.body}`}>
        <h2>Why it exists</h2>
        <p>
          The idea came from a short video making a neat claim: take the architecture behind
          large language models, point it at brain recordings, have it predict the next
          slice of activity rather than the next word, and it will teach itself to
          understand movement.
        </p>
        <p>
          It is a good idea and worth trying. What the video skipped is the part that
          decides whether the idea worked, which is what you compare against. So the project
          became less about building the model and more about building the comparisons that
          could show it was pointless.
        </p>
        <p>
          Three of the four things I hoped to show did not survive those comparisons. That is
          written up plainly on the <Link href="/findings">findings page</Link>, including
          the moment where a better control flipped the conclusion from a clean success to a
          small failure.
        </p>

        <h2>What it is worth</h2>
        <p>
          This is a student project. It has not been peer reviewed. Eight patients and fifty
          seven minutes of recording is a small amount of data, and the honest reading of the
          negative transfer result is that there was nowhere near enough of it, not that the
          method is broken. Published work using far more data reports transfer working, and
          those papers are linked on the <Link href="/references">references page</Link>.
        </p>
        <p>
          What I think does hold up: the forecasting model works, the comparison against a
          plain linear decoder is fair and the linear decoder wins, and prediction error
          reliably drops after movement in every patient. That last one surprised me and is
          the piece I would most like someone else to check.
        </p>

        <h2>Credit where it belongs</h2>
        <p>
          The recordings were collected by Riyo Ueda, Eishi Asano and colleagues at Wayne
          State University, and released publicly under CC0. Eight young patients in hospital
          for epilepsy monitoring agreed to have their recordings shared. None of this exists
          without them, and I had no part in that work.
        </p>

        <h2>How the site is built</h2>
        <p>
          Next.js and TypeScript, with the 3D map drawn directly in Three.js and the charts
          drawn by hand rather than pulled from a chart library. The analysis behind it is
          Python, using MNE for reading the recordings, SciPy for the filtering and PyTorch
          for the model. All the tools on this site run in your browser using real exported
          data, including the decoder weights, which are the same numbers the study produced.
        </p>

        <div className={styles.contact}>
          <p>
            Built by Aaryav Sharma. Corrections and questions welcome at{" "}
            <a href="mailto:aaryavvatts@gmail.com">aaryavvatts@gmail.com</a>.
          </p>
        </div>
      </section>
    </>
  );
}
