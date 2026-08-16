import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin, getAdminSession } from "@/lib/admin-auth";

export async function GET(req: Request) {
  const authError = requireAdmin(req, ["admin", "finance"]);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status") || "ALL";
    const searchQuery = (searchParams.get("search") || "").trim().toLowerCase();
    const branchFilter = searchParams.get("branch") || "ALL";
    const yearFilter = searchParams.get("year") || "ALL";

    // 1. Fetch all memberships for statistics and listing
    let query = supabase
      .from("memberships")
      .select("*")
      .order("created_at", { ascending: false });

    if (statusFilter !== "ALL") {
      query = query.eq("status", statusFilter);
    }
    if (branchFilter !== "ALL") {
      query = query.eq("branch", branchFilter);
    }
    if (yearFilter !== "ALL") {
      query = query.eq("year", yearFilter);
    }

    const { data: list, error: listError } = await query;

    if (listError) {
      console.error("Fetch memberships error:", listError);
      return NextResponse.json(
        { error: "Failed to fetch membership records from database." },
        { status: 500 }
      );
    }

    let filtered = list || [];
    if (searchQuery) {
      filtered = filtered.filter((m: any) => {
        return (
          m.full_name?.toLowerCase().includes(searchQuery) ||
          m.email?.toLowerCase().includes(searchQuery) ||
          m.phone?.toLowerCase().includes(searchQuery) ||
          m.transaction_id?.toLowerCase().includes(searchQuery) ||
          m.membership_id?.toLowerCase().includes(searchQuery)
        );
      });
    }

    // 2. Compute overall summary statistics
    const { data: allRecords } = await supabase
      .from("memberships")
      .select("status, amount");

    let pendingCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;
    let totalRevenue = 0;

    if (allRecords) {
      for (const rec of allRecords) {
        if (rec.status === "PENDING") pendingCount++;
        else if (rec.status === "APPROVED") {
          approvedCount++;
          totalRevenue += Number(rec.amount) || 100;
        } else if (rec.status === "REJECTED") rejectedCount++;
      }
    }

    return NextResponse.json({
      memberships: filtered,
      stats: {
        totalCount: (allRecords || []).length,
        pendingCount,
        approvedCount,
        rejectedCount,
        totalRevenue,
      },
    });
  } catch (err: any) {
    console.error("Admin memberships GET error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to load memberships." },
      { status: 500 }
    );
  }
}
