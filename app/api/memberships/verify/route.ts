import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyMemberName } from "@/lib/member-verify";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cleanId = (body?.membershipId || "").trim().toUpperCase();
    const cleanName = (body?.name || "").trim();

    if (!cleanId) {
      return NextResponse.json(
        { success: false, error: "Please enter your Membership ID (e.g. AICE-2026-CS-ABCDEF)." },
        { status: 400 },
      );
    }

    if (!cleanName) {
      return NextResponse.json(
        { success: false, error: "Please enter your registered full name." },
        { status: 400 },
      );
    }

    if (cleanName.length < 3) {
      return NextResponse.json(
        { success: false, error: "Please enter your full registered name (at least 3 characters)." },
        { status: 400 },
      );
    }

    // Look up membership by membership_id (case-insensitive)
    const { data: member, error: dbError } = await supabase
      .from("memberships")
      .select("id, full_name, membership_id, status")
      .ilike("membership_id", cleanId)
      .maybeSingle();

    if (dbError) {
      console.error("Membership verify error:", dbError);
      return NextResponse.json(
        { success: false, error: "Database error while verifying membership. Please try again." },
        { status: 500 },
      );
    }

    if (!member) {
      return NextResponse.json(
        { success: false, error: "Membership ID not found. Please check your ID and try again." },
        { status: 404 },
      );
    }

    if (member.status !== "APPROVED") {
      return NextResponse.json(
        {
          success: false,
          error: "Your membership registration has not been approved yet. Please contact the AICE team.",
        },
        { status: 400 },
      );
    }

    // Cross-verify name with registered membership record
    const matchResult = verifyMemberName(cleanName, member.full_name);
    if (!matchResult.matches) {
      return NextResponse.json(
        {
          success: false,
          error:
            matchResult.error ||
            "The name you entered does not match the name associated with this Membership ID.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      verified: true,
      membershipId: member.membership_id,
      memberName: member.full_name,
    });
  } catch (err: any) {
    console.error("Membership verification exception:", err);
    return NextResponse.json(
      { success: false, error: "Unable to verify membership. Please try again." },
      { status: 500 },
    );
  }
}
