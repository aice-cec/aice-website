"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { QRCodeCanvas } from "qrcode.react";
import { toPng } from "html-to-image";
import styles from "../../register/Register.module.css";

function DownloadIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function CopyIcon() {
  return (
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
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function ShareIcon() {
  return (
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
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function StatusContent() {
  const searchParams = useSearchParams();
  const txIdParam = searchParams.get("txId");
  const idParam = searchParams.get("id");
  const emailParam = searchParams.get("email");

  const [searchQuery, setSearchQuery] = useState(
    txIdParam || idParam || emailParam || "",
  );
  const [membership, setMembership] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fetchStatus = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setHasSearched(true);

    try {
      let url = "";
      if (query.includes("@")) {
        url = `/api/memberships/status?email=${encodeURIComponent(query.trim())}`;
      } else if (query.startsWith("AICE-") || query.length > 20) {
        url = `/api/memberships/status?id=${encodeURIComponent(query.trim())}`;
      } else {
        url = `/api/memberships/status?txId=${encodeURIComponent(query.trim())}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        setMembership(null);
        setError(data.error || "No membership record found.");
      } else {
        setMembership(data.membership);
      }
    } catch (err: any) {
      setMembership(null);
      setError(err?.message || "Failed to query membership status.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialQuery = txIdParam || idParam || emailParam;
    if (initialQuery) {
      fetchStatus(initialQuery);
    }
  }, [txIdParam, idParam, emailParam, fetchStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStatus(searchQuery);
  };

  const handleCopy = (text: string, field: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleDownloadImage = async () => {
    const cardElement = document.getElementById("membership-pass-card");
    if (!cardElement) return;

    setDownloading(true);
    try {
      // Generate ultra high resolution PNG image (3x scale)
      const dataUrl = await toPng(cardElement, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: "#000000",
      });

      const fileName = `AICE-Membership-${membership?.membership_id || "Card"}.png`;
      const link = document.createElement("a");
      link.download = fileName;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to export membership pass image:", err);
      // Fallback: try printing
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    const shareUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/membership/status?id=${membership?.membership_id || membership?.id}`
        : `https://aice.ceconline.edu/membership/status?id=${membership?.membership_id || membership?.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `AICE Official Membership Pass - ${membership?.full_name}`,
          text: `Official AICE Membership Credential: ${membership?.membership_id}`,
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled or fallback
      }
    }

    handleCopy(shareUrl, "shareLink");
  };

  const isApproved = membership?.status === "APPROVED";
  const isPending = membership?.status === "PENDING";
  const isRejected = membership?.status === "REJECTED";

  const verificationLiveUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/membership/status?id=${membership?.membership_id || membership?.id}`
      : `https://aice.ceconline.edu/membership/status?id=${membership?.membership_id || membership?.id}`;

  const validTillDate = (() => {
    const baseDate = membership?.reviewed_at
      ? new Date(membership.reviewed_at)
      : membership?.created_at
        ? new Date(membership.created_at)
        : new Date();
    const nextYear = new Date(baseDate);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    return nextYear.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  })();

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.logoRow}>
          <Image
            src="/logos/aice_logo.png"
            alt="AICE Logo"
            width={46}
            height={46}
            style={{ height: "auto" }}
          />
          <span className={styles.logoText}>ICE</span>
        </div>

        <h1 className={styles.title} style={{ marginTop: "0.5rem" }}>
          MEMBERSHIP <span className={styles.titleAccent}>STATUS</span>
        </h1>
        <p className={styles.subtitle}>
          Verify and track your AICE membership registration
        </p>
      </div>

      <form onSubmit={handleSearchSubmit} style={{ marginBottom: "1.5rem" }}>
        <div className={styles.statusSearchRow}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter UTR, Membership ID, or Email..."
            className={styles.input}
            style={{ fontSize: "0.85rem", flex: 1 }}
          />
          <button
            type="submit"
            disabled={loading}
            className={styles.submitBtn}
            style={{ width: "auto", minWidth: "120px", marginTop: 0 }}
          >
            {loading ? "SEARCHING..." : "SEARCH"}
          </button>
        </div>
      </form>

      {error && (
        <div className={styles.errorMsg} style={{ marginBottom: "1.5rem" }}>
          {error}
        </div>
      )}

      {membership && (
        <div style={{ textAlign: "left", marginBottom: "1.5rem" }}>
          {isApproved && (
            <div>
              <div
                className={styles.officialPassCard}
                id="membership-pass-card"
              >
                <div className={styles.passTopRow}>
                  <div className={styles.passMemberCol}>
                    <div className={styles.passSectionLabel}>MEMBER NAME:</div>
                    <div className={styles.passMemberNameText}>
                      {membership.full_name}
                    </div>
                    <div className={styles.passYearBranchText}>
                      {membership.year}-{membership.branch}
                    </div>
                  </div>

                  <div className={styles.passIdCol}>
                    <div className={styles.passSectionLabel}>
                      MEMBERSHIP ID:
                    </div>
                    <div className={styles.passIdValText}>
                      {membership.membership_id}
                    </div>
                  </div>
                </div>

                <div className={styles.passCenterSection}>
                  <div className={styles.passQrBox}>
                    <QRCodeCanvas
                      value={verificationLiveUrl}
                      size={280}
                      level="H"
                      includeMargin={false}
                    />
                  </div>

                  <div className={styles.passCenterDivider} />

                  <div className={styles.passBrandingCol}>
                    <div className={styles.passLogoHeader}>
                      <img
                        src="/logos/aice_logo.png"
                        alt="AICE Logo"
                        className={styles.passLogoImg}
                        crossOrigin="anonymous"
                      />
                      <span className={styles.passAiceWord}>ICE</span>
                    </div>
                    <div className={styles.passFullForm}>
                      AI INNOVATION
                      <br />
                      COMMUNITY FOR
                      <br />
                      EXCELLENCE
                    </div>
                  </div>
                </div>

                {/* Bottom Tagline */}
                <div className={styles.passBottomTagline}>
                  <span>You are officially an</span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "2px",
                      fontWeight: 800,
                    }}
                  >
                    <img
                      src="/logos/aice_logo.png"
                      alt="A"
                      width={14}
                      height={14}
                      crossOrigin="anonymous"
                      style={{ height: "auto", display: "inline-block" }}
                    />
                    <span>ICE</span>
                  </span>
                  <span>member. Let&apos;s grow together!!</span>
                </div>

                <div className={styles.passValidTillRow}>
                  Valid Till: {validTillDate}
                </div>
              </div>

              <div className={styles.passActionRow}>
                <button
                  type="button"
                  onClick={handleDownloadImage}
                  disabled={downloading}
                  className={styles.passActionBtn}
                >
                  <DownloadIcon />
                  <span>
                    {downloading ? "Downloading..." : "Download Card"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopy(membership.membership_id, "id")}
                  className={styles.passActionBtn}
                >
                  <CopyIcon /> {copiedField === "id" ? "Copied ID!" : "Copy ID"}
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className={styles.passActionBtn}
                >
                  <ShareIcon />{" "}
                  {copiedField === "shareLink" ? "Link Copied!" : "Share Link"}
                </button>
              </div>
            </div>
          )}

          {/* PENDING STATE */}
          {isPending && (
            <div
              style={{
                backgroundColor: "rgba(245, 158, 11, 0.08)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                borderRadius: "1rem",
                padding: "1.25rem 1.15rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "#f59e0b",
                  fontWeight: 800,
                  fontSize: "0.9rem",
                  marginBottom: "0.75rem",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "9999px",
                    backgroundColor: "#f59e0b",
                  }}
                />
                PAYMENT UNDER VERIFICATION
              </div>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "rgba(255,255,255,0.75)",
                  lineHeight: "1.6",
                  margin: 0,
                  wordBreak: "break-word",
                }}
              >
                Thank you, <strong>{membership.full_name}</strong>! Your
                registration is currently being verified by the AICE Finance
                Team against UTR{" "}
                <strong style={{ color: "#ffffff", fontFamily: "monospace" }}>
                  {membership.transaction_id}
                </strong>
                .
              </p>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "rgba(255,255,255,0.5)",
                  marginTop: "0.75rem",
                  wordBreak: "break-word",
                }}
              >
                Verification usually completes within 12–24 hours. Your official
                digital membership pass will be dispatched to{" "}
                <strong>{membership.email}</strong> once verified.
              </p>
            </div>
          )}

          {/* REJECTED STATE */}
          {isRejected && (
            <div
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "1rem",
                padding: "1.25rem 1.15rem",
              }}
            >
              <div
                style={{
                  color: "#ef4444",
                  fontWeight: 800,
                  fontSize: "0.9rem",
                  marginBottom: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <CrossIcon /> VERIFICATION UNSUCCESSFUL
              </div>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "rgba(255,255,255,0.75)",
                  lineHeight: "1.6",
                  wordBreak: "break-word",
                }}
              >
                Your membership submission for UTR{" "}
                <strong style={{ color: "#ffffff", fontFamily: "monospace" }}>
                  {membership.transaction_id}
                </strong>{" "}
                could not be approved.
              </p>
              {membership.rejection_reason && (
                <div
                  style={{
                    marginTop: "0.75rem",
                    padding: "0.75rem",
                    backgroundColor: "rgba(0,0,0,0.4)",
                    borderRadius: "0.5rem",
                    border: "1px solid rgba(255,255,255,0.1)",
                    fontSize: "0.8rem",
                    color: "#f87171",
                    wordBreak: "break-word",
                  }}
                >
                  <strong>Reason:</strong> {membership.rejection_reason}
                </div>
              )}
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "rgba(255,255,255,0.5)",
                  marginTop: "0.75rem",
                }}
              >
                If you have valid payment proof, please re-submit your
                registration via the registration page or contact the AICE
                Finance Team.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Fallback prompt when no search yet */}
      {!membership && !loading && !error && !hasSearched && (
        <div
          style={{
            padding: "1.25rem 1rem",
            borderRadius: "0.75rem",
            backgroundColor: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            fontSize: "0.85rem",
            lineHeight: "1.6",
            color: "rgba(255, 255, 255, 0.7)",
            marginBottom: "1.5rem",
          }}
        >
          Enter your <strong>12-digit UTR Number</strong>,{" "}
          <strong>Membership ID</strong>, or{" "}
          <strong>registered email address</strong> in the box above to check
          your live membership activation status.
        </div>
      )}

      {/* Responsive Navigation Buttons */}
      <div className={styles.buttonRow}>
        <Link
          href="/register"
          className={styles.btnSecondary}
          style={{ textDecoration: "none" }}
        >
          &larr; REGISTER NEW
        </Link>
        <Link
          href="/"
          className={styles.submitBtn}
          style={{ textDecoration: "none", marginTop: 0 }}
        >
          HOME &rarr;
        </Link>
      </div>
    </div>
  );
}

export default function MembershipStatusPage() {
  return (
    <main className={styles.page}>
      <div className={styles.glowLeft} />
      <div className={styles.glowRight} />

      <div className={styles.container}>
        <Suspense
          fallback={
            <div className={styles.card} style={{ textAlign: "center" }}>
              Loading status...
            </div>
          }
        >
          <StatusContent />
        </Suspense>
      </div>
    </main>
  );
}
