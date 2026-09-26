"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import styles from "./Attendance.module.css";

// ---- Types ----
interface VolunteerInfo {
  id: string;
  name: string;
  role: string;
  team: string;
}

interface AttendanceRecord {
  id: string;
  ticket_code: string;
  event_id: string;
  attendee_name: string;
  attendee_email: string;
  checked_in_by: string;
  checked_in_at: string;
}

interface ScanResult {
  type: "success" | "duplicate" | "error";
  title: string;
  detail: string;
}

interface EventOption {
  id: string;
  title: string;
}

// ---- SVG Icons ----
function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function QrScanIcon({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="3" height="3" />
      <line x1="21" y1="14" x2="21" y2="14.01" />
      <line x1="21" y1="21" x2="21" y2="21.01" />
      <line x1="17" y1="17" x2="17" y2="21" />
      <line x1="21" y1="17" x2="21" y2="17.01" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function AlertCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function XCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="15" y2="16" />
    </svg>
  );
}

// ---- Helpers ----
function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// ---- Main Page Component ----
export default function AttendancePage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [volunteer, setVolunteer] = useState<VolunteerInfo | null>(null);
  const [loginName, setLoginName] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Page state
  const [activeTab, setActiveTab] = useState<"scan" | "sheet">("scan");
  const [events, setEvents] = useState<EventOption[]>([]);
  const [selectedEvent, setSelectedEvent] = useState("");

  // Scanner state
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const scannerRef = useRef<any>(null);
  const scannerContainerId = "attendance-qr-reader";
  const lastScannedRef = useRef<string>("");
  const scanCooldownRef = useRef<boolean>(false);

  // Records state
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [totalCheckedIn, setTotalCheckedIn] = useState(0);

  // ---- Check existing session on mount ----
  useEffect(() => {
    fetch("/api/attendance/login")
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated && data.volunteer) {
          setIsAuthenticated(true);
          setVolunteer(data.volunteer);
        }
      })
      .catch(() => {})
      .finally(() => setSessionChecked(true));
  }, []);

  // ---- Load events ----
  useEffect(() => {
    if (!isAuthenticated) return;
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => {
        const evts: EventOption[] = (data || [])
          .filter((e: any) => !e.isPast)
          .map((e: any) => ({ id: e.id, title: e.title }));
        setEvents(evts);
        if (evts.length > 0 && !selectedEvent) {
          setSelectedEvent(evts[0].id);
        }
      })
      .catch(() => {});
  }, [isAuthenticated]);

  // ---- Load records when event changes or tab switches ----
  const fetchRecords = useCallback(async () => {
    if (!selectedEvent || !isAuthenticated) return;
    setLoadingRecords(true);
    try {
      const res = await fetch(
        `/api/attendance/records?eventId=${encodeURIComponent(selectedEvent)}`,
      );
      const data = await res.json();
      if (data.records) {
        setRecords(data.records);
        setTotalCheckedIn(data.total || 0);
      }
    } catch {
      // silent
    } finally {
      setLoadingRecords(false);
    }
  }, [selectedEvent, isAuthenticated]);

  useEffect(() => {
    if (activeTab === "sheet") {
      fetchRecords();
    }
  }, [activeTab, fetchRecords]);

  // ---- Login handler ----
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const res = await fetch("/api/attendance/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: loginName, password: loginPass }),
      });

      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Invalid credentials");
        return;
      }

      setIsAuthenticated(true);
      setVolunteer(data.volunteer);
    } catch {
      setLoginError("Network error. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  // ---- Logout handler ----
  const handleLogout = async () => {
    await stopScanner();
    await fetch("/api/attendance/login", { method: "DELETE" });
    setIsAuthenticated(false);
    setVolunteer(null);
    setRecords([]);
    setTotalCheckedIn(0);
  };

  // ---- Scan a ticket code ----
  const processTicket = useCallback(
    async (code: string) => {
      if (!selectedEvent || processing) return;

      const normalised = code.trim().toUpperCase();
      if (!normalised) return;

      // Avoid rapid duplicate scans
      if (scanCooldownRef.current || lastScannedRef.current === normalised) {
        return;
      }
      lastScannedRef.current = normalised;
      scanCooldownRef.current = true;
      setTimeout(() => {
        scanCooldownRef.current = false;
      }, 3000);

      setProcessing(true);
      setScanResult(null);

      try {
        const res = await fetch("/api/attendance/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticketCode: normalised,
            eventId: selectedEvent,
          }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setScanResult({
            type: "success",
            title: `✓ ${data.attendeeName}`,
            detail: `Checked in • ${normalised}`,
          });
          setTotalCheckedIn((prev) => prev + 1);

          // Play success sound
          try {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 880;
            gain.gain.value = 0.15;
            osc.start();
            osc.stop(ctx.currentTime + 0.15);
          } catch {}
        } else if (res.status === 409 && data.duplicate) {
          setScanResult({
            type: "duplicate",
            title: `Already checked in`,
            detail: `${data.attendeeName || "Attendee"} • ${formatTime(data.checkedInAt || "")}`,
          });
        } else {
          setScanResult({
            type: "error",
            title: "Scan failed",
            detail: data.error || "Unknown error",
          });
        }
      } catch {
        setScanResult({
          type: "error",
          title: "Network error",
          detail: "Could not reach the server. Please try again.",
        });
      } finally {
        setProcessing(false);
      }
    },
    [selectedEvent, processing],
  );

  // ---- QR Scanner ----
  const startScanner = async () => {
    if (scanning || !selectedEvent) return;

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const html5QrCode = new Html5Qrcode(scannerContainerId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText: string) => {
          processTicket(decodedText);
        },
        () => {
          // ignore failures
        },
      );

      setScanning(true);
    } catch (err) {
      console.error("Scanner init error:", err);
      setScanResult({
        type: "error",
        title: "Camera access denied",
        detail: "Please allow camera access to scan QR codes.",
      });
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {}
      scannerRef.current = null;
    }
    setScanning(false);
    lastScannedRef.current = "";
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.stop();
          scannerRef.current.clear();
        } catch {}
      }
    };
  }, []);

  // ---- Manual submit ----
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      processTicket(manualCode.trim());
      setManualCode("");
    }
  };

  // ---- Export CSV ----
  const exportCSV = () => {
    if (records.length === 0) return;

    const headers = [
      "Sl. No.",
      "Name",
      "Email",
      "Ticket Code",
      "Checked In At",
      "Checked In By",
    ];
    const rows = records.map((r, i) => [
      String(i + 1),
      `"${r.attendee_name}"`,
      `"${r.attendee_email}"`,
      r.ticket_code,
      new Date(r.checked_in_at).toLocaleString("en-IN"),
      `"${r.checked_in_by}"`,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const eventName = events.find((e) => e.id === selectedEvent)?.title || selectedEvent;
    a.download = `attendance-${eventName.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---- Loading screen ----
  if (!sessionChecked) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingPulse}>Checking session…</div>
      </div>
    );
  }

  // ---- Login screen ----
  if (!isAuthenticated) {
    return (
      <div className={styles.loginOverlay}>
        <div className={styles.loginCard}>
          <div className={styles.loginHeader}>
            <div className={styles.loginLogo}>
              <Image
                src="/logos/aice_logo.png"
                alt="AICE logo"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h2 className={styles.loginTitle}>AICE Attendance</h2>
              <p className={styles.loginSubtitle}>
                Volunteer check-in portal
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className={styles.loginForm}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>User ID</label>
              <input
                id="attendance-login-name"
                type="text"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                placeholder="Enter your User ID"
                maxLength={80}
                required
                className={styles.fieldInput}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Password</label>
              <div className={styles.fieldInputWrap}>
                <input
                  id="attendance-login-password"
                  type={showPass ? "text" : "password"}
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  placeholder="Enter your password"
                  maxLength={120}
                  required
                  className={styles.fieldInput}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className={styles.togglePassBtn}
                  title={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className={styles.loginError}>{loginError}</div>
            )}

            <button
              id="attendance-login-submit"
              type="submit"
              className={styles.loginBtn}
              disabled={loginLoading}
            >
              {loginLoading ? "Signing in…" : "Log In"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ---- Main authenticated UI ----
  return (
    <div className={styles.container}>
      {/* Top bar */}
      <header className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <div className={styles.topBarLogo}>
            <Image
              src="/logos/aice_logo.png"
              alt="AICE"
              fill
              className="object-contain"
            />
          </div>
          <span className={styles.topBarTitle}>Attendance</span>
          <span className={styles.topBarBadge}>Volunteer</span>
        </div>
        <div className={styles.topBarRight}>
          <span className={styles.volunteerName}>
            {volunteer?.name}
          </span>
          <button
            id="attendance-logout"
            onClick={handleLogout}
            className={styles.logoutBtn}
          >
            Log out
          </button>
        </div>
      </header>

      <main className={styles.content}>
        {/* Event selector */}
        <div className={styles.selectorSection}>
          <label className={styles.selectorLabel}>Select Event</label>
          <select
            id="attendance-event-select"
            className={styles.selectorDropdown}
            value={selectedEvent}
            onChange={(e) => {
              setSelectedEvent(e.target.value);
              setRecords([]);
              setTotalCheckedIn(0);
              setScanResult(null);
              lastScannedRef.current = "";
            }}
          >
            {events.length === 0 && (
              <option value="">No upcoming events</option>
            )}
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
        </div>

        {/* Live counter */}
        <div className={styles.liveCounter}>
          <div className={styles.counterItem}>
            <span className={styles.counterValue}>{totalCheckedIn}</span>
            <span className={styles.counterLabel}>Checked In</span>
          </div>
          <div className={styles.counterDivider} />
          <div className={styles.counterItem}>
            <span className={styles.counterValue}>
              {volunteer?.name?.split(" ")[0] || "—"}
            </span>
            <span className={styles.counterLabel}>Volunteer</span>
          </div>
        </div>

        {/* Tab switcher */}
        <div className={styles.tabs}>
          <button
            id="attendance-tab-scan"
            className={`${styles.tab} ${activeTab === "scan" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("scan")}
          >
            Scan Tickets
          </button>
          <button
            id="attendance-tab-sheet"
            className={`${styles.tab} ${activeTab === "sheet" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("sheet")}
          >
            Attendance Sheet
          </button>
        </div>

        {/* ---- SCAN TAB ---- */}
        {activeTab === "scan" && (
          <div className={styles.scannerSection}>
            {/* Scanner card */}
            <div className={styles.scannerCard}>
              <div className={styles.scannerViewport}>
                {scanning ? (
                  <div id={scannerContainerId} style={{ width: "100%", height: "100%" }} />
                ) : (
                  <div className={styles.scannerPlaceholder}>
                    <div id={scannerContainerId} style={{ display: "none" }} />
                    <QrScanIcon />
                    <p className={styles.scannerPlaceholderText}>
                      Start the camera to scan QR tickets
                    </p>
                  </div>
                )}
              </div>
              <div className={styles.scannerControls}>
                {!scanning ? (
                  <button
                    id="attendance-start-scan"
                    className={`${styles.scanBtn} ${styles.scanBtnStart} ${!selectedEvent ? styles.scanBtnDisabled : ""}`}
                    onClick={startScanner}
                    disabled={!selectedEvent}
                  >
                    <CameraIcon /> Start Camera
                  </button>
                ) : (
                  <button
                    id="attendance-stop-scan"
                    className={`${styles.scanBtn} ${styles.scanBtnStop}`}
                    onClick={stopScanner}
                  >
                    <StopIcon /> Stop Camera
                  </button>
                )}
              </div>
            </div>

            {/* Scan result */}
            {scanResult && (
              <div
                className={`${styles.scanResult} ${
                  scanResult.type === "success"
                    ? styles.scanResultSuccess
                    : scanResult.type === "duplicate"
                      ? styles.scanResultDuplicate
                      : styles.scanResultError
                }`}
              >
                <div
                  className={`${styles.scanResultIcon} ${
                    scanResult.type === "success"
                      ? styles.scanResultIconSuccess
                      : scanResult.type === "duplicate"
                        ? styles.scanResultIconDuplicate
                        : styles.scanResultIconError
                  }`}
                >
                  {scanResult.type === "success" && <CheckCircleIcon />}
                  {scanResult.type === "duplicate" && <AlertCircleIcon />}
                  {scanResult.type === "error" && <XCircleIcon />}
                </div>
                <div className={styles.scanResultBody}>
                  <span
                    className={`${styles.scanResultTitle} ${
                      scanResult.type === "success"
                        ? styles.scanResultSuccessText
                        : scanResult.type === "duplicate"
                          ? styles.scanResultDuplicateText
                          : styles.scanResultErrorText
                    }`}
                  >
                    {scanResult.title}
                  </span>
                  <span className={styles.scanResultDetail}>
                    {scanResult.detail}
                  </span>
                </div>
              </div>
            )}

            {/* Manual entry */}
            <div className={styles.divider}>or enter ticket code manually</div>

            <form onSubmit={handleManualSubmit} className={styles.manualEntry}>
              <input
                id="attendance-manual-input"
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="AICE-XXXXXXXXXXXX"
                maxLength={20}
                className={styles.manualInput}
              />
              <button
                id="attendance-manual-submit"
                type="submit"
                className={styles.manualSubmitBtn}
                disabled={!manualCode.trim() || !selectedEvent || processing}
              >
                {processing ? "…" : "Submit"}
              </button>
            </form>
          </div>
        )}

        {/* ---- SHEET TAB ---- */}
        {activeTab === "sheet" && (
          <div className={styles.sheetSection}>
            <div className={styles.sheetHeader}>
              <div>
                <h2 className={styles.sheetTitle}>
                  Attendance Sheet{" "}
                  <span className={styles.sheetCount}>
                    ({records.length} attendee{records.length !== 1 ? "s" : ""})
                  </span>
                </h2>
              </div>
              <div className={styles.sheetActions}>
                <button
                  id="attendance-refresh"
                  className={styles.refreshBtn}
                  onClick={fetchRecords}
                >
                  <RefreshIcon /> Refresh
                </button>
                <button
                  id="attendance-export"
                  className={styles.exportBtn}
                  onClick={exportCSV}
                  disabled={records.length === 0}
                >
                  <DownloadIcon /> Export CSV
                </button>
              </div>
            </div>

            {loadingRecords ? (
              <div className={styles.loadingPulse}>
                Loading attendance records…
              </div>
            ) : records.length === 0 ? (
              <div className={styles.emptyState}>
                <ClipboardIcon />
                <p className={styles.emptyStateText}>
                  No attendance recorded yet
                </p>
                <p className={styles.emptyStateHint}>
                  Scanned tickets will appear here in real-time
                </p>
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.sheetTable}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Ticket</th>
                      <th>Time</th>
                      <th>Volunteer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r, i) => (
                      <tr key={r.id}>
                        <td className={styles.sheetSlNo}>{i + 1}</td>
                        <td>
                          <div className={styles.sheetName}>
                            {r.attendee_name}
                          </div>
                          {r.attendee_email && (
                            <div className={styles.sheetEmail}>
                              {r.attendee_email}
                            </div>
                          )}
                        </td>
                        <td className={styles.sheetTicket}>
                          {r.ticket_code}
                        </td>
                        <td className={styles.sheetTime}>
                          {formatTime(r.checked_in_at)}
                        </td>
                        <td className={styles.sheetVolunteer}>
                          {r.checked_in_by}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
