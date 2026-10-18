import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

/* Erode, by Indian Type Foundry via Fontshare (ITF Free Font License), self-hosted so no font
   service learns who visited. */
const erode = localFont({
  variable: "--font-erode",
  display: "swap",
  src: [
    { path: "./fonts/Erode-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Erode-Italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/Erode-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Erode-Semibold.woff2", weight: "600", style: "normal" },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ecog-movement-decoder.vercel.app"),
  title: {
    default: "CorticalTap: reading movement from brain surface recordings",
    template: "%s | CorticalTap",
  },
  description:
    "Open tools and results from a study of 735 electrodes recorded inside the skull while eight young patients played a tapping game. Explore the electrodes in 3D, run a real decoder in your browser, and check your own signals.",
  keywords: ["ECoG", "brain computer interface", "iEEG", "movement decoding", "open data", "ds005931"],
  authors: [{ name: "Aaryav Sharma" }],
  openGraph: {
    title: "CorticalTap",
    description:
      "Explore 735 real brain electrodes in 3D, run a movement decoder in your browser, and test your own signals.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

// Runs before first paint: marks JavaScript as working and applies a saved theme. The older
// key this site used (ct-theme) is read once and carried over to the shared name.
const themeHead =
  "(function(){var d=document.documentElement;d.classList.add('js');try{var t=localStorage.getItem('theme');" +
  "if(!t){var o=localStorage.getItem('ct-theme');if(o==='dark'||o==='light'){t=o;localStorage.setItem('theme',o);}" +
  "localStorage.removeItem('ct-theme');localStorage.removeItem('ct-notice-seen');}" +
  "if(t==='dark'||t==='light')d.setAttribute('data-theme',t);}catch(e){}})();";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={erode.variable} suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <meta name="theme-color" content="#f4f3ef" />
        <script dangerouslySetInnerHTML={{ __html: themeHead }} />
      </head>
      <body>
        <a className="skip" href="#main">Skip to main content</a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
