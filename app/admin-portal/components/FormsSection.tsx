"use client";

import { useState, useEffect } from "react";
import { CustomFormItem, EventItem, FormField, FormSubmission } from "../types";
import {
  SubmissionDetailModal,
  extractSubmitterName,
  formatTaskFilename,
} from "./SubmissionDetailModal";

interface FormsSectionProps {
  customForms: CustomFormItem[];
  selectedFormId: string | null;
  customFormBuilder: CustomFormItem;
  events: EventItem[];
  formSubmissions: FormSubmission[];
  setFormSubmissions: React.Dispatch<React.SetStateAction<FormSubmission[]>>;
  loadingSubmissions: boolean;
  onRefreshSubmissions: () => void;
  selectCustomForm: (cf: CustomFormItem) => void;
  handleCreateNewCustomForm: () => void;
  handleDeleteCurrentCustomForm: () => void;
  handleCustomFormInputChange: (
    field: keyof CustomFormItem,
    value: any,
  ) => void;
  handleAddField: () => void;
  handleUpdateField: (fieldId: string, updates: Partial<FormField>) => void;
  handleRemoveField: (fieldId: string) => void;
  handleMoveField: (index: number, direction: "up" | "down") => void;
  handleExportResponsesCSV: () => void;
  copyFormLinkToClipboard: (slug: string) => void;
  showToast: (text: string, isError?: boolean) => void;
}

function RefreshIcon({ className = "" }: { className?: string }) {
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
      className={className}
    >
      <path d="M23 4v6h-6" />
      <path d="M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function FormIcon() {
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
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function ExportIcon() {
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
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  );
}

function EyeImageIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function FormsSection({
  customForms,
  selectedFormId,
  customFormBuilder,
  events,
  formSubmissions,
  setFormSubmissions,
  loadingSubmissions,
  onRefreshSubmissions,
  selectCustomForm,
  handleCreateNewCustomForm,
  handleDeleteCurrentCustomForm,
  handleCustomFormInputChange,
  handleAddField,
  handleUpdateField,
  handleRemoveField,
  handleMoveField,
  handleExportResponsesCSV,
  copyFormLinkToClipboard,
  showToast,
}: FormsSectionProps) {
  const [activeSubmissionDetail, setActiveSubmissionDetail] =
    useState<FormSubmission | null>(null);
  const [previewMediaUrl, setPreviewMediaUrl] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string | null>(null);
  const [blobObjectUrl, setBlobObjectUrl] = useState<string | null>(null);

  // Convert base64 data URLs to native Blob URLs for 100% reliable PDF rendering & downloading
  useEffect(() => {
    if (!previewMediaUrl) {
      setBlobObjectUrl(null);
      setPreviewFileName(null);
      return;
    }
    if (previewMediaUrl.startsWith("data:")) {
      try {
        const parts = previewMediaUrl.split(",");
        const mimeMatch = parts[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : "application/octet-stream";
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const objectUrl = URL.createObjectURL(blob);
        setBlobObjectUrl(objectUrl);
        return () => {
          URL.revokeObjectURL(objectUrl);
        };
      } catch (err) {
        console.error("Data URL to Blob conversion failed", err);
        setBlobObjectUrl(previewMediaUrl);
      }
    } else {
      setBlobObjectUrl(previewMediaUrl);
    }
  }, [previewMediaUrl]);

  const isPdfPreview = Boolean(
    previewMediaUrl?.toLowerCase().includes("application/pdf") ||
    previewMediaUrl?.toLowerCase().endsWith(".pdf")
  );

  const getFileExtension = (targetUrl?: string) => {
    const url = targetUrl || previewMediaUrl;
    if (!url) return "file";
    if (
      url.toLowerCase().includes("application/pdf") ||
      url.toLowerCase().endsWith(".pdf")
    )
      return "pdf";
    const header = url.slice(0, 60).toLowerCase();
    if (header.includes("image/jpeg") || header.includes("image/jpg")) return "jpg";
    if (header.includes("image/webp")) return "webp";
    if (header.includes("image/png")) return "png";
    if (header.includes("image/gif")) return "gif";
    return "png";
  };

  const handleUpdateSubmission = (updated: FormSubmission) => {
    setFormSubmissions((prev) =>
      prev.map((sub) => (sub.id === updated.id ? updated : sub)),
    );
    setActiveSubmissionDetail(updated);
  };

  const handleDeleteSubmission = (id: string) => {
    setFormSubmissions((prev) => prev.filter((sub) => sub.id !== id));
    if (activeSubmissionDetail?.id === id) {
      setActiveSubmissionDetail(null);
    }
  };

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 min-w-0 pb-36">
      {/* Sidebar Forms List */}
      <aside className="flex flex-col bg-[#121217] border border-white/10 rounded-xl overflow-hidden h-fit max-h-[300px] lg:max-h-[calc(100vh-120px)] lg:sticky lg:top-24">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <FormIcon />
            <span className="text-sm font-bold text-white">Forms</span>
          </div>
          <button
            onClick={handleCreateNewCustomForm}
            className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            + New Form
          </button>
        </div>

        <div className="p-3 overflow-y-auto flex flex-col gap-2 max-h-60 lg:max-h-full">
          {customForms.length === 0 ? (
            <div className="p-4 text-xs text-center text-gray-500">
              No forms created yet
            </div>
          ) : (
            customForms.map((item) => (
              <div
                key={item.id}
                onClick={() => selectCustomForm(item)}
                className={`p-3 rounded-lg border cursor-pointer transition-all min-w-0 overflow-hidden ${
                  item.id === selectedFormId
                    ? "border-red-500 bg-red-500/10"
                    : "border-white/10 bg-white/[0.02] hover:bg-white/5"
                }`}
              >
                <div className="text-sm font-bold text-white truncate mb-1">
                  {item.title || "Untitled Form"}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400 min-w-0 gap-2">
                  <span className="font-mono text-[11px] truncate max-w-[70%]">
                    /{item.slug}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded shrink-0 ${
                      item.is_active
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {item.is_active ? "OPEN" : "CLOSED"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Form Builder Editor & Responses Table */}
      <section className="flex flex-col gap-6 min-w-0">
        {/* Form Builder Configuration Card */}
        <div className="p-5 md:p-6 bg-[#121217] border border-white/10 rounded-xl space-y-6 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-3 border-b border-white/10 gap-3 min-w-0">
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold text-white break-words leading-snug">
                Form Builder: {customFormBuilder.title}
              </h3>
              <p className="text-xs text-gray-400 break-words mt-1">
                Registration Link:{" "}
                <code className="text-red-400 font-mono break-all">
                  aice.ceconline.edu/{customFormBuilder.slug || "slug"}
                </code>
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => copyFormLinkToClipboard(customFormBuilder.slug)}
                className="px-3 py-1.5 text-xs font-semibold text-gray-200 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <CopyIcon /> Copy Form URL
              </button>
              <button
                onClick={handleDeleteCurrentCustomForm}
                className="px-3 py-1.5 text-xs font-semibold text-red-400 bg-red-500/15 border border-red-500/30 hover:bg-red-500/25 rounded-lg transition-colors"
              >
                Delete Form
              </button>
            </div>
          </div>

          {/* General Form Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-gray-400">
                Form Title * (Max 100 characters)
              </label>
              <input
                type="text"
                value={customFormBuilder.title}
                onChange={(e) =>
                  handleCustomFormInputChange(
                    "title",
                    e.target.value.slice(0, 100),
                  )
                }
                placeholder="e.g. AICE BUILD NIGHT REGISTRATION"
                maxLength={100}
                className="w-full min-w-0 px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-red-500 break-words"
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-gray-400">
                Form Description / Instructions
              </label>
              <textarea
                value={customFormBuilder.description || ""}
                onChange={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(500, Math.max(120, e.target.scrollHeight))}px`;
                  handleCustomFormInputChange("description", e.target.value);
                }}
                ref={(el) => {
                  if (el) {
                    el.style.height = "auto";
                    el.style.height = `${Math.min(500, Math.max(120, el.scrollHeight))}px`;
                  }
                }}
                placeholder="Provide event details, instructions, or venue info..."
                rows={4}
                maxLength={2000}
                className="w-full min-w-0 px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-red-500 resize-y break-words overflow-y-auto min-h-[120px] max-h-[500px] [field-sizing:content]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400">
                Form URL Slug *
              </label>
              <div className="flex items-center min-w-0">
                <span className="px-3 py-2.5 bg-black/60 border border-r-0 border-white/10 rounded-l-lg text-xs text-gray-400 font-mono select-none flex-shrink-0">
                  /
                </span>
                <input
                  type="text"
                  value={customFormBuilder.slug}
                  onChange={(e) =>
                    handleCustomFormInputChange("slug", e.target.value)
                  }
                  placeholder="e.g. aice-build-night"
                  maxLength={120}
                  className="w-full min-w-0 px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-r-lg text-sm text-white font-mono focus:outline-none focus:border-red-500 break-words"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-gray-400">
                Attach to Event
              </label>
              <select
                value={customFormBuilder.event_id || ""}
                onChange={(e) =>
                  handleCustomFormInputChange("event_id", e.target.value)
                }
                className="w-full min-w-0 px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-red-500 truncate"
              >
                <option value="">-- None (Standalone Form) --</option>
                {events.map((ev) => (
                  <option
                    key={ev.id}
                    value={ev.id}
                    className="bg-[#121217] text-white"
                  >
                    {ev.title} ({ev.dateISO})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-gray-400">
                WhatsApp Group Invite Link (Optional)
              </label>
              <input
                type="url"
                value={customFormBuilder.whatsapp_link || ""}
                onChange={(e) =>
                  handleCustomFormInputChange("whatsapp_link", e.target.value)
                }
                placeholder="https://chat.whatsapp.com/..."
                maxLength={300}
                className="w-full min-w-0 px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-red-500 break-all"
              />
              <p className="text-[11px] text-gray-500">
                Shown to attendees immediately after submitting their
                registration.
              </p>
            </div>

            <div className="md:col-span-2 pt-2">
              <label className="flex items-center gap-3 text-xs font-semibold text-gray-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={Boolean(customFormBuilder.is_active)}
                  onChange={(e) =>
                    handleCustomFormInputChange("is_active", e.target.checked)
                  }
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
                Form Status:{" "}
                <span
                  className={
                    customFormBuilder.is_active
                      ? "text-emerald-400"
                      : "text-red-400"
                  }
                >
                  {customFormBuilder.is_active
                    ? "Open for Registrations"
                    : "Registrations Closed"}
                </span>
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-3 text-xs font-semibold text-gray-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={customFormBuilder.issue_ticket !== false}
                  onChange={(e) =>
                    handleCustomFormInputChange(
                      "issue_ticket",
                      e.target.checked,
                    )
                  }
                  className="w-4 h-4 accent-red-500 rounded cursor-pointer"
                />
                Issue QR Ticket &amp; Confirmation Email
              </label>
              <p className="ml-7 mt-1 text-[11px] text-gray-500">
                Disable for forms that should save submissions without
                generating a ticket or email.
              </p>
            </div>
          </div>

          {/* Questions Field List Manager */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-white">
                Questions & Fields
              </h4>
              <button
                type="button"
                onClick={handleAddField}
                className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                + Add Question
              </button>
            </div>

            <div className="space-y-4">
              {customFormBuilder.fields.map((field, idx) => (
                <div
                  key={field.id}
                  className="p-4 bg-black/40 border border-white/10 rounded-xl space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-gray-400">
                      Question #{idx + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleMoveField(idx, "up")}
                        disabled={idx === 0}
                        className="px-2 py-1 text-xs bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 rounded text-gray-300"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveField(idx, "down")}
                        disabled={idx === customFormBuilder.fields.length - 1}
                        className="px-2 py-1 text-xs bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 rounded text-gray-300"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveField(field.id)}
                        className="px-2 py-1 text-xs bg-red-500/15 border border-red-500/30 hover:bg-red-500/25 rounded text-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                        Field Label *
                      </label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) =>
                          handleUpdateField(field.id, { label: e.target.value })
                        }
                        placeholder="Question text..."
                        maxLength={200}
                        className="w-full min-w-0 px-3 py-1.5 bg-[#121217] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-red-500 break-all"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                        Field Type
                      </label>
                      <select
                        value={field.type}
                        onChange={(e) =>
                          handleUpdateField(field.id, {
                            type: e.target.value as any,
                          })
                        }
                        className="w-full min-w-0 px-3 py-1.5 bg-[#121217] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                      >
                        <option value="text">Short Text</option>
                        <option value="email">Email Address</option>
                        <option value="phone">
                          Phone / WhatsApp (10 digits)
                        </option>
                        <option value="number">Number</option>
                        <option value="select">Dropdown Select</option>
                        <option value="radio">Single Choice (Radio)</option>
                        <option value="checkbox">
                          Multiple Choice (Checkboxes)
                        </option>
                        <option value="file">Image / Screenshot Upload</option>
                      </select>
                    </div>
                  </div>

                  {/* Dropdown / Radio / Checkbox Options List Editor */}
                  {(field.type === "select" ||
                    field.type === "radio" ||
                    field.type === "checkbox") && (
                    <div>
                      <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                        Options (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={(field.options || []).join(", ")}
                        onChange={(e) =>
                          handleUpdateField(field.id, {
                            options: e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          })
                        }
                        placeholder="Option 1, Option 2, Option 3"
                        maxLength={500}
                        className="w-full min-w-0 px-3 py-1.5 bg-[#121217] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-red-500 break-all"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) =>
                          handleUpdateField(field.id, {
                            required: e.target.checked,
                          })
                        }
                        className="w-3.5 h-3.5 accent-red-500 rounded cursor-pointer"
                      />
                      Required Field *
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form Responses Table Card */}
        <div className="p-5 md:p-6 bg-[#121217] border border-white/10 rounded-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h4 className="text-base font-bold text-white">
                Submissions ({formSubmissions.length})
              </h4>
              <p className="text-xs text-gray-400">
                Live attendee responses recorded for this form
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onRefreshSubmissions();
                  showToast("Refreshed submissions!");
                }}
                disabled={loadingSubmissions}
                className="px-2.5 py-1.5 text-xs font-semibold text-gray-200 bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-40 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-md"
                title="Reload Submissions"
              >
                <RefreshIcon
                  className={loadingSubmissions ? "animate-spin" : ""}
                />
                <span>Reload</span>
              </button>

              <button
                onClick={handleExportResponsesCSV}
                disabled={formSubmissions.length === 0}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 rounded-lg transition-colors flex items-center gap-1.5 shadow-md"
              >
                <ExportIcon /> Export CSV
              </button>
            </div>
          </div>

          {loadingSubmissions ? (
            <div className="p-8 text-center text-xs text-gray-400">
              Loading responses...
            </div>
          ) : formSubmissions.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500 border border-dashed border-white/10 rounded-xl">
              No responses submitted for this form yet.
            </div>
          ) : (
            <div className="overflow-x-auto border border-white/10 rounded-xl max-w-full">
              <table className="w-full text-left text-xs table-auto">
                <thead className="bg-black/60 text-gray-400 border-b border-white/10">
                  <tr>
                    <th className="p-3 font-semibold whitespace-nowrap">
                      Action
                    </th>
                    <th className="p-3 font-semibold whitespace-nowrap">
                      Submitted At
                    </th>
                    {customFormBuilder.fields.map((f) => (
                      <th
                        key={f.id}
                        className="p-3 font-semibold whitespace-nowrap max-w-[200px] truncate"
                        title={f.label}
                      >
                        {f.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {formSubmissions.map((sub) => {
                    const resp = sub.responses || {};
                    return (
                      <tr key={sub.id} className="hover:bg-white/[0.02]">
                        <td className="p-3 whitespace-nowrap">
                          <button
                            onClick={() => setActiveSubmissionDetail(sub)}
                            className="px-2.5 py-1 bg-white/5 border border-white/10 hover:bg-white/10 rounded text-[11px] text-red-400 font-semibold transition-colors"
                          >
                            View Details
                          </button>
                        </td>
                        <td className="p-3 text-gray-400 whitespace-nowrap font-mono">
                          {sub.created_at
                            ? new Date(sub.created_at).toLocaleString()
                            : "N/A"}
                        </td>
                        {customFormBuilder.fields.map((f) => {
                          const val = resp[f.id];
                          const displayStr = Array.isArray(val)
                            ? val.join(", ")
                            : typeof val === "string"
                              ? val
                              : val
                                ? String(val)
                                : "-";

                          return (
                            <td
                              key={f.id}
                              className="p-3 text-gray-200 max-w-[200px] truncate font-mono text-[11px]"
                              title={
                                typeof displayStr === "string" &&
                                !displayStr.startsWith("data:")
                                  ? displayStr
                                  : undefined
                              }
                            >
                              {f.type === "file" &&
                               typeof val === "string" &&
                               val.startsWith("data:") ? (
                                 <button
                                   type="button"
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     const submitterName = extractSubmitterName(
                                       sub,
                                       customFormBuilder,
                                     );
                                     const fn = formatTaskFilename(
                                       submitterName,
                                       getFileExtension(val),
                                     );
                                     setPreviewMediaUrl(val);
                                     setPreviewFileName(fn);
                                   }}
                                   className="px-2.5 py-1 bg-red-600/15 border border-red-500/30 text-red-400 hover:bg-red-600 hover:text-white rounded text-[11px] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                                 >
                                   <EyeImageIcon />
                                   <span>View File</span>
                                 </button>
                               ) : (
                                 displayStr
                               )}
                             </td>
                           );
                         })}
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
             </div>
           )}
         </div>
       </section>

       {/* Submission Details Modal */}
        <SubmissionDetailModal
          submission={activeSubmissionDetail}
          form={customFormBuilder}
          onClose={() => setActiveSubmissionDetail(null)}
          onUpdateSubmission={handleUpdateSubmission}
          onDeleteSubmission={handleDeleteSubmission}
          onPreviewMedia={(url, fileName) => {
            setPreviewMediaUrl(url);
            setPreviewFileName(fileName || null);
          }}
          showToast={showToast}
        />

        {/* In-page Lightbox Media Preview Popup with Close & Download */}
       {previewMediaUrl && (
         <div
           onClick={() => setPreviewMediaUrl(null)}
           className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
         >
           <div
             onClick={(e) => e.stopPropagation()}
             className="w-full max-w-4xl max-h-[92vh] sm:max-h-[90vh] bg-[#121217] border border-white/15 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
           >
             {/* Header */}
             <div className="flex flex-wrap sm:flex-nowrap items-center justify-between p-3 sm:p-4 border-b border-white/10 bg-black/40 gap-2">
               <div className="flex items-center gap-2">
                 <EyeImageIcon className="text-red-500 w-4 h-4" />
                 <span className="text-[11px] sm:text-xs font-mono font-bold text-red-500 uppercase tracking-wider">
                   {isPdfPreview
                     ? "📄 PDF DOCUMENT PREVIEW"
                     : "📷 IMAGE PREVIEW"}
                 </span>
               </div>
               <div className="flex items-center gap-2 sm:gap-3 ml-auto">
                 <button
                   type="button"
                   onClick={() => {
                     const a = document.createElement("a");
                     a.href = blobObjectUrl || previewMediaUrl;
                     a.download =
                       previewFileName ||
                       formatTaskFilename("user", getFileExtension());
                     document.body.appendChild(a);
                     a.click();
                     document.body.removeChild(a);
                   }}
                   className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-600 hover:bg-red-500 text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded transition-colors flex items-center gap-1.5 shadow cursor-pointer active:scale-95"
                 >
                   <svg
                     width="14"
                     height="14"
                     viewBox="0 0 24 24"
                     fill="none"
                     stroke="currentColor"
                     strokeWidth="2.5"
                     strokeLinecap="round"
                     strokeLinejoin="round"
                   >
                     <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                     <polyline points="7 10 12 15 17 10" />
                     <line x1="12" y1="15" x2="12" y2="3" />
                   </svg>
                   <span>Download</span>
                 </button>
                 <button
                   type="button"
                   onClick={() => setPreviewMediaUrl(null)}
                   className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 text-gray-200 text-[11px] sm:text-xs font-bold rounded transition-colors flex items-center gap-1 cursor-pointer active:scale-95"
                 >
                   <span>✕ Close</span>
                 </button>
               </div>
             </div>

             {/* Content Body */}
             <div className="p-3 sm:p-5 flex-1 flex items-center justify-center overflow-auto bg-black/60 min-h-[250px] sm:min-h-[350px]">
               {isPdfPreview ? (
                 <iframe
                   src={blobObjectUrl || previewMediaUrl}
                   className="w-full h-[60vh] sm:h-[68vh] rounded border border-white/10 bg-zinc-900"
                   title="PDF Document Preview"
                 />
               ) : (
                 <img
                   src={blobObjectUrl || previewMediaUrl}
                   alt="Submitted Attachment Preview"
                   className="max-h-[60vh] sm:max-h-[72vh] w-auto max-w-full object-contain rounded border border-white/10 shadow-2xl"
                 />
               )}
             </div>
           </div>
         </div>
       )}
     </main>
   );
 }
