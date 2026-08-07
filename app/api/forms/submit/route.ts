import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendTicketEmail } from "@/lib/email";
import formsFallback from "@/data/forms.json";
import fs from "fs";
import path from "path";

// Fallback in-memory store for submissions if Supabase table is not created yet
let submissionsFallbackStore: any[] = [];

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

export async function POST(req: Request) {
  try {
    const { formId, eventId, responses } = await req.json();

    if (!formId || !responses) {
      return NextResponse.json(
        { error: "Invalid form submission payload" },
        { status: 400 }
      );
    }

    // Query form details from Supabase OR local fallback file
    let formObj: any = null;
    try {
      const { data: dbForm } = await supabase
        .from("forms")
        .select("*")
        .or(`id.eq.${formId},slug.eq.${formId}`)
        .single();
      if (dbForm) formObj = dbForm;
    } catch (e) {}

    if (!formObj) {
      const localForms = getLocalForms();
      formObj = localForms.find(
        (f) => f.id === formId || f.slug === formId
      );
    }

    if (formObj && formObj.is_active === false) {
      return NextResponse.json(
        { error: "Registrations for this event are currently closed." },
        { status: 403 }
      );
    }

    const ticketCode = `AICE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const newSubmission = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      form_id: formId,
      event_id: eventId || null,
      responses: responses,
      ticket_code: ticketCode,
      created_at: new Date().toISOString(),
    };

    submissionsFallbackStore.push(newSubmission);

    // Try inserting into Supabase
    const { data, error } = await supabase
      .from("form_submissions")
      .insert([
        {
          form_id: formId,
          event_id: eventId || null,
          responses: responses,
        },
      ])
      .select();

    if (error) {
      console.warn(
        "Supabase form_submissions insert warning (falling back to memory):",
        error
      );
    }

    // Extract email and attendee name from responses
    let toEmail = "";
    let attendeeName = "";

    if (formObj && Array.isArray(formObj.fields)) {
      for (const f of formObj.fields) {
        const val = responses[f.id];
        if (!val || typeof val !== "string") continue;

        if (f.type === "email" || f.label.toLowerCase().includes("email")) {
          toEmail = val;
        }
        if (
          f.label.toLowerCase().includes("name") ||
          f.label.toLowerCase().includes("full name") ||
          f.label.toLowerCase().includes("participant")
        ) {
          attendeeName = val;
        }
      }
    }

    // Fallback search for email and name in responses if not matched above
    if (!toEmail) {
      const keys = Object.keys(responses);
      for (const k of keys) {
        const val = responses[k];
        if (typeof val === "string" && val.includes("@")) {
          toEmail = val;
          break;
        }
      }
    }

    if (!attendeeName) {
      const keys = Object.keys(responses);
      for (const k of keys) {
        const val = responses[k];
        if (
          typeof val === "string" &&
          !val.includes("@") &&
          !val.startsWith("data:") &&
          !val.startsWith("http") &&
          val.length > 1 &&
          val.length < 50
        ) {
          attendeeName = val;
          break;
        }
      }
    }

    // Attempt to send email ticket asynchronously
    if (toEmail) {
      sendTicketEmail({
        toEmail,
        attendeeName: attendeeName || "Participant",
        eventTitle: formObj?.title || "AICE Event",
        ticketId: ticketCode,
        submittedAt: newSubmission.created_at,
        whatsappLink: formObj?.whatsapp_link || "",
      }).catch((err) => console.warn("Background email error:", err));
    }

    return NextResponse.json({
      success: true,
      message: "Registration submitted successfully!",
      id: newSubmission.id,
      ticketCode,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to submit form" },
      { status: 500 }
    );
  }
}
