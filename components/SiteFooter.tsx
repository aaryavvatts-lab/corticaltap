import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="wrap close">
      <p className="close__mark">CorticalTap</p>
      <p>
        A student project on reading finger movement from recordings made on the surface of
        the brain. All data here is public and shared under CC0. The tools run in your
        browser, and nothing you load or type is sent anywhere.
      </p>
      <p>
        Data from OpenNeuro ds005931, shared under CC0 by Riyo Ueda, Eishi Asano and
        colleagues at Wayne State University. This site is for learning and research. It is
        not a medical device and gives no medical advice.
      </p>
      <nav className="close__meta" aria-label="Tools">
        <Link href="/explore">Brain map</Link>
        <Link href="/signals">Signal lab</Link>
        <Link href="/decode">Live decoder</Link>
        <Link href="/analyze">Check your data</Link>
        <Link href="/splits">Split test</Link>
      </nav>
      <nav className="close__meta" aria-label="Read and policies">
        <Link href="/findings">Findings</Link>
        <Link href="/methods">Methods</Link>
        <Link href="/references">References</Link>
        <Link href="/about">About</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/cookies">Cookies</Link>
        <Link href="/accessibility">Accessibility</Link>
      </nav>
      <p className="small" style={{ color: "var(--muted)" }}>
        Pictures: the electrode map is drawn from this study&apos;s own coordinates; the grid
        illustration is{" "}
        <a href="https://commons.wikimedia.org/wiki/File:Intracranial_electrode_grid_for_electrocorticography.png">
          Intracranial electrode grid for electrocorticography
        </a>{" "}
        by BruceBlaus, <a href="https://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>, via
        Wikimedia Commons. Type is Erode by Indian Type Foundry, under the ITF Free Font
        License, served from this site.
      </p>
    </footer>
  );
}
