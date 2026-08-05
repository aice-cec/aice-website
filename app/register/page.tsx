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
    branch: "Computer Science & Engineering",
    semester: "S4",
    membershipTier: "Standard",
    duration: "1 Year",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
              REGISTRATION FEE: ₹100 INR
            </div>
          </div>

          {error && <div className={styles.errorMsg}>{error}</div>}

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.fieldGroup}>
              <label htmlFor="fullName" className={styles.label}>
                Full Name *
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                required
                placeholder="e.g. Alex Mercer"
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
                placeholder="e.g. alex@ceconline.edu"
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

            <div className={styles.rowTwo}>
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
                  <option value="Computer Science & Engineering">CSE</option>
                  <option value="Electronics & Communication">ECE</option>
                  <option value="Electrical & Electronics">EEE</option>
                  <option value="Mechanical Engineering">ME</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="semester" className={styles.label}>
                  Semester *
                </label>
                <select
                  id="semester"
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className={styles.select}
                >
                  <option value="S1">S1</option>
                  <option value="S2">S2</option>
                  <option value="S3">S3</option>
                  <option value="S4">S4</option>
                  <option value="S5">S5</option>
                  <option value="S6">S6</option>
                  <option value="S7">S7</option>
                  <option value="S8">S8</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles.submitBtn}
            >
              {loading ? "PROCESSING..." : "PAY ₹100 & JOIN NOW →"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
