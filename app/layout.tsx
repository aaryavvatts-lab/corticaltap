import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CookieNotice from "@/components/CookieNotice";

export const metadata: Metadata = {
  metadataBase: new URL("https://neurotap.vercel.app"),
  title: {
    default: "NeuroTap: reading movement from brain surface recordings",
    template: "%s | NeuroTap",
  },
  description:
    "Open tools and results from a study of 735 electrodes recorded inside the skull while eight young patients played a tapping game. Explore the electrodes in 3D, run a real decoder in your browser, and check your own signals.",
  keywords: ["ECoG", "brain computer interface", "iEEG", "movement decoding", "open data", "ds005931"],
  authors: [{ name: "Aaryav Sharma" }],
  openGraph: {
    title: "NeuroTap",
    description:
      "Explore 735 real brain electrodes in 3D, run a movement decoder in your browser, and test your own signals.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;500&family=Newsreader:opsz,wght@6..72,500;6..72,600&display=swap"
        />
      </head>
      <body>
        <a className="skip" href="#main">Skip to main content</a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <CookieNotice />
      </body>
    </html>
  );
}
