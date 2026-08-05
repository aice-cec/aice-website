import type { Metadata } from "next";
import { Geist, Geist_Mono, Bebas_Neue } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas-neue",
  subsets: ["latin"],
});

export const metadata: Metadata = {
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 selection:bg-white selection:text-black">
        {children}
      </body>
    </html>
  );
}
