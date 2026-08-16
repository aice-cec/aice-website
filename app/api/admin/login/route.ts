import { NextResponse } from "next/server";
import {
  ADMIN_USER,
  FINANCE_USER,
  ADMIN_PASSWORD,
  clearAdminSession,
  generateToken,
  safeCompare,
  setAdminSession,
  getAdminSession,
  AdminRole,
} from "@/lib/admin-auth";

const loginAttempts = new Map<
  string,
  { attempts: number; lockUntil: number; lastAttempt: number }
>();

const MAX_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000;

function getClientIdentifier(req: Request): string {
  // Vercel sets this header from the connection and does not rely on a
  // user-controlled forwarding chain. The fallback keeps local development usable.
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
          error: `Too many failed login attempts. Account locked for ${remainingMinutes} more minute(s).`,
        },
        { status: 429 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const username = (body.username || "").trim();
    const password = body.password || "";

    const isAdminUser = safeCompare(username, ADMIN_USER);
    const isFinanceUser = safeCompare(username, FINANCE_USER);
    const isPassValid = safeCompare(password, ADMIN_PASSWORD);

    if ((!isAdminUser && !isFinanceUser) || !isPassValid) {
      // Record failed attempt
      const attempts = (attemptRecord ? attemptRecord.attempts : 0) + 1;
      const lockUntil = attempts >= MAX_ATTEMPTS ? now + LOCK_TIME_MS : 0;
      loginAttempts.set(ip, { attempts, lockUntil, lastAttempt: now });

      const remaining = Math.max(0, MAX_ATTEMPTS - attempts);
      const errorMsg =
        attempts >= MAX_ATTEMPTS
          ? `Too many failed attempts. Locked for 15 minutes.`
          : `Invalid User ID or Password. (${remaining} attempt(s) remaining)`;

      return NextResponse.json({ error: errorMsg }, { status: 401 });
    }

    // Reset failed attempts on success
    loginAttempts.delete(ip);

    const role: AdminRole = isFinanceUser && !isAdminUser ? "finance" : "admin";
    const sessionUser = isAdminUser ? ADMIN_USER : FINANCE_USER;

    // Generate secure signed session token with role
    const token = generateToken(sessionUser, role);

    return setAdminSession(
      NextResponse.json({
        success: true,
        role,
        username: sessionUser,
      }),
      token,
    );
  } catch {
    return NextResponse.json({ error: "Unable to sign in" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const session = getAdminSession(req);
  if (!session.authenticated || !session.role) {
    return NextResponse.json(
      { error: "Unauthorized or Session Expired" },
      { status: 401 },
    );
  }
  return NextResponse.json({
    authenticated: true,
    role: session.role,
    username: session.username,
  });
}

export async function DELETE() {
  return clearAdminSession(NextResponse.json({ success: true }));
}
