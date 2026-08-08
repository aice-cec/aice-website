"use client";

import Image from "next/image";

interface AdminHeaderProps {
  activeSection: "events" | "redirects" | "forms";
  setActiveSection: (sec: "events" | "redirects" | "forms") => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  handleExportJSON: () => void;
  handleImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePublishChanges: () => void;
  handleLogout: () => void;
}

function CalendarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function FormIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  );
}

function ImportIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function AdminHeader({
  activeSection,
  setActiveSection,
  mobileMenuOpen,
  setMobileMenuOpen,
  handleExportJSON,
  handleImportJSON,
  handlePublishChanges,
  handleLogout,
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#121217]/90 backdrop-blur-md border-b border-white/10 px-4 md:px-6 py-3 md:py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 md:w-9 md:h-9 flex-shrink-0">
            <Image
              src="/logos/aice_logo.png"
              alt="AICE logo"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-extrabold tracking-tight text-white leading-tight">
              AICE PR Admin
            </h1>
            <p className="text-[11px] text-gray-400 hidden sm:block">
              Portal Management & Live Sync
            </p>
          </div>
        </div>

        {/* Desktop Section Switcher Navigation */}
        <div className="hidden md:flex items-center p-1 bg-black/40 border border-white/10 rounded-xl">
          <button
            onClick={() => setActiveSection("events")}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeSection === "events"
                ? "bg-red-600 text-white shadow-md"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <CalendarIcon /> Events
          </button>
          <button
            onClick={() => setActiveSection("redirects")}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeSection === "redirects"
                ? "bg-red-600 text-white shadow-md"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <LinkIcon /> Redirect URLs
          </button>
          <button
            onClick={() => setActiveSection("forms")}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeSection === "forms"
                ? "bg-red-600 text-white shadow-md"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <FormIcon /> Custom Forms
          </button>
        </div>

        {/* Desktop Right Action Buttons */}
        <div className="hidden md:flex items-center gap-2.5">
          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-200 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
            title={`Export ${activeSection}.json`}
          >
            <ExportIcon /> Export
          </button>

          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-200 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 cursor-pointer transition-colors">
            <ImportIcon /> Import
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>

          <button
            onClick={handlePublishChanges}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-md"
          >
            <SendIcon /> Save Changes
          </button>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-lg transition-colors"
          >
            <LogoutIcon /> Logout
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-gray-300 hover:text-white bg-white/5 border border-white/10 rounded-lg"
        >
          {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile Expanded Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden pt-3 mt-3 border-t border-white/10 flex flex-col gap-2">
          <div className="grid grid-cols-3 gap-1 p-1 bg-black/40 border border-white/10 rounded-xl mb-2">
            <button
              onClick={() => {
                setActiveSection("events");
                setMobileMenuOpen(false);
              }}
              className={`py-2 text-xs font-bold rounded-lg text-center ${
                activeSection === "events"
                  ? "bg-red-600 text-white"
                  : "text-gray-400"
              }`}
            >
              Events
            </button>
            <button
              onClick={() => {
                setActiveSection("redirects");
                setMobileMenuOpen(false);
              }}
              className={`py-2 text-xs font-bold rounded-lg text-center ${
                activeSection === "redirects"
                  ? "bg-red-600 text-white"
                  : "text-gray-400"
              }`}
            >
              Redirects
            </button>
            <button
              onClick={() => {
                setActiveSection("forms");
                setMobileMenuOpen(false);
              }}
              className={`py-2 text-xs font-bold rounded-lg text-center ${
                activeSection === "forms"
                  ? "bg-red-600 text-white"
                  : "text-gray-400"
              }`}
            >
              Forms
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handlePublishChanges}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-emerald-600 rounded-lg"
            >
              <SendIcon /> Save Changes
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg"
            >
              <LogoutIcon /> Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
