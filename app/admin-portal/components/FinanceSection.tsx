"use client";

import { useState } from "react";
import { MembershipItem, FinanceStats } from "../types";

interface FinanceSectionProps {
  memberships: MembershipItem[];
  stats: FinanceStats;
  loading: boolean;
  onRefresh: () => void;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  showToast: (text: string, isError?: boolean) => void;
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function CrossIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      width="12"
      height="12"
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

function ZoomIcon() {
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
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function MailIcon() {
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
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

export function FinanceSection({
  memberships,
  stats,
  loading,
  onRefresh,
  onApprove,
  onReject,
  showToast,
}: FinanceSectionProps) {
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "PENDING" | "APPROVED" | "REJECTED"
  >("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");

  // Selected screenshot for preview modal
  const [activeScreenshot, setActiveScreenshot] = useState<string | null>(null);

  // Approve modal state
  const [approveModalItem, setApproveModalItem] =
    useState<MembershipItem | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  // Reject modal state
  const [rejectModalItem, setRejectModalItem] =
    useState<MembershipItem | null>(null);
  const [rejectReason, setRejectReason] = useState(
    "Payment could not be verified with the provided transaction reference.",
  );
  const [isRejecting, setIsRejecting] = useState(false);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      showToast("Copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Filter memberships
  const filtered = memberships.filter((item) => {
    if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
    if (branchFilter !== "ALL" && item.branch !== branchFilter) return false;
    if (yearFilter !== "ALL" && item.year !== yearFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.full_name?.toLowerCase().includes(q);
      const matchEmail = item.email?.toLowerCase().includes(q);
      const matchPhone = item.phone?.toLowerCase().includes(q);
      const matchTx = item.transaction_id?.toLowerCase().includes(q);
      const matchMemId = item.membership_id?.toLowerCase().includes(q);
      return matchName || matchEmail || matchPhone || matchTx || matchMemId;
    }
    return true;
  });

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      showToast("No records to export", true);
      return;
    }

    const headers = [
      "Membership ID",
      "Full Name",
      "Email",
      "Phone",
      "College",
      "Branch",
      "Year",
      "Amount",
      "Transaction ID",
      "Status",
      "Created At",
      "Reviewed At",
      "Reviewed By",
    ];

    const sanitizeCsv = (val: any) => {
      let str = String(val ?? "").replace(/"/g, '""');
      if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`;
      }
      return `"${str}"`;
    };

    const rows = filtered.map((m) => [
      sanitizeCsv(m.membership_id || "N/A"),
      sanitizeCsv(m.full_name),
      sanitizeCsv(m.email),
      sanitizeCsv(m.phone),
      sanitizeCsv(m.college),
      sanitizeCsv(m.branch),
      sanitizeCsv(m.year),
      sanitizeCsv(`₹${m.amount}`),
      sanitizeCsv(m.transaction_id),
      sanitizeCsv(m.status),
      sanitizeCsv(new Date(m.created_at).toLocaleString("en-IN")),
      sanitizeCsv(m.reviewed_at ? new Date(m.reviewed_at).toLocaleString("en-IN") : "N/A"),
      sanitizeCsv(m.reviewed_by || "N/A"),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `aice-memberships-${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Exported CSV successfully!");
  };

  const confirmApprove = async () => {
    if (!approveModalItem) return;
    setIsApproving(true);
    try {
      await onApprove(approveModalItem.id);
      setApproveModalItem(null);
    } finally {
      setIsApproving(false);
    }
  };

  const confirmReject = async () => {
    if (!rejectModalItem) return;
    setIsRejecting(true);
    try {
      await onReject(rejectModalItem.id, rejectReason);
      setRejectModalItem(null);
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Metric Cards - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Total Revenue */}
        <div className="p-4 md:p-5 bg-[#121217] border border-white/10 rounded-xl relative overflow-hidden group hover:border-red-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] md:text-xs font-bold tracking-wider text-gray-400 uppercase font-mono">
              Total Revenue
            </span>
            <span className="p-1 md:p-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md text-[10px] font-mono font-bold">
              INR
            </span>
          </div>
          <div className="mt-2 md:mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl md:text-3xl font-black text-white font-mono tracking-tight">
              ₹{stats.totalRevenue.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="p-4 md:p-5 bg-[#121217] border border-white/10 rounded-xl relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] md:text-xs font-bold tracking-wider text-gray-400 uppercase font-mono">
              Pending
            </span>
            {stats.pendingCount > 0 ? (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
            ) : (
              <span className="p-1 bg-gray-500/10 text-gray-400 rounded text-[10px] font-mono">
                0
              </span>
            )}
          </div>
          <div className="mt-2 md:mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl md:text-3xl font-black text-amber-400 font-mono tracking-tight">
              {stats.pendingCount}
            </span>
            <span className="text-[10px] md:text-xs text-gray-400 font-mono">
              review
            </span>
          </div>
        </div>

        {/* Approved Members */}
        <div className="p-4 md:p-5 bg-[#121217] border border-white/10 rounded-xl relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] md:text-xs font-bold tracking-wider text-gray-400 uppercase font-mono">
              Active
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-400">
              Approved
            </span>
          </div>
          <div className="mt-2 md:mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl md:text-3xl font-black text-emerald-400 font-mono tracking-tight">
              {stats.approvedCount}
            </span>
            <span className="text-[10px] md:text-xs text-gray-400 font-mono">
              issued
            </span>
          </div>
        </div>

        {/* Rejected Submissions */}
        <div className="p-4 md:p-5 bg-[#121217] border border-white/10 rounded-xl relative overflow-hidden group hover:border-red-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] md:text-xs font-bold tracking-wider text-gray-400 uppercase font-mono">
              Rejected
            </span>
            <span className="text-[10px] font-mono font-bold text-red-400">
              Invalid
            </span>
          </div>
          <div className="mt-2 md:mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl md:text-3xl font-black text-red-400 font-mono tracking-tight">
              {stats.rejectedCount}
            </span>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Actions */}
      <div className="p-3.5 md:p-4 bg-[#121217] border border-white/10 rounded-xl space-y-3">
        <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-black/40 border border-white/10 rounded-lg overflow-x-auto">
            {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map(
              (tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`px-2.5 md:px-3 py-1.5 rounded-md text-[11px] font-bold font-mono transition-all whitespace-nowrap ${
                    statusFilter === tab
                      ? "bg-red-600 text-white shadow"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab === "ALL"
                    ? `ALL (${stats.totalCount})`
                    : tab === "PENDING"
                      ? `PENDING (${stats.pendingCount})`
                      : tab === "APPROVED"
                        ? `APPROVED (${stats.approvedCount})`
                        : `REJECTED (${stats.rejectedCount})`}
                </button>
              ),
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="flex-1 md:flex-initial px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={loading ? "animate-spin" : ""}
              >
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              Refresh
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="flex-1 md:flex-initial px-3.5 py-1.5 bg-emerald-600/80 hover:bg-emerald-600 border border-emerald-500/30 text-white rounded-lg text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-colors shadow-md"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        {/* Search and Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-white/5">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Name, Email, UTR..."
              className="w-full pl-8 pr-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
            />
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="absolute left-2.5 top-2.5 text-gray-500"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-red-500 transition-colors"
          >
            <option value="ALL">All Branches</option>
            <option value="CL">CSE(AI/ML) (CL)</option>
            <option value="CS">Computer Science (CS)</option>
            <option value="EC">Electronics & Comm. (EC)</option>
            <option value="EEE">Electrical & Electronics (EEE)</option>
          </select>

          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-red-500 transition-colors"
          >
            <option value="ALL">All Years</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
          </select>
        </div>
      </div>

      {/* Submissions Content: Desktop Table + Mobile Cards */}
      <div className="bg-[#121217] border border-white/10 rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-gray-400 font-mono text-xs">
            Loading membership submissions...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-mono text-xs">
            No membership registrations match the selected filters.
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE VIEW */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/60 border-b border-white/10 text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4 min-w-[200px]">Applicant</th>
                    <th className="py-3.5 px-4">Branch / Year</th>
                    <th className="py-3.5 px-4 min-w-[160px]">UTR / Ref No</th>
                    <th className="py-3.5 px-4 text-center">Receipt Proof</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Submitted</th>
                    <th className="py-3.5 px-4 text-right min-w-[150px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs font-sans">
                  {filtered.map((item) => {
                    const isApproved = item.status === "APPROVED";
                    const isRejected = item.status === "REJECTED";
                    const isPending = item.status === "PENDING";

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        {/* Applicant Details */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-white tracking-tight">
                            {item.full_name}
                          </div>
                          <div className="text-[11px] text-gray-400 font-mono flex items-center gap-1 mt-0.5">
                            <span>{item.email}</span>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(item.email, `email-${item.id}`)
                              }
                              className="text-gray-500 hover:text-white"
                              title="Copy email"
                            >
                              {copiedId === `email-${item.id}` ? (
                                <CheckIcon className="text-emerald-400" />
                              ) : (
                                <CopyIcon />
                              )}
                            </button>
                          </div>
                          <div className="text-[11px] text-gray-500 font-mono">
                            {item.phone}
                          </div>
                        </td>

                        {/* Branch & Year */}
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[11px] font-mono font-bold text-white">
                            {item.branch}
                          </span>
                          <div className="text-[11px] text-gray-400 mt-1">
                            {item.year}
                          </div>
                        </td>

                        {/* Transaction ID / UTR */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                              {item.transaction_id}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(item.transaction_id, item.id)
                              }
                              className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors text-xs"
                              title="Copy UTR for bank lookup"
                            >
                              {copiedId === item.id ? (
                                <CheckIcon className="text-emerald-400" />
                              ) : (
                                <CopyIcon />
                              )}
                            </button>
                          </div>
                          <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                            ₹{item.amount || 100} INR
                          </div>
                        </td>

                        {/* Screenshot Proof */}
                        <td className="py-3 px-4 text-center">
                          {item.screenshot_url ? (
                            <button
                              type="button"
                              onClick={() =>
                                setActiveScreenshot(item.screenshot_url || null)
                              }
                              className="relative group inline-block rounded-lg overflow-hidden border border-white/20 hover:border-red-500 transition-colors shadow-sm"
                              title="Click to view full receipt"
                            >
                              <img
                                src={item.screenshot_url}
                                alt="Receipt proof thumbnail"
                                className="w-12 h-12 object-cover object-center group-hover:scale-105 transition-transform"
                              />
                              <span className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs">
                                <ZoomIcon />
                              </span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-gray-500 font-mono">
                              No proof
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          {isPending && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-[11px] font-mono font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                              PENDING
                            </span>
                          )}
                          {isApproved && (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[11px] font-mono font-bold">
                                <CheckIcon /> APPROVED
                              </span>
                              {item.membership_id && (
                                <div className="text-[10px] font-mono text-gray-400 mt-1">
                                  ID:{" "}
                                  <strong className="text-white">
                                    {item.membership_id}
                                  </strong>
                                </div>
                              )}
                            </div>
                          )}
                          {isRejected && (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-[11px] font-mono font-bold">
                                <CrossIcon /> REJECTED
                              </span>
                              {item.rejection_reason && (
                                <div
                                  className="text-[10px] text-gray-400 mt-1 max-w-[12rem] truncate"
                                  title={item.rejection_reason}
                                >
                                  {item.rejection_reason}
                                </div>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Date */}
                        <td className="py-3 px-4 text-gray-400 font-mono text-[11px]">
                          {new Date(item.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isPending && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setApproveModalItem(item)}
                                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-mono font-bold transition-colors shadow-sm"
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRejectModalItem(item);
                                    setRejectReason(
                                      "Payment could not be verified with the provided transaction reference.",
                                    );
                                  }}
                                  className="px-2.5 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-lg text-[11px] font-mono font-bold transition-colors"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {isApproved && (
                              <a
                                href={`/membership/status?id=${encodeURIComponent(
                                  item.membership_id || item.id,
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded text-[11px] font-mono"
                              >
                                View Pass <ExternalLinkIcon />
                              </a>
                            )}

                            {isRejected && (
                              <button
                                type="button"
                                onClick={() => setApproveModalItem(item)}
                                className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded text-[11px] font-mono"
                              >
                                Re-Approve
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARD VIEW (Optimized for phones/tablets) */}
            <div className="block md:hidden divide-y divide-white/10">
              {filtered.map((item) => {
                const isApproved = item.status === "APPROVED";
                const isRejected = item.status === "REJECTED";
                const isPending = item.status === "PENDING";

                return (
                  <div key={item.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-white text-sm">
                          {item.full_name}
                        </div>
                        <div className="text-xs text-gray-400 font-mono mt-0.5">
                          {item.branch} • {item.year}
                        </div>
                        <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                          {item.email}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-[10px] font-mono font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            PENDING
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-mono font-bold">
                            <CheckIcon /> APPROVED
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-[10px] font-mono font-bold">
                            <CrossIcon /> REJECTED
                          </span>
                        )}
                      </div>
                    </div>

                    {/* UTR and Receipt Row */}
                    <div className="flex items-center justify-between p-2.5 bg-black/40 border border-white/5 rounded-lg text-xs font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400 text-[10px]">UTR:</span>
                        <span className="text-red-400 font-bold font-mono">
                          {item.transaction_id}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.transaction_id, item.id)}
                          className="p-1 text-gray-400 hover:text-white"
                        >
                          {copiedId === item.id ? (
                            <CheckIcon className="text-emerald-400" />
                          ) : (
                            <CopyIcon />
                          )}
                        </button>
                      </div>

                      {item.screenshot_url && (
                        <button
                          type="button"
                          onClick={() => setActiveScreenshot(item.screenshot_url || null)}
                          className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:underline"
                        >
                          <ZoomIcon /> Receipt
                        </button>
                      )}
                    </div>

                    {/* Mobile Action Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      {isPending && (
                        <>
                          <button
                            type="button"
                            onClick={() => setApproveModalItem(item)}
                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold transition-colors shadow-sm"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRejectModalItem(item);
                              setRejectReason(
                                "Payment could not be verified with the provided transaction reference.",
                              );
                            }}
                            className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-lg text-xs font-mono font-bold transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {isApproved && (
                        <a
                          href={`/membership/status?id=${encodeURIComponent(
                            item.membership_id || item.id,
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-1.5 text-center bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-lg text-xs font-mono inline-flex items-center justify-center gap-1"
                        >
                          View Pass <ExternalLinkIcon />
                        </a>
                      )}

                      {isRejected && (
                        <button
                          type="button"
                          onClick={() => setApproveModalItem(item)}
                          className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-lg text-xs font-mono"
                        >
                          Re-Approve
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* MODAL: Fullscreen Screenshot Preview */}
      {activeScreenshot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setActiveScreenshot(null)}
        >
          <div
            className="max-w-2xl w-full bg-[#121217] border border-white/20 rounded-2xl overflow-hidden shadow-2xl p-4 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Payment Screenshot Receipt
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={activeScreenshot}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded text-xs text-white font-mono inline-flex items-center gap-1"
                >
                  Open Original <ExternalLinkIcon />
                </a>
                <button
                  type="button"
                  onClick={() => setActiveScreenshot(null)}
                  className="p-1 text-gray-400 hover:text-white"
                >
                  <CrossIcon />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center bg-black/60 rounded-xl p-2">
              <img
                src={activeScreenshot}
                alt="Full Payment Receipt"
                className="max-w-full h-auto object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Confirm Approve */}
      {approveModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/85 backdrop-blur-sm">
          <div className="max-w-md w-full bg-[#121217] border border-emerald-500/30 rounded-2xl p-5 md:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xl mb-4 font-bold">
              <CheckIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">
              Approve Membership Registration?
            </h3>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              You are approving the registration for{" "}
              <strong className="text-white">
                {approveModalItem.full_name}
              </strong>{" "}
              ({approveModalItem.branch} • {approveModalItem.year}).
            </p>

            <div className="my-4 p-3 bg-black/40 border border-white/10 rounded-xl space-y-1 font-mono text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Transaction Ref:</span>
                <span className="text-red-400 font-bold">
                  {approveModalItem.transaction_id}
                </span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Email:</span>
                <span className="text-white">{approveModalItem.email}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Fee:</span>
                <span className="text-emerald-400">
                  ₹{approveModalItem.amount || 100}
                </span>
              </div>
            </div>

            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs font-mono mb-4 flex items-center gap-2">
              <MailIcon />
              <span>
                On approval, an official AICE digital membership card will be dispatched via email.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setApproveModalItem(null)}
                disabled={isApproving}
                className="flex-1 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg text-xs font-bold font-mono transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmApprove}
                disabled={isApproving}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold font-mono transition-colors shadow-lg"
              >
                {isApproving ? "Approving & Sending..." : "Confirm & Send Card"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Confirm Reject */}
      {rejectModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/85 backdrop-blur-sm">
          <div className="max-w-md w-full bg-[#121217] border border-red-500/30 rounded-2xl p-5 md:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center text-xl mb-4 font-bold">
              <CrossIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">
              Reject Membership Submission
            </h3>
            <p className="text-xs text-gray-400 mt-2">
              Rejecting submission for{" "}
              <strong className="text-white">
                {rejectModalItem.full_name}
              </strong>{" "}
              (Ref: {rejectModalItem.transaction_id}).
            </p>

            <div className="mt-4 mb-4">
              <label className="text-xs font-mono font-bold text-gray-400 uppercase block mb-1.5">
                Reason for Rejection:
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="w-full p-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-red-500 transition-colors"
                placeholder="e.g. UTR number does not match bank record..."
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRejectModalItem(null)}
                disabled={isRejecting}
                className="flex-1 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg text-xs font-bold font-mono transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmReject}
                disabled={isRejecting}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold font-mono transition-colors shadow-lg"
              >
                {isRejecting ? "Rejecting..." : "Reject Submission"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
