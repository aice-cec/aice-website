import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getVolunteerSession } from "@/lib/volunteer-auth";

/** GET: Fetch attendance records for a given event */
export async function GET(req: Request) {
  const session = getVolunteerSession(req);
  if (!session.authenticated || !session.volunteer) {
    return NextResponse.json(
      { error: "Unauthorized. Please log in." },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");

  if (!eventId) {
    return NextResponse.json(
      { error: "Event ID is required" },
      { status: 400 },
    );
  }

  try {
    const { data: records, error } = await supabase
      .from("attendance_records")
      .select(
        "id, ticket_code, event_id, attendee_name, attendee_email, checked_in_by, checked_in_at",
      )
      .eq("event_id", eventId)
      .order("checked_in_at", { ascending: false });

    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch attendance records" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      records: records || [],
      total: (records || []).length,
    });
  } catch (error) {
    console.error("Records fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch records" },
      { status: 500 },
    );
  }
}
