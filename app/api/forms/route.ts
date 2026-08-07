import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyToken } from "../admin/login/route";
import formsFallback from "@/data/forms.json";
import fs from "fs";
import path from "path";

// Local file fallback helper
const formsFilePath = path.join(process.cwd(), "data", "forms.json");

function getLocalForms(): any[] {
  try {
    if (fs.existsSync(formsFilePath)) {
      const fileData = fs.readFileSync(formsFilePath, "utf8");
      return JSON.parse(fileData);
    }
  } catch (e) {}
  return formsFallback as any[];
}

function saveLocalForms(forms: any[]) {
  try {
    fs.writeFileSync(formsFilePath, JSON.stringify(forms, null, 2), "utf8");
  } catch (e) {
    console.warn("Failed to write to data/forms.json:", e);
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const id = searchParams.get("id");

    const localForms = getLocalForms();

    if (slug) {
      const { data, error } = await supabase
        .from("forms")
        .select("*")
        .eq("slug", slug)
        .single();

      if (!error && data) {
        return NextResponse.json(data);
      }

      const fallbackForm = localForms.find(
        (f) => f.slug === slug || f.id === slug
      );
      if (fallbackForm) return NextResponse.json(fallbackForm);

      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    if (id) {
      const { data, error } = await supabase
        .from("forms")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        return NextResponse.json(data);
      }

      const fallbackForm = localForms.find((f) => f.id === id);
      if (fallbackForm) return NextResponse.json(fallbackForm);

      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // List all forms
    const { data, error } = await supabase
      .from("forms")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return NextResponse.json(data);
    }

    return NextResponse.json(localForms);
  } catch (err: any) {
    return NextResponse.json(getLocalForms());
  }
}

export async function POST(req: Request) {
  try {
    const token = req.headers.get("x-admin-token");
    if (!verifyToken(token)) {
      return NextResponse.json(
        { error: "Unauthorized or Session Expired" },
        { status: 401 }
      );
    }

    const rawForms = await req.json();
    if (!Array.isArray(rawForms)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Format & validate form objects
    const formattedForms = rawForms.map((f: any) => ({
      id: f.id || `form-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      slug: (f.slug || f.title || "form")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, ""),
      event_id: f.event_id || f.eventId || null,
      title: f.title || "Untitled Form",
      description: f.description || "",
      whatsapp_link: f.whatsapp_link || f.whatsappLink || "",
      fields: Array.isArray(f.fields) ? f.fields : [],
      is_active: f.is_active !== undefined ? Boolean(f.is_active) : true,
    }));

    // Always update local data/forms.json fallback file
    saveLocalForms(formattedForms);

    // Save to Supabase
    const { data, error } = await supabase
      .from("forms")
      .upsert(formattedForms, { onConflict: "id" })
      .select();

    if (error) {
      console.warn("Supabase forms upsert warning (saved to local data/forms.json):", error);
    }

    return NextResponse.json({ success: true, forms: formattedForms });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server Error" },
      { status: 500 }
    );
  }
}
