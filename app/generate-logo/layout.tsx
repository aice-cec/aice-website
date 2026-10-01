import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Logo Generator | AICE",
  description:
    "Generate custom AICE logos in any color combination. Perfect for designers and team members who need branded assets.",
  keywords: [
    "AICE logo",
    "logo generator",
    "brand assets",
    "custom logo",
    "color picker",
    "design tools",
  ],
  openGraph: {
    title: "AICE Logo Generator",
    description:
      "Generate custom AICE logos in any color combination for your projects.",
    type: "website",
  },
};

export default function LogoGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
