"use client";

interface UnsavedChangesBarProps {
  isEventsDirty: boolean;
  isRedirectsDirty: boolean;
  isFormsDirty: boolean;
  handleDiscardChanges: () => void;
  handlePublishChanges: () => void;
}

export function UnsavedChangesBar({
  isEventsDirty,
  isRedirectsDirty,
  isFormsDirty,
  handleDiscardChanges,
  handlePublishChanges,
}: UnsavedChangesBarProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between gap-6 px-5 py-3 bg-[#121217]/95 backdrop-blur-md border border-red-500/40 rounded-xl shadow-2xl max-sm:w-[calc(100%-2rem)] max-sm:flex-col max-sm:gap-3">
      <div className="flex items-center gap-2.5 text-xs font-semibold text-white">
        <span className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_#ef4444]" />
        You have unsaved changes in {isEventsDirty ? "Events" : ""}
        {isEventsDirty && isRedirectsDirty ? " & " : ""}
        {isRedirectsDirty ? "Redirect URLs" : ""}
        {(isEventsDirty || isRedirectsDirty) && isFormsDirty ? " & " : ""}
        {isFormsDirty ? "Custom Forms" : ""}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleDiscardChanges}
          className="px-3 py-1.5 text-xs font-semibold text-red-400 bg-red-500/15 border border-red-500/30 hover:bg-red-500/25 rounded-lg transition-colors"
        >
          Discard
        </button>
        <button
          onClick={handlePublishChanges}
          className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-md"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
