import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export interface VaultClaimRecord {
  rank: number;
  fullName: string;
  passCode: string;
  rewardDescription: string;
}

export const inMemoryClaims: VaultClaimRecord[] = [];

export function getTierInfo(rank: number) {
  if (rank === 1) {
    return {
      discount: "100% FREE",
      rewardDescription: "1 Year Free Forum Membership",
    };
  } else if (rank === 2) {
    return {
      discount: "75% DISCOUNT",
      rewardDescription: "75% Discount on Forum Membership",
    };
  } else if (rank === 3) {
    return {
      discount: "50% DISCOUNT",
      rewardDescription: "50% Discount on Forum Membership",
    };
  } else {
    return {
      discount: "COMPLETED",
      rewardDescription: "All 3 prizes have been claimed! Great job on cracking the passcode.",
    };
  }
}

export async function GET() {
  try {
    let count = 0;
    try {
      const { count: dbCount, error } = await supabase
        .from("vault_claims")
        .select("*", { count: "exact", head: true });
      if (!error && typeof dbCount === "number") {
        count = dbCount;
      } else {
        count = inMemoryClaims.length;
      }
    } catch {
      count = inMemoryClaims.length;
    }

    const nextRank = count + 1;
    const currentTier = getTierInfo(nextRank);

    return NextResponse.json({
      success: true,
      totalClaims: count,
      nextRank,
      currentTier,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch status" },
      { status: 500 }
    );
  }
}
