import type { Metadata, Viewport } from "next";
import {
  Geist,
  Geist_Mono,
  Bebas_Neue,
  Space_Grotesk,
  Kanit,
} from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#000000",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://aice-cec.vercel.app"),
  title: "AICE",
  description:
    "Official AI community of College of Engineering Chengannur (CEC). A platform where curious minds meet, ideas evolve, and innovation becomes impact.",
  keywords: [
    "AICE",
    "AICE CEC",
    "AI Community",
    "College of Engineering Chengannur",
    "CEC Chengannur",
    "Artificial Intelligence",
    "Machine Learning",
  ],
  authors: [{ name: "AICE CEC Team" }],
  openGraph: {
    title: "AICE | AI Innovation Community for Excellence",
    description:
      "Official AI community of College of Engineering Chengannur. Join us to learn, build, and innovate.",
    siteName: "AICE CEC",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AICE | AI Innovation Community for Excellence",
    description:
      "Official AI community of College of Engineering Chengannur. Join us to learn, build, and innovate.",
  },
  applicationName: "AICE",
  appleWebApp: {
    capable: true,
    title: "AICE",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/logos/favicon.ico", type: "image/x-icon" },
      { url: "/logos/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/logos/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/logos/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    shortcut: "/logos/favicon.ico",
    apple: [
      {
        url: "/logos/apple-touch-icon-180x180.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        url: "/logos/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

import ToastContainer from "@/app/components/Toast";
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} ${spaceGrotesk.variable} ${kanit.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 selection:bg-white selection:text-black">
        {children}
        <ToastContainer />
        <Analytics />
      </body>
    </html>
  );
}
