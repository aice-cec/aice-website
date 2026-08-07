import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import eventsFallback from "@/data/events.json";

export async function GET() {
  try {
    const { data, error } = await supabase.from("events").select("*");

    if (error) {
      console.error("Supabase GET error:", error);
      return NextResponse.json(eventsFallback);
    }

    if (!data || data.length === 0) {
      return NextResponse.json(eventsFallback);
    }

    const normalized = data
      .map((item: any) => ({
        id: item.id,
        title: item.title || "",
        description: item.description || "",
        type: item.type || item.label || "",
        label: item.label || item.type || "",
        dateISO: item.dateISO || item.dateiso || "",
        date: item.date || "",
        month: item.month || "",
        time: item.time || "",
        place: item.place || "",
        stat: item.stat || "",
        featured: item.featured !== undefined ? Boolean(item.featured) : false,
        isPast:
          item.isPast !== undefined
            ? Boolean(item.isPast)
            : Boolean(item.ispast),
        bgImage: item.bgImage || item.bgimage || "",
        registrationLink: item.registrationLink || item.registrationlink || "",
        registrationDeadline:
          item.registrationDeadline || item.registrationdeadline || "",
      }))
      .sort((a: any, b: any) => {
        if (!a.dateISO) return 1;
        if (!b.dateISO) return -1;
        return new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime();
      });

    return NextResponse.json(normalized);
  } catch (err) {
    console.error("GET events route error:", err);
    return NextResponse.json(eventsFallback);
  }
}

import { verifyToken } from "../admin/login/route";

export async function POST(req: Request) {
  try {
    const token = req.headers.get("x-admin-token");
    if (!verifyToken(token)) {
      return NextResponse.json(
        { error: "Unauthorized or Session Expired" },
        { status: 401 },
      );
    }

    const rawEvents = await req.json();
    if (!Array.isArray(rawEvents)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const validIds = new Set(rawEvents.map((e: any) => e.id).filter(Boolean));
    const { data: existingDbEvents } = await supabase
      .from("events")
      .select("id");
    if (existingDbEvents && existingDbEvents.length > 0) {
      const idsToDelete = existingDbEvents
        .map((e: any) => e.id)
        .filter((id: string) => !validIds.has(id));

      if (idsToDelete.length > 0) {
        const { error: delErr } = await supabase
          .from("events")
          .delete()
          .in("id", idsToDelete);
        if (delErr) {
          console.warn(
            "Failed to delete removed events from Supabase:",
            delErr,
          );
        }
      }
    }

    const formattedEvents = rawEvents.map((e: any) => ({
      id: e.id,
      dateISO: e.dateISO || e.dateiso || "",
      date: e.date || "",
      month: e.month || "",
      title: e.title || "",
      type: e.type || "",
      label: e.label || "",
      time: e.time || "",
      place: e.place || "",
      description: e.description || "",
      stat: e.stat || "",
      featured: Boolean(e.featured),
      isPast: Boolean(e.isPast),
      registrationLink: e.registrationLink || e.registrationlink || "",
      registrationlink: e.registrationLink || e.registrationlink || "",
      registrationDeadline:
        e.registrationDeadline || e.registrationdeadline || "",
      registrationdeadline:
        e.registrationDeadline || e.registrationdeadline || "",
    }));

    let { data, error } = await supabase
      .from("events")
      .upsert(formattedEvents, { onConflict: "id" })
      .select();

    if (
      error &&
      (error.code === "PGRST204" || error.message.includes("column"))
    ) {
      console.warn("Retrying Supabase upsert with lowercased column names...");
      const lowercasedEvents = rawEvents.map((e: any) => ({
        id: e.id,
        dateiso: e.dateISO || e.dateiso || "",
        date: e.date || "",
        month: e.month || "",
        title: e.title || "",
        type: e.type || "",
        label: e.label || "",
        time: e.time || "",
        place: e.place || "",
        description: e.description || "",
        stat: e.stat || "",
        featured: Boolean(e.featured),
        ispast: Boolean(e.isPast || e.ispast),
        registrationlink: e.registrationLink || e.registrationlink || "",
        registrationdeadline:
          e.registrationDeadline || e.registrationdeadline || "",
      }));

      const retry = await supabase
        .from("events")
        .upsert(lowercasedEvents, { onConflict: "id" })
        .select();

      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error("Supabase upsert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: data ? data.length : rawEvents.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update events" },
      { status: 500 },
    );
  }
}
