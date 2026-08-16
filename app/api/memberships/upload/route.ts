import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import crypto from "crypto";

export const maxDuration = 30; // Next.js route max duration

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { base64Data, mimeType, fileName } = payload;

    if (!base64Data) {
      return NextResponse.json(
        { error: "No image data provided" },
        { status: 400 }
      );
    }

    const cleanBase64 = base64Data.includes(",")
      ? base64Data.split(",")[1]
      : base64Data;
    const buffer = Buffer.from(cleanBase64, "base64");

    // Max 10MB file limit
    if (buffer.length > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Screenshot file size exceeds 10MB limit." },
        { status: 400 }
      );
    }

    const ALLOWED_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp", "gif"]);
    const rawExtension = (mimeType || "image/png").split("/")[1] || "png";
    const extension = ALLOWED_EXTENSIONS.has(rawExtension) ? rawExtension : "png";
    const uniqueFileName = `receipt-${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${extension}`;

    // 1. Try uploading to Supabase Storage bucket 'membership-proofs'
    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("membership-proofs")
        .upload(uniqueFileName, buffer, {
          contentType: mimeType || "image/png",
          upsert: true,
        });

      if (!uploadError && uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from("membership-proofs")
          .getPublicUrl(uniqueFileName);

        if (publicUrlData?.publicUrl) {
          return NextResponse.json({
            success: true,
            fileUrl: publicUrlData.publicUrl,
          });
        }
      }
    } catch (storageErr) {
      console.warn("Supabase storage upload fallback triggered:", storageErr);
    }

    // 2. Fallback to data URI if storage bucket isn't set up yet
    const dataUrl = `data:${mimeType || "image/png"};base64,${cleanBase64}`;
    return NextResponse.json({
      success: true,
      fileUrl: dataUrl,
    });
  } catch (err: any) {
    console.error("Upload failed:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to process screenshot upload." },
      { status: 500 }
    );
  }
}
