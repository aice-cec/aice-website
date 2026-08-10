import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";
import { getLocalForms } from "@/lib/forms";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const id = searchParams.get("id");

    if (slug) {
      const { data } = await supabase
        .from("forms")
        .select("*")
        .eq("slug", slug)
        .single();

      if (data) return NextResponse.json(data);

      const fallback = getLocalForms().find((f) => f.slug === slug || f.id === slug);
      if (fallback) return NextResponse.json(fallback);

      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    if (id) {
      const { data } = await supabase
        .from("forms")
        .select("*")
        .eq("id", id)
        .single();

      if (data) return NextResponse.json(data);

      const fallback = getLocalForms().find((f) => f.id === id);
      if (fallback) return NextResponse.json(fallback);

      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("forms")
      .select("*")
      .order("created_at", { ascending: false });

    const localForms = getLocalForms();
    if (!error && Array.isArray(data)) {
      const existingIds = new Set(data.map((f: any) => f.id));
      const existingSlugs = new Set(data.map((f: any) => f.slug));
      const mergedForms = [...data];
      for (const lf of localForms) {
        if (!existingIds.has(lf.id) && !existingSlugs.has(lf.slug)) {
          mergedForms.push(lf);
        }
      }
      return NextResponse.json(mergedForms, {
        headers: { "Cache-Control": "s-maxage=10, stale-while-revalidate=30" },
      });
    }

    return NextResponse.json(localForms);
  } catch {
    return NextResponse.json(getLocalForms());
  }
}

export async function POST(req: Request) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    const rawForms = await req.json();
    if (!Array.isArray(rawForms)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const formattedForms = rawForms.map((f: any) => ({
      id: f.id || `form-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      slug: (f.slug || f.title || "form")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, ""),
      event_id: f.event_id || f.eventId || null,
      title: (f.title || "Untitled Form").slice(0, 100),
      description: f.description || "",
      whatsapp_link: f.whatsapp_link || f.whatsappLink || "",
      fields: Array.isArray(f.fields) ? f.fields : [],
      is_active: f.is_active !== undefined ? Boolean(f.is_active) : true,
      issue_ticket: f.issue_ticket !== false,
    }));

    // Upsert first: a failed write must never erase existing data.
    const validIds = new Set(formattedForms.map((f: any) => f.id).filter(Boolean));
    const { data: existingDbForms } = await supabase.from("forms").select("id");

    if (!formattedForms.length) {
      return NextResponse.json({ error: "At least one form is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("forms")
      .upsert(formattedForms, { onConflict: "id" })
      .select();

    if (error) {
      console.error("Supabase form sync failed", error);
      return NextResponse.json(
        { error: "Unable to save forms" },
        { status: 500 },
      );
    }

    const idsToDelete = (existingDbForms || [])
      .map((f: any) => f.id)
      .filter((id: string) => !validIds.has(id));
    if (idsToDelete.length) {
      const { error: submissionDeleteError } = await supabase
        .from("form_submissions")
        .delete()
        .in("form_id", idsToDelete);
      const { error: formDeleteError } = submissionDeleteError
        ? { error: submissionDeleteError }
        : await supabase.from("forms").delete().in("id", idsToDelete);
      if (formDeleteError) {
        console.error("Supabase form deletion failed", formDeleteError);
        return NextResponse.json({ error: "Forms saved, but obsolete forms could not be removed" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, forms: data || formattedForms });
  } catch (error) {
    console.error("Forms update failed", error);
    return NextResponse.json({ error: "Unable to save forms" }, { status: 500 });
  }
}
