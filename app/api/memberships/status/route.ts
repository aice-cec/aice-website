import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const txId = (searchParams.get("txId") || "").trim();
    const id = (searchParams.get("id") || "").trim();
    const email = (searchParams.get("email") || "").trim().toLowerCase();

    if (!txId && !id && !email) {
      return NextResponse.json(
        {
          error:
            "Please provide a Transaction ID, Membership ID, or Email to check status.",
        },
        { status: 400 },
      );
    }

    const SAFE_ID_PATTERN = /^[a-zA-Z0-9\-_]+$/;
    const UUID_REGEX =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    let query = supabase
      .from("memberships")
      .select(
        "id, full_name, email, phone, college, branch, year, transaction_id, status, membership_id, rejection_reason, created_at, reviewed_at",
      );

    if (txId) {
      query = query.eq("transaction_id", txId);
    } else if (id) {
      if (!SAFE_ID_PATTERN.test(id)) {
        return NextResponse.json(
          {
            error:
              "Invalid ID format. Only alphanumeric characters, hyphens, and underscores are allowed.",
          },
          { status: 400 },
        );
      }
      if (UUID_REGEX.test(id)) {
        query = query.or(`membership_id.eq.${id},id.eq.${id}`);
      } else {
        query = query.eq("membership_id", id);
      }
    } else if (email) {
      query = query.eq("email", email);
    }

    let { data: member, error } = await query
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Fallback: if 'id' didn't match membership_id and wasn't a UUID, check if it was a transaction_id
    if (!member && id && !UUID_REGEX.test(id)) {
      const { data: fallbackTx } = await supabase
        .from("memberships")
        .select(
          "id, full_name, email, phone, college, branch, year, transaction_id, status, membership_id, rejection_reason, created_at, reviewed_at",
        )
        .eq("transaction_id", id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fallbackTx) {
        member = fallbackTx;
        error = null;
      }
    }

    if (error) {
      console.error("Status check DB error:", error);
      return NextResponse.json(
        { error: "Failed to retrieve status." },
        { status: 500 },
      );
    }

    if (!member) {
      return NextResponse.json(
        { error: "No registration found matching the provided reference." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      membership: member,
    });
  } catch (err: any) {
    console.error("Status check exception:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to check membership status." },
      { status: 500 },
    );
  }
}
