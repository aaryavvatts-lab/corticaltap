import type { Metadata } from "next";
import DecodeClient from "./DecodeClient";

export const metadata: Metadata = {
  title: "Live decoder",
  description:
    "Run a real movement decoder in your browser. Pick a moment in a recording and the same weights used in the study decide whether the patient was tapping.",
};

export default function Page() {
  return <DecodeClient />;
}
