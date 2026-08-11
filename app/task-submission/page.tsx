"use client";

import { useState, useRef, useEffect } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { uploadFileFromClientToDrive } from "@/lib/google-drive";
import { formatTaskFilename } from "@/lib/filename";

const ROLES = [
  "Design Team",
  "Content Team",
  "Web Team",
  "Operations Team",
  "Media Team",
  "Project Coordinator",
] as const;

type RoleName = (typeof ROLES)[number];

// SVG Icon Helper Components
function GlobeIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function PaletteIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.7-.72 1.7-1.65 0-.43-.17-.83-.44-1.14-.24-.28-.37-.64-.37-1.02 0-.85.7-1.54 1.56-1.54h1.72c3.21 0 5.83-2.62 5.83-5.83 0-4.88-4.04-8.82-10-8.82z" />
    </svg>
  );
}

function FilmIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
      <line x1="7" y1="2" x2="7" y2="22" />
      <line x1="17" y1="2" x2="17" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="2" y1="7" x2="7" y2="7" />
      <line x1="2" y1="17" x2="7" y2="17" />
      <line x1="17" y1="17" x2="22" y2="17" />
      <line x1="17" y1="7" x2="22" y2="7" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function AlertTriangleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

export default function TaskSubmissionPage() {
  const [fullName, setFullName] = useState("");
  const [classBatch, setClassBatch] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<RoleName[]>([]);

  // Role-specific task fields
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [driveUrl, setDriveUrl] = useState("");
  const [designImage, setDesignImage] = useState<string>("");
  const [designFileName, setDesignFileName] = useState<string>("");

  // Dedicated PDF states for Content, Operations, and Project Coordinator
  const [contentPdf, setContentPdf] = useState<string>("");
  const [contentPdfName, setContentPdfName] = useState<string>("");
  const [opsPdf, setOpsPdf] = useState<string>("");
  const [opsPdfName, setOpsPdfName] = useState<string>("");
  const [coordPdf, setCoordPdf] = useState<string>("");
  const [coordPdfName, setCoordPdfName] = useState<string>("");

  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [ticketCode, setTicketCode] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadEtaSeconds, setUploadEtaSeconds] = useState<number | null>(null);
  const [uploadStatusText, setUploadStatusText] =
    useState("SUBMITTING TASK...");
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (errorMsg && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [errorMsg]);

  const isWebSelected = selectedRoles.includes("Web Team");
  const isDesignSelected = selectedRoles.includes("Design Team");
  const isMediaSelected = selectedRoles.includes("Media Team");
  const isContentSelected = selectedRoles.includes("Content Team");
  const isOpsSelected = selectedRoles.includes("Operations Team");
  const isCoordSelected = selectedRoles.includes("Project Coordinator");

  const toggleRole = (role: RoleName) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const handlePdfFileProcessing = (
    file: File | null,
    setFile: (data: string) => void,
    setFileName: (name: string) => void,
    roleLabel: string,
    inputEl?: HTMLInputElement | null,
  ) => {
    if (!file) {
      setFile("");
      setFileName("");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setFile("");
      setFileName("");
      if (inputEl) inputEl.value = "";
      setErrorMsg(
        `${roleLabel} PDF file size exceeds 10MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please upload a smaller PDF file.`,
      );
      return;
    }
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      setFile("");
      setFileName("");
      if (inputEl) inputEl.value = "";
      setErrorMsg(`Please upload a valid PDF document (.pdf) for ${roleLabel}`);
      return;
    }
    setErrorMsg("");
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      setFile(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (
    file: File | null,
    inputEl?: HTMLInputElement | null,
  ) => {
    if (!file) {
      setDesignImage("");
      setDesignFileName("");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setDesignImage("");
      setDesignFileName("");
      if (inputEl) inputEl.value = "";
      setErrorMsg(
        `Image file size exceeds 10MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please upload a smaller image file.`,
      );
      return;
    }
    setErrorMsg("");
    setDesignFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1200;
        if (img.width > MAX_WIDTH) {
          const scale = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = Math.round(img.height * scale);
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        setDesignImage(canvas.toDataURL("image/webp", 0.8));
      };
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!fullName.trim()) return setErrorMsg("Please enter your Full Name.");
    if (!classBatch.trim())
      return setErrorMsg("Please enter your Class / Batch.");
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return setErrorMsg("Please enter a valid Email Address.");
    }
    if (!phone.trim() || phone.replace(/\D/g, "").length !== 10) {
      return setErrorMsg("Please enter a valid 10-digit Phone Number.");
    }
    if (selectedRoles.length === 0) {
      return setErrorMsg(
        "Please select at least one Role you are applying for.",
      );
    }

    // Role-specific task validation
    if (isWebSelected) {
      if (!githubUrl.trim())
        return setErrorMsg("Web Team applicants must provide a GitHub Link.");
      if (!liveUrl.trim())
        return setErrorMsg(
          "Web Team applicants must provide a Live Website Link.",
        );
    }
    if (isDesignSelected && !designImage) {
      return setErrorMsg(
        "Design Team applicants must upload a Design Task Image.",
      );
    }
    if (isMediaSelected && !driveUrl.trim()) {
      return setErrorMsg(
        "Media Team applicants must provide a Google Drive / Cloud Link.",
      );
    }
    if (isContentSelected && !contentPdf) {
      return setErrorMsg(
        "Content Team applicants must upload a Content Team Task PDF.",
      );
    }
    if (isOpsSelected && !opsPdf) {
      return setErrorMsg(
        "Operations Team applicants must upload an Operations Team Task PDF.",
      );
    }
    if (isCoordSelected && !coordPdf) {
      return setErrorMsg(
        "Project Coordinator applicants must upload a Project Coordinator Task PDF.",
      );
    }

    setSubmitting(true);
    setUploadProgress(0);
    setUploadEtaSeconds(null);
    setUploadStatusText("PREPARING ATTACHMENTS...");

    let finalDesignImg = designImage;
    let finalContentPdf = contentPdf;
    let finalOpsPdf = opsPdf;
    let finalCoordPdf = coordPdf;

    const CHUNK_SIZE = 1.8 * 1024 * 1024;
    const fileItems: Array<{
      id: string;
      base64: string;
      folderName:
        | "Design Team"
        | "Content Team"
        | "Operations Team"
        | "Project Coordinator";
      fileName: string;
      mimeType: string;
      onSuccess: (url: string) => void;
    }> = [];

    if (isDesignSelected && designImage.startsWith("data:")) {
      fileItems.push({
        id: "design",
        base64: designImage,
        folderName: "Design Team",
        fileName: formatTaskFilename(fullName, "png", "Design Task Image"),
        mimeType: "image/png",
        onSuccess: (url) => {
          finalDesignImg = url;
        },
      });
    }

    if (isContentSelected && contentPdf.startsWith("data:")) {
      fileItems.push({
        id: "content",
        base64: contentPdf,
        folderName: "Content Team",
        fileName: formatTaskFilename(fullName, "pdf", "Content Team Task PDF"),
        mimeType: "application/pdf",
        onSuccess: (url) => {
          finalContentPdf = url;
        },
      });
    }

    if (isOpsSelected && opsPdf.startsWith("data:")) {
      fileItems.push({
        id: "ops",
        base64: opsPdf,
        folderName: "Operations Team",
        fileName: formatTaskFilename(
          fullName,
          "pdf",
          "Operations Team Task PDF",
        ),
        mimeType: "application/pdf",
        onSuccess: (url) => {
          finalOpsPdf = url;
        },
      });
    }

    if (isCoordSelected && coordPdf.startsWith("data:")) {
      fileItems.push({
        id: "coord",
        base64: coordPdf,
        folderName: "Project Coordinator",
        fileName: formatTaskFilename(
          fullName,
          "pdf",
          "Project Coordinator Task PDF",
        ),
        mimeType: "application/pdf",
        onSuccess: (url) => {
          finalCoordPdf = url;
        },
      });
    }

    if (fileItems.length > 0) {
      let totalChunksCount = 0;
      const chunksMap = new Map<string, { processed: number; total: number }>();

      fileItems.forEach((item) => {
        const numChunks = Math.max(
          1,
          Math.ceil(item.base64.length / CHUNK_SIZE),
        );
        chunksMap.set(item.id, { processed: 0, total: numChunks });
        totalChunksCount += numChunks;
      });

      const startTime = Date.now();
      const DRIVE_OVERHEAD_PER_FILE = 8; // Google Apps Script processing overhead per file (in seconds)
      const totalDriveOverhead = fileItems.length * DRIVE_OVERHEAD_PER_FILE;

      const updateGlobalProgress = () => {
        let processedSum = 0;
        chunksMap.forEach((val) => {
          processedSum += val.processed;
        });

        const percent = Math.min(
          99,
          Math.round((processedSum / totalChunksCount) * 100),
        );
        setUploadProgress(percent);
        setUploadStatusText(`UPLOADING ATTACHMENTS (${percent}%)`);

        const elapsed = (Date.now() - startTime) / 1000;
        if (processedSum > 0 && elapsed > 0.5) {
          const avgPerChunk = elapsed / processedSum;
          const remainingChunks = totalChunksCount - processedSum;
          // Calculate remaining chunk transfer time + Google Drive Apps Script execution overhead
          const driveOverheadRemaining = Math.max(
            0,
            Math.ceil(
              (remainingChunks / totalChunksCount) * totalDriveOverhead,
            ),
          );
          const calculatedSec = Math.max(
            1,
            Math.round(avgPerChunk * remainingChunks + driveOverheadRemaining),
          );
          setUploadEtaSeconds(calculatedSec);
        }
      };

      // Smooth 1-second ticker interval to tick down ETA while waiting for Google Drive processing
      const timerInterval = setInterval(() => {
        setUploadEtaSeconds((prev) =>
          prev !== null && prev > 1 ? prev - 1 : prev,
        );
      }, 1000);

      const uploadTasks = fileItems.map((item) =>
        uploadFileFromClientToDrive(
          {
            folderName: item.folderName,
            fileName: item.fileName,
            base64Data: item.base64,
            mimeType: item.mimeType,
            applicantName: fullName.trim(),
            applicantEmail: email.trim(),
          },
          (processed, total) => {
            chunksMap.set(item.id, { processed, total });
            updateGlobalProgress();
          },
        ).then((url) => {
          if (url) item.onSuccess(url);
        }),
      );

      try {
        await Promise.all(uploadTasks);
      } catch (err) {
        console.warn("One or more Drive uploads failed:", err);
      } finally {
        clearInterval(timerInterval);
      }
    }

    setUploadProgress(100);
    setUploadStatusText("FINALIZING SUBMISSION...");
    setUploadEtaSeconds(null);

    const responsesPayload: Record<string, any> = {
      field_name: fullName.trim(),
      field_class: classBatch.trim(),
      field_email: email.trim(),
      field_phone: phone.replace(/\D/g, ""),
      field_roles: selectedRoles,
      ...(isWebSelected && {
        field_github: githubUrl.trim(),
        field_live_website: liveUrl.trim(),
      }),
      ...(isDesignSelected && { field_image: finalDesignImg }),
      ...(isMediaSelected && { field_drive: driveUrl.trim() }),
      ...(isContentSelected && { field_pdf_content: finalContentPdf }),
      ...(isOpsSelected && { field_pdf_ops: finalOpsPdf }),
      ...(isCoordSelected && { field_pdf_coord: finalCoordPdf }),
      field_pdf: finalContentPdf || finalOpsPdf || finalCoordPdf || "",
      ...(notes.trim() && { field_notes: notes.trim() }),
    };

    // Calculate approximate payload size to guard against Vercel 4.5MB payload limit
    const payloadSize = JSON.stringify(responsesPayload).length;
    if (payloadSize > 3.5 * 1024 * 1024) {
      setSubmitting(false);
      return setErrorMsg(
        "File upload to Google Drive failed or timed out. Please check your internet connection or try a smaller file.",
      );
    }

    try {
      const res = await fetch("/api/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId: "execom-task-submission",
          eventId: null,
          responses: responsesPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit task response.");
      }

      if (data.ticketCode) {
        setTicketCode(data.ticketCode);
      }
      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(
        err.message || "An unexpected error occurred. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-red-600 selection:text-white flex flex-col relative">
      <Navbar />

      {/* Grid Pattern Overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.04] z-0"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 pt-28 pb-20 relative z-10">
        {/* Header Title */}
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/10 border border-red-600/30 text-red-500 text-xs font-mono tracking-widest uppercase mb-4">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            AICE EXECOM CALL 2026
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-heading text-white uppercase mb-3">
            TASK SUBMISSION
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base max-w-xl">
            Please fill out your details, select the role(s) you are applying
            for, and attach your respective task submissions.
          </p>
        </div>

        {submitted ? (
          /* SUCCESS STATE */
          <div className="bg-[#121217] border-2 border-red-600/50 p-6 sm:p-10 shadow-[8px_8px_0px_#000000] text-center space-y-6">
            <div className="w-16 h-16 bg-red-600/20 border-2 border-red-500 text-red-500 flex items-center justify-center mx-auto text-2xl font-bold">
              <CheckIcon />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white uppercase mb-2">
                TASK SUBMITTED SUCCESSFULLY!
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base max-w-md mx-auto">
                Thank you,{" "}
                <span className="text-white font-semibold">{fullName}</span>.
                Your Execom task submission has been received for:
              </p>
              <div className="flex flex-wrap gap-2 justify-center mt-3">
                {selectedRoles.map((r) => (
                  <span
                    key={r}
                    className="px-3 py-1 bg-red-950/60 border border-red-600/40 text-red-400 text-xs font-semibold uppercase tracking-wider"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>

            {ticketCode && (
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded text-center">
                <span className="text-xs uppercase text-zinc-500 block mb-1 tracking-widest font-mono">
                  SUBMISSION REFERENCE ID
                </span>
                <span className="font-mono text-lg font-bold text-red-500 tracking-wider">
                  {ticketCode}
                </span>
              </div>
            )}

            <button
              onClick={() => {
                setSubmitted(false);
                setSelectedRoles([]);
                setFullName("");
                setClassBatch("");
                setEmail("");
                setPhone("");
                setGithubUrl("");
                setLiveUrl("");
                setDriveUrl("");
                setDesignImage("");
                setDesignFileName("");
                setContentPdf("");
                setContentPdfName("");
                setOpsPdf("");
                setOpsPdfName("");
                setCoordPdf("");
                setCoordPdfName("");
                setNotes("");
              }}
              className="inline-block px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-sm tracking-wider uppercase transition-colors"
            >
              SUBMIT ANOTHER RESPONSE
            </button>
          </div>
        ) : (
          /* FORM SUBMISSION FORM */
          <form onSubmit={handleSubmit} className="space-[#121217] space-y-6">
            {errorMsg && (
              <div
                ref={errorRef}
                className="p-4 bg-red-950/80 border-2 border-red-600 text-red-200 text-sm font-semibold flex items-center gap-3 animate-shake"
              >
                <AlertTriangleIcon />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 01. FULL NAME */}
            <div className="bg-[#121217] border border-zinc-800 p-5 sm:p-6 space-y-3">
              <label className="flex items-center text-sm sm:text-base font-bold text-white uppercase tracking-wider font-heading">
                <span className="bg-red-600 text-white font-mono px-2 py-0.5 text-xs font-bold mr-3">
                  01
                </span>
                FULL NAME <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full bg-zinc-950 border border-zinc-800 text-white px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors"
                required
              />
            </div>

            {/* 02. CLASS / BATCH */}
            <div className="bg-[#121217] border border-zinc-800 p-5 sm:p-6 space-y-3">
              <label className="flex items-center text-sm sm:text-base font-bold text-white uppercase tracking-wider font-heading">
                <span className="bg-red-600 text-white font-mono px-2 py-0.5 text-xs font-bold mr-3">
                  02
                </span>
                CLASS / BATCH <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={classBatch}
                onChange={(e) => setClassBatch(e.target.value)}
                placeholder="e.g. CSA 2026, ECA, EEE B"
                className="w-full bg-zinc-950 border border-zinc-800 text-white px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors"
                required
              />
            </div>

            {/* 03. EMAIL ADDRESS */}
            <div className="bg-[#121217] border border-zinc-800 p-5 sm:p-6 space-y-3">
              <label className="flex items-center text-sm sm:text-base font-bold text-white uppercase tracking-wider font-heading">
                <span className="bg-red-600 text-white font-mono px-2 py-0.5 text-xs font-bold mr-3">
                  03
                </span>
                EMAIL ADDRESS <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-zinc-950 border border-zinc-800 text-white px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors"
                required
              />
            </div>

            {/* 04. PHONE NUMBER */}
            <div className="bg-[#121217] border border-zinc-800 p-5 sm:p-6 space-y-3">
              <label className="flex items-center text-sm sm:text-base font-bold text-white uppercase tracking-wider font-heading">
                <span className="bg-red-600 text-white font-mono px-2 py-0.5 text-xs font-bold mr-3">
                  04
                </span>
                PHONE NUMBER <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                placeholder="10-digit mobile number"
                className="w-full bg-zinc-950 border border-zinc-800 text-white px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors"
                required
              />
            </div>

            {/* 05. ROLE(S) APPLIED */}
            <div className="bg-[#121217] border border-zinc-800 p-5 sm:p-6 space-y-4">
              <label className="flex items-center text-sm sm:text-base font-bold text-white uppercase tracking-wider font-heading">
                <span className="bg-red-600 text-white font-mono px-2 py-0.5 text-xs font-bold mr-3">
                  05
                </span>
                ROLE(S) APPLIED: <span className="text-red-500 ml-1">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ROLES.map((role) => {
                  const isChecked = selectedRoles.includes(role);
                  return (
                    <label
                      key={role}
                      onClick={() => toggleRole(role)}
                      className={`flex items-center gap-3 p-4 border cursor-pointer transition-all ${
                        isChecked
                          ? "bg-zinc-900 border-red-600 shadow-[0_0_12px_rgba(255,32,32,0.25)]"
                          : "bg-black/60 border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 border flex items-center justify-center transition-colors ${
                          isChecked
                            ? "bg-red-600 border-red-500 text-white"
                            : "bg-zinc-950 border-zinc-700"
                        }`}
                      >
                        {isChecked && (
                          <svg
                            className="w-3.5 h-3.5 fill-current"
                            viewBox="0 0 20 20"
                          >
                            <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-white uppercase tracking-wide">
                        {role}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* DYNAMIC TASK SUBMISSION SECTIONS BASED ON ROLE SELECTION */}
            {selectedRoles.length === 0 ? (
              <div className="bg-[#121217]/50 border border-dashed border-zinc-800 p-6 text-center text-zinc-500 text-sm flex items-center justify-center gap-2">
                <InfoIcon />
                <span>
                  Select one or more roles above to reveal task submission
                  fields.
                </span>
              </div>
            ) : (
              <div className="space-y-6 pt-2">
                <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                  <span className="text-xs font-mono text-red-500 uppercase tracking-widest font-bold">
                    [TASK SUBMISSIONS FOR SELECTED ROLES]
                  </span>
                </div>

                {/* WEB TEAM FIELDS */}
                {isWebSelected && (
                  <div className="bg-[#121217] border border-zinc-800 p-5 sm:p-6 space-y-4">
                    <div className="text-xs font-mono bg-red-950/60 text-red-400 border border-red-800/40 px-2.5 py-1 inline-flex items-center gap-2 uppercase font-bold">
                      <GlobeIcon />
                      <span>Web Team Task Requirements</span>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center text-sm font-bold text-white uppercase tracking-wider font-heading">
                        <span className="bg-red-600 text-white font-mono px-2 py-0.5 text-xs font-bold mr-3">
                          06A
                        </span>
                        GITHUB LINK <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="url"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/your-username/your-repo"
                        className="w-full bg-zinc-950 border border-zinc-800 text-white px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors"
                        required={isWebSelected}
                      />
                    </div>

                    <div className="space-y-3 pt-2">
                      <label className="flex items-center text-sm font-bold text-white uppercase tracking-wider font-heading">
                        <span className="bg-red-600 text-white font-mono px-2 py-0.5 text-xs font-bold mr-3">
                          06B
                        </span>
                        LIVE WEBSITE LINK{" "}
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="url"
                        value={liveUrl}
                        onChange={(e) => setLiveUrl(e.target.value)}
                        placeholder="https://your-project.vercel.app"
                        className="w-full bg-zinc-950 border border-zinc-800 text-white px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors"
                        required={isWebSelected}
                      />
                    </div>
                  </div>
                )}

                {/* DESIGN TEAM FIELDS */}
                {isDesignSelected && (
                  <div className="bg-[#121217] border border-zinc-800 p-5 sm:p-6 space-y-3">
                    <div className="text-xs font-mono bg-red-950/60 text-red-400 border border-red-800/40 px-2.5 py-1 inline-flex items-center gap-2 uppercase font-bold">
                      <PaletteIcon />
                      <span>Design Team Task Requirements</span>
                    </div>
                    <label className="flex items-center text-sm font-bold text-white uppercase tracking-wider font-heading">
                      <span className="bg-red-600 text-white font-mono px-2 py-0.5 text-xs font-bold mr-3">
                        07
                      </span>
                      DESIGN TASK IMAGE / PORTFOLIO{" "}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <p className="text-xs text-zinc-400">
                      Upload an image file of your design task (PNG, JPG, WebP -
                      Max 10MB).
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleImageUpload(e.target.files?.[0] || null, e.target)
                      }
                      className="w-full text-xs text-zinc-400 file:mr-4 file:py-2.5 file:px-4 file:border-0 file:text-xs file:font-bold file:uppercase file:bg-red-600 file:text-white hover:file:bg-red-500 cursor-pointer bg-zinc-950 p-2 border border-zinc-800"
                      required={isDesignSelected && !designImage}
                    />
                    {designFileName && (
                      <div className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 mt-2">
                        <span className="truncate max-w-[80%] font-mono flex items-center gap-2">
                          <ImageIcon />
                          <span>{designFileName}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setDesignImage("");
                            setDesignFileName("");
                          }}
                          className="text-red-500 hover:text-red-400 text-xs font-bold uppercase"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* MEDIA TEAM FIELDS */}
                {isMediaSelected && (
                  <div className="bg-[#121217] border border-zinc-800 p-5 sm:p-6 space-y-3">
                    <div className="text-xs font-mono bg-red-950/60 text-red-400 border border-red-800/40 px-2.5 py-1 inline-flex items-center gap-2 uppercase font-bold">
                      <FilmIcon />
                      <span>Media Team Task Requirements</span>
                    </div>
                    <label className="flex items-center text-sm font-bold text-white uppercase tracking-wider font-heading">
                      <span className="bg-red-600 text-white font-mono px-2 py-0.5 text-xs font-bold mr-3">
                        08
                      </span>
                      GOOGLE DRIVE LINK{" "}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <p className="text-xs text-zinc-400">
                      Provide a Google Drive link containing your media
                      files/videos (Ensure link sharing is turned ON).
                    </p>
                    <input
                      type="url"
                      value={driveUrl}
                      onChange={(e) => setDriveUrl(e.target.value)}
                      placeholder="https://drive.google.com/drive/folders/..."
                      className="w-full bg-zinc-950 border border-zinc-800 text-white px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors"
                      required={isMediaSelected}
                    />
                  </div>
                )}

                {/* CONTENT TEAM PDF FIELD */}
                {isContentSelected && (
                  <div className="bg-[#121217] border border-zinc-800 p-5 sm:p-6 space-y-3">
                    <div className="text-xs font-mono bg-red-950/60 text-red-400 border border-red-800/40 px-2.5 py-1 inline-flex items-center gap-2 uppercase font-bold">
                      <DocumentIcon />
                      <span>Content Team Task PDF</span>
                    </div>
                    <label className="flex items-center text-sm font-bold text-white uppercase tracking-wider font-heading">
                      <span className="bg-red-600 text-white font-mono px-2 py-0.5 text-xs font-bold mr-3">
                        09A
                      </span>
                      CONTENT TASK PDF UPLOAD{" "}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <p className="text-xs text-zinc-400">
                      Upload your Content Team task document in PDF format (Max
                      10MB).
                    </p>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) =>
                        handlePdfFileProcessing(
                          e.target.files?.[0] || null,
                          setContentPdf,
                          setContentPdfName,
                          "Content Team",
                          e.target,
                        )
                      }
                      className="w-full text-xs text-zinc-400 file:mr-4 file:py-2.5 file:px-4 file:border-0 file:text-xs file:font-bold file:uppercase file:bg-red-600 file:text-white hover:file:bg-red-500 cursor-pointer bg-zinc-950 p-2 border border-zinc-800"
                      required={isContentSelected && !contentPdf}
                    />
                    {contentPdfName && (
                      <div className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 mt-2">
                        <span className="truncate max-w-[80%] font-mono flex items-center gap-2">
                          <DocumentIcon />
                          <span>{contentPdfName}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setContentPdf("");
                            setContentPdfName("");
                          }}
                          className="text-red-500 hover:text-red-400 text-xs font-bold uppercase"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* OPERATIONS TEAM PDF FIELD */}
                {isOpsSelected && (
                  <div className="bg-[#121217] border border-zinc-800 p-5 sm:p-6 space-y-3">
                    <div className="text-xs font-mono bg-red-950/60 text-red-400 border border-red-800/40 px-2.5 py-1 inline-flex items-center gap-2 uppercase font-bold">
                      <DocumentIcon />
                      <span>Operations Team Task PDF</span>
                    </div>
                    <label className="flex items-center text-sm font-bold text-white uppercase tracking-wider font-heading">
                      <span className="bg-red-600 text-white font-mono px-2 py-0.5 text-xs font-bold mr-3">
                        09B
                      </span>
                      OPERATIONS TASK PDF UPLOAD{" "}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <p className="text-xs text-zinc-400">
                      Upload your Operations Team task document in PDF format
                      (Max 10MB).
                    </p>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) =>
                        handlePdfFileProcessing(
                          e.target.files?.[0] || null,
                          setOpsPdf,
                          setOpsPdfName,
                          "Operations Team",
                          e.target,
                        )
                      }
                      className="w-full text-xs text-zinc-400 file:mr-4 file:py-2.5 file:px-4 file:border-0 file:text-xs file:font-bold file:uppercase file:bg-red-600 file:text-white hover:file:bg-red-500 cursor-pointer bg-zinc-950 p-2 border border-zinc-800"
                      required={isOpsSelected && !opsPdf}
                    />
                    {opsPdfName && (
                      <div className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 mt-2">
                        <span className="truncate max-w-[80%] font-mono flex items-center gap-2">
                          <DocumentIcon />
                          <span>{opsPdfName}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setOpsPdf("");
                            setOpsPdfName("");
                          }}
                          className="text-red-500 hover:text-red-400 text-xs font-bold uppercase"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* PROJECT COORDINATOR PDF FIELD */}
                {isCoordSelected && (
                  <div className="bg-[#121217] border border-zinc-800 p-5 sm:p-6 space-y-3">
                    <div className="text-xs font-mono bg-red-950/60 text-red-400 border border-red-800/40 px-2.5 py-1 inline-flex items-center gap-2 uppercase font-bold">
                      <DocumentIcon />
                      <span>Project Coordinator Task PDF</span>
                    </div>
                    <label className="flex items-center text-sm font-bold text-white uppercase tracking-wider font-heading">
                      <span className="bg-red-600 text-white font-mono px-2 py-0.5 text-xs font-bold mr-3">
                        09C
                      </span>
                      PROJECT COORDINATOR TASK PDF UPLOAD{" "}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <p className="text-xs text-zinc-400">
                      Upload your Project Coordinator task document in PDF
                      format (Max 10MB).
                    </p>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) =>
                        handlePdfFileProcessing(
                          e.target.files?.[0] || null,
                          setCoordPdf,
                          setCoordPdfName,
                          "Project Coordinator",
                          e.target,
                        )
                      }
                      className="w-full text-xs text-zinc-400 file:mr-4 file:py-2.5 file:px-4 file:border-0 file:text-xs file:font-bold file:uppercase file:bg-red-600 file:text-white hover:file:bg-red-500 cursor-pointer bg-zinc-950 p-2 border border-zinc-800"
                      required={isCoordSelected && !coordPdf}
                    />
                    {coordPdfName && (
                      <div className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 mt-2">
                        <span className="truncate max-w-[80%] font-mono flex items-center gap-2">
                          <DocumentIcon />
                          <span>{coordPdfName}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setCoordPdf("");
                            setCoordPdfName("");
                          }}
                          className="text-red-500 hover:text-red-400 text-xs font-bold uppercase"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* ADDITIONAL NOTES / COMMENTS */}
                <div className="bg-[#121217] border border-zinc-800 p-5 sm:p-6 space-y-3">
                  <label className="flex items-center text-sm font-bold text-white uppercase tracking-wider font-heading">
                    <span className="bg-zinc-800 text-zinc-300 font-mono px-2 py-0.5 text-xs font-bold mr-3">
                      10
                    </span>
                    ADDITIONAL NOTES / COMMENTS
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional context, references, or instructions for the reviewers..."
                    rows={3}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors resize-y"
                  />
                </div>
              </div>
            )}

            {/* SUBMIT BUTTON WITH REAL-TIME PROGRESS BAR & ETA */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full relative overflow-hidden bg-red-600 hover:bg-red-500 disabled:bg-zinc-900 disabled:text-zinc-400 text-white font-extrabold text-base tracking-wider uppercase transition-all shadow-[4px_4px_0px_#000000] border-2 border-red-600 disabled:border-zinc-800"
              >
                {submitting ? (
                  <div className="relative w-full py-4 min-h-[64px] flex flex-col items-center justify-center">
                    {/* Dynamic Progress Fill Bar */}
                    <div
                      className="absolute inset-0 bg-red-800 transition-all duration-300 ease-out z-0"
                      style={{ width: `${uploadProgress}%` }}
                    />
                    <div className="relative z-10 flex flex-col items-center justify-center px-4">
                      <div className="flex items-center gap-2.5 text-white font-black text-sm sm:text-base tracking-wider uppercase font-heading drop-shadow">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                        <span>{uploadStatusText}</span>
                      </div>
                      {uploadEtaSeconds !== null && (
                        <div className="text-[11px] font-mono text-zinc-200 font-bold tracking-widest uppercase mt-1 drop-shadow">
                          <span>
                            Estimated Time Remaining: {uploadEtaSeconds}seconds
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-4 flex items-center justify-center gap-2">
                    SUBMIT TASK RESPONSE →
                  </div>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      <Footer />
    </main>
  );
}
