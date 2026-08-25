import type { Metadata } from "next";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Accessibility",
  description:
    "How this site is built to be usable with a keyboard, a screen reader, or reduced motion, what is known to be difficult, and how to tell us when something does not work.",
};

export default function Page() {
  return (
    <>
      <section className={`wrap ${styles.head}`}>
        <p className="eyebrow">Legal</p>
        <h1>Accessibility</h1>
        <p className={styles.updated}>Last updated 25 August 2026</p>
      </section>

      <section className={`wrap ${styles.body}`}>
        <div className={styles.summary}>
          <p><strong>The aim.</strong></p>
          <p>
            Everything that can be read should be readable by anyone, and every number shown
            in a picture should also exist as text or a table. Some of the tools here are
            visual by nature, and where that limits things it is written down below rather
            than glossed over.
          </p>
          <p>
            Target is WCAG 2.2 level AA. Most of the site meets it. The parts that do not
            are listed under known problems.
          </p>
        </div>

        <h2 id="built">What has been done</h2>
        <h3>Reading and seeing</h3>
        <ul>
          <li>Body text is set in Atkinson Hyperlegible, a typeface designed by the Braille Institute to keep similar letters apart for readers with low vision.</li>
          <li>Text and background combinations meet at least the 4.5 to 1 contrast ratio in both light and dark, and larger text meets 3 to 1.</li>
          <li>Light and dark both exist as real designs, and the site follows your system setting unless you override it with the button in the header.</li>
          <li>Text resizes with your browser zoom and reflows to a single column, with no loss of content up to 400 percent.</li>
          <li>Colour is never the only signal. Results carry a word such as passed or did not hold up, not just a colour.</li>
        </ul>
        <h3>Keyboard and screen readers</h3>
        <ul>
          <li>Everything interactive is reachable with the Tab key and has a visible focus outline.</li>
          <li>A skip link at the very start jumps past the navigation to the main content.</li>
          <li>Headings run in order and describe the section, so jumping by heading works.</li>
          <li>Charts drawn on canvas carry a text description of what they show.</li>
          <li>Form controls have real labels, and the tapping tool works from the space bar as well as the mouse.</li>
        </ul>
        <h3>Motion</h3>
        <ul>
          <li>The 3D brain map turns slowly on load and stops as soon as you touch it.</li>
          <li>If your system asks for reduced motion, the map does not turn on its own and transitions are switched off.</li>
          <li>Nothing flashes, blinks or auto plays with sound.</li>
        </ul>

        <h2 id="problems">Known problems</h2>
        <p>Being straight about the parts that fall short.</p>
        <ul>
          <li>
            <strong>The 3D brain map needs a pointer.</strong> Turning and zooming is mouse
            or touch only, and individual electrodes cannot be reached with the Tab key.
            The strongest responders list beside it is fully keyboard operable and reaches
            the same information for the contacts that matter most, but it does not cover
            all 735. Making every contact keyboard selectable is the next fix planned.
          </li>
          <li>
            <strong>The signal lab is a drawn canvas.</strong> It has a description of what
            is on screen and the readouts under it are real text, but the traces themselves
            cannot be explored point by point with a screen reader.
          </li>
          <li>
            <strong>Some figures are images.</strong> Charts on the findings page have
            descriptive alt text and the numbers they show are repeated in the surrounding
            text and in the scoreboard table, but the images themselves are not machine
            readable.
          </li>
          <li>
            <strong>Dense numeric tables scroll sideways</strong> on narrow screens. They
            are marked up properly with headers, so a screen reader handles them correctly,
            but a small screen means horizontal scrolling.
          </li>
        </ul>

        <h2 id="alternatives">Getting the same information another way</h2>
        <p>
          Every result on this site exists as text. The findings page states each number in
          a sentence as well as in a chart, and the scoreboard table holds the full
          comparison. The raw tables the site is built from are in the project repository as
          plain CSV files, which work well with a screen reader or a spreadsheet.
        </p>

        <h2 id="tech">How it is built</h2>
        <p>
          Semantic HTML, with ARIA used only where plain HTML cannot express something.
          Tested by keyboard, with browser zoom, in both colour schemes, and with VoiceOver
          on macOS. Automated checks help but do not replace that, so if something is broken
          for you it is worth telling us even if a checker says the page passes.
        </p>

        <h2 id="feedback">If something does not work</h2>
        <p>
          Please say so. Knowing which page, what you were trying to do, and what you were
          using, such as a screen reader and browser, makes it much easier to fix. Reports
          about the parts already listed as problems are still useful, because they help
          decide what to fix first.
        </p>

        <div className={styles.contact}>
          <p>
            Accessibility reports go to{" "}
            <a href="mailto:aaryavvatts@gmail.com">aaryavvatts@gmail.com</a>. This is a
            personal project, so a reply may take a few days, but every report is read.
          </p>
        </div>
      </section>
    </>
  );
}
