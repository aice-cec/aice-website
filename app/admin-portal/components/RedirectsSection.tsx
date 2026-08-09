"use client";

import { RedirectItem } from "../types";

interface RedirectsSectionProps {
  redirects: RedirectItem[];
  filteredRedirects: RedirectItem[];
  selectedRedirectId: string | null;
  redirectSearch: string;
  setRedirectSearch: (val: string) => void;
  redirectForm: RedirectItem;
  selectRedirect: (r: RedirectItem) => void;
  handleCreateNewRedirect: () => void;
  handleDeleteCurrentRedirect: () => void;
  handleRedirectInputChange: (field: keyof RedirectItem, value: string) => void;
  copyShortlinkToClipboard: (urlName: string) => void;
}

function LinkIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export function RedirectsSection({
  filteredRedirects,
  selectedRedirectId,
  redirectSearch,
  setRedirectSearch,
  redirectForm,
  selectRedirect,
  handleCreateNewRedirect,
  handleDeleteCurrentRedirect,
  handleRedirectInputChange,
  copyShortlinkToClipboard,
}: RedirectsSectionProps) {
  return (
    <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
      <aside className="flex flex-col bg-[#121217] border border-white/10 rounded-xl overflow-hidden h-fit max-h-[300px] lg:max-h-[calc(100vh-120px)] lg:sticky lg:top-24">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <LinkIcon />
            <span className="text-sm font-bold text-white">Redirect Links</span>
          </div>
          <button
            onClick={handleCreateNewRedirect}
            className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            + New Shortlink
          </button>
        </div>

        <div className="p-3 border-b border-white/10 bg-black/20">
          <input
            type="text"
            value={redirectSearch}
            onChange={(e) => setRedirectSearch(e.target.value)}
            placeholder="Filter shortlinks..."
            maxLength={100}
            className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="p-3 overflow-y-auto flex flex-col gap-2 max-h-60 lg:max-h-full">
          {filteredRedirects.length === 0 ? (
            <div className="p-4 text-xs text-center text-gray-500">
              No shortlinks found
            </div>
          ) : (
            filteredRedirects.map((item) => (
              <div
                key={item.id}
                onClick={() => selectRedirect(item)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  item.id === selectedRedirectId
                    ? "border-red-500 bg-orange-500/10"
                    : "border-white/10 bg-white/[0.02] hover:bg-white/5"
                }`}
              >
                <div className="text-sm font-bold text-white font-mono truncate mb-1">
                  /{item.url_name || "slug"}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {item.target_url || "Target URL..."}
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      <section className="flex flex-col gap-6">
        <div className="p-5 md:p-6 bg-[#121217] border border-white/10 rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-5 border-b border-white/10 gap-3">
            <div>
              <span className="text-base font-bold text-white truncate block">
                Edit Redirect URL
              </span>
              <p className="text-xs text-gray-400 truncate">
                Shortlink:{" "}
                <code className="text-red-400 font-mono">
                  aice.ceconline.edu/{redirectForm.url_name || "<url_name>"}
                </code>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => copyShortlinkToClipboard(redirectForm.url_name)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-200 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg transition-colors"
              >
                <CopyIcon /> Copy
              </button>
              {redirectForm.target_url && (
                <a
                  href={
                    redirectForm.target_url.startsWith("http")
                      ? redirectForm.target_url
                      : `https://${redirectForm.target_url}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-200 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg transition-colors"
                >
                  Test Link â†—
                </a>
              )}
              <button
                onClick={handleDeleteCurrentRedirect}
                className="px-3 py-1.5 text-xs font-semibold text-red-400 bg-orange-500/15 border border-red-500/30 hover:bg-orange-500/25 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400">
                URL Name (<code className="text-red-400">url_name</code> slug) *
              </label>
              <div className="flex items-center">
                <span className="px-2.5 sm:px-3.5 py-2.5 bg-black/60 border border-r-0 border-white/10 rounded-l-lg text-[11px] sm:text-xs text-gray-400 font-mono select-none whitespace-nowrap">
                  aice.ceconline.edu/
                </span>
                <input
                  type="text"
                  value={redirectForm.url_name}
                  onChange={(e) =>
                    handleRedirectInputChange("url_name", e.target.value)
                  }
                  placeholder="e.g. insta, workshop-reg, discord"
                  maxLength={100}
                  required
                  className="w-full min-w-0 px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-r-lg text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400">
                Destination / Redirect Link (<code className="text-red-400">target_url</code>) *
              </label>
              <input
                type="url"
                value={redirectForm.target_url}
                onChange={(e) =>
                  handleRedirectInputChange("target_url", e.target.value)
                }
                placeholder="e.g. https://forms.gle/xyz or https://instagram.com/aice_cec"
                maxLength={500}
                required
                className="w-full min-w-0 px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400">
                Description (Internal Notes)
              </label>
              <input
                type="text"
                value={redirectForm.description || ""}
                onChange={(e) =>
                  handleRedirectInputChange("description", e.target.value)
                }
                placeholder="e.g. Main Instagram Handle link, Build Night Registration Form"
                maxLength={300}
                className="w-full min-w-0 px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
