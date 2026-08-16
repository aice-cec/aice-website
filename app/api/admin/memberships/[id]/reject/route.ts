import { NextResponse, after } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin, getAdminSession } from "@/lib/admin-auth";
import { sendMembershipRejectedEmail } from "@/lib/email";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = requireAdmin(req, ["admin", "finance"]);
  if (authError) return authError;

  const session = getAdminSession(req);
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "Missing membership ID" },
      { status: 400 },
    );
  }

  try {
    const UUID_REGEX =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const body = await req.json().catch(() => ({}));
    const reason = (
      body.reason ||
      "Payment could not be verified with the provided transaction reference."
    ).trim();

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
        { status: 404 },
      );
    }

    const reviewedAt = new Date().toISOString();
    const reviewedBy = session.username || "Finance Admin";

    const { data: updated, error: updateError } = await supabase
      .from("memberships")
      .update({
        status: "REJECTED",
        rejection_reason: reason,
        reviewed_at: reviewedAt,
        reviewed_by: reviewedBy,
      })
      .eq("id", member.id)
      .select()
      .single();

    if (updateError || !updated) {
      console.error("Supabase update error on rejection:", updateError);
      return NextResponse.json(
        { error: "Failed to update membership status." },
        { status: 500 },
      );
    }

    // 3. Dispatch notification email in background
    after(async () => {
      try {
        await sendMembershipRejectedEmail({
          toEmail: member.email,
          memberName: member.full_name,
          reason,
          transactionId: member.transaction_id,
        });
      } catch (emailErr) {
        console.error("Failed to send membership rejection email:", emailErr);
      }
    });

    return NextResponse.json({
      success: true,
      message: `Membership rejected. Notification sent to ${member.email}`,
      membership: updated,
    });
  } catch (err: any) {
    console.error("Reject membership error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to reject membership." },
      { status: 500 },
    );
  }
}
