import type { MetadataRoute } from "next";
import formsFallback from "@/data/forms.json";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://aice-cec.vercel.app";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const dynamicFormRoutes: MetadataRoute.Sitemap = [];
  if (Array.isArray(formsFallback)) {
    for (const form of formsFallback) {
      if (form.is_active && form.slug) {
        dynamicFormRoutes.push({
          url: `${baseUrl}/${form.slug}`,
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    }
  }

  return [...staticRoutes, ...dynamicFormRoutes];
}
