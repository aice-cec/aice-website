import { NextResponse, after } from "next/server";
import crypto from "crypto";
import { supabase } from "@/lib/supabase";
import { sendTicketEmail } from "@/lib/email";
import { getLocalForms } from "@/lib/forms";
import { validateResponses } from "@/lib/form-validation";
import { dispatchTaskUploadsToGoogleDrive } from "@/lib/google-drive";

const FORM_COLUMNS =
  "id,slug,title,fields,is_active,issue_ticket,whatsapp_link,event_id";

function getPublicTicketImageUrl(req: Request, ticketCode: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(ticketCode)}`;
}

export async function POST(req: Request) {
  try {
    const { formId, eventId, responses } = await req.json();

    if (!formId || !responses) {
      return NextResponse.json(
        { error: "Invalid form submission payload" },
        { status: 400 },
      );
    }

    let formObj: any = null;
    const { data: dbForm } = await supabase
      .from("forms")
      .select(FORM_COLUMNS)
      .or(`id.eq.${formId},slug.eq.${formId}`)
      .single();

    const localForm = getLocalForms().find((f) => f.id === formId || f.slug === formId);
    formObj = dbForm || localForm;

    if (!formObj) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Merge any newly added local fields (e.g. field_design_link) into formObj.fields if loading from DB snapshot
    if (formObj && localForm?.fields && Array.isArray(formObj.fields)) {
      const existingIds = new Set(formObj.fields.map((f: any) => f.id));
      for (const lf of localForm.fields) {
        if (!existingIds.has(lf.id)) {
          formObj.fields.push(lf);
        }
      }
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

    const issueTicket = formObj.issue_ticket !== false;
    const ticketCode = issueTicket
      ? `AICE-${crypto.randomBytes(6).toString("hex").toUpperCase()}`
      : null;
    const createdAt = new Date().toISOString();
    const ticketImageUrl = ticketCode
      ? getPublicTicketImageUrl(req, ticketCode)
      : null;

    const { error: insertError } = await supabase
      .from("form_submissions")
      .insert([
        {
          form_id: formId,
          event_id: formObj.event_id || null,
          responses: ticketCode
            ? {
                ...validation.responses,
                __ticket: { code: ticketCode, issuedAt: createdAt },
              }
            : validation.responses,
        },
      ]);
    if (insertError) {
      console.error("Unable to save form submission", insertError);
      return NextResponse.json(
        { error: "Unable to save your registration. Please try again." },
        { status: 503 },
      );
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
        if (
          !attendeeName &&
          (label.includes("name") || label.includes("participant"))
        ) {
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

    // Dispatch Google Drive uploads in the background if Google Apps Script is configured
    after(async () => {
      try {
        await dispatchTaskUploadsToGoogleDrive(
          attendeeName || "Applicant",
          toEmail || "n/a",
          validation.responses,
        );
      } catch (err) {
        console.error("Background Drive upload failed:", err);
      }
    });

    // Send ticket email after response is returned
    if (ticketCode && ticketImageUrl && toEmail) {
      after(async () => {
        await sendTicketEmail({
          toEmail,
          attendeeName: attendeeName || "Participant",
          eventTitle: formObj?.title || "AICE Event",
          ticketId: ticketCode,
          submittedAt: createdAt,
          ticketImageUrl,
          whatsappLink: formObj?.whatsapp_link || "",
        });
      });
    }

    return NextResponse.json({
      success: true,
      message: "Registration submitted successfully!",
      ...(ticketCode ? { ticketCode } : {}),
    });
  } catch (error) {
    console.error("Form submission failed", error);
    return NextResponse.json(
      { error: "Failed to submit form" },
      { status: 500 },
    );
  }
}
