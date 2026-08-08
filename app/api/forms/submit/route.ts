import { NextResponse, after } from "next/server";
import crypto from "crypto";
import { supabase } from "@/lib/supabase";
import { sendTicketEmail } from "@/lib/email";
import { getLocalForms } from "@/lib/forms";
import { validateResponses } from "@/lib/form-validation";

const FORM_COLUMNS = "id,slug,title,fields,is_active,issue_ticket,whatsapp_link,event_id";

function getPublicTicketImageUrl(req: Request, ticketCode: string): string {
  const envUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "");

  if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
    const baseUrl = envUrl.startsWith("http") ? envUrl : `https://${envUrl}`;
    return `${baseUrl}/api/tickets/qr?ticket=${encodeURIComponent(ticketCode)}`;
  }

  const origin = new URL(req.url).origin;
  if (
    origin &&
    !origin.includes("localhost") &&
    !origin.includes("127.0.0.1") &&
    !origin.includes("192.168.")
  ) {
    return `${origin}/api/tickets/qr?ticket=${encodeURIComponent(ticketCode)}`;
  }

  // Fallback to public HTTPS QR service during local testing so email clients (Gmail) can render the image
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

    formObj = dbForm || getLocalForms().find((f) => f.id === formId || f.slug === formId);

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

    const issueTicket = formObj.issue_ticket !== false;
    const ticketCode = issueTicket
      ? `AICE-${crypto.randomBytes(6).toString("hex").toUpperCase()}`
      : null;
    const createdAt = new Date().toISOString();
    const ticketImageUrl = ticketCode ? getPublicTicketImageUrl(req, ticketCode) : null;

    const { error: insertError } = await supabase.from("form_submissions").insert([{
      form_id: formId,
      event_id: formObj.event_id || null,
      responses: ticketCode
        ? { ...validation.responses, __ticket: { code: ticketCode, issuedAt: createdAt } }
        : validation.responses,
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
    return NextResponse.json({ error: "Failed to submit form" }, { status: 500 });
  }
}
