"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";

export interface FormField {
  id: string;
  label: string;
  type:
    | "text"
    | "email"
    | "phone"
    | "number"
    | "select"
    | "radio"
    | "checkbox"
    | "file";
  placeholder?: string;
  required: boolean;
  options?: string[];
}

export interface CustomFormItem {
  id: string;
  slug: string;
  event_id?: string;
  title: string;
  description?: string;
  whatsapp_link?: string;
  fields: FormField[];
  is_active: boolean;
  issue_ticket?: boolean;
  created_at?: string;
}

function WhatsAppIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.197 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.05 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function BanIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export default function CustomFormRender({ form }: { form: CustomFormItem }) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [filePreviews, setFilePreviews] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketCode, setTicketCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const submittingRef = useRef(false);
  const errorRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to error message when it appears
  useEffect(() => {
    if (errorMsg && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [errorMsg]);

  const handleInputChange = (fieldId: string, value: any, fieldType?: string) => {
    let finalVal = value;
    if (fieldType === "phone" && typeof value === "string") {
      finalVal = value.replace(/\D/g, "").slice(0, 10);
    }
    setFormData((prev) => ({ ...prev, [fieldId]: finalVal }));
  };

  const handleCheckboxChange = (
    fieldId: string,
    option: string,
    checked: boolean,
  ) => {
    setFormData((prev) => {
      const currentList: string[] = Array.isArray(prev[fieldId])
        ? prev[fieldId]
        : [];
      if (checked) {
        return { ...prev, [fieldId]: [...currentList, option] };
      } else {
        return {
          ...prev,
          [fieldId]: currentList.filter((item) => item !== option),
        };
      }
    });
  };

  // Image Screenshot Compression to lightweight base64/URL
  const handleFileUpload = (fieldId: string, file: File | null) => {
    if (!file) {
      setFilePreviews((prev) => ({ ...prev, [fieldId]: "" }));
      setFormData((prev) => ({ ...prev, [fieldId]: "" }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("File size must be under 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;

        // Only scale down, never up â€” preserve aspect ratio
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

        const compressedDataUrl = canvas.toDataURL("image/webp", 0.7);
        setFilePreviews((prev) => ({ ...prev, [fieldId]: compressedDataUrl }));
        setFormData((prev) => ({ ...prev, [fieldId]: compressedDataUrl }));
      };
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ref-based guard prevents double-submit from fast double-clicks
    if (submittingRef.current) return;
    submittingRef.current = true;
    setErrorMsg("");

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^\d{10}$/;

    // Validate required fields & format
    for (const field of form.fields) {
      const val = formData[field.id];

      if (field.required) {
        if (
          val === undefined ||
          val === null ||
          val === "" ||
          (Array.isArray(val) && val.length === 0)
        ) {
          setErrorMsg(`Please fill out the required field: "${field.label}"`);
          submittingRef.current = false;
          return;
        }
      }

      if (val && typeof val === "string") {
        const isEmailField = field.type === "email" || field.label.toLowerCase().includes("email");
        const isPhoneField = field.type === "phone" || field.label.toLowerCase().includes("phone") || field.label.toLowerCase().includes("whatsapp") || field.label.toLowerCase().includes("mobile");

        if (isEmailField && !emailRegex.test(val.trim())) {
          setErrorMsg(`Please enter a valid email address with domain extension (e.g. name@gmail.com) for "${field.label}"`);
          submittingRef.current = false;
          return;
        }

        if (isPhoneField) {
          const cleanPhone = val.replace(/\D/g, "");
          if (!phoneRegex.test(cleanPhone)) {
            setErrorMsg(`"${field.label}" must be exactly 10 digits.`);
            submittingRef.current = false;
            return;
          }
        }
      }
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId: form.id,
          eventId: form.event_id || null,
          responses: formData,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit registration");
      }

      if (data.ticketCode) {
        setTicketCode(data.ticketCode);
      }
      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
      submittingRef.current = false;
    }
  };

  // Render Closed Notice if form is not active
  if (!form.is_active) {
    return (
      <div className="min-h-screen bg-[#070709] text-gray-100 font-sans flex items-center justify-center p-4 relative overflow-hidden">
        {/* Dark Grid Overlay Background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20 z-0"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />

        <div className="w-full max-w-lg p-8 sm:p-10 bg-[#121217] border-2 border-white/20 shadow-[8px_8px_0px_#000000] text-center relative z-10">
          <div className="w-14 h-14 bg-orange-500/15 border-2 border-red-500/30 text-red-500 flex items-center justify-center mx-auto mb-5 shadow-[3px_3px_0px_#000000]">
            <BanIcon />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-2 font-mono">
            {form.title}
          </h1>
          <p className="text-sm font-medium text-gray-400 mb-8">
            Registrations for this event have been officially closed.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_#000000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
          >
            Return to AICE Homepage <ArrowRightIcon />
          </a>
        </div>
      </div>
    );
  }

  // Render Submitted Confirmation Screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#070709] text-gray-100 font-sans flex items-center justify-center p-4 relative overflow-hidden">
        {/* Dark Grid Overlay Background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20 z-0"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />

        <div className="w-full max-w-lg p-8 sm:p-10 bg-[#121217] border-2 border-white/20 shadow-[8px_8px_0px_#000000] text-center relative z-10">
          <div className="w-16 h-16 bg-emerald-500/15 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_#000000]">
            <CheckCircleIcon />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-2">
            Registration Confirmed!
          </h1>
          <p className="text-xs font-medium text-gray-300 mb-6">
            {form.issue_ticket !== false
              ? "Your QR code pass and confirmation ticket have been sent to your email address."
              : "Your registration has been submitted successfully."}
          </p>

          {ticketCode && (
            <div className="p-5 mb-6 bg-[#000000] border-2 border-white/20 shadow-[4px_4px_0px_#000000] text-center space-y-3">
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 font-mono">
                SCAN AT DESK FOR ENTRY
              </div>
              <div className="inline-block p-3 bg-white border-2 border-black shadow-[4px_4px_0px_#000000] mx-auto">
                <QRCodeSVG
                  value={ticketCode}
                  size={160}
                  level="H"
                />
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-red-500 font-mono pt-1">
                PASS IDENTIFIER
              </div>
              <div className="max-w-full break-all text-lg font-black font-mono text-white tracking-[0.12em] sm:text-2xl sm:tracking-widest">
                {ticketCode}
              </div>
            </div>
          )}

          {form.whatsapp_link && (
            <div className="p-5 mb-6 bg-emerald-500/10 border-2 border-emerald-500/30 shadow-[4px_4px_0px_#000000] text-center space-y-3">
              <div className="text-xs font-black uppercase tracking-wider text-emerald-400 font-mono">
                OFFICIAL EVENT WHATSAPP GROUP
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-medium">
                Join the official group for live announcements, workshop
                updates, and team discussions!
              </p>
              <a
                href={
                  form.whatsapp_link.startsWith("http")
                    ? form.whatsapp_link
                    : `https://${form.whatsapp_link}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 bg-[#059669] hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_#000000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-2.5 w-full cursor-pointer"
              >
                <WhatsAppIcon /> Join WhatsApp Group
              </a>
            </div>
          )}
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({});
                setFilePreviews({});
              }}
              className="px-5 py-3 bg-white/5 hover:bg-white/10 border-2 border-white/20 text-white font-extrabold text-xs uppercase tracking-wider shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
            >
              Submit Another Response
            </button>
            <a
              href="/"
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Done <ArrowRightIcon />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070709] text-gray-100 font-sans flex flex-col justify-between py-8 px-4 sm:px-6 relative">
      {/* Dark Grid Pattern Background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20 z-0"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Top Header Branding Bar */}
      <header className="w-full max-w-3xl mx-auto flex items-center justify-between py-4 mb-6 border-b-2 border-white/15 z-10">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 flex-shrink-0">
            <Image
              src="/logos/aice_logo.png"
              alt="AICE logo"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <div className="text-[40px] font-black uppercase tracking-widest text-red-500 font-mono">
              FORMS
            </div>
          </div>
        </div>
      </header>

      {/* Main Neo-Brutalist Dark Paper Form Container */}
      <main className="w-full max-w-3xl mx-auto bg-[#121217] border-2 border-white/15 shadow-[8px_8px_0px_#000000] p-6 sm:p-10 z-10 min-w-0 overflow-hidden">
        {/* Form Title & Subtitle */}
        <div className="border-b-2 border-white/15 pb-6 mb-8 min-w-0">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white leading-tight mb-3 break-words overflow-wrap-anywhere">
            {form.title}
          </h1>
          {form.description && (
            <p className="text-xs sm:text-sm text-gray-300 font-medium leading-relaxed break-words">
              {form.description}
            </p>
          )}
        </div>

        {/* Dynamic Fields Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {form.fields.map((field, idx) => {
            const stepNum = String(idx + 1).padStart(2, "0");
            return (
              <div key={field.id} className="space-y-2">
                {/* Numbered Section Header */}
                <div className="flex items-center gap-2.5 pb-1 border-b border-white/10 min-w-0">
                  <span className="px-2 py-0.5 bg-red-600 text-white font-mono font-black text-xs shrink-0">
                    {stepNum}
                  </span>
                  <label className="font-extrabold text-gray-200 font-mono text-xs uppercase tracking-widest break-words break-all min-w-0">
                    {field.label}{" "}
                    {field.required && <span className="text-red-500">*</span>}
                  </label>
                </div>

                {/* Text / Email / Phone / Number Inputs */}
                {(field.type === "text" ||
                  field.type === "email" ||
                  field.type === "phone" ||
                  field.type === "number") && (
                  <input
                    type={field.type === "phone" ? "tel" : field.type}
                    value={formData[field.id] || ""}
                    onChange={(e) =>
                      handleInputChange(field.id, e.target.value, field.type)
                    }
                    maxLength={
                      field.type === "phone"
                        ? 15
                        : field.type === "email"
                        ? 100
                        : field.type === "number"
                        ? 20
                        : 250
                    }
                    inputMode={field.type === "phone" || field.type === "number" ? "numeric" : undefined}
                    pattern={field.type === "phone" ? "[0-9]{10}" : undefined}
                    placeholder={
                      field.placeholder ||
                      (field.type === "phone"
                        ? "e.g. 9876543210 (10 digits)"
                        : `e.g. Enter ${field.label.toLowerCase()}`)
                    }
                    required={field.required}
                    className="w-full min-w-0 px-4 py-3 bg-[#070709] border-2 border-white/15 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:border-red-500 transition-colors rounded-none break-all"
                  />
                )}

                {/* Select Dropdown */}
                {field.type === "select" && (
                  <select
                    value={formData[field.id] || ""}
                    onChange={(e) =>
                      handleInputChange(field.id, e.target.value)
                    }
                    required={field.required}
                    className="w-full min-w-0 px-4 py-3 bg-[#070709] border-2 border-white/15 text-sm text-white focus:outline-none focus:border-red-500 transition-colors cursor-pointer rounded-none break-all"
                  >
                    <option
                      value=""
                      disabled
                      className="bg-[#121217] text-gray-400"
                    >
                      -- Select Option --
                    </option>
                    {(field.options || []).map((opt) => (
                      <option
                        key={opt}
                        value={opt}
                        className="bg-[#121217] text-white"
                      >
                        {opt}
                      </option>
                    ))}
                  </select>
                )}

                {/* Radio Buttons */}
                {field.type === "radio" && (
                  <div className="space-y-2 pt-1">
                    {(field.options || []).map((opt) => (
                      <label
                        key={opt}
                        className="flex items-center gap-3 p-3 bg-[#070709] border-2 border-white/15 text-xs font-bold text-gray-200 cursor-pointer select-none hover:bg-white/5 transition-colors break-words break-all min-w-0"
                      >
                        <input
                          type="radio"
                          name={field.id}
                          value={opt}
                          checked={formData[field.id] === opt}
                          onChange={(e) =>
                            handleInputChange(field.id, e.target.value)
                          }
                          required={field.required}
                          className="w-4 h-4 accent-red-500 cursor-pointer shrink-0"
                        />
                        <span className="break-words break-all min-w-0">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Checkboxes */}
                {field.type === "checkbox" && (
                  <div className="space-y-2 pt-1">
                    {(field.options || []).map((opt) => {
                      const checkedList: string[] = Array.isArray(
                        formData[field.id],
                      )
                        ? formData[field.id]
                        : [];
                      return (
                        <label
                          key={opt}
                          className="flex items-center gap-3 p-3 bg-[#070709] border-2 border-white/15 text-xs font-bold text-gray-200 cursor-pointer select-none hover:bg-white/5 transition-colors break-words break-all min-w-0"
                        >
                          <input
                            type="checkbox"
                            value={opt}
                            checked={checkedList.includes(opt)}
                            onChange={(e) =>
                              handleCheckboxChange(
                                field.id,
                                opt,
                                e.target.checked,
                              )
                            }
                            className="w-4 h-4 accent-red-500 rounded-none cursor-pointer shrink-0"
                          />
                          <span className="break-words break-all min-w-0">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* File / Screenshot Upload */}
                {field.type === "file" && (
                  <div className="space-y-3 pt-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileUpload(field.id, e.target.files?.[0] || null)
                      }
                      required={field.required && !formData[field.id]}
                      className="block w-full text-xs text-gray-300 border-2 border-white/15 bg-[#070709] p-2 file:mr-4 file:py-2 file:px-4 file:border-2 file:border-black file:text-xs file:font-black file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer"
                    />
                    {filePreviews[field.id] && (
                      <div className="relative w-40 h-40 border-2 border-white/15 overflow-hidden bg-black shadow-[4px_4px_0px_#000000]">
                        <img
                          src={filePreviews[field.id]}
                          alt="Upload preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {errorMsg && (
            <div ref={errorRef} className="p-3 text-xs font-bold text-center text-red-400 bg-orange-500/10 border-2 border-red-500/30 shadow-[3px_3px_0px_#000000]">
              âš ï¸ {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black text-sm uppercase tracking-widest border-2 border-black shadow-[5px_5px_0px_#000000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer mt-4"
          >
            {submitting ? "Submitting Registration..." : "Submit Registration"}
          </button>
        </form>
      </main>

      <footer className="text-center text-xs text-gray-500 font-mono font-bold pt-8 z-10">
        Â© {new Date().getFullYear()} AICE CEC.
      </footer>
    </div>
  );
}
