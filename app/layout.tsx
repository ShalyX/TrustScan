import type { Metadata, Viewport } from "next";
import { Space_Mono, Syne } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-body",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TrustScan — Scan before you interact",
  description:
    "AI-powered Web3 security scanner. Check wallets, URLs, and token contracts before you interact. Cross-referenced across Etherscan, GoPlus, and Chainabuse.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [{ url: "/shield.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "TrustScan — Scan before you interact",
    description:
      "AI-powered Web3 security scanner built on GenLayer. Check wallets, URLs, and token contracts in seconds.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TrustScan — Scan before you interact",
    description: "AI-powered Web3 security scanner built on GenLayer.",
  },
};

export const viewport: Viewport = {
  themeColor: "#00ff88",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceMono.variable} ${syne.variable} dark`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}