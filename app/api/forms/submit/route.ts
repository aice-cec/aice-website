import { NextResponse, after } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendTicketEmail } from "@/lib/email";
import { getLocalForms } from "@/lib/forms";
import {
  FormDefinition,
  isRecord,
  validateResponses,
} from "@/lib/form-validation";
import crypto from "crypto";

const FORM_COLUMNS = "id,slug,title,fields,is_active,whatsapp_link";

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    if (!isRecord(body)) {
      return NextResponse.json({ error: "Invalid form submission payload" }, { status: 400 });
    }
    const { formId, responses } = body;

    if (typeof formId !== "string" || !formId.trim() || formId.length > 100) {
      return NextResponse.json(
        { error: "Invalid form submission payload" },
        { status: 400 },
      );
    }

    // Query form details from Supabase, fallback to local JSON
    let formObj: FormDefinition | null = null;
    const { data: dbForm } = await supabase
      .from("forms")
      .select(FORM_COLUMNS)
      .or(`id.eq.${formId.trim()},slug.eq.${formId.trim()}`)
      .single();

    formObj = (dbForm as FormDefinition | null) ||
      (getLocalForms().find((f) => f.id === formId || f.slug === formId) as FormDefinition | undefined) ||
      null;

    if (!formObj) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    if (formObj?.is_active === false) {
      return NextResponse.json(
        { error: "Registrations for this event are currently closed." },
        { status: 403 },
      );
    }

    const validation = validateResponses(formObj.fields, responses);
    if ("error" in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const ticketCode = `AICE-${crypto.randomUUID().replace(/-/g, "").toUpperCase()}`;
    const createdAt = new Date().toISOString();

    const { error: insertError } = await supabase.from("form_submissions").insert([{
      form_id: formId,
      event_id: formObj.event_id || null,
      responses: { ...validation.responses, __ticket: { code: ticketCode, issuedAt: createdAt } },
    }]);
    if (insertError) {
      console.error("Unable to save form submission", insertError);
      return NextResponse.json({ error: "Unable to save your registration. Please try again." }, { status: 503 });
    }

    // Extract email and attendee name from responses
    let toEmail = "";
    let attendeeName = "";

    if (Array.isArray(formObj.fields)) {
      for (const f of formObj.fields) {
        const val = validation.responses[f.id];
        if (!val || typeof val !== "string") continue;
        const label = f.label.toLowerCase();

        if (!toEmail && (f.type === "email" || label.includes("email"))) {
          toEmail = val;
        }
        if (!attendeeName && (label.includes("name") || label.includes("participant"))) {
          attendeeName = val;
        }
      }
    }

    // Fallback: scan raw response values
    if (!toEmail || !attendeeName) {
      for (const val of Object.values(validation.responses)) {
        if (typeof val !== "string") continue;
        if (!toEmail && val.includes("@")) {
          toEmail = val;
        } else if (
          !attendeeName &&
          !val.includes("@") &&
          !val.startsWith("data:") &&
          !val.startsWith("http") &&
          val.length > 1 &&
          val.length < 50
        ) {
          attendeeName = val;
        }
        if (toEmail && attendeeName) break;
      }
    }

    // Send ticket email after response is returned
    if (toEmail) {
      after(async () => {
        await sendTicketEmail({
          toEmail,
          attendeeName: attendeeName || "Participant",
          eventTitle: formObj?.title || "AICE Event",
          ticketId: ticketCode,
          submittedAt: createdAt,
          whatsappLink: formObj?.whatsapp_link || "",
        });
      });
    }

    return NextResponse.json({
      success: true,
      message: "Registration submitted successfully!",
      ticketCode,
    });
  } catch (error) {
    console.error("Form submission failed", error);
    return NextResponse.json({ error: "Failed to submit form" }, { status: 500 });
  }
}
