import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AICE | AI Innovation Community for Excellence",
    short_name: "AICE",
    description:
      "Official AI community of College of Engineering Chengannur (CEC). A platform where curious minds meet, ideas evolve, and innovation becomes impact.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#000000",
    icons: [
      {
        src: "/logos/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        src: "/logos/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/logos/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logos/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
