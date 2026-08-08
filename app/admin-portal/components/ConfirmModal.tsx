"use client";

interface ConfirmModalProps {
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmModal({
  show,
  title,
  message,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070709]/85 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 bg-[#121217] border border-white/10 rounded-2xl shadow-2xl">
        <div className="text-lg font-extrabold text-white mb-2">{title}</div>
        <p className="text-xs text-gray-400 mb-5">{message}</p>
        <div className="flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
