import QRCode from "qrcode";
import { NextResponse } from "next/server";

const TICKET_PATTERN = /^AICE-[A-F0-9]{12}$/;

export async function GET(req: Request) {
  const ticket = new URL(req.url).searchParams.get("ticket")?.toUpperCase();
  if (!ticket || !TICKET_PATTERN.test(ticket)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const png = await QRCode.toBuffer(ticket, {
    type: "png",
    width: 250,
    margin: 1,
    errorCorrectionLevel: "M",
  });

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, s-maxage=86400, immutable",
      "X-Content-Type-Options": "nosniff",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
