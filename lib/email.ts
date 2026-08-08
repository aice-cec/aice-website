interface SendTicketEmailParams {
  toEmail: string;
  attendeeName: string;
  eventTitle: string;
  ticketId: string;
  submittedAt: string;
  whatsappLink?: string;
}

export async function sendTicketEmail({
  toEmail,
  attendeeName,
  eventTitle,
  ticketId,
  submittedAt,
  whatsappLink,
}: SendTicketEmailParams) {
  const brevoApiKey = (
    process.env.BREVO_API_KEY || process.env.SENDINBLUE_API_KEY || ""
  ).trim();
  const senderEmail =
    process.env.BREVO_SENDER_EMAIL || "aice@ceconline.edu";
  const senderName = process.env.BREVO_SENDER_NAME || "AICE";

  if (!brevoApiKey) {
    console.warn("BREVO_API_KEY is missing in environment variables. Email ticket skipped.");
    return false;
  }

  // Generate QR Code URL containing payload for scanning attendance later
  const qrPayload = JSON.stringify({
    tkt: ticketId,
    event: eventTitle,
    name: attendeeName,
    email: toEmail,
  });

  // Gmail strips data:image/png;base64 URIs, so we use a public HTTPS QR Code URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrPayload)}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>AICE Event Entry Pass</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #070709; color: #f3f4f6; margin: 0; padding: 20px; }
        .card { max-width: 520px; margin: 0 auto; background-color: #121217; border: 2px solid rgba(255,255,255,0.2); padding: 32px; box-shadow: 8px 8px 0px #000000; }
        .brand-title { font-size: 16px; font-weight: 900; color: #ffffff; letter-spacing: 1px; font-family: monospace; }
        .brand-sub { font-size: 11px; font-weight: 800; color: #ef4444; text-transform: uppercase; letter-spacing: 1.5px; font-family: monospace; }
        .pass-badge { display: inline-block; padding: 5px 14px; background-color: #dc2626; border: 2px solid #000000; color: #ffffff; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; font-family: monospace; }
        .event-title { font-size: 26px; font-weight: 900; color: #ffffff; margin: 0 0 6px 0; line-height: 1.2; text-transform: uppercase; letter-spacing: -0.5px; }
        .attendee-name { font-size: 14px; color: #d1d5db; margin: 0 0 24px 0; font-weight: 600; }
        .ticket-box { background-color: #000000; border: 2px dashed rgba(255,255,255,0.25); padding: 24px; text-align: center; margin-bottom: 24px; box-shadow: 4px 4px 0px #000000; }
        .qr-img { width: 180px; height: 180px; margin: 0 auto 16px auto; display: block; background-color: #ffffff; padding: 10px; border: 2px solid #000000; box-shadow: 4px 4px 0px #000000; }
        .ticket-id { font-family: 'Courier New', Courier, monospace; font-size: 22px; font-weight: 900; color: #ef4444; letter-spacing: 2.5px; margin-top: 4px; }
        .btn-wa { display: block; text-align: center; background-color: #059669; color: #ffffff !important; font-weight: 900; font-size: 12px; text-decoration: none; padding: 14px 20px; border: 2px solid #000000; box-shadow: 4px 4px 0px #000000; text-transform: uppercase; letter-spacing: 1px; margin-top: 12px; font-family: monospace; }
        .footer { font-size: 11px; color: #9ca3af; text-align: center; margin-top: 28px; border-top: 2px solid rgba(255,255,255,0.1); padding-top: 16px; font-family: monospace; }
      </style>
    </head>
    <body>
      <div class="card">
        <!-- AICE Branding Header -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px; border-bottom: 2px solid rgba(255,255,255,0.15); padding-bottom: 16px;">
          <tr>
            <td align="left">
              <div class="brand-title">AICE CEC</div>
              <div style="font-size: 10px; color: #9ca3af; font-family: monospace; font-weight: 700;">ARTIFICIAL INTELLIGENCE SOCIETY</div>
            </td>
            <td align="right">
              <div class="brand-sub">OFFICIAL PASS</div>
            </td>
          </tr>
        </table>

        <div class="pass-badge">ENTRY PASS CONFIRMED</div>
        <h1 class="event-title">${eventTitle}</h1>
        <p class="attendee-name">ATTENDEE: <strong style="color: #ffffff; font-size: 15px;">${attendeeName || "Participant"}</strong></p>
        
        <!-- Neo-Brutalist Ticket Container with QR Code -->
        <div class="ticket-box">
          <div style="font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; font-family: monospace; font-weight: 700;">SCAN QR CODE AT DESK FOR ENTRY</div>
          <img src="${qrCodeUrl}" alt="Event Ticket QR Code" class="qr-img" width="180" height="180" />
          <div style="font-size: 11px; color: #9ca3af; text-transform: uppercase; margin-bottom: 4px; font-family: monospace; font-weight: 700;">PASS IDENTIFIER</div>
          <div class="ticket-id">${ticketId}</div>
          <div style="font-size: 11px; color: #6b7280; margin-top: 8px; font-family: monospace;">Issued: ${new Date(submittedAt).toLocaleString()}</div>
        </div>

        ${
          whatsappLink
            ? `
          <div style="background-color: rgba(16,185,129,0.1); border: 2px solid rgba(16,185,129,0.3); padding: 18px; text-align: center; box-shadow: 4px 4px 0px #000000;">
            <div style="font-size: 12px; font-weight: 900; color: #10b981; margin-bottom: 4px; font-family: monospace; text-transform: uppercase; letter-spacing: 1px;">OFFICIAL WHATSAPP GROUP</div>
            <div style="font-size: 12px; color: #d1d5db; margin-bottom: 12px;">Join for live announcements, workshop files, and updates</div>
            <a href="${whatsappLink.startsWith("http") ? whatsappLink : `https://${whatsappLink}`}" class="btn-wa" target="_blank">JOIN WHATSAPP GROUP</a>
          </div>
        `
            : ""
        }

        <div class="footer">
          Please present this QR ticket on your phone during desk check-in.<br/>
          © ${new Date().getFullYear()} AICE CEC. ALL RIGHTS RESERVED.
        </div>
      </div>
    </body>
    </html>
  `;

  // Direct Brevo HTTP REST API Request with retry mechanism
  const maxRetries = 2;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          accept: "application/json",
          "api-key": brevoApiKey,
          "content-type": "application/json",
          "user-agent": "AICE-App/1.0",
          connection: "close",
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: [{ email: toEmail, name: attendeeName || "Participant" }],
          subject: `🎟️ ENTRY PASS: ${eventTitle} (${ticketId})`,
          htmlContent: htmlContent,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        return true;
      }
      const errData = await res.json();
      console.warn(`Brevo API error response (attempt ${attempt}/${maxRetries}):`, errData);
      if (res.status === 401 || res.status === 403) {
        // Invalid API Key - no point retrying
        break;
      }
    } catch (err: any) {
      const isTimeout = err.name === "AbortError" || err.code === "UND_ERR_CONNECT_TIMEOUT";
      console.warn(
        `Brevo API request failed (attempt ${attempt}/${maxRetries}): ${
          isTimeout ? "Connection Timeout (api.brevo.com reachable check needed)" : err.message || err
        }`
      );
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  return false;
}
