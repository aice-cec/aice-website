import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import redirectsFallback from "@/data/redirects.json";

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

  return (
    <main className="min-h-screen bg-[#070709] text-gray-100 font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow ambient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md p-8 bg-[#121217] border border-white/10 rounded-2xl shadow-2xl text-center flex flex-col items-center gap-6">
        <div className="relative w-16 h-16 mb-2">
          <Image
            src="/logos/aice_logo.png"
            alt="AICE Logo"
            fill
            className="object-contain"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="px-3 py-1 text-xs font-extrabold tracking-wider uppercase bg-red-500/10 border border-red-500/20 text-red-400 rounded-full w-fit mx-auto">
            404 — Redirect Not Found
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Invalid Redirect Link
          </h1>
          <p className="text-xs text-gray-400 leading-relaxed">
            The short link{" "}
            <code className="px-2 py-0.5 bg-black/50 text-red-400 border border-white/10 rounded font-mono">
              aice.ceconline.edu/{targetSlug}
            </code>{" "}
            does not exist or has been removed by the PR team.
          </p>
        </div>

        <div className="w-full pt-4 border-t border-white/10 flex flex-col gap-3">
          <Link
            href="/"
            className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-lg text-center"
          >
            Return to Homepage
          </Link>
          <Link
            href="/admin-portal"
            className="w-full py-2 px-4 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold text-xs rounded-lg transition-colors border border-white/10 text-center"
          >
            Go to PR Admin Portal
          </Link>
        </div>
      </div>
    </main>
  );
}
