import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import redirectsFallback from "@/data/redirects.json";
import { verifyToken } from "../admin/login/route";

export interface RedirectItem {
  id: string;
  url_name: string;
  target_url: string;
  description?: string;
  created_at?: string;
}

export async function GET() {
  try {
    const { data, error } = await supabase.from("redirects").select("*");

    if (error) {
      console.error("Supabase GET redirects error:", error);
      return NextResponse.json(redirectsFallback);
    }

    if (!data || data.length === 0) {
      return NextResponse.json(redirectsFallback);
    }

    const normalized = data.map((item: any) => ({
      id: String(item.id),
      url_name: item.url_name || item.urlname || "",
      target_url: item.target_url || item.targeturl || "",
      description: item.description || "",
      created_at: item.created_at || item.createdat || "",
    }));

    return NextResponse.json(normalized);
  } catch (err) {
    console.error("GET redirects route error:", err);
    return NextResponse.json(redirectsFallback);
  }
}

export async function POST(req: Request) {
  try {
    const token = req.headers.get("x-admin-token");
    if (!verifyToken(token)) {
      return NextResponse.json(
        { error: "Unauthorized or Session Expired" },
        { status: 401 },
      );
    }

    const rawRedirects = await req.json();
    if (!Array.isArray(rawRedirects)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const validIds = new Set(rawRedirects.map((r: any) => r.id).filter(Boolean));
    const { data: existingDbRedirects } = await supabase
      .from("redirects")
      .select("id");

    if (existingDbRedirects && existingDbRedirects.length > 0) {
      const idsToDelete = existingDbRedirects
        .map((r: any) => String(r.id))
        .filter((id: string) => !validIds.has(id));

      if (idsToDelete.length > 0) {
        const { error: delErr } = await supabase
          .from("redirects")
          .delete()
          .in("id", idsToDelete);
        if (delErr) {
          console.warn("Failed to delete removed redirects from Supabase:", delErr);
        }
      }
    }

    const formatted = rawRedirects.map((r: any) => ({
      id: String(r.id),
      url_name: r.url_name || r.urlname || "",
      target_url: r.target_url || r.targeturl || "",
      description: r.description || "",
    }));

    let { data, error } = await supabase
      .from("redirects")
      .upsert(formatted, { onConflict: "id" })
      .select();

    if (error && (error.code === "PGRST204" || error.message.includes("column"))) {
      console.warn("Retrying Supabase redirects upsert with lowercased column names...");
      const lowercased = rawRedirects.map((r: any) => ({
        id: String(r.id),
        urlname: r.url_name || r.urlname || "",
        targeturl: r.target_url || r.targeturl || "",
        description: r.description || "",
      }));

      const retry = await supabase
        .from("redirects")
        .upsert(lowercased, { onConflict: "id" })
        .select();

      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error("Supabase redirects upsert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: data ? data.length : rawRedirects.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update redirects" },
      { status: 500 },
    );
  }
}
