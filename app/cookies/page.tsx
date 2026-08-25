import type { Metadata } from "next";
import Link from "next/link";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Cookies and storage",
  description:
    "This site sets no cookies at all. Two small items are kept in local storage for your colour choice and the banner. Here is exactly what they are and how to remove them.",
};

export default function Page() {
  return (
    <>
      <section className={`wrap ${styles.head}`}>
        <p className="eyebrow">Legal</p>
        <h1>Cookies and storage</h1>
        <p className={styles.updated}>Last updated 25 August 2026</p>
      </section>

      <section className={`wrap ${styles.body}`}>
        <div className={styles.summary}>
          <p><strong>This site sets no cookies.</strong></p>
          <p>
            Not one, for any purpose. No advertising, no analytics, no session cookies. That
            is why there is no consent wall asking you to accept anything before reading.
          </p>
          <p>
            Two small items are saved in local storage so the site behaves sensibly on your
            next visit. Neither is a cookie, neither is sent to any server, and neither can
            identify you.
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
                  <td className="mono">nt-theme</td><td>Local storage</td>
                  <td className="mono">light or dark</td>
                  <td>Keeps the colours you picked instead of resetting every visit</td>
                </tr>
                <tr>
                  <td className="mono">nt-notice-seen</td><td>Local storage</td>
                  <td className="mono">1</td>
                  <td>Stops the storage banner reappearing after you close it</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <p>
          Local storage is different from a cookie in one way that matters here: it is never
          attached to network requests. A cookie travels with every request to the server.
          These values stay on your machine and are only read by the page itself.
        </p>

        <h2 id="why">Why show a banner at all</h2>
        <p>
          Strictly, a site that stores only what these two do is not required to ask
          permission, because both are needed for the site to work the way you asked it to.
          The banner is there to say plainly what is stored rather than to collect consent,
          which is why it has one button and no options to weigh up.
        </p>

        <h2 id="third">Third party requests</h2>
        <p>
          Fonts are loaded from Google Fonts, so your browser makes a request to
          fonts.googleapis.com and fonts.gstatic.com. Google does not set cookies for font
          requests, but it does receive your IP address and browser details as part of the
          request itself. Blocking those requests leaves the site fully usable with fallback
          type.
        </p>
        <p>
          The brain recordings, figures and model weights the tools use are served from this
          site. They are plain data files and set nothing on your device.
        </p>

        <h2 id="remove">Removing what is stored</h2>
        <p>
          Clearing site data for this domain in your browser removes both items at once.
          The path is usually settings, then privacy, then site data or cookies and site
          data. In private or incognito windows nothing is kept once you close the window.
        </p>
        <p>
          The site works fine with storage blocked. You will simply get the banner each
          visit and the theme will follow your system setting.
        </p>

        <p>
          For the wider picture, see <Link href="/privacy">the privacy notice</Link>.
        </p>
      </section>
    </>
  );
}
