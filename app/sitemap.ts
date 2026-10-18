import type { MetadataRoute } from "next";

const BASE = "https://ecog-movement-decoder.vercel.app";
const PAGES = ["", "/explore", "/signals", "/decode", "/analyze", "/splits",
  "/findings", "/methods", "/references", "/about",
  "/privacy", "/terms", "/cookies", "/accessibility"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map((p) => ({
    url: `${BASE}${p}`,
    lastModified: new Date("2026-08-25"),
    changeFrequency: p === "" ? "monthly" : "yearly",
    priority: p === "" ? 1 : p.startsWith("/priv") || p.startsWith("/terms") ? 0.3 : 0.8,
  }));
}
