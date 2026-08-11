import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";

const EVENTS_COLUMNS = "id,title,description,type,label,dateiso,date,month,time,place,stat,featured,ispast,bgimage,registrationlink,registrationdeadline";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("events")
      .select(EVENTS_COLUMNS);

    if (error || !data) {
      return NextResponse.json([], {
        headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" },
      });
    }

    const normalized = data
      .map((item: any) => {
        let dateVal = item.date || "";
        let monthVal = item.month || "";
        if (dateVal === "SOON" || (dateVal === "SOON" && monthVal === "COMING")) {
          dateVal = "COMING";
          monthVal = "SOON";
        }
        return {
          id: item.id,
          title: item.title || "",
          description: item.description || "",
          type: item.type || item.label || "",
          label: item.label || item.type || "",
          dateISO: item.dateiso || item.dateISO || "",
          date: dateVal,
          month: monthVal,
          time: item.time || "",
          place: item.place || "",
          stat: item.stat || "",
          featured: Boolean(item.featured),
          isPast: item.ispast !== undefined ? Boolean(item.ispast) : Boolean(item.isPast),
          bgImage: item.bgimage || item.bgImage || "",
          registrationLink: item.registrationlink || item.registrationLink || "",
          registrationDeadline: item.registrationdeadline || item.registrationDeadline || "",
        };
      })
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

    const formattedEvents = rawEvents.map((e: any) => {
      let dateVal = e.date || "";
      let monthVal = e.month || "";
      if (dateVal === "SOON") {
        dateVal = "COMING";
        monthVal = "SOON";
      }
      return {
        id: e.id,
        dateiso: e.dateISO || e.dateiso || "",
        date: dateVal,
        month: monthVal,
        title: e.title || "",
        type: e.type || "",
        label: e.label || "",
        time: e.time || "",
        place: e.place || "",
        description: e.description || "",
        stat: e.stat || "",
        featured: Boolean(e.featured),
        ispast: Boolean(e.isPast ?? e.ispast),
        registrationlink: e.registrationLink || e.registrationlink || "",
        registrationdeadline: e.registrationDeadline || e.registrationdeadline || "",
      };
    });

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
