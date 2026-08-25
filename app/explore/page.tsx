import type { Metadata } from "next";
import ExploreClient from "./ExploreClient";

export const metadata: Metadata = {
  title: "Brain map",
  description:
    "Turn and zoom a 3D map of 735 electrodes recorded inside the skulls of eight patients. Click any contact to see how its high gamma power changed around a finger tap.",
};

export default function Page() {
  return <ExploreClient />;
}
