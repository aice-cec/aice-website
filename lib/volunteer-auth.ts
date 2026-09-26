import "server-only";
import { NextResponse } from "next/server";
import crypto from "crypto";
import membersData from "@/data/team-26/members.json";

export const VOLUNTEER_SESSION_COOKIE = "aice_volunteer_session";
const VOLUNTEER_SECRET = process.env.ADMIN_SECRET_KEY || "aice_volunteer_secret_2026_cec";

export interface VolunteerInfo {
  id: string;
  name: string;
  role: string;
  team: string;
}

/** All execom + subExecom members who can volunteer */
export function getAllVolunteers(): VolunteerInfo[] {
  const execom = (membersData.execom || []).map((m) => ({
    id: m.id,
    name: m.name,
    role: m.role,
    team: m.team || "Executive Committee",
  }));
  const subExecom = (membersData.subExecom || []).map((m) => ({
    id: m.id,
    name: m.name,
    role: m.role,
    team: m.team || "Sub Executive Committee",
  }));
  return [...execom, ...subExecom];
}

/** Collapse whitespace and lowercase for flexible matching */
function normaliseName(n: string): string {
  return n.trim().replace(/\s+/g, " ").toLowerCase();
}

/** Find a volunteer by name (case-insensitive, whitespace-flexible) */
export function findVolunteer(name: string): VolunteerInfo | undefined {
  const normalised = normaliseName(name);
  return getAllVolunteers().find(
    (v) => normaliseName(v.name) === normalised,
  );
}

/** Validate password: should be `name@aice` with all spaces stripped from name */
export function validateVolunteerPassword(
  name: string,
  password: string,
): boolean {
  const expected = `${name.replace(/\s+/g, "").toLowerCase()}@aice`;
  return password.trim().replace(/\s+/g, "").toLowerCase() === expected;
}

// ---- Session token management (clean, URL-safe alphanumeric tokens) ----

export function generateVolunteerToken(volunteer: VolunteerInfo): string {
  const timestamp = Date.now();
  const nonce = crypto.randomUUID();
  const raw = `volunteer:${volunteer.id}:${timestamp}:${nonce}`;
  const signature = crypto
    .createHmac("sha256", VOLUNTEER_SECRET)
    .update(raw)
    .digest("hex");
  return `${timestamp}.${nonce}.${volunteer.id}.${signature}`;
}

export interface VolunteerSession {
  authenticated: boolean;
  volunteer?: VolunteerInfo;
}

export function verifyVolunteerToken(token: string | null): VolunteerSession {
  if (!token || !VOLUNTEER_SECRET) return { authenticated: false };

  const parts = token.split(".");
  if (parts.length !== 4 && parts.length !== 5) return { authenticated: false };

  let timestampStr: string;
  let nonce: string;
  let id: string;
  let signature: string;

  if (parts.length === 4) {
    [timestampStr, nonce, id, signature] = parts;
  } else {
    // backward-compatibility for 5-part tokens
    [timestampStr, nonce, id, , signature] = parts;
  }

  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return { authenticated: false };

  const maxAge = 24 * 60 * 60 * 1000;
  if (timestamp > Date.now() || Date.now() - timestamp > maxAge) {
    return { authenticated: false };
  }

  const volunteer = getAllVolunteers().find((v) => v.id === id);
  if (!volunteer) return { authenticated: false };

  // Verify 4-part signature
  const raw4 = `volunteer:${id}:${timestamp}:${nonce}`;
  const sig4 = crypto
    .createHmac("sha256", VOLUNTEER_SECRET)
    .update(raw4)
    .digest("hex");

  if (safeCompare(signature, sig4)) {
    return { authenticated: true, volunteer };
  }

  // Fallback check for legacy 5-part signature
  const raw5 = `volunteer:${id}:${volunteer.name}:${timestamp}:${nonce}`;
  const sig5 = crypto
    .createHmac("sha256", VOLUNTEER_SECRET)
    .update(raw5)
    .digest("hex");

  if (safeCompare(signature, sig5)) {
    return { authenticated: true, volunteer };
  }

  return { authenticated: false };
}

function safeCompare(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function getCookie(req: Request, name: string): string | null {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return null;
  for (const cookie of cookieHeader.split(";")) {
    const [key, ...value] = cookie.trim().split("=");
    if (key === name) {
      const val = value.join("=");
      try {
        return decodeURIComponent(val);
      } catch {
        return val || null;
      }
    }
  }
  return null;
}

export function getVolunteerSession(req: Request): VolunteerSession {
  const token = getCookie(req, VOLUNTEER_SESSION_COOKIE);
  return verifyVolunteerToken(token);
}

export function setVolunteerSession(
  response: NextResponse,
  token: string,
): NextResponse {
  response.cookies.set(VOLUNTEER_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 24 * 60 * 60,
  });
  return response;
}

export function clearVolunteerSession(response: NextResponse): NextResponse {
  response.cookies.set(VOLUNTEER_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export function requireVolunteer(req: Request): NextResponse | null {
  const session = getVolunteerSession(req);
  if (!session.authenticated || !session.volunteer) {
    return NextResponse.json(
      { error: "Unauthorized. Please log in." },
      { status: 401 },
    );
  }
  return null;
}
