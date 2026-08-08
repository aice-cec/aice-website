import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyToken } from "@/lib/admin-auth";

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

export async function PUT(req: Request) {
  try {
    const token = req.headers.get("x-admin-token");
    if (!verifyToken(token)) {
      return NextResponse.json(
        { error: "Unauthorized or Session Expired" },
        { status: 401 }
      );
    }

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
      console.warn("Supabase form_submissions update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, submission: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const token = req.headers.get("x-admin-token");
    if (!verifyToken(token)) {
      return NextResponse.json(
        { error: "Unauthorized or Session Expired" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing submission id" }, { status: 400 });
    }

    const { error } = await supabase
      .from("form_submissions")
      .delete()
      .eq("id", id);

    if (error) {
      console.warn("Supabase form_submissions delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
  }
}
