"use client";

import { useState, useEffect, useCallback } from "react";
import { FormPaymentItem } from "../types";

interface FormPaymentsSectionProps {
  showToast: (text: string, isError?: boolean) => void;
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function CrossIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ZoomIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

export function FormPaymentsSection({ showToast }: FormPaymentsSectionProps) {
  const [payments, setPayments] = useState<FormPaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({ totalCount: 0, pendingCount: 0, approvedCount: 0, rejectedCount: 0, totalRevenue: 0 });

  // Screenshot preview
  const [activeScreenshot, setActiveScreenshot] = useState<string | null>(null);

  // Approve modal
  const [approveItem, setApproveItem] = useState<FormPaymentItem | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  // Reject modal
  const [rejectItem, setRejectItem] = useState<FormPaymentItem | null>(null);
  const [rejectReason, setRejectReason] = useState("Payment could not be verified with the provided transaction reference.");
  const [isRejecting, setIsRejecting] = useState(false);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/form-payments");
      const data = await res.json();
      if (res.ok && data.payments) {
        setPayments(data.payments);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch form payments:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const filtered = payments.filter((item) => {
    if (statusFilter !== "ALL" && item.payment_status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.submitter_name?.toLowerCase().includes(q) ||
        item.submitter_email?.toLowerCase().includes(q) ||
        item.transaction_id?.toLowerCase().includes(q) ||
        item.form_title?.toLowerCase().includes(q) ||
        item.membership_id_used?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleApprove = async () => {
    if (!approveItem) return;
    setIsApproving(true);
    try {
      const res = await fetch(`/api/admin/form-payments/${approveItem.id}/approve`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to approve payment", true);
        return;
      }
      showToast(data.message || "Payment approved!");
      setApproveItem(null);
      await fetchPayments();
    } catch (err: any) {
      showToast(err?.message || "Approval failed", true);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectItem) return;
    setIsRejecting(true);
    try {
      const res = await fetch(`/api/admin/form-payments/${rejectItem.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to reject payment", true);
        return;
      }
      showToast("Payment rejected.");
      setRejectItem(null);
      await fetchPayments();
    } catch (err: any) {
      showToast(err?.message || "Rejection failed", true);
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            Form Payment Verification
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Verify payment proofs submitted through registration forms.
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="p-4 md:p-5 bg-[#121217] border border-white/10 rounded-xl hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] md:text-xs font-bold tracking-wider text-gray-400 uppercase font-mono">Revenue</span>
            <span className="p-1 md:p-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md text-[10px] font-mono font-bold">INR</span>
          </div>
          <div className="mt-2 md:mt-3">
            <span className="text-2xl md:text-3xl font-black text-white font-mono tracking-tight">₹{stats.totalRevenue.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="p-4 md:p-5 bg-[#121217] border border-white/10 rounded-xl hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] md:text-xs font-bold tracking-wider text-gray-400 uppercase font-mono">Pending</span>
            {stats.pendingCount > 0 && (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
              </span>
            )}
          </div>
          <div className="mt-2 md:mt-3">
            <span className="text-2xl md:text-3xl font-black text-amber-400 font-mono tracking-tight">{stats.pendingCount}</span>
            <span className="text-[10px] md:text-xs text-gray-400 font-mono ml-1.5">review</span>
          </div>
        </div>

        <div className="p-4 md:p-5 bg-[#121217] border border-white/10 rounded-xl hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] md:text-xs font-bold tracking-wider text-gray-400 uppercase font-mono">Approved</span>
          </div>
          <div className="mt-2 md:mt-3">
            <span className="text-2xl md:text-3xl font-black text-emerald-400 font-mono tracking-tight">{stats.approvedCount}</span>
          </div>
        </div>

        <div className="p-4 md:p-5 bg-[#121217] border border-white/10 rounded-xl hover:border-red-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] md:text-xs font-bold tracking-wider text-gray-400 uppercase font-mono">Rejected</span>
          </div>
          <div className="mt-2 md:mt-3">
            <span className="text-2xl md:text-3xl font-black text-red-400 font-mono tracking-tight">{stats.rejectedCount}</span>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="p-3.5 md:p-4 bg-[#121217] border border-white/10 rounded-xl space-y-3">
        <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
          <div className="flex items-center gap-1 p-1 bg-black/40 border border-white/10 rounded-lg overflow-x-auto">
            {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((tab) => (
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
                {tab === "ALL" ? `ALL (${stats.totalCount})`
                  : tab === "PENDING" ? `PENDING (${stats.pendingCount})`
                  : tab === "APPROVED" ? `APPROVED (${stats.approvedCount})`
                  : `REJECTED (${stats.rejectedCount})`}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => { fetchPayments(); showToast("Refreshed form payments!"); }}
            disabled={loading}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={loading ? "animate-spin" : ""}>
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            Refresh
          </button>
        </div>

        <div className="pt-2 border-t border-white/5">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Name, Email, Transaction ID, Form..."
              className="w-full pl-8 pr-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
            />
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-2.5 top-2.5 text-gray-500">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>
      </div>

      {/* Payment Records Table */}
      <div className="bg-[#121217] border border-white/10 rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-gray-400 font-mono text-xs">Loading form payments...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-mono text-xs">No form payment records match the selected filters.</div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-black/40">
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-400 font-mono">Status</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-400 font-mono">Form</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-400 font-mono">Name</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-400 font-mono">Email</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-400 font-mono">Amount</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-400 font-mono">Tx ID</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-400 font-mono">Member</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-400 font-mono">Proof</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-400 font-mono">Date</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-400 font-mono">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded font-mono ${
                          p.payment_status === "APPROVED" ? "bg-emerald-500/20 text-emerald-400" :
                          p.payment_status === "REJECTED" ? "bg-red-500/20 text-red-400" :
                          "bg-amber-500/20 text-amber-400"
                        }`}>
                          {p.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-300 font-medium max-w-[150px] truncate" title={p.form_title}>{p.form_title}</td>
                      <td className="px-4 py-3 text-xs text-white font-bold max-w-[140px] truncate">{p.submitter_name}</td>
                      <td className="px-4 py-3 text-xs text-gray-400 font-mono max-w-[160px] truncate">{p.submitter_email}</td>
                      <td className="px-4 py-3 text-xs text-white font-black font-mono">₹{p.amount}</td>
                      <td className="px-4 py-3 text-xs text-gray-300 font-mono max-w-[120px] truncate" title={p.transaction_id}>{p.transaction_id}</td>
                      <td className="px-4 py-3">
                        {p.is_member ? (
                          <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-emerald-500/20 text-emerald-400 rounded font-mono" title={p.membership_id_used || ""}>
                            MEMBER
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-500 font-mono">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {p.screenshot_url ? (
                          <button
                            type="button"
                            onClick={() => setActiveScreenshot(p.screenshot_url!)}
                            className="px-2 py-1 bg-white/5 border border-white/10 hover:bg-white/10 rounded text-[10px] text-red-400 font-bold flex items-center gap-1 transition-colors"
                          >
                            <ZoomIcon /> View
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[10px] text-gray-400 font-mono whitespace-nowrap">
                        {p.created_at ? new Date(p.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {p.payment_status === "PENDING" ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setApproveItem(p)}
                              className="px-2 py-1 bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 rounded text-[10px] text-emerald-400 font-bold flex items-center gap-1 transition-colors"
                            >
                              <CheckIcon /> Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => { setRejectItem(p); setRejectReason("Payment could not be verified with the provided transaction reference."); }}
                              className="px-2 py-1 bg-red-500/15 border border-red-500/30 hover:bg-red-500/25 rounded text-[10px] text-red-400 font-bold flex items-center gap-1 transition-colors"
                            >
                              <CrossIcon /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-500 font-mono">
                            {p.payment_reviewed_by ? `by ${p.payment_reviewed_by}` : "—"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-white/5">
              {filtered.map((p) => (
                <div key={p.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded font-mono ${
                      p.payment_status === "APPROVED" ? "bg-emerald-500/20 text-emerald-400" :
                      p.payment_status === "REJECTED" ? "bg-red-500/20 text-red-400" :
                      "bg-amber-500/20 text-amber-400"
                    }`}>
                      {p.payment_status}
                    </span>
                    <span className="text-xs text-white font-black font-mono">₹{p.amount}</span>
                  </div>
                  <div>
                    <div className="text-xs text-white font-bold">{p.submitter_name}</div>
                    <div className="text-[10px] text-gray-400 font-mono">{p.submitter_email}</div>
                    <div className="text-[10px] text-gray-500 font-mono mt-1">{p.form_title}</div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                    <span>TX: {p.transaction_id}</span>
                    {p.is_member && <span className="px-1 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[9px] font-bold">MEMBER</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    {p.screenshot_url && (
                      <button
                        type="button"
                        onClick={() => setActiveScreenshot(p.screenshot_url!)}
                        className="px-2.5 py-1 bg-white/5 border border-white/10 hover:bg-white/10 rounded text-[10px] text-red-400 font-bold flex items-center gap-1 transition-colors"
                      >
                        <ZoomIcon /> View Proof
                      </button>
                    )}
                    {p.payment_status === "PENDING" && (
                      <>
                        <button
                          type="button"
                          onClick={() => setApproveItem(p)}
                          className="px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 rounded text-[10px] text-emerald-400 font-bold flex items-center gap-1"
                        >
                          <CheckIcon /> Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => { setRejectItem(p); setRejectReason("Payment could not be verified with the provided transaction reference."); }}
                          className="px-2.5 py-1 bg-red-500/15 border border-red-500/30 hover:bg-red-500/25 rounded text-[10px] text-red-400 font-bold flex items-center gap-1"
                        >
                          <CrossIcon /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Approve Modal */}
      {approveItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setApproveItem(null)}>
          <div className="w-full max-w-md bg-[#121217] border border-white/15 rounded-xl p-6 space-y-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-black text-white">Approve Payment?</h3>
            <div className="space-y-2 text-xs text-gray-300">
              <p><strong className="text-white">{approveItem.submitter_name}</strong> — ₹{approveItem.amount}</p>
              <p className="font-mono text-gray-400">TX: {approveItem.transaction_id}</p>
              <p className="text-gray-400">Form: {approveItem.form_title}</p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleApprove}
                disabled={isApproving}
                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors disabled:opacity-50"
              >
                {isApproving ? "Approving..." : "Confirm Approve"}
              </button>
              <button
                type="button"
                onClick={() => setApproveItem(null)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-bold text-xs rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setRejectItem(null)}>
          <div className="w-full max-w-md bg-[#121217] border border-white/15 rounded-xl p-6 space-y-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-black text-white">Reject Payment?</h3>
            <div className="space-y-2 text-xs text-gray-300">
              <p><strong className="text-white">{rejectItem.submitter_name}</strong> — ₹{rejectItem.amount}</p>
              <p className="font-mono text-gray-400">TX: {rejectItem.transaction_id}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1">Rejection Reason</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-red-500 resize-none"
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleReject}
                disabled={isRejecting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors disabled:opacity-50"
              >
                {isRejecting ? "Rejecting..." : "Confirm Reject"}
              </button>
              <button
                type="button"
                onClick={() => setRejectItem(null)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-bold text-xs rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screenshot Preview Modal */}
      {activeScreenshot && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setActiveScreenshot(null)}>
          <div className="max-w-3xl max-h-[90vh] bg-[#121217] border border-white/15 rounded-xl overflow-hidden shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-3 border-b border-white/10 bg-black/40">
              <span className="text-xs font-mono font-bold text-red-500 uppercase tracking-wider">📷 Payment Screenshot</span>
              <button
                type="button"
                onClick={() => setActiveScreenshot(null)}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-gray-200 text-xs font-bold rounded transition-colors"
              >
                ✕ Close
              </button>
            </div>
            <div className="p-4 flex-1 flex items-center justify-center overflow-auto bg-black/60 min-h-[300px]">
              <img
                src={activeScreenshot}
                alt="Payment Screenshot"
                className="max-h-[70vh] w-auto max-w-full object-contain rounded border border-white/10 shadow-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
