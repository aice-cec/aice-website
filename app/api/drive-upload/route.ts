import { NextResponse } from "next/server";
import { uploadSingleFileToDrive } from "@/lib/google-drive";

interface ChunkEntry {
  chunks: string[];
  received: number;
  total: number;
  payload: any;
  timestamp: number;
}

const chunkStore = new Map<string, ChunkEntry>();

// Periodic cleanup of stale upload chunks older than 10 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [id, data] of chunkStore.entries()) {
      if (now - data.timestamp > 10 * 60 * 1000) {
        chunkStore.delete(id);
      }
    }
  }, 5 * 60 * 1000);
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    if (!payload || !payload.folderName) {
      return NextResponse.json(
        { error: "Invalid upload payload" },
        { status: 400 },
      );
    }

    // Handle chunked upload
    if (payload.isChunked && payload.uploadId) {
      const { uploadId, chunkIndex, totalChunks, chunkData } = payload;
      let entry = chunkStore.get(uploadId);
      if (!entry) {
        entry = {
          chunks: new Array(totalChunks),
          received: 0,
          total: totalChunks,
          payload,
          timestamp: Date.now(),
        };
        chunkStore.set(uploadId, entry);
      }

      entry.chunks[chunkIndex] = chunkData;
      entry.received++;

      // If all chunks received, assemble and forward to Google Apps Script
      if (entry.received === entry.total) {
        chunkStore.delete(uploadId);
        const completeBase64 = entry.chunks.join("");

        const fullPayload = {
          ...entry.payload,
          base64Data: completeBase64,
        };
        delete fullPayload.isChunked;
        delete fullPayload.chunkIndex;
        delete fullPayload.totalChunks;
        delete fullPayload.chunkData;
        delete fullPayload.uploadId;

        const result = await uploadSingleFileToDrive(fullPayload);
        if (result && result.fileUrl) {
          return NextResponse.json({ success: true, fileUrl: result.fileUrl });
        }
        return NextResponse.json(
          { error: result?.message || "Failed to upload file to Google Drive" },
          { status: 500 },
        );
      }

      return NextResponse.json({
        success: true,
        chunkReceived: chunkIndex + 1,
        totalChunks,
      });
    }

    // Single non-chunked upload
    if (!payload.base64Data) {
      return NextResponse.json(
        { error: "Missing base64Data in payload" },
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
