import type { Metadata } from "next";
import Link from "next/link";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Cookies and storage",
  description:
    "This site sets no cookies at all. One small item is kept in local storage for your colour choice, and only if you pick one. Here is exactly what it is and how to remove it.",
};

export default function Page() {
  return (
    <>
      <section className={`wrap page-head ${styles.head}`}>
        <h1>Cookies and storage</h1>
        <p className={styles.updated}>Last updated 18 October 2026</p>
      </section>

      <section className={`wrap ${styles.body}`}>
        <div className={styles.summary}>
          <p><strong>This site sets no cookies.</strong></p>
          <p>
            Not one, for any purpose. No advertising, no analytics, no session cookies. That
            is why there is no consent wall asking you to accept anything before reading.
          </p>
          <p>
            One small item is saved in local storage, and only if you press the Light or
            Dark control in the header, so the site keeps your colours on the next page. It
            is not a cookie, it is not sent to any server, and it cannot identify you.
          </p>
        </div>

        <h2 id="what">What is stored</h2>
        <div className={styles.tbl}>
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th scope="col">Key</th><th scope="col">Type</th>
                  <th scope="col">What it holds</th><th scope="col">Why</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>theme</code></td><td>Local storage</td>
                  <td>light or dark</td>
                  <td>Keeps the colours you picked instead of resetting every visit</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <p>
          Local storage is different from a cookie in one way that matters here: it is never
          attached to network requests. A cookie travels with every request to the server.
          This value stays on your machine and is only read by the page itself.
        </p>

        <h2 id="why">Why there is no banner</h2>
        <p>
          A site that stores only a setting you chose yourself is not required to ask
          permission, because that setting is needed for the site to work the way you asked
          it to. A banner would be noise, so there is none. This page says plainly what is
          stored instead.
        </p>

        <h2 id="third">Third party requests</h2>
        <p>
          There are none. The typeface is served from this site under its own licence, so
          no font service sees your request. Every file a page loads comes from this same
          address.
        </p>
        <p>
          The brain recordings, figures and model weights the tools use are served from this
          site. They are plain data files and set nothing on your device.
        </p>

        <h2 id="remove">Removing what is stored</h2>
        <p>
          Clearing site data for this domain in your browser removes it.
          The path is usually settings, then privacy, then site data or cookies and site
          data. In private or incognito windows nothing is kept once you close the window.
        </p>
        <p>
          The site works fine with storage blocked. The theme simply follows your system
          setting on every visit.
        </p>

        <p>
          For the wider picture, see <Link href="/privacy">the privacy notice</Link>.
        </p>
      </section>
    </>
  );
}
