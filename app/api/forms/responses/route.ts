import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyToken } from "../../admin/login/route";

export async function GET(req: Request) {
  try {
    const token = req.headers.get("x-admin-token");
    if (!verifyToken(token)) {
      return NextResponse.json(
        { error: "Unauthorized or Session Expired" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const formId = searchParams.get("form_id");

    if (!formId) {
      return NextResponse.json({ error: "Missing form_id parameter" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("form_submissions")
      .select("*")
      .eq("form_id", formId)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase form_submissions fetch error:", error);
      return NextResponse.json([]);
    }

    return NextResponse.json(data || []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
  }
}
