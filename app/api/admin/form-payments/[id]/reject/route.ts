import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin, getAdminSession } from "@/lib/admin-auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = requireAdmin(req, ["admin", "finance"]);
  if (authError) return authError;

  const session = getAdminSession(req);
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing submission ID" }, { status: 400 });
  }

  try {
    const { reason } = await req.json();

    // Fetch current submission
    const { data: submission, error: fetchError } = await supabase
      .from("form_submissions")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !submission) {
      return NextResponse.json(
        { error: "Form submission not found." },
        { status: 404 },
      );
    }

    const reviewedAt = new Date().toISOString();
    const reviewedBy = session.username || "Finance Admin";

    const { data: updated, error: updateError } = await supabase
      .from("form_submissions")
      .update({
        payment_status: "REJECTED",
        payment_reviewed_at: reviewedAt,
        payment_reviewed_by: reviewedBy,
        payment_rejection_reason:
          reason || "Payment could not be verified with the provided transaction reference.",
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError || !updated) {
      console.error("Supabase update error on payment rejection:", updateError);
      return NextResponse.json(
        { error: "Failed to update payment status." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Form payment rejected.",
      submission: updated,
    });
  } catch (err: any) {
    console.error("Reject form payment error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to reject form payment." },
      { status: 500 },
    );
  }
}
