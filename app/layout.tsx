import type { Metadata, Viewport } from "next";
import { Geist, Bebas_Neue, Kanit } from "next/font/google";
import "./globals.css";
import ToastContainer from "@/app/components/Toast";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  display: "swap",
});

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["latin"],
  weight: ["700", "900"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#000000",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://aice-cec.vercel.app"),
  title: {
    default: "AICE | AI Innovation Community for Excellence",
    template: "%s | AICE CEC",
  },
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
    "CEC AI",
    "Robotics",
    "Kerala Tech Community",
  ],
  authors: [{ name: "AICE CEC Team" }],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "AICE | AI Innovation Community for Excellence",
    description:
      "Official AI community of College of Engineering Chengannur. Join us to learn, build, and innovate.",
    url: "https://aice-cec.vercel.app",
    siteName: "AICE CEC",
    type: "website",
    images: [
      {
        url: "/logos/aice_logo.png",
        width: 800,
        height: 800,
        alt: "AICE CEC Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AICE | AI Innovation Community for Excellence",
    description:
      "Official AI community of College of Engineering Chengannur. Join us to learn, build, and innovate.",
    images: ["/logos/aice_logo.png"],
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

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": "https://aice-cec.vercel.app/#organization",
      name: "AICE - Artificial Intelligence Community for Excellence",
      url: "https://aice-cec.vercel.app",
      logo: "https://aice-cec.vercel.app/logos/aice_logo.png",
      parentOrganization: {
        "@type": "CollegeOrUniversity",
        name: "College of Engineering Chengannur",
      },
      sameAs: [
        "https://instagram.com/aice_cec",
        "https://linkedin.com/company/aice-cec",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://aice-cec.vercel.app/#website",
      url: "https://aice-cec.vercel.app",
      name: "AICE CEC",
      publisher: {
        "@id": "https://aice-cec.vercel.app/#organization",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${bebasNeue.variable} ${kanit.variable} h-full antialiased dark`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 selection:bg-white selection:text-black">
        {children}
        <ToastContainer />
        <Analytics />
      </body>
    </html>
  );
}
