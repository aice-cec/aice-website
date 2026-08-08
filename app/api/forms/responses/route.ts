import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";

const SUBMISSION_COLUMNS = "id,form_id,responses,created_at";

export async function GET(req: Request) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    const formId = new URL(req.url).searchParams.get("form_id");
    if (!formId) {
      return NextResponse.json({ error: "Missing form_id parameter" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("form_submissions")
      .select(SUBMISSION_COLUMNS)
      .eq("form_id", formId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(data || []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    const { id, responses } = await req.json();
    if (!id || !responses) {
      return NextResponse.json({ error: "Missing submission id or responses payload" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("form_submissions")
      .update({ responses })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, submission: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing submission id" }, { status: 400 });
    }

    const { error } = await supabase
      .from("form_submissions")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
  }
}
