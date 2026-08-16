import { NextResponse, after } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin, getAdminSession } from "@/lib/admin-auth";
import { sendMembershipApprovedEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireAdmin(req, ["admin", "finance"]);
  if (authError) return authError;

  const session = getAdminSession(req);
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing membership ID" }, { status: 400 });
  }

  try {
    const UUID_REGEX =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    // 1. Fetch current record
    let query = supabase.from("memberships").select("*");
    if (UUID_REGEX.test(id)) {
      query = query.eq("id", id);
    } else {
      query = query.eq("membership_id", id);
    }

    const { data: member, error: fetchError } = await query.maybeSingle();

    if (fetchError || !member) {
      return NextResponse.json(
        { error: "Membership record not found." },
        { status: 404 }
      );
    }

    if (member.status === "APPROVED") {
      return NextResponse.json(
        { error: "This membership is already approved." },
        { status: 400 }
      );
    }

    // 2. Generate unique Membership ID
    const shortCode = crypto.randomBytes(3).toString("hex").toUpperCase();
    const branchCode = (member.branch || "CS").toUpperCase();
    const membershipId = member.membership_id || `AICE-2026-${branchCode}-${shortCode}`;
    const reviewedAt = new Date().toISOString();
    const reviewedBy = session.username || "Finance Admin";

    // 3. Update database record
    const { data: updated, error: updateError } = await supabase
      .from("memberships")
      .update({
        status: "APPROVED",
        membership_id: membershipId,
        reviewed_at: reviewedAt,
        reviewed_by: reviewedBy,
        rejection_reason: null,
      })
      .eq("id", member.id)
      .select()
      .single();

    if (updateError || !updated) {
      console.error("Supabase update error on approval:", updateError);
      return NextResponse.json(
        { error: "Failed to update membership status." },
        { status: 500 }
      );
    }

    // 4. Dispatch Email with Membership Card in background
    after(async () => {
      try {
        await sendMembershipApprovedEmail({
          toEmail: member.email,
          memberName: member.full_name,
          membershipId,
          branch: member.branch,
          year: member.year,
          college: member.college,
        });
      } catch (emailErr) {
        console.error("Failed to send membership approved email:", emailErr);
      }
    });

    return NextResponse.json({
      success: true,
      message: `Membership approved successfully! Card sent to ${member.email}`,
      membership: updated,
    });
  } catch (err: any) {
    console.error("Approve membership error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to approve membership." },
      { status: 500 }
    );
  }
}
