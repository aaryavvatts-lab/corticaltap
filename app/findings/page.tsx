import type { Metadata } from "next";
import FindingsClient from "./FindingsClient";

export const metadata: Metadata = {
  title: "Findings",
  description:
    "Every result from the study with the control that produced it: decoder comparison, transfer to new patients, label free movement detection, embedding structure and electrode attribution.",
};

export default function Page() {
  return <FindingsClient />;
}
