"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";

export const TOOLS = [
  { href: "/explore", label: "Brain map" },
  { href: "/signals", label: "Signal lab" },
  { href: "/decode", label: "Live decoder" },
  { href: "/analyze", label: "Your data" },
  { href: "/splits", label: "Split test" },
];
export const READS = [
  { href: "/findings", label: "Findings" },
  { href: "/methods", label: "Methods" },
  { href: "/references", label: "References" },
  { href: "/about", label: "About" },
];
const LEGAL = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/cookies", label: "Cookies" },
  { href: "/accessibility", label: "Accessibility" },
];
const BAR = [
  { href: "/explore", label: "Brain map" },
  { href: "/findings", label: "Findings" },
  { href: "/decode", label: "Live decoder" },
  { href: "/analyze", label: "Your data" },
];

export default function SiteHeader() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const sheetRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    if (!open) { document.body.style.overflow = ""; return; }
    document.body.style.overflow = "hidden";
    sheetRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); toggleRef.current?.focus(); }
      if (e.key === "Tab" && sheetRef.current) {
        const f = sheetRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
        if (!f.length) return;
        const a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    };
    const mq = window.matchMedia("(min-width: 48em)");
    const onWide = (m: MediaQueryListEvent) => { if (m.matches) setOpen(false); };
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onWide);
    return () => {
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onWide);
      document.body.style.overflow = "";
    };
  }, [open]);

  const cur = (href: string) => (path === href ? "page" : undefined);
  let i = 0;
  const item = (l: { href: string; label: string }) => (
    <Link key={l.href} href={l.href} aria-current={cur(l.href)} style={{ ["--i" as string]: i++ }}>{l.label}</Link>
  );

  return (
    <>
      <header className="wrap bar">
        <Link href="/" className="bar__mark">CorticalTap</Link>
        <nav className="bar__links" aria-label="Site">
          {BAR.map((l) => <Link key={l.href} href={l.href} aria-current={cur(l.href)}>{l.label}</Link>)}
          <ThemeToggle />
        </nav>
        <div className="bar__phone">
          <ThemeToggle />
          <button ref={toggleRef} type="button" className="textbtn" onClick={() => setOpen((v) => !v)}
            aria-expanded={open} aria-controls="menu">
            Menu
          </button>
        </div>
      </header>

      <nav id="menu" ref={sheetRef} className="sheet" hidden={!open} aria-label="Menu">
        <div className="sheet__top">
          <span className="bar__mark">CorticalTap</span>
          <button type="button" className="textbtn" onClick={() => { setOpen(false); toggleRef.current?.focus(); }}>Close</button>
        </div>
        <div className="sheet__cols">
          <div><p>Tools</p>{TOOLS.map(item)}</div>
          <div>
            <p>Read</p>
            {item({ href: "/", label: "Home" })}
            {READS.map(item)}
            <p style={{ marginTop: "1.2rem" }}>Policies</p>
            {LEGAL.map(item)}
          </div>
        </div>
        <p className="small" style={{ color: "var(--muted)" }}>A student project. Not a medical device.</p>
      </nav>
    </>
  );
}
