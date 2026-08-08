"use client";

import { useState, useEffect } from "react";
import { CustomFormItem, FormSubmission } from "../types";

interface SubmissionDetailModalProps {
  submission: FormSubmission | null;
  form: CustomFormItem;
  onClose: () => void;
  onUpdateSubmission: (updated: FormSubmission) => void;
  onDeleteSubmission: (id: string) => void;
  showToast: (text: string, isError?: boolean) => void;
}

const TOKEN_KEY = "aice_admin_token";

export function SubmissionDetailModal({
  submission,
  form,
  onClose,
  onUpdateSubmission,
  onDeleteSubmission,
  showToast,
}: SubmissionDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editResponses, setEditResponses] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (submission) {
      setEditResponses(submission.responses || {});
      setIsEditing(false);
      setErrorMsg("");
    }
  }, [submission]);

  if (!submission) return null;

  const handleFieldValueChange = (fieldId: string, value: any, fieldType?: string) => {
    let finalVal = value;
    if (fieldType === "phone" && typeof value === "string") {
      finalVal = value.replace(/\D/g, "").slice(0, 10);
    }
    setEditResponses((prev) => ({ ...prev, [fieldId]: finalVal }));
  };

  const handleSave = async () => {
    setErrorMsg("");
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) {
      showToast("Session expired. Please log in again.", true);
      return;
    }

    // Validation check
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^\d{10}$/;

    for (const field of form.fields) {
      const val = editResponses[field.id];
      if (val && typeof val === "string") {
        const isEmailField = field.type === "email" || field.label.toLowerCase().includes("email");
        const isPhoneField = field.type === "phone" || field.label.toLowerCase().includes("phone") || field.label.toLowerCase().includes("whatsapp") || field.label.toLowerCase().includes("mobile");

        if (isEmailField && !emailRegex.test(val.trim())) {
          setErrorMsg(`Please enter a valid email address with domain extension (e.g. name@gmail.com) for "${field.label}"`);
          return;
        }

        if (isPhoneField) {
          const cleanPhone = val.replace(/\D/g, "");
          if (!phoneRegex.test(cleanPhone)) {
            setErrorMsg(`"${field.label}" must be exactly 10 digits.`);
            return;
          }
        }
      }
    }

    setSaving(true);

    try {
      const res = await fetch("/api/forms/responses", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify({
          id: submission.id,
          responses: editResponses,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update submission");
      }

      const updatedSub: FormSubmission = {
        ...submission,
        responses: editResponses,
      };

      onUpdateSubmission(updatedSub);
      setIsEditing(false);
      showToast("Submission updated successfully!");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this submission permanently?")) {
      return;
    }

    const token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) {
      showToast("Session expired. Please log in again.", true);
      return;
    }

    try {
      const res = await fetch(`/api/forms/responses?id=${submission.id}`, {
        method: "DELETE",
        headers: {
          "x-admin-token": token,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete submission");
      }

      onDeleteSubmission(submission.id);
      showToast("Submission deleted!");
      onClose();
    } catch (err: any) {
      showToast(err.message || "Failed to delete", true);
    }
  };

  const currentResponses = submission.responses || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070709]/85 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#121217] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                {isEditing ? "Edit Submission Response" : "Submission Details"}
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-white/10 text-gray-300 rounded">
                {isEditing ? "EDIT MODE" : "VIEW MODE"}
              </span>
            </div>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              ID: {submission.id} • {submission.created_at ? new Date(submission.created_at).toLocaleString() : "N/A"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                ✏️ Edit Submission
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditResponses(submission.responses || {});
                  setErrorMsg("");
                }}
                className="px-3 py-1.5 text-xs font-semibold text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg transition-colors"
              >
                Cancel Edit
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-4 divide-y divide-white/5">
          {errorMsg && (
            <div className="p-3 text-xs font-bold text-center text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg">
              ⚠️ {errorMsg}
            </div>
          )}

          {form.fields.map((f, idx) => {
            const val = isEditing ? editResponses[f.id] : currentResponses[f.id];
            return (
              <div key={f.id} className={idx === 0 ? "" : "pt-4"}>
                <label className="text-xs font-bold text-red-400 mb-1 block">
                  {f.label}{" "}
                  <span className="text-gray-500 font-normal">({f.type})</span>
                  {f.required && <span className="text-red-500"> *</span>}
                </label>

                {!isEditing ? (
                  <div className="text-sm text-gray-200 bg-black/40 p-3 rounded-lg border border-white/5 break-words whitespace-pre-wrap font-mono">
                    {f.type === "file" && typeof val === "string" && val.startsWith("data:") ? (
                      <div className="space-y-2">
                        <a
                          href={val}
                          target="_blank"
                          rel="noreferrer"
                          className="text-red-400 underline font-semibold block"
                        >
                          Open Full Image ↗
                        </a>
                        <img src={val} alt="Uploaded file" className="max-h-48 rounded border border-white/10 object-contain" />
                      </div>
                    ) : Array.isArray(val) ? (
                      val.join(", ")
                    ) : (
                      val || "-"
                    )}
                  </div>
                ) : (
                  <div className="mt-1">
                    {/* Editable Controls */}
                    {(f.type === "text" || f.type === "email" || f.type === "phone" || f.type === "number") && (
                      <input
                        type={f.type === "phone" ? "tel" : f.type}
                        value={val || ""}
                        onChange={(e) => handleFieldValueChange(f.id, e.target.value, f.type)}
                        maxLength={f.type === "phone" ? 10 : f.type === "email" ? 100 : 250}
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-red-500"
                      />
                    )}

                    {f.type === "select" && (
                      <select
                        value={val || ""}
                        onChange={(e) => handleFieldValueChange(f.id, e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-red-500"
                      >
                        <option value="">-- Select Option --</option>
                        {(f.options || []).map((opt) => (
                          <option key={opt} value={opt} className="bg-[#121217]">
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}

                    {f.type === "radio" && (
                      <div className="space-y-1.5 pt-1">
                        {(f.options || []).map((opt) => (
                          <label key={opt} className="flex items-center gap-2 text-xs text-gray-200 cursor-pointer">
                            <input
                              type="radio"
                              name={`edit_${f.id}`}
                              value={opt}
                              checked={val === opt}
                              onChange={(e) => handleFieldValueChange(f.id, e.target.value)}
                              className="accent-red-500"
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    )}

                    {f.type === "checkbox" && (
                      <div className="space-y-1.5 pt-1">
                        {(f.options || []).map((opt) => {
                          const currentArr: string[] = Array.isArray(val) ? val : [];
                          return (
                            <label key={opt} className="flex items-center gap-2 text-xs text-gray-200 cursor-pointer">
                              <input
                                type="checkbox"
                                value={opt}
                                checked={currentArr.includes(opt)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    handleFieldValueChange(f.id, [...currentArr, opt]);
                                  } else {
                                    handleFieldValueChange(
                                      f.id,
                                      currentArr.filter((item) => item !== opt)
                                    );
                                  }
                                }}
                                className="accent-red-500"
                              />
                              {opt}
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {f.type === "file" && (
                      <input
                        type="text"
                        value={val || ""}
                        onChange={(e) => handleFieldValueChange(f.id, e.target.value)}
                        placeholder="Image URL or Base64 string..."
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-red-500"
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={handleDelete}
            className="px-3.5 py-2 text-xs font-semibold text-red-400 bg-red-500/15 border border-red-500/30 hover:bg-red-500/25 rounded-lg transition-colors"
          >
            Delete Submission
          </button>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg transition-colors shadow-md"
              >
                {saving ? "Saving..." : "Save Submission Changes"}
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
