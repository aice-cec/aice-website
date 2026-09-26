import { NextResponse } from "next/server";
import {
  findVolunteer,
  validateVolunteerPassword,
  generateVolunteerToken,
  setVolunteerSession,
  getVolunteerSession,
  clearVolunteerSession,
  getAllVolunteers,
} from "@/lib/volunteer-auth";

// --- Rate limiting (mirrors admin login pattern) ---
const loginAttempts = new Map<
  string,
  { attempts: number; lockUntil: number; lastAttempt: number }
>();
const MAX_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000;

function getClientIdentifier(req: Request): string {
  return (
    req.headers.get("x-vercel-forwarded-for") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown_ip"
  );
}

function pruneExpiredAttempts(now: number) {
  for (const [key, record] of loginAttempts) {
    if (record.lockUntil <= now && now - record.lastAttempt > LOCK_TIME_MS) {
      loginAttempts.delete(key);
    }
  }
}

/** POST: Log in a volunteer */
export async function POST(req: Request) {
  try {
    const now = Date.now();
    pruneExpiredAttempts(now);
    const ip = getClientIdentifier(req);

    const attemptRecord = loginAttempts.get(ip);
    if (attemptRecord && attemptRecord.lockUntil > now) {
      const remainingMinutes = Math.ceil(
        (attemptRecord.lockUntil - now) / (60 * 1000),
      );
      return NextResponse.json(
        {
          error: `Too many failed attempts. Locked for ${remainingMinutes} more minute(s).`,
        },
        { status: 429 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const name = (body.name || "").trim();
    const password = body.password || "";

    if (!name || !password) {
      return NextResponse.json(
        { error: "Name and password are required" },
        { status: 400 },
      );
    }

    const volunteer = findVolunteer(name);
    const passValid = volunteer
      ? validateVolunteerPassword(volunteer.name, password)
      : false;

    if (!volunteer || !passValid) {
      const attempts = (attemptRecord ? attemptRecord.attempts : 0) + 1;
      const lockUntil = attempts >= MAX_ATTEMPTS ? now + LOCK_TIME_MS : 0;
      loginAttempts.set(ip, { attempts, lockUntil, lastAttempt: now });

      const remaining = Math.max(0, MAX_ATTEMPTS - attempts);
      const errorMsg =
        attempts >= MAX_ATTEMPTS
          ? "Too many failed attempts. Locked for 15 minutes."
          : `Invalid name or password. (${remaining} attempt(s) remaining)`;

      return NextResponse.json({ error: errorMsg }, { status: 401 });
    }

    loginAttempts.delete(ip);

    const token = generateVolunteerToken(volunteer);
    return setVolunteerSession(
      NextResponse.json({
        success: true,
        volunteer: {
          id: volunteer.id,
          name: volunteer.name,
          role: volunteer.role,
          team: volunteer.team,
        },
      }),
      token,
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to sign in" },
      { status: 500 },
    );
  }
}

/** GET: Check current volunteer session */
export async function GET(req: Request) {
  const session = getVolunteerSession(req);
  if (!session.authenticated || !session.volunteer) {
    return NextResponse.json(
      { error: "Unauthorized or Session Expired" },
      { status: 401 },
    );
  }
  return NextResponse.json({
    authenticated: true,
    volunteer: session.volunteer,
  });
}

/** DELETE: Log out */
export async function DELETE() {
  return clearVolunteerSession(NextResponse.json({ success: true }));
}
