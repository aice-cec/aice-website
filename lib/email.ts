import "server-only";

interface SendTicketEmailParams {
  toEmail: string;
  attendeeName: string;
  eventTitle: string;
  ticketId: string;
  submittedAt: string;
  ticketImageUrl: string;
  whatsappLink?: string;
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character] ?? character,
  );
}

function getSafeExternalUrl(value?: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export async function sendTicketEmail({
  toEmail,
  attendeeName,
  eventTitle,
  ticketId,
  submittedAt,
  ticketImageUrl,
  whatsappLink,
}: SendTicketEmailParams) {
  const brevoApiKey = (process.env.BREVO_API_KEY || "").trim();
  const senderEmail = process.env.BREVO_SENDER_EMAIL || "aice@ceconline.edu";
  const senderName = process.env.BREVO_SENDER_NAME || "AICE";

  if (!brevoApiKey) return false;

  const safeEventTitle = escapeHtml(eventTitle);
  const safeAttendeeName = escapeHtml(attendeeName || "Participant");
  const safeTicketId = escapeHtml(ticketId);
  const safeWhatsappLink = getSafeExternalUrl(whatsappLink);
  const safeTicketImageUrl =
    getSafeExternalUrl(ticketImageUrl) || ticketImageUrl;
  const issuedAt = escapeHtml(
    new Date(submittedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
  );

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
        .attendee-name { font-size: 14px; color: #d1d5db; margin: 0 0 24px 0; font-weight: 600; overflow-wrap: anywhere; word-break: break-word; }
        .ticket-box { background-color: #000000; border: 2px dashed rgba(255,255,255,0.25); padding: 24px; text-align: center; margin-bottom: 24px; box-shadow: 4px 4px 0px #000000; }
        .qr-img { width: 180px; height: 180px; margin: 0 auto 16px auto; display: block; background-color: #ffffff; padding: 10px; border: 2px solid #000000; box-shadow: 4px 4px 0px #000000; }
        .ticket-id { font-family: 'Courier New', Courier, monospace; font-size: 22px; font-weight: 900; color: #ef4444; letter-spacing: 2.5px; margin-top: 4px; }
        .btn-wa { display: block; text-align: center; background-color: #059669; color: #ffffff !important; font-weight: 900; font-size: 12px; text-decoration: none; padding: 14px 20px; border: 2px solid #000000; box-shadow: 4px 4px 0px #000000; text-transform: uppercase; letter-spacing: 1px; margin-top: 12px; font-family: monospace; }
        .footer { font-size: 11px; color: #9ca3af; text-align: center; margin-top: 28px; border-top: 2px solid rgba(255,255,255,0.1); padding-top: 16px; font-family: monospace; }
      </style>
    </head>
    <body>
      <div class="card">
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
        <h1 class="event-title">${safeEventTitle}</h1>
        <p class="attendee-name">ATTENDEE: <strong style="color: #ffffff; font-size: 15px;">${safeAttendeeName}</strong></p>

        <div class="ticket-box">
          <div style="font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; font-family: monospace; font-weight: 700;">SCAN QR CODE AT DESK FOR ENTRY</div>
          <img src="${safeTicketImageUrl}" alt="Event Ticket QR Code" class="qr-img" width="180" height="180" style="width: 180px; height: 180px; margin: 0 auto 16px auto; display: block; background-color: #ffffff; padding: 10px; border: 2px solid #000000; box-shadow: 4px 4px 0px #000000;" />
          <div style="font-size: 11px; color: #9ca3af; text-transform: uppercase; margin-bottom: 4px; font-family: monospace; font-weight: 700;">PASS IDENTIFIER</div>
          <div class="ticket-id">${safeTicketId}</div>
          <div style="font-size: 11px; color: #6b7280; margin-top: 8px; font-family: monospace;">Issued: ${issuedAt}</div>
        </div>

        ${
          safeWhatsappLink
            ? `
          <div style="background-color: rgba(16,185,129,0.1); border: 2px solid rgba(16,185,129,0.3); padding: 18px; text-align: center; box-shadow: 4px 4px 0px #000000;">
            <div style="font-size: 12px; font-weight: 900; color: #10b981; margin-bottom: 4px; font-family: monospace; text-transform: uppercase; letter-spacing: 1px;">OFFICIAL WHATSAPP GROUP</div>
            <div style="font-size: 12px; color: #d1d5db; margin-bottom: 12px;">Join for live announcements, workshop files, and updates</div>
            <a href="${escapeHtml(safeWhatsappLink)}" class="btn-wa" target="_blank" rel="noopener noreferrer">JOIN WHATSAPP GROUP</a>
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

  const payload = JSON.stringify({
    sender: { name: senderName, email: senderEmail },
    to: [{ email: toEmail, name: attendeeName || "Participant" }],
    subject: `🎟️ ENTRY PASS: ${eventTitle}`,
    htmlContent,
  });

  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          accept: "application/json",
          "api-key": brevoApiKey,
          "content-type": "application/json",
        },
        body: payload,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) return true;
      if (res.status === 401 || res.status === 403) break;
    } catch {
      // Retry on network/timeout/socket errors
    }

    if (attempt < maxRetries) {
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
    }
  }

  return false;
}

export interface SendMembershipApprovedParams {
  toEmail: string;
  memberName: string;
  membershipId: string;
  branch: string;
  year: string;
  college?: string;
  verificationUrl?: string;
}

export async function sendMembershipApprovedEmail({
  toEmail,
  memberName,
  membershipId,
  branch,
  year,
  college = "College of Engineering Chengannur",
  verificationUrl,
}: SendMembershipApprovedParams) {
  const brevoApiKey = (process.env.BREVO_API_KEY || "").trim();
  const senderEmail = process.env.BREVO_SENDER_EMAIL || "aice@ceconline.edu";
  const senderName = process.env.BREVO_SENDER_NAME || "AICE CEC";

  if (!brevoApiKey) return false;

  const safeMemberName = escapeHtml(memberName || "AICE Member");
  const safeMembershipId = escapeHtml(membershipId);
  const safeBranch = escapeHtml(branch);
  const safeYear = escapeHtml(year);
  const safeCollege = escapeHtml(college);
  const verifyLink =
    verificationUrl ||
    `https://aice.ceconline.edu/membership/status?id=${encodeURIComponent(membershipId)}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(verifyLink)}`;
  const issuedDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const validTillDate = (() => {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    return nextYear.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  })();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Official AICE Membership Card</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #070709; color: #f3f4f6; margin: 0; padding: 12px; }
        .wrapper { max-width: 520px; margin: 0 auto; width: 100%; }
        .card { background-color: #000000; border: 1px solid rgba(255,255,255,0.3); border-radius: 12px; padding: 22px 18px 16px 18px; color: #ffffff; box-shadow: 0 10px 30px rgba(0,0,0,0.85); box-sizing: border-box; }
        .btn-verify { display: block; text-align: center; background-color: #ef4444; color: #ffffff !important; font-weight: 800; font-size: 13px; text-decoration: none; padding: 14px 20px; border-radius: 8px; text-transform: uppercase; letter-spacing: 1px; margin-top: 20px; }
        .footer { font-size: 11px; color: #6b7280; text-align: center; margin-top: 22px; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.1); }
        @media only screen and (max-width: 480px) {
          .card { padding: 16px 12px 14px 12px !important; }
          .mem-name { font-size: 14px !important; }
          .mem-id { font-size: 11.5px !important; }
          .qr-img { width: 95px !important; height: 95px !important; }
          .divider-line { height: 95px !important; }
          .brand-ice { font-size: 20px !important; }
          .brand-full { font-size: 9.5px !important; }
          .tagline-text { font-size: 11px !important; }
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div style="text-align: center; margin-bottom: 18px; padding-top: 6px;">
          <div style="font-size: 11px; font-weight: 800; color: #10b981; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 4px;">MEMBERSHIP ACTIVATED</div>
          <h1 style="font-size: 20px; font-weight: 900; color: #ffffff; margin: 0 0 4px 0; text-transform: uppercase;">WELCOME TO AICE</h1>
          <p style="font-size: 13px; color: #9ca3af; margin: 0;">Your annual membership pass is confirmed and active.</p>
        </div>

        <!-- EXACT BLACK MEMBERSHIP CARD -->
        <div class="card">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="table-layout: fixed;">
            <!-- TOP ROW -->
            <tr>
              <td align="left" style="vertical-align: top; width: 50%; padding-right: 4px;">
                <div style="font-size: 10px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">MEMBER NAME:</div>
                <div class="mem-name" style="font-size: 15px; font-weight: 900; color: #ffffff; text-transform: uppercase; letter-spacing: 0.3px; line-height: 1.2; word-break: break-word;">${safeMemberName}</div>
                <div style="font-size: 12px; font-weight: 600; color: #e5e7eb; margin-top: 2px;">${safeYear}-${safeBranch}</div>
              </td>
              <td align="right" style="vertical-align: top; width: 50%; padding-left: 4px;">
                <div style="font-size: 10px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">MEMBERSHIP ID:</div>
                <div class="mem-id" style="font-size: 13px; font-weight: 900; color: #ffffff; font-family: 'Courier New', Courier, monospace; letter-spacing: 0.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${safeMembershipId}</div>
              </td>
            </tr>

            <!-- CENTER SECTION -->
            <tr>
              <td colspan="2" style="padding: 16px 0 14px 0;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <!-- QR Code -->
                    <td align="center" style="width: 42%; vertical-align: middle;">
                      <div style="background-color: #ffffff; padding: 5px; border: 1px solid #ffffff; border-radius: 4px; display: inline-block;">
                        <img src="${qrImageUrl}" alt="Pass QR" width="105" height="105" class="qr-img" style="display: block; width: 105px; height: 105px; border: 0;" />
                      </div>
                    </td>

                    <!-- Divider -->
                    <td align="center" style="width: 6%; vertical-align: middle;">
                      <div class="divider-line" style="width: 2px; height: 105px; background-color: #ffffff; margin: 0 auto;"></div>
                    </td>

                    <!-- AICE Brand -->
                    <td align="left" style="width: 52%; vertical-align: middle; padding-left: 10px;">
                      <table border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="vertical-align: middle;">
                            <img src="https://aice.ceconline.edu/logos/aice_logo.png" alt="AICE" width="28" height="28" style="display: block; width: 28px; height: 28px;" />
                          </td>
                          <td style="vertical-align: middle; padding-left: 6px;">
                            <div class="brand-ice" style="font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: 3px; line-height: 1;">ICE</div>
                          </td>
                        </tr>
                      </table>
                      <div class="brand-full" style="font-size: 11px; font-weight: 800; color: #ffffff; letter-spacing: 0.8px; line-height: 1.35; text-transform: uppercase; margin-top: 8px;">
                        AI INNOVATION<br/>
                        COMMUNITY FOR<br/>
                        EXCELLENCE
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- BOTTOM TAGLINE -->
            <tr>
              <td colspan="2" align="center" style="padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.2);">
                <div class="tagline-text" style="font-size: 12px; font-weight: 600; color: #ffffff; text-align: center; line-height: 1.3;">
                  You are officially an <strong>AICE</strong> member. Let's grow together!!
                </div>
              </td>
            </tr>

            <!-- VALID TILL -->
            <tr>
              <td colspan="2" align="right" style="padding-top: 6px;">
                <div style="font-size: 10px; font-weight: 600; color: #9ca3af; font-family: monospace;">
                  Valid Till: ${validTillDate}
                </div>
              </td>
            </tr>
          </table>
        </div>

        <a href="${escapeHtml(verifyLink)}" class="btn-verify" target="_blank" rel="noopener noreferrer">VIEW & DOWNLOAD DIGITAL PASS ONLINE &rarr;</a>

        <div class="footer">
          Please keep this email for your records and present your digital pass at AICE events.<br/>
          © ${new Date().getFullYear()} AICE CEC. ALL RIGHTS RESERVED.
        </div>
      </div>
    </body>
    </html>
  `;

  const payload = JSON.stringify({
    sender: { name: senderName, email: senderEmail },
    to: [{ email: toEmail, name: memberName || "Member" }],
    subject: `OFFICIAL AICE MEMBERSHIP CARD [${membershipId}]`,
    htmlContent,
  });

  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          accept: "application/json",
          "api-key": brevoApiKey,
          "content-type": "application/json",
        },
        body: payload,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) return true;
      if (res.status === 401 || res.status === 403) break;
    } catch {}

    if (attempt < maxRetries) {
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
    }
  }

  return false;
}

export interface SendMembershipRejectedParams {
  toEmail: string;
  memberName: string;
  reason?: string;
  transactionId?: string;
}

export async function sendMembershipRejectedEmail({
  toEmail,
  memberName,
  reason,
  transactionId,
}: SendMembershipRejectedParams) {
  const brevoApiKey = (process.env.BREVO_API_KEY || "").trim();
  const senderEmail = process.env.BREVO_SENDER_EMAIL || "aice@ceconline.edu";
  const senderName = process.env.BREVO_SENDER_NAME || "AICE CEC";

  if (!brevoApiKey) return false;

  const safeMemberName = escapeHtml(memberName || "Applicant");
  const safeReason = escapeHtml(
    reason ||
      "Payment could not be verified with the provided transaction reference.",
  );
  const safeTx = escapeHtml(transactionId || "N/A");

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>AICE Membership Status Update</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #070709; color: #f3f4f6; margin: 0; padding: 20px; }
        .card { max-width: 520px; margin: 0 auto; background-color: #121217; border: 2px solid rgba(239,68,68,0.4); padding: 32px; box-shadow: 4px 4px 0px #000000; border-radius: 8px; }
        .brand-title { font-size: 16px; font-weight: 900; color: #ffffff; letter-spacing: 1px; font-family: monospace; }
        .badge { display: inline-block; padding: 4px 12px; background-color: #ef4444; color: #ffffff; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; font-family: monospace; }
        .title { font-size: 22px; font-weight: 900; color: #ffffff; margin: 0 0 10px 0; }
        .desc { font-size: 13px; color: #d1d5db; line-height: 1.6; margin-bottom: 20px; }
        .info-box { background-color: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); padding: 16px; border-radius: 6px; margin-bottom: 20px; font-family: monospace; font-size: 12px; }
        .footer { font-size: 11px; color: #6b7280; text-align: center; margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px; font-family: monospace; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="brand-title" style="margin-bottom: 16px;">AICE CEC</div>
        <div class="badge">REGISTRATION UPDATE</div>
        <h1 class="title">Payment Verification Unsuccessful</h1>
        <p class="desc">Dear <strong>${safeMemberName}</strong>, your membership submission could not be verified by our finance team.</p>

        <div class="info-box">
          <div style="color: #ef4444; font-weight: 700; margin-bottom: 6px;">REASON:</div>
          <div style="color: #ffffff; margin-bottom: 12px;">${safeReason}</div>
          <div style="color: #9ca3af;">Transaction Reference: <span style="color: #ffffff;">${safeTx}</span></div>
        </div>

        <p class="desc" style="font-size: 12px; color: #9ca3af;">
          If you believe this is an error or have valid payment proof, please re-submit your registration on our website or reach out to the AICE Execom.
        </p>

        <div class="footer">
          © ${new Date().getFullYear()} AICE CEC. ALL RIGHTS RESERVED.
        </div>
      </div>
    </body>
    </html>
  `;

  const payload = JSON.stringify({
    sender: { name: senderName, email: senderEmail },
    to: [{ email: toEmail, name: memberName || "Applicant" }],
    subject: `⚠️ AICE Membership Registration Update [${safeTx}]`,
    htmlContent,
  });

  try {
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": brevoApiKey,
        "content-type": "application/json",
      },
      body: payload,
    });
    return true;
  } catch {
    return false;
  }
}
