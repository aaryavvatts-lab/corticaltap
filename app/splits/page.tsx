import type { Metadata } from "next";
import SplitsClient from "./SplitsClient";

export const metadata: Metadata = {
  title: "Split test",
  description:
    "See why the usual way of splitting data into training and test sets goes wrong on this recording, and what blocked cross validation does instead.",
};

export default function Page() {
  return <SplitsClient />;
}
