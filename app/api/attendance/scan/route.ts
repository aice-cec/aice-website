import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getVolunteerSession } from "@/lib/volunteer-auth";

const TICKET_PATTERN = /^AICE-[A-F0-9]{12}$/;

/** POST: Record attendance for a scanned ticket */
export async function POST(req: Request) {
  const session = getVolunteerSession(req);
  if (!session.authenticated || !session.volunteer) {
    return NextResponse.json(
      { error: "Unauthorized. Please log in." },
      { status: 401 },
    );
  }

  try {
    const { ticketCode, eventId } = await req.json();

    if (!ticketCode || typeof ticketCode !== "string") {
      return NextResponse.json(
        { error: "Invalid ticket code" },
        { status: 400 },
      );
    }

    const normalised = ticketCode.trim().toUpperCase();
    if (!TICKET_PATTERN.test(normalised)) {
      return NextResponse.json(
        { error: "Invalid ticket format. Expected: AICE-XXXXXXXXXXXX" },
        { status: 400 },
      );
    }

    if (!eventId || typeof eventId !== "string") {
      return NextResponse.json(
        { error: "Please select an event" },
        { status: 400 },
      );
    }

    // Look up the form submission containing this ticket
    const { data: submissions, error: fetchError } = await supabase
      .from("form_submissions")
      .select("id, form_id, event_id, responses, created_at")
      .or(`event_id.eq.${eventId},form_id.eq.${eventId}`);

    if (fetchError) {
      console.error("Supabase query error:", fetchError);
      return NextResponse.json(
        { error: "Database error while looking up ticket" },
        { status: 500 },
      );
    }

    // Find the submission whose responses.__ticket.code matches
    const matchingSubmission = (submissions || []).find((s: any) => {
      const ticket = s.responses?.__ticket;
      return ticket?.code?.toUpperCase() === normalised;
    });

    if (!matchingSubmission) {
      return NextResponse.json(
        { error: "Ticket not found for the selected event. Please check the ticket code and event." },
        { status: 404 },
      );
    }

    // Extract attendee info from submission
    let attendeeName = "";
    let attendeeEmail = "";
    const responses = matchingSubmission.responses || {};
    for (const [key, value] of Object.entries(responses)) {
      if (key.startsWith("__")) continue;
      if (typeof value !== "string") continue;
      if (!attendeeEmail && value.includes("@") && value.includes(".")) {
        attendeeEmail = value;
      } else if (
        !attendeeName &&
        !value.includes("@") &&
        !value.startsWith("data:") &&
        !value.startsWith("http") &&
        value.length > 1 &&
        value.length < 60
      ) {
        attendeeName = value;
      }
    }

    // Check for duplicate attendance
    const { data: existing } = await supabase
      .from("attendance_records")
      .select("id, checked_in_at")
      .eq("ticket_code", normalised)
      .eq("event_id", eventId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        {
          error: "Already checked in",
          duplicate: true,
          attendeeName,
          attendeeEmail,
          checkedInAt: existing.checked_in_at,
        },
        { status: 409 },
      );
    }

    // Insert attendance record
    const { error: insertError } = await supabase
      .from("attendance_records")
      .insert([
        {
          ticket_code: normalised,
          event_id: eventId,
          form_submission_id: matchingSubmission.id,
          attendee_name: attendeeName || "Unknown",
          attendee_email: attendeeEmail || "",
          checked_in_by: session.volunteer.name,
          checked_in_at: new Date().toISOString(),
        },
      ]);

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to record attendance. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      attendeeName: attendeeName || "Unknown",
      attendeeEmail: attendeeEmail || "",
      ticketCode: normalised,
    });
  } catch (error) {
    console.error("Attendance scan error:", error);
    return NextResponse.json(
      { error: "Failed to process scan" },
      { status: 500 },
    );
  }
}
