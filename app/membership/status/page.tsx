"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "../../register/Register.module.css";

function StatusContent() {
  const searchParams = useSearchParams();
  const txId = searchParams.get("txId");

  return (
    <div className={styles.card} style={{ textAlign: "center" }}>
      <div className={styles.logoRow}>
        <Image
          src="/logos/aice_logo.webp"
          alt="AICE Logo"
          width={36}
          height={36}
          style={{ height: "auto" }}
        />
        <span className={styles.logoText}>AICE</span>
      </div>

      <h1 className={styles.title} style={{ marginTop: "1rem" }}>
        MEMBERSHIP <span className={styles.titleAccent}>STATUS</span>
      </h1>

      <p className={styles.subtitle} style={{ marginTop: "0.5rem" }}>
        Transaction Reference: <strong>{txId || "N/A"}</strong>
      </p>

      <div
        style={{
          margin: "1.5rem 0",
          padding: "1rem",
          borderRadius: "0.75rem",
          backgroundColor: "rgba(255, 255, 255, 0.04)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          fontSize: "0.875rem",
          lineHeight: "1.6",
          color: "rgba(255, 255, 255, 0.75)",
        }}
      >
        Thank you for registering with AICE! If your payment was successful, your membership has been activated and your official AICE membership card will be sent to your registered email address.
      </div>

      <Link href="/" className={styles.submitBtn} style={{ textDecoration: "none" }}>
        RETURN TO HOME &rarr;
      </Link>
    </div>
  );
}

export default function MembershipStatusPage() {
  return (
    <main className={styles.page}>
      <div className={styles.glowLeft} />
      <div className={styles.glowRight} />

      <div className={styles.container}>
        <Suspense fallback={<div className={styles.card} style={{ textAlign: "center" }}>Loading...</div>}>
          <StatusContent />
        </Suspense>
      </div>
    </main>
  );
}
