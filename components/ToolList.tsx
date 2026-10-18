"use client";
import Link from "next/link";
import { useState } from "react";
import Reveal from "@/components/Reveal";
import styles from "./ToolList.module.css";

/* Sticky picture, active list. Pointing at a tool crossfades the picture beside it. */
const TOOLS = [
  { href: "/explore", title: "Brain map", text: "Turn a 3D map of 735 real electrodes. Click one and see what it did when the patient tapped.", pic: ["/pictures/electrodes-light.png", "/pictures/electrodes-dark.png"] },
  { href: "/signals", title: "Signal lab", text: "Play back a real recording. Watch seven frequency bands move, with taps marked.", pic: ["/figures/fig0_data.png"] },
  { href: "/decode", title: "Live decoder", text: "Pick a moment and the real fitted weights decide whether the patient was moving. Runs on your machine.", pic: ["/figures/fig1_decoders.png"] },
  { href: "/analyze", title: "Check your own data", text: "Load any signal file for a spectrum and rhythm read, or tap a beat and compare yourself to the patients.", pic: ["/figures/fig4_geometry.png"] },
  { href: "/splits", title: "Split test", text: "See how the usual training and test split quietly breaks on this data, and what fixes it.", pic: ["/figures/fig2_transfer.png"] },
];

export default function ToolList() {
  const [on, setOn] = useState(0);
  return (
    <div className={styles.tools}>
      <div className={styles.pic} aria-hidden="true">
        {TOOLS.map((t, i) => t.pic.length === 2 ? (
          <span key={t.href} className={`${styles.pair} ${i === on ? styles.on : ""}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="only-light" src={t.pic[0]} alt="" width={1200} height={1500} loading="lazy" decoding="async" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="only-dark" src={t.pic[1]} alt="" width={1200} height={1500} loading="lazy" decoding="async" />
          </span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={t.href} src={t.pic[0]} alt="" width={1400} height={700} loading="lazy" decoding="async" className={i === on ? styles.on : ""} />
        ))}
      </div>
      <ul className={styles.list}>
        {TOOLS.map((t, i) => (
          <Reveal as="li" key={t.href} index={i} className={i === on ? styles.on : ""}>
            <Link href={t.href} onMouseEnter={() => setOn(i)} onFocus={() => setOn(i)}>
              <span className={styles.name}>{t.title}</span>
              <span className={styles.desc}>{t.text}</span>
            </Link>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}
