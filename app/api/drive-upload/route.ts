import { NextResponse } from "next/server";
import { uploadSingleFileToDrive } from "@/lib/google-drive";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    if (!payload || !payload.base64Data || !payload.folderName) {
      return NextResponse.json(
        { error: "Invalid upload payload" },
        { status: 400 },
      );
    }

    const result = await uploadSingleFileToDrive(payload);
    if (result && result.fileUrl) {
      return NextResponse.json({ success: true, fileUrl: result.fileUrl });
    }

    return NextResponse.json(
      { error: result?.message || "Failed to upload file to Google Drive" },
      { status: 500 },
    );
  } catch (err: any) {
    console.error("Drive upload API proxy failed:", err);
    return NextResponse.json(
      { error: err.message || "Drive upload API proxy failed" },
      { status: 500 },
    );
  }
}
