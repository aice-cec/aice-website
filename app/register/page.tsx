"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./Register.module.css";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    college: "College of Engineering Chengannur",
    branch: "CS",
    year: "1st Year",
    membershipTier: "Standard",
    duration: "1 Year",
    skipPayment: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const value =
      e.target.type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to initiate registration.");
      }

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error("Payment gateway URL not received.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.glowLeft} />
      <div className={styles.glowRight} />

      <div className={styles.container}>
        <Link href="/" className={styles.backBtn}>
          &larr; BACK TO HOME
        </Link>

        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.logoRow}>
              <Image
                src="/logos/aice_logo.png"
                alt="AICE Logo"
                width={32}
                height={32}
                style={{ height: "auto" }}
              />
              <span className={styles.logoText}>AICE</span>
            </div>
            <h1 className={styles.title}>
              JOIN THE <span className={styles.titleAccent}>COMMUNITY.</span>
            </h1>
            <p className={styles.subtitle}>
              Complete your membership signup to unlock AICE access.
            </p>
            <div className={styles.feeBadge}>
              <span className={styles.feeLabel}>REGISTRATION FEE</span>
              <span className={styles.feeAmount}>₹100 INR</span>
            </div>
          </div>

          {error && <div className={styles.errorMsg}>{error}</div>}

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label htmlFor="fullName" className={styles.label}>
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  required
                  placeholder="e.g. Jeevan George"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="email" className={styles.label}>
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="e.g. chn77bt777@ceconline.edu"
                  value={formData.email}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="phone" className={styles.label}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="college" className={styles.label}>
                  College
                </label>
                <input
                  type="text"
                  id="college"
                  name="college"
                  required
                  value={formData.college}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="branch" className={styles.label}>
                  Branch / Dept *
                </label>
                <select
                  id="branch"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  className={styles.select}
                >
                  <option value="CL">CL</option>
                  <option value="CS">CS</option>
                  <option value="EC">EC</option>
                  <option value="EEE">EEE</option>
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="year" className={styles.label}>
                  Year *
                </label>
                <select
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className={styles.select}
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.775rem",
                color: "rgba(255, 255, 255, 0.6)",
                marginTop: "0.5rem",
              }}
            >
              <input
                type="checkbox"
                id="skipPayment"
                name="skipPayment"
                checked={formData.skipPayment}
                onChange={handleChange}
                style={{ accentColor: "#ef4444", cursor: "pointer" }}
              />
              <label htmlFor="skipPayment" style={{ cursor: "pointer" }}>
                Test Mode: Skip Payment (Bypass PG for dev testing)
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles.submitBtn}
            >
              {loading
                ? "PROCESSING..."
                : formData.skipPayment
                  ? "JOIN NOW (TEST BYPASS) →"
                  : "PAY ₹100 & JOIN NOW →"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
