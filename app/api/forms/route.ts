import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyToken } from "@/lib/admin-auth";
import formsFallback from "@/data/forms.json";
import fs from "fs";
import path from "path";

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
        (f) => f.slug === slug || f.id === slug,
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
        { status: 401 },
      );
    }

    const rawForms = await req.json();
    if (!Array.isArray(rawForms)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const formattedForms = rawForms.map((f: any) => ({
      id:
        f.id || `form-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
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

    saveLocalForms(formattedForms);

    const validIds = new Set(
      formattedForms.map((f: any) => f.id).filter(Boolean),
    );
    const { data: existingDbForms } = await supabase.from("forms").select("id");
    if (existingDbForms && existingDbForms.length > 0) {
      const idsToDelete = existingDbForms
        .map((f: any) => f.id)
        .filter((id: string) => !validIds.has(id));

      if (idsToDelete.length > 0) {
        const { error: subDelErr } = await supabase
          .from("form_submissions")
          .delete()
          .in("form_id", idsToDelete);
        if (subDelErr) {
          console.warn(
            "Failed to delete associated form submissions from Supabase:",
            subDelErr,
          );
        }

        const { error: delErr } = await supabase
          .from("forms")
          .delete()
          .in("id", idsToDelete);
        if (delErr) {
          console.warn("Failed to delete removed forms from Supabase:", delErr);
        }
      }
    }

    if (formattedForms.length === 0) {
      return NextResponse.json({ success: true, forms: [] });
    }

    const preparePayload = (
      useLowercase = false,
      omitEventId = false,
      omitWhatsapp = false,
    ) => {
      return rawForms.map((f: any) => {
        const item: any = {
          id:
            f.id ||
            `form-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          slug: (f.slug || f.title || "form")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, ""),
          title: f.title || "Untitled Form",
          description: f.description || "",
          fields: Array.isArray(f.fields) ? f.fields : [],
        };

        if (useLowercase) {
          item.isactive =
            f.is_active !== undefined ? Boolean(f.is_active) : true;
          if (!omitEventId && (f.event_id || f.eventId))
            item.eventid = f.event_id || f.eventId;
          if (!omitWhatsapp && (f.whatsapp_link || f.whatsappLink))
            item.whatsapplink = f.whatsapp_link || f.whatsappLink;
        } else {
          item.is_active =
            f.is_active !== undefined ? Boolean(f.is_active) : true;
          if (!omitEventId && (f.event_id || f.eventId))
            item.event_id = f.event_id || f.eventId;
          if (!omitWhatsapp && (f.whatsapp_link || f.whatsappLink))
            item.whatsapp_link = f.whatsapp_link || f.whatsappLink;
        }

        return item;
      });
    };

    let payload = preparePayload(false, false, false);
    let { data, error } = await supabase
      .from("forms")
      .upsert(payload, { onConflict: "id" })
      .select();

    if (
      error &&
      (error.code === "PGRST204" || error.message.includes("column")) &&
      error.message.includes("event")
    ) {
      console.warn(
        "Retrying Supabase forms upsert without event_id column...",
        error.message,
      );
      payload = preparePayload(false, true, false);
      const retry = await supabase
        .from("forms")
        .upsert(payload, { onConflict: "id" })
        .select();
      data = retry.data;
      error = retry.error;
    }

    if (
      error &&
      (error.code === "PGRST204" || error.message.includes("column")) &&
      error.message.includes("whatsapp")
    ) {
      console.warn(
        "Retrying Supabase forms upsert without whatsapp_link column...",
        error.message,
      );
      payload = preparePayload(false, true, true);
      const retry = await supabase
        .from("forms")
        .upsert(payload, { onConflict: "id" })
        .select();
      data = retry.data;
      error = retry.error;
    }

    if (
      error &&
      (error.code === "PGRST204" ||
        error.message.includes("column") ||
        error.code === "42703")
    ) {
      console.warn(
        "Retrying Supabase forms upsert with lowercased column names...",
        error.message,
      );
      payload = preparePayload(true, false, false);
      let retry = await supabase
        .from("forms")
        .upsert(payload, { onConflict: "id" })
        .select();

      if (retry.error && retry.error.message.includes("event")) {
        payload = preparePayload(true, true, false);
        retry = await supabase
          .from("forms")
          .upsert(payload, { onConflict: "id" })
          .select();
      }

      if (retry.error && retry.error.message.includes("whatsapp")) {
        payload = preparePayload(true, true, true);
        retry = await supabase
          .from("forms")
          .upsert(payload, { onConflict: "id" })
          .select();
      }

      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error("Supabase forms upsert error:", error);
      return NextResponse.json(
        {
          error: `Supabase Sync Error: ${error.message} (${error.code || "unknown"})`,
          details: error,
          forms: payload,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, forms: data || payload });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server Error" },
      { status: 500 },
    );
  }
}
