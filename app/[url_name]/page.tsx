import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import redirectsFallback from "@/data/redirects.json";
import NotFound from "../404";

interface RedirectPageProps {
  params: Promise<{ url_name: string }>;
}

export default async function RedirectPage({ params }: RedirectPageProps) {
  const resolvedParams = await params;
  const rawUrlName = resolvedParams?.url_name
    ? decodeURIComponent(resolvedParams.url_name)
    : "";
  const targetSlug = rawUrlName.trim().toLowerCase();

  let targetUrl: string | null = null;

  try {
    const { data } = await supabase.from("redirects").select("*");

    if (data && data.length > 0) {
      const match = data.find((item: any) => {
        const name = item.url_name || item.urlname || "";
        return name.trim().toLowerCase() === targetSlug;
      });

      if (match) {
        targetUrl = match.target_url || match.targeturl || null;
      }
    }
  } catch (err) {
    console.error("Error fetching redirect from Supabase:", err);
  }

  if (!targetUrl && Array.isArray(redirectsFallback)) {
    const fallbackMatch = redirectsFallback.find(
      (item) => item.url_name.trim().toLowerCase() === targetSlug,
    );
    if (fallbackMatch) {
      targetUrl = fallbackMatch.target_url;
    }
  }

  if (targetUrl) {
    let destination = targetUrl.trim();
    if (
      !destination.startsWith("http://") &&
      !destination.startsWith("https://") &&
      !destination.startsWith("/")
    ) {
      destination = `https://${destination}`;
    }
    redirect(destination);
  }

  return <NotFound />;
}

