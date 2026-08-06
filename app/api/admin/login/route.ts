import { NextResponse } from "next/server";
import crypto from "crypto";

const loginAttempts = new Map<
  string,
  { attempts: number; lockUntil: number }
>();

const MAX_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000;

const ADMIN_USER = process.env.ADMIN_USER ?? "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";
const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY ?? "";

function safeCompare(a?: string | null, b?: string | null): boolean {
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

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown_ip";
    const now = Date.now();

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
    const username = body.username;
    const password = body.password;

    const isUserValid = safeCompare(username, ADMIN_USER);
    const isPassValid = safeCompare(password, ADMIN_PASSWORD);

    if (!isUserValid || !isPassValid) {
      // Record failed attempt
      const attempts = (attemptRecord ? attemptRecord.attempts : 0) + 1;
      const lockUntil = attempts >= MAX_ATTEMPTS ? now + LOCK_TIME_MS : 0;
      loginAttempts.set(ip, { attempts, lockUntil });

      const remaining = Math.max(0, MAX_ATTEMPTS - attempts);
      const errorMsg =
        attempts >= MAX_ATTEMPTS
          ? `Too many failed attempts. Locked for 15 minutes.`
          : `Invalid User ID or Password. (${remaining} attempt(s) remaining)`;

      return NextResponse.json({ error: errorMsg }, { status: 401 });
    }

    // Reset failed attempts on success
    loginAttempts.delete(ip);

    // Generate secure signed session token
    const token = generateToken();

    return NextResponse.json({ success: true, token });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server Error" },
      { status: 500 },
    );
  }
}
