import "server-only";
import { NextResponse } from "next/server";
import crypto from "crypto";

export const ADMIN_SESSION_COOKIE = "aice_admin_session";
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
  const nonce = crypto.randomUUID();
  const raw = `${ADMIN_USER}:${timestamp}:${nonce}`;
  const signature = crypto
    .createHmac("sha256", ADMIN_SECRET)
    .update(raw)
    .digest("hex");
  return `${timestamp}.${nonce}.${signature}`;
}

export function verifyToken(token: string | null): boolean {
  if (!token || !ADMIN_SECRET || !ADMIN_USER) return false;
  const [timestampStr, nonce, signature, ...extraParts] = token.split(".");
  if (!timestampStr || !nonce || !signature || extraParts.length > 0) return false;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  const maxAge = 24 * 60 * 60 * 1000;
  if (timestamp > Date.now() || Date.now() - timestamp > maxAge) return false;

  const raw = `${ADMIN_USER}:${timestamp}:${nonce}`;
  const expectedSig = crypto
    .createHmac("sha256", ADMIN_SECRET)
    .update(raw)
    .digest("hex");

  return safeCompare(signature, expectedSig);
}

function getCookie(req: Request, name: string): string | null {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return null;

  for (const cookie of cookieHeader.split(";")) {
    const [key, ...value] = cookie.trim().split("=");
    if (key === name) return value.join("=") || null;
  }
  return null;
}

export function setAdminSession(response: NextResponse, token: string): NextResponse {
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 24 * 60 * 60,
  });
  return response;
}

export function clearAdminSession(response: NextResponse): NextResponse {
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}

/** Returns a 401 response if unauthorized, or null if the request is authenticated. */
export function requireAdmin(req: Request): NextResponse | null {
  if (!verifyToken(getCookie(req, ADMIN_SESSION_COOKIE))) {
    return NextResponse.json(
      { error: "Unauthorized or Session Expired" },
      { status: 401 },
    );
  }
  return null;
}
