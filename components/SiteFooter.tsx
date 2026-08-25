import Link from "next/link";
import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`wrap ${styles.inner}`}>
        <div className={styles.about}>
          <p className={styles.name}>CorticalTap</p>
          <p className={styles.blurb}>
            A student project on reading finger movement from recordings made on the
            surface of the brain. All data here is public and shared under CC0. The
            tools run in your browser.
          </p>
        </div>

        <nav className={styles.cols} aria-label="Footer">
          <div>
            <h2 className={styles.h}>Tools</h2>
            <Link href="/explore">Brain map</Link>
            <Link href="/signals">Signal lab</Link>
            <Link href="/decode">Live decoder</Link>
            <Link href="/analyze">Check your data</Link>
            <Link href="/splits">Split test</Link>
          </div>
          <div>
            <h2 className={styles.h}>Read</h2>
            <Link href="/findings">Findings</Link>
            <Link href="/methods">Methods</Link>
            <Link href="/references">References</Link>
            <Link href="/about">About</Link>
          </div>
          <div>
            <h2 className={styles.h}>Legal</h2>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/cookies">Cookies</Link>
            <Link href="/accessibility">Accessibility</Link>
          </div>
        </nav>
      </div>

      <div className={`wrap ${styles.bottom}`}>
        <p>
          Data from OpenNeuro ds005931, shared under CC0 by Riyo Ueda, Eishi Asano and
          colleagues at Wayne State University.
        </p>
        <p className={styles.warn}>
          This site is for learning and research. It is not a medical device and gives
          no medical advice.
        </p>
      </div>
    </footer>
  );
}
