import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";
import redirectsFallback from "@/data/redirects.json";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("redirects")
      .select("id,url_name,target_url,description,created_at");

    if (error || !data?.length) {
      return NextResponse.json(redirectsFallback, {
        headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" },
      });
    }

    const normalized = data.map((item: any) => ({
      id: String(item.id),
      url_name: item.url_name || item.urlname || "",
      target_url: item.target_url || item.targeturl || "",
      description: item.description || "",
      created_at: item.created_at || item.createdat || "",
    }));

    return NextResponse.json(normalized, {
      headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" },
    });
  } catch {
    return NextResponse.json(redirectsFallback);
  }
}

export async function POST(req: Request) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    const rawRedirects = await req.json();
    if (!Array.isArray(rawRedirects)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Upsert first: a failed write must never erase existing data.
    const validIds = new Set(rawRedirects.map((r: any) => r.id).filter(Boolean));
    const { data: existingDbRedirects } = await supabase
      .from("redirects")
      .select("id");

    const formatted = rawRedirects.map((r: any) => ({
      id: String(r.id),
      url_name: r.url_name || r.urlname || "",
      target_url: r.target_url || r.targeturl || "",
      description: r.description || "",
    }));

    const { error } = await supabase
      .from("redirects")
      .upsert(formatted, { onConflict: "id" });

    if (error) {
      console.error("Supabase redirect sync failed", error);
      return NextResponse.json({ error: "Unable to save redirects" }, { status: 500 });
    }

    const idsToDelete = (existingDbRedirects || [])
      .map((r: any) => String(r.id))
      .filter((id: string) => !validIds.has(id));
    if (idsToDelete.length) {
      const { error: deleteError } = await supabase.from("redirects").delete().in("id", idsToDelete);
      if (deleteError) {
        console.error("Supabase redirect deletion failed", deleteError);
        return NextResponse.json({ error: "Redirects saved, but obsolete redirects could not be removed" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, count: formatted.length });
  } catch (error) {
    console.error("Redirect update failed", error);
    return NextResponse.json({ error: "Unable to save redirects" }, { status: 500 });
  }
}
