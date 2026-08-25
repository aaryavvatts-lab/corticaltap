"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./SiteHeader.module.css";

const TOOLS = [
  { href: "/explore", label: "Brain map" },
  { href: "/signals", label: "Signal lab" },
  { href: "/decode", label: "Live decoder" },
  { href: "/analyze", label: "Your data" },
  { href: "/splits", label: "Split test" },
];
const READS = [
  { href: "/findings", label: "Findings" },
  { href: "/methods", label: "Methods" },
  { href: "/references", label: "References" },
];

export default function SiteHeader() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"auto" | "light" | "dark">("auto");

  useEffect(() => {
    const saved = localStorage.getItem("ct-theme") as "light" | "dark" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);
  useEffect(() => { setOpen(false); }, [path]);

  function flip() {
    const isDark =
      document.documentElement.getAttribute("data-theme") === "dark" ||
      (theme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    const next = isDark ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("ct-theme", next);
  }

  return (
    <header className={styles.header}>
      <div className={`wrap ${styles.bar}`}>
        <Link href="/" className={styles.brand} aria-label="CorticalTap home">
          <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
            <path d="M2 20 L7 20 L9 12 L12 25 L15 8 L18 22 L21 16 L24 16 L26 13 L30 13"
              fill="none" stroke="var(--signal)" strokeWidth="2.4"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>CorticalTap</span>
        </Link>

        <nav className={`${styles.nav} ${open ? styles.navOpen : ""}`} aria-label="Main">
          <span className={styles.groupLabel}>Tools</span>
          {TOOLS.map((l) => (
            <Link key={l.href} href={l.href}
              className={path === l.href ? styles.active : undefined}
              aria-current={path === l.href ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
          <span className={styles.divider} aria-hidden="true" />
          <span className={styles.groupLabel}>Read</span>
          {READS.map((l) => (
            <Link key={l.href} href={l.href}
              className={path === l.href ? styles.active : undefined}
              aria-current={path === l.href ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className={styles.right}>
          <button className={styles.icon} onClick={flip}
            aria-label="Switch between light and dark colours">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
              <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8Z" />
            </svg>
          </button>
          <button className={styles.burger} aria-expanded={open}
            aria-controls="mainnav" onClick={() => setOpen(!open)}>
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>
    </header>
  );
}
