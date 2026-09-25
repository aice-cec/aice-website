import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: Request) {
  const authError = requireAdmin(req, ["admin", "finance"]);
  if (authError) return authError;

  try {
    // Fetch form submissions that have payment data
    const { data: submissions, error } = await supabase
      .from("form_submissions")
      .select("*")
      .not("payment_status", "is", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch form payments error:", error);
      return NextResponse.json(
        { error: "Failed to fetch form payment records." },
        { status: 500 },
      );
    }

    // Fetch all forms to get titles
    const { data: forms } = await supabase
      .from("forms")
      .select("id, title, fields");

    const formMap = new Map<string, any>();
    if (forms) {
      for (const f of forms) {
        formMap.set(f.id, f);
      }
    }

    // Build enriched payment items
    const payments = (submissions || []).map((sub: any) => {
      const form = formMap.get(sub.form_id);
      const responses = sub.responses || {};

      // Extract submitter name and email from responses
      let submitterName = "";
      let submitterEmail = "";

      if (form?.fields && Array.isArray(form.fields)) {
        for (const f of form.fields) {
          const val = responses[f.id];
          if (!val || typeof val !== "string") continue;
          const label = f.label.toLowerCase();
          if (!submitterEmail && (f.type === "email" || label.includes("email"))) {
            submitterEmail = val;
          }
          if (!submitterName && (label.includes("name") || label.includes("participant"))) {
            submitterName = val;
          }
        }
      }

      // Fallback scan
      if (!submitterName || !submitterEmail) {
        for (const val of Object.values(responses)) {
          if (typeof val !== "string") continue;
          if (!submitterEmail && val.includes("@")) submitterEmail = val;
          else if (
            !submitterName &&
            !val.includes("@") &&
            !val.startsWith("data:") &&
            !val.startsWith("http") &&
            val.length > 1 &&
            val.length < 50
          ) {
            submitterName = val;
          }
          if (submitterEmail && submitterName) break;
        }
      }

      return {
        id: sub.id,
        form_id: sub.form_id,
        form_title: form?.title || "Unknown Form",
        submitter_name: submitterName || "Unknown",
        submitter_email: submitterEmail || "N/A",
        amount: sub.payment_amount || 0,
        transaction_id: sub.payment_transaction_id || "",
        screenshot_url: sub.payment_screenshot_url || null,
        is_member: Boolean(sub.is_member),
        membership_id_used: sub.membership_id_used || null,
        payment_status: sub.payment_status,
        payment_rejection_reason: sub.payment_rejection_reason || null,
        payment_reviewed_at: sub.payment_reviewed_at || null,
        payment_reviewed_by: sub.payment_reviewed_by || null,
        created_at: sub.created_at,
      };
    });

    // Compute stats
    let pendingCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;
    let totalRevenue = 0;

    for (const p of payments) {
      if (p.payment_status === "PENDING") pendingCount++;
      else if (p.payment_status === "APPROVED") {
        approvedCount++;
        totalRevenue += p.amount;
      } else if (p.payment_status === "REJECTED") rejectedCount++;
    }

    return NextResponse.json({
      payments,
      stats: {
        totalCount: payments.length,
        pendingCount,
        approvedCount,
        rejectedCount,
        totalRevenue,
      },
    });
  } catch (err: any) {
    console.error("Admin form payments GET error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to load form payments." },
      { status: 500 },
    );
  }
}
