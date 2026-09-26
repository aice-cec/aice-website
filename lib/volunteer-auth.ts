import "server-only";
import { NextResponse } from "next/server";
import crypto from "crypto";
import membersData from "@/data/team-26/members.json";

export const VOLUNTEER_SESSION_COOKIE = "aice_volunteer_session";
const VOLUNTEER_SECRET = process.env.ADMIN_SECRET_KEY ?? "";

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

// ---- Session token management (mirrors admin-auth pattern) ----

export function generateVolunteerToken(volunteer: VolunteerInfo): string {
  const timestamp = Date.now();
  const nonce = crypto.randomUUID();
  const raw = `volunteer:${volunteer.id}:${volunteer.name}:${timestamp}:${nonce}`;
  const signature = crypto
    .createHmac("sha256", VOLUNTEER_SECRET)
    .update(raw)
    .digest("hex");
  return `${timestamp}.${nonce}.${volunteer.id}.${encodeURIComponent(volunteer.name)}.${signature}`;
}

export interface VolunteerSession {
  authenticated: boolean;
  volunteer?: VolunteerInfo;
}

export function verifyVolunteerToken(token: string | null): VolunteerSession {
  if (!token || !VOLUNTEER_SECRET) return { authenticated: false };

  const parts = token.split(".");
  if (parts.length !== 5) return { authenticated: false };

  const [timestampStr, nonce, id, encodedName, signature] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return { authenticated: false };

  const maxAge = 24 * 60 * 60 * 1000;
  if (timestamp > Date.now() || Date.now() - timestamp > maxAge) {
    return { authenticated: false };
  }

  const name = decodeURIComponent(encodedName);
  const raw = `volunteer:${id}:${name}:${timestamp}:${nonce}`;
  const expectedSig = crypto
    .createHmac("sha256", VOLUNTEER_SECRET)
    .update(raw)
    .digest("hex");

  if (!safeCompare(signature, expectedSig)) return { authenticated: false };

  const volunteer = getAllVolunteers().find((v) => v.id === id);
  if (!volunteer) return { authenticated: false };

  return { authenticated: true, volunteer };
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
    if (key === name) return value.join("=") || null;
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
    sameSite: "strict",
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
