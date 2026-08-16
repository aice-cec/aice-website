import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabase } from "@/lib/supabase";
import { inMemoryClaims, getTierInfo, VaultClaimRecord } from "../status/route";

const DEFAULT_PIN =
  process.env.EVENT_PIN || process.env.NEXT_PUBLIC_EVENT_PIN || "7268";

// Process-level Mutex lock for atomic sequential execution during concurrent bursts
let claimLockQueue: Promise<any> = Promise.resolve();

async function runAtomic<T>(fn: () => Promise<T>): Promise<T> {
  const current = claimLockQueue;
  let resolveCurrent: () => void;
  claimLockQueue = new Promise<void>((resolve) => {
    resolveCurrent = resolve;
  });

  await current.catch(() => {});
  try {
    return await fn();
  } finally {
    resolveCurrent!();
  }
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // Developer / testing reset endpoint
    if (action === "reset") {
      return await runAtomic(async () => {
        inMemoryClaims.length = 0;
        try {
          await supabase
            .from("vault_claims")
            .delete()
            .neq("rank", -1);
        } catch {}
        return NextResponse.json({
          success: true,
          message: "Claims have been reset.",
        });
      });
    }

    const body = await req.json();
    const { pin, fullName } = body;

    // 1. PIN verification (4-digit passcode)
    const normalizedInputPin = String(pin || "").trim();
    const expectedPin = String(DEFAULT_PIN).trim();

    if (normalizedInputPin !== expectedPin) {
      return NextResponse.json(
        {
          success: false,
          error: "Access Denied: Invalid 4-digit PIN passcode.",
        },
        { status: 401 },
      );
    }

    // 2. Validate name
    const cleanName = String(fullName || "").trim();
    if (!cleanName) {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter your name to unlock the vault.",
        },
        { status: 400 },
      );
    }

    return await runAtomic(async () => {
      let currentClaimsCount = 0;
      let existingClaim: VaultClaimRecord | null = null;

      try {
        const { data: existingUser } = await supabase
          .from("vault_claims")
          .select("rank, full_name, pass_code, reward_description")
          .ilike("full_name", cleanName)
          .maybeSingle();

        if (existingUser) {
          existingClaim = {
            rank: existingUser.rank,
            fullName: existingUser.full_name,
            passCode: existingUser.pass_code,
            rewardDescription: existingUser.reward_description,
          };
        } else {
          const { count, error } = await supabase
            .from("vault_claims")
            .select("*", { count: "exact", head: true });

          if (!error && typeof count === "number") {
            currentClaimsCount = count;
          } else {
            currentClaimsCount = inMemoryClaims.length;
          }
        }
      } catch {
        // Fallback in-memory check
        existingClaim =
          inMemoryClaims.find(
            (c) => c.fullName.toLowerCase() === cleanName.toLowerCase(),
          ) || null;
        currentClaimsCount = inMemoryClaims.length;
      }

      // If user already claimed earlier, return their existing claim
      if (existingClaim) {
        return NextResponse.json({
          success: true,
          alreadyClaimed: true,
          claim: existingClaim,
        });
      }

      // 4. Assign Rank & Prize Tier atomically
      const assignedRank = currentClaimsCount + 1;
      const tier = getTierInfo(assignedRank);
      const uniqueSuffix = crypto.randomBytes(2).toString("hex").toUpperCase();
      const passCode = `AICE-VAULT-${String(assignedRank).padStart(3, "0")}-${uniqueSuffix}`;

      const newClaim: VaultClaimRecord = {
        rank: assignedRank,
        fullName: cleanName,
        passCode,
        rewardDescription: tier.rewardDescription,
      };

      // 5. Store record in database with conflict protection
      try {
        await supabase.from("vault_claims").insert([
          {
            rank: assignedRank,
            full_name: cleanName,
            pass_code: passCode,
            reward_description: tier.rewardDescription,
          },
        ]);
      } catch {
        // Graceful fallback to memory store
      }

      inMemoryClaims.push(newClaim);

      return NextResponse.json({
        success: true,
        alreadyClaimed: false,
        claim: newClaim,
      });
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process claim" },
      { status: 500 },
    );
  }
}
