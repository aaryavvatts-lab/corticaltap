import type { Metadata } from "next";
import AnalyzeClient from "./AnalyzeClient";

export const metadata: Metadata = {
  title: "Check your own data",
  description:
    "Drop in a CSV of any recorded signal and get a spectrum, band power and rhythm estimate. Or tap a rhythm on your keyboard and compare it with the patients in the study. Nothing leaves your browser.",
};

export default function Page() {
  return <AnalyzeClient />;
}
