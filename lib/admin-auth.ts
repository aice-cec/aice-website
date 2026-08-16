import "server-only";
import { NextResponse } from "next/server";
import crypto from "crypto";

export const ADMIN_SESSION_COOKIE = "aice_admin_session";
export const ADMIN_USER = process.env.ADMIN_USER ?? "aice-admin";
export const FINANCE_USER = process.env.FINANCE_USER ?? "aice-finance";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";
export const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY ?? "";

export type AdminRole = "admin" | "finance";

export interface SessionInfo {
  authenticated: boolean;
  username?: string;
  role?: AdminRole;
}

export function safeCompare(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function generateToken(username: string = ADMIN_USER, role: AdminRole = "admin"): string {
  const timestamp = Date.now();
  const nonce = crypto.randomUUID();
  const raw = `${username}:${role}:${timestamp}:${nonce}`;
  const signature = crypto
    .createHmac("sha256", ADMIN_SECRET)
    .update(raw)
    .digest("hex");
  return `${timestamp}.${nonce}.${username}.${role}.${signature}`;
}

export function verifyToken(token: string | null): SessionInfo {
  if (!token || !ADMIN_SECRET) return { authenticated: false };

  const parts = token.split(".");
  
  // Format: timestamp.nonce.username.role.signature (5 parts)
  if (parts.length === 5) {
    const [timestampStr, nonce, username, role, signature] = parts;
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) return { authenticated: false };

    const maxAge = 24 * 60 * 60 * 1000;
    if (timestamp > Date.now() || Date.now() - timestamp > maxAge) {
      return { authenticated: false };
    }

    const raw = `${username}:${role}:${timestamp}:${nonce}`;
    const expectedSig = crypto
      .createHmac("sha256", ADMIN_SECRET)
      .update(raw)
      .digest("hex");

    if (safeCompare(signature, expectedSig)) {
      return {
        authenticated: true,
        username,
        role: role as AdminRole,
      };
    }
  }

  // Legacy format: timestamp.nonce.signature (3 parts)
  if (parts.length === 3) {
    const [timestampStr, nonce, signature] = parts;
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) return { authenticated: false };

    const maxAge = 24 * 60 * 60 * 1000;
    if (timestamp > Date.now() || Date.now() - timestamp > maxAge) {
      return { authenticated: false };
    }

    const raw = `${ADMIN_USER}:${timestamp}:${nonce}`;
    const expectedSig = crypto
      .createHmac("sha256", ADMIN_SECRET)
      .update(raw)
      .digest("hex");

    if (safeCompare(signature, expectedSig)) {
      return {
        authenticated: true,
        username: ADMIN_USER,
        role: "admin",
      };
    }
  }

  return { authenticated: false };
}

export function getCookie(req: Request, name: string): string | null {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return null;

  for (const cookie of cookieHeader.split(";")) {
    const [key, ...value] = cookie.trim().split("=");
    if (key === name) return value.join("=") || null;
  }
  return null;
}

export function getAdminSession(req: Request): SessionInfo {
  const token = getCookie(req, ADMIN_SESSION_COOKIE);
  return verifyToken(token);
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

/** Returns a 401/403 response if unauthorized, or null if authenticated with proper role. */
export function requireAdmin(
  req: Request,
  allowedRoles: AdminRole[] = ["admin"]
): NextResponse | null {
  const session = getAdminSession(req);
  if (!session.authenticated || !session.role) {
    return NextResponse.json(
      { error: "Unauthorized or Session Expired" },
      { status: 401 },
    );
  }

  if (!allowedRoles.includes(session.role)) {
    return NextResponse.json(
      { error: "Forbidden: You do not have permission to perform this action" },
      { status: 403 },
    );
  }

  return null;
}
