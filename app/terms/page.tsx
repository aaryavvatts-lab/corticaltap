import type { Metadata } from "next";
import Link from "next/link";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Terms of use",
  description:
    "The rules for using this site: what you may do with the code and data, what the tools are and are not for, and the limits of what is promised.",
};

export default function Page() {
  return (
    <>
      <section className={`wrap ${styles.head}`}>
        <p className="eyebrow">Legal</p>
        <h1>Terms of use</h1>
        <p className={styles.updated}>Last updated 25 August 2026</p>
      </section>

      <section className={`wrap ${styles.body}`}>
        <div className={styles.summary}>
          <p><strong>The short version.</strong></p>
          <p>
            Use it, learn from it, reuse the code and the data. Do not use it to make
            decisions about anyone&apos;s health. It is a student project shared as is, with
            no promises that it is correct or that it will stay online.
          </p>
        </div>

        <h2 id="accept">Agreeing to these terms</h2>
        <p>
          By using this site you accept what follows. If you do not, please stop using it.
          These terms may change, and continuing to use the site after a change means you
          accept the new version.
        </p>

        <h2 id="medical">Not medical advice</h2>
        <p>
          This is the important one. NeuroTap is for education and research. It is not a
          medical device, has not been reviewed or approved by any regulator, and must not
          be used to diagnose, treat, monitor or make decisions about any medical condition,
          including epilepsy.
        </p>
        <p>
          The tool that analyses your own data does ordinary signal processing on numbers
          you supply. It knows nothing about health, produces nothing clinical, and its
          output means nothing medically. If you have a health concern, speak to a qualified
          professional. If you are having a medical emergency, contact emergency services.
        </p>

        <h2 id="use">What you may do</h2>
        <p>
          You may read, share and link to anything here. You may run the tools as much as
          you like. You may reuse the analysis code under the terms in its repository, and
          the underlying recordings under the CC0 dedication the original team released
          them under.
        </p>
        <p>
          If you build on the research, please credit the team who collected the data,
          listed on the <Link href="/references">references page</Link>, rather than this
          site. They did the hard part.
        </p>

        <h2 id="dont">What you may not do</h2>
        <ul>
          <li>Present any output from this site as a clinical or diagnostic result.</li>
          <li>Claim the site, or its results, are endorsed by Wayne State University, OpenNeuro, or the researchers who collected the recordings. They are not.</li>
          <li>Attempt to identify any individual from the recordings, which are de-identified and shared publicly on that basis.</li>
          <li>Try to break, overload or interfere with the site, or use automated tools in a way that degrades it for other people.</li>
          <li>Copy the site and present it as your own work.</li>
        </ul>

        <h2 id="yourdata">Content you provide</h2>
        <p>
          Files you load and rhythms you tap stay in your browser. We never receive them, so
          we claim no rights over them and take no responsibility for them. You are
          responsible for having the right to use any file you open, and for deciding
          whether a shared or public computer is a sensible place to open it.
        </p>

        <h2 id="accuracy">Accuracy, and the lack of guarantees</h2>
        <p>
          Every number here comes from code that is public and can be checked. That does not
          make it correct. This is a student project, it has not been peer reviewed, and it
          may contain mistakes in the analysis, the code or the writing.
        </p>
        <p>
          The site is provided as is and as available, without warranties of any kind,
          whether express or implied, including any implied warranty of merchantability,
          fitness for a particular purpose or non infringement. There is no promise that it
          will be accurate, uninterrupted, error free, or that it will remain online.
        </p>

        <h2 id="liability">Limits on liability</h2>
        <p>
          To the fullest extent the law allows, the site&apos;s author is not liable for any
          indirect, incidental, special or consequential loss arising from your use of this
          site, including lost data, lost profits or decisions made on the basis of anything
          here.
        </p>
        <p>
          Nothing in these terms excludes or limits liability where the law does not permit
          it, including liability for death or personal injury caused by negligence, or for
          fraud.
        </p>

        <h2 id="thirdparty">Links elsewhere</h2>
        <p>
          Links to papers, datasets and code repositories are provided as references. Those
          sites are not under our control and we are not responsible for what they contain
          or do.
        </p>

        <h2 id="law">Governing law</h2>
        <p>
          These terms are governed by the laws of the State of California, United States,
          without regard to conflict of law rules. This does not remove any protection you
          have under the mandatory law of the country you live in.
        </p>

        <div className={styles.contact}>
          <p>
            Questions, corrections or takedown requests can go to{" "}
            <a href="mailto:aaryavvatts@gmail.com">aaryavvatts@gmail.com</a>.
          </p>
        </div>
      </section>
    </>
  );
}
