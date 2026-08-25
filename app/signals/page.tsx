import type { Metadata } from "next";
import SignalsClient from "./SignalsClient";

export const metadata: Metadata = {
  title: "Signal lab",
  description:
    "Scrub through real brain recordings from eight patients. Watch power in seven frequency bands move as the patient taps, and see where the forecasting model got things wrong.",
};

export default function Page() {
  return <SignalsClient />;
}
