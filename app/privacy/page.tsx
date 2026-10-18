import type { Metadata } from "next";
import Link from "next/link";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What this site does and does not collect. Short version: no accounts, no tracking, no analytics, and anything you load stays on your own device.",
};

export default function Page() {
  return (
    <>
      <section className={`wrap page-head ${styles.head}`}>
        <h1>Privacy</h1>
        <p className={styles.updated}>Last updated 18 October 2026</p>
      </section>

      <section className={`wrap ${styles.body}`}>
        <div className={styles.summary}>
          <p><strong>The short version.</strong></p>
          <p>
            There are no accounts and no sign in. There is no analytics, no advertising and
            no third party tracking of any kind. Files you load and rhythms you tap are
            processed inside your browser and never sent to us or anyone else.
          </p>
          <p>
            The only things kept on your device are your light or dark colour choice and a
            note that you closed the storage banner. You can clear both at any time by
            clearing site data in your browser.
          </p>
        </div>

        <h2 id="who">Who runs this site</h2>
        <p>
          CorticalTap is a personal research and education project by Aaryav Sharma. It is not
          run by a company, a hospital or a university, and it is not connected to the team
          that collected the brain recordings it uses.
        </p>

        <h2 id="collect">What we collect</h2>
        <p>
          We do not collect personal information. There is no form asking for your name,
          your email or anything else, because there is nothing on this site that needs an
          account.
        </p>
        <h3>Files and input you provide</h3>
        <p>
          The tool for checking your own data reads files using your browser&apos;s own file
          reader. The contents stay in the memory of the page you have open. Nothing is
          uploaded, nothing is stored on a server, and closing the tab discards it. The same
          is true of the tapping tool: the timings exist only while the page is open.
        </p>
        <p>
          Because your file never leaves your device, we could not access it even if we
          wanted to. That said, be sensible about what you load. If a file contains health
          information or anything else private, treat it the way you would treat opening it
          in any other program on a shared computer.
        </p>
        <h3>Stored on your device</h3>
        <div className={styles.tbl}>
          <div className="tw">
            <table>
              <thead>
                <tr><th scope="col">Name</th><th scope="col">Purpose</th><th scope="col">Kept for</th></tr>
              </thead>
              <tbody>
                <tr><td><code>theme</code></td><td>Remembers whether you chose light or dark, and only if you pressed the control in the header</td><td>Until you clear site data</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <p>
          It is held in local storage, not a cookie. It contains nothing that could
          identify you, and if you never press the control nothing is stored at all. See the <Link href="/cookies">storage page</Link> for detail.
        </p>

        <h2 id="hosting">Hosting and server logs</h2>
        <p>
          The site is hosted on Vercel. Like nearly every web host, Vercel&apos;s
          infrastructure processes the technical information any web request contains,
          including your IP address, the page requested and your browser type, in order to
          deliver the page and to protect against abuse. We have not enabled Vercel
          Analytics, Speed Insights or any similar product, so we do not receive visitor
          reports and cannot see who visited.
        </p>
        <p>
          Vercel acts as our hosting provider in this respect. Their handling of that data
          is described in the Vercel privacy notice at{" "}
          <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
            vercel.com/legal/privacy-policy</a>.
        </p>

        <h2 id="third">Other services</h2>
        <p>
          The typeface is served from this site under its own licence rather than from a
          font service, so loading a page tells no other company that you visited. Every
          file a page loads comes from this same address.
        </p>
        <p>
          Links to research papers point at publishers and preprint servers. Once you follow
          one you are on their site under their rules.
        </p>

        <h2 id="children">Children</h2>
        <p>
          This site is aimed at a general audience interested in neuroscience and machine
          learning. It does not knowingly collect information from anyone, including
          children, because it does not collect personal information at all.
        </p>

        <h2 id="rights">Your rights</h2>
        <p>
          Rules such as the UK and EU General Data Protection Regulation and the California
          Consumer Privacy Act give you rights to see, correct, delete or export personal
          data an organisation holds about you. We hold none, so there is nothing to hand
          over or erase. If you believe otherwise, get in touch and we will look into it.
        </p>
        <p>
          For anything stored on your own device, you are in full control: clearing site
          data in your browser removes it immediately.
        </p>

        <h2 id="research">About the brain recordings</h2>
        <p>
          The recordings on this site come from OpenNeuro dataset ds005931, released under a
          CC0 public domain dedication by the research team that collected it. The patients
          gave consent through the original study, which was approved by the Institutional
          Review Board of Wayne State University, and the data was de-identified before
          release. No patient is named here and nothing on this site can identify anyone.
        </p>

        <h2 id="changes">Changes</h2>
        <p>
          If this notice changes, the date at the top changes with it. Since there is no
          mailing list, checking that date is the way to know.
        </p>

        <div className={styles.contact}>
          <p>
            Questions about this notice, or anything else on the site, can go to{" "}
            <a href="mailto:aaryavvatts@gmail.com">aaryavvatts@gmail.com</a>.
          </p>
        </div>
      </section>
    </>
  );
}
