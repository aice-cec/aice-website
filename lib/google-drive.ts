import { formatTaskFilename } from "@/lib/filename";

export interface GoogleDriveUploadPayload {
  folderName:
    | "Design Team"
    | "Content Team"
    | "Operations Team"
    | "Project Coordinator";
  fileName: string;
  base64Data: string;
  mimeType: string;
  applicantName: string;
  applicantEmail: string;
  folderIdOverride?: string;
}

/**
 * Sends a base64 file to the configured Google Apps Script Web App.
 */
function cleanFolderId(input?: string): string {
  if (!input) return "";
  const match = input.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  return input.split("?")[0].split("#")[0].trim();
}

export async function uploadSingleFileToDrive(
  payload: GoogleDriveUploadPayload,
) {
  const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  if (!scriptUrl) {
    console.warn(
      "[GoogleDrive] GOOGLE_APPS_SCRIPT_URL environment variable is missing.",
    );
    return null;
  }

  try {
    const res = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        ...payload,
        folderIds: {
          "Design Team": cleanFolderId(
            process.env.GOOGLE_DRIVE_DESIGN_FOLDER_ID,
          ),
          "Content Team": cleanFolderId(
            process.env.GOOGLE_DRIVE_CONTENT_FOLDER_ID,
          ),
          "Operations Team": cleanFolderId(
            process.env.GOOGLE_DRIVE_OPS_FOLDER_ID,
          ),
          "Project Coordinator": cleanFolderId(
            process.env.GOOGLE_DRIVE_COORD_FOLDER_ID,
          ),
        },
      }),
      redirect: "follow",
    });

    const responseText = await res.text();
    let data: any = null;
    try {
      data = JSON.parse(responseText);
    } catch {
      if (responseText.includes("You need access") || res.status === 403) {
        console.error(
          `[GoogleDrive] ACCESS DENIED: Google Apps Script Web App permissions are restricted.\n` +
            `Please set "Who has access" to "Anyone" in script.google.com -> Deploy -> Manage deployments.`,
        );
      } else {
        console.error(
          `[GoogleDrive] Invalid response from Google Apps Script (${res.status}):`,
          responseText.slice(0, 200),
        );
      }
      return null;
    }

    if (data?.status === "error") {
      console.error(
        `[GoogleDrive] Apps Script Error for ${payload.fileName}:`,
        data.message,
      );
    } else {
      console.log(
        `[GoogleDrive] Uploaded ${payload.fileName} to ${payload.folderName}`,
      );
    }
    return data;
  } catch (err) {
    console.error(`[GoogleDrive] Error uploading ${payload.fileName}:`, err);
    return null;
  }
}

/**
 * Uploads a file directly from browser to Google Drive via Apps Script Web App.
 * Returns the created Google Drive File URL or null if fallback to payload is needed.
 */
export async function uploadFileFromClientToDrive(
  payload: GoogleDriveUploadPayload,
): Promise<string | null> {
  const scriptUrl =
    process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL ||
    process.env.GOOGLE_APPS_SCRIPT_URL;
  if (!scriptUrl) return null;

  try {
    const res = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
      redirect: "follow",
    });

    const text = await res.text();
    const data = JSON.parse(text);
    if (data?.status === "success" && data?.fileUrl) {
      return data.fileUrl as string;
    }
  } catch (err) {
    console.warn(
      "Direct browser upload to Drive failed, falling back to base64 payload:",
      err,
    );
  }
  return null;
}

/**
 * Dispatches all task upload files from a submission to Google Drive in separate folders.
 */
export async function dispatchTaskUploadsToGoogleDrive(
  applicantName: string,
  applicantEmail: string,
  responses: Record<string, any>,
) {
  if (!process.env.GOOGLE_APPS_SCRIPT_URL) return;

  const fileFields: Array<{
    key: string;
    folderName:
      | "Design Team"
      | "Content Team"
      | "Operations Team"
      | "Project Coordinator";
    defaultExt: string;
    label: string;
  }> = [
    {
      key: "field_image",
      folderName: "Design Team",
      defaultExt: "png",
      label: "Design Task Image",
    },
    {
      key: "field_pdf_content",
      folderName: "Content Team",
      defaultExt: "pdf",
      label: "Content Team Task PDF",
    },
    {
      key: "field_pdf_ops",
      folderName: "Operations Team",
      defaultExt: "pdf",
      label: "Operations Team Task PDF",
    },
    {
      key: "field_pdf_coord",
      folderName: "Project Coordinator",
      defaultExt: "pdf",
      label: "Project Coordinator Task PDF",
    },
    {
      key: "field_pdf",
      folderName: "Content Team",
      defaultExt: "pdf",
      label: "Task PDF Document",
    },
  ];

  for (const item of fileFields) {
    const rawVal = responses[item.key];
    if (typeof rawVal === "string" && rawVal.startsWith("data:")) {
      let mimeType =
        item.defaultExt === "pdf" ? "application/pdf" : "image/png";
      let ext = item.defaultExt;

      const header = rawVal.slice(0, 50).toLowerCase();
      if (header.includes("application/pdf")) {
        mimeType = "application/pdf";
        ext = "pdf";
      } else if (header.includes("image/webp")) {
        mimeType = "image/webp";
        ext = "webp";
      } else if (
        header.includes("image/jpeg") ||
        header.includes("image/jpg")
      ) {
        mimeType = "image/jpeg";
        ext = "jpg";
      } else if (header.includes("image/png")) {
        mimeType = "image/png";
        ext = "png";
      }

      const fileName = formatTaskFilename(applicantName, ext, item.label);

      await uploadSingleFileToDrive({
        folderName: item.folderName,
        fileName,
        base64Data: rawVal,
        mimeType,
        applicantName,
        applicantEmail,
      });
    }
  }
}
