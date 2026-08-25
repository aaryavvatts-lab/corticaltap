"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./CookieNotice.module.css";

/* This site sets no tracking cookies. The only thing kept on your device is a
   colour theme choice and the fact that you dismissed this notice, both in
   localStorage. The notice exists so that is stated plainly rather than hidden. */
export default function CookieNotice() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem("nt-notice-seen")) setShow(true);
  }, []);
  if (!show) return null;
  return (
    <div className={styles.bar} role="region" aria-label="Storage notice">
      <p>
        This site sets no tracking or advertising cookies. It saves two things on your
        device: your light or dark colour choice, and that you closed this note.{" "}
        <Link href="/cookies">What is stored</Link>
      </p>
      <button className="btn"
        onClick={() => { localStorage.setItem("nt-notice-seen", "1"); setShow(false); }}>
        Got it
      </button>
    </div>
  );
}
