import { NextResponse, after } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendTicketEmail } from "@/lib/email";
import { getLocalForms } from "@/lib/forms";

const FORM_COLUMNS = "id,slug,title,fields,is_active,whatsapp_link";

export async function POST(req: Request) {
  try {
    const { formId, eventId, responses } = await req.json();

    if (!formId || !responses) {
      return NextResponse.json(
        { error: "Invalid form submission payload" },
        { status: 400 },
      );
    }

    // Query form details from Supabase, fallback to local JSON
    let formObj: any = null;
    const { data: dbForm } = await supabase
      .from("forms")
      .select(FORM_COLUMNS)
      .or(`id.eq.${formId},slug.eq.${formId}`)
      .single();

    formObj = dbForm || getLocalForms().find((f) => f.id === formId || f.slug === formId);

    if (formObj?.is_active === false) {
      return NextResponse.json(
        { error: "Registrations for this event are currently closed." },
        { status: 403 },
      );
    }

    // Server-side validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^\d{10}$/;

    if (formObj && Array.isArray(formObj.fields)) {
      for (const field of formObj.fields) {
        const val = responses[field.id];
        if (
          field.required &&
          (val === undefined ||
            val === null ||
            val === "" ||
            (Array.isArray(val) && val.length === 0))
        ) {
          return NextResponse.json(
            { error: `Missing required field: ${field.label}` },
            { status: 400 },
          );
        }

        if (val && typeof val === "string") {
          const label = field.label.toLowerCase();
          const isEmailField = field.type === "email" || label.includes("email");
          const isPhoneField = field.type === "phone" || label.includes("phone") || label.includes("whatsapp") || label.includes("mobile");

          if (isEmailField && !emailRegex.test(val.trim())) {
            return NextResponse.json(
              { error: `Invalid email address for ${field.label}` },
              { status: 400 },
            );
          }

          if (isPhoneField && !phoneRegex.test(val.replace(/\D/g, ""))) {
            return NextResponse.json(
              { error: `Phone number must be exactly 10 digits for ${field.label}` },
              { status: 400 },
            );
          }
        }
      }
    }

    const ticketCode = `AICE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const createdAt = new Date().toISOString();

    await supabase.from("form_submissions").insert([{
      form_id: formId,
      event_id: eventId || null,
      responses,
    }]);

    // Extract email and attendee name from responses
    let toEmail = "";
    let attendeeName = "";

    if (formObj && Array.isArray(formObj.fields)) {
      for (const f of formObj.fields) {
        const val = responses[f.id];
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
      for (const val of Object.values(responses)) {
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
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to submit form" },
      { status: 500 },
    );
  }
}
