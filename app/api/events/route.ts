import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";

const EVENTS_COLUMNS = "id,title,description,type,label,dateISO,date,month,time,place,stat,featured,isPast,bgImage,registrationLink,registrationDeadline";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("events")
      .select(EVENTS_COLUMNS);

    if (error || !data?.length) {
      return NextResponse.json([], {
        headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" },
      });
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
        featured: Boolean(item.featured),
        isPast: item.isPast !== undefined ? Boolean(item.isPast) : Boolean(item.ispast),
        bgImage: item.bgImage || item.bgimage || "",
        registrationLink: item.registrationLink || item.registrationlink || "",
        registrationDeadline: item.registrationDeadline || item.registrationdeadline || "",
      }))
      .sort((a: any, b: any) => {
        if (!a.dateISO) return 1;
        if (!b.dateISO) return -1;
        return new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime();
      });

    return NextResponse.json(normalized, {
      headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" },
    });
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    const rawEvents = await req.json();
    if (!Array.isArray(rawEvents)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Upsert first: a failed write must never erase existing data.
    const validIds = new Set(rawEvents.map((e: any) => e.id).filter(Boolean));
    const { data: existingDbEvents } = await supabase
      .from("events")
      .select("id");

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
      registrationDeadline: e.registrationDeadline || e.registrationdeadline || "",
    }));

    const { error } = await supabase
      .from("events")
      .upsert(formattedEvents, { onConflict: "id" });

    if (error) {
      console.error("Supabase event sync failed", error);
      return NextResponse.json({ error: "Unable to save events" }, { status: 500 });
    }

    const idsToDelete = (existingDbEvents || [])
      .map((e: any) => e.id)
      .filter((id: string) => !validIds.has(id));
    if (idsToDelete.length) {
      const { error: deleteError } = await supabase.from("events").delete().in("id", idsToDelete);
      if (deleteError) {
        console.error("Supabase event deletion failed", deleteError);
        return NextResponse.json({ error: "Events saved, but obsolete events could not be removed" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, count: formattedEvents.length });
  } catch (error) {
    console.error("Events update failed", error);
    return NextResponse.json({ error: "Unable to save events" }, { status: 500 });
  }
}
