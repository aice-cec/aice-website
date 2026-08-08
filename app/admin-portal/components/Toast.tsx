"use client";

interface ToastProps {
  toastMsg: { text: string; isError?: boolean } | null;
}

export function Toast({ toastMsg }: ToastProps) {
  if (!toastMsg) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg text-xs font-semibold text-white shadow-2xl transition-all ${
        toastMsg.isError ? "bg-red-600" : "bg-emerald-600"
      }`}
    >
      {toastMsg.text}
    </div>
  );
}
