import { NextResponse } from "next/server";
import crypto from "crypto";

export const ADMIN_USER = process.env.ADMIN_USER ?? "";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";
export const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY ?? "";

export function safeCompare(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function generateToken(): string {
  const timestamp = Date.now();
  const raw = `${ADMIN_USER}:${timestamp}:${ADMIN_SECRET}`;
  const signature = crypto
    .createHmac("sha256", ADMIN_SECRET)
    .update(raw)
    .digest("hex");
  return `${timestamp}.${signature}`;
}

export function verifyToken(token: string | null): boolean {
  if (!token || !token.includes(".")) return false;
  const [timestampStr, signature] = token.split(".");
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  const maxAge = 24 * 60 * 60 * 1000;
  if (Date.now() - timestamp > maxAge) return false;

  const raw = `${ADMIN_USER}:${timestamp}:${ADMIN_SECRET}`;
  const expectedSig = crypto
    .createHmac("sha256", ADMIN_SECRET)
    .update(raw)
    .digest("hex");

  return safeCompare(signature, expectedSig);
}

/** Returns a 401 response if unauthorized, or null if the request is authenticated. */
export function requireAdmin(req: Request): NextResponse | null {
  if (!verifyToken(req.headers.get("x-admin-token"))) {
    return NextResponse.json(
      { error: "Unauthorized or Session Expired" },
      { status: 401 },
    );
  }
  return null;
}
