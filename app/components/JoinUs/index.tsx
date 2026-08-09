"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./JoinUs.module.css";
import { showToast } from "@/app/components/Toast";

const reasons = [
  [
    "LEARN TOGETHER",
    "Explore tools, research, and ideas with people who are actively making things.",
  ],
  [
    "BUILD IN PUBLIC",
    "Turn weekend experiments into real projects, events, and collaborative work.",
  ],
  [
    "FIND YOUR PEOPLE",
    "Meet a community that stays curious, generous, and ready to try the hard thing.",
  ],
];

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
      className={styles.arrowIcon}
    >
      <path
        d="M5 12h14M13 6l6 6-6 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Join() {
  const sectionRef = useRef<HTMLElement>(null);
  const [hasArrived, setHasArrived] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasArrived(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="join"
      ref={sectionRef}
      className={`${styles.joinSection} ${hasArrived ? styles.joinActive : ""}`}
    >
        <div className={styles.arrivalField} aria-hidden="true" />
        <div className={styles.signalLine} aria-hidden="true" />
        <div className={styles.container}>
          <div className={styles.mainGrid}>
            <div>
              <h2 className={styles.heading}>
                <span style={{ whiteSpace: "nowrap" }}>YOUR NEXT</span>
                <br />
                <span style={{ whiteSpace: "nowrap" }}>IDEA STARTS</span>
                <br />
                <span style={{ whiteSpace: "nowrap" }}>HERE.</span>
              </h2>
            </div>
            <div className={styles.card}>
              <p className={styles.cardBadge}>OPEN TO CEC STUDENTS</p>
              <p className={styles.cardText}>
                Join our community to learn, connect, collaborate, and discover
                opportunities that turn curiosity into meaningful experiences.
              </p>
              <button
                type="button"
                className={styles.ctaButton}
                onClick={() =>
                  showToast(
                    "Membership registration is coming soon! Stay tuned.",
                  )
                }
              >
                START YOUR AICE JOURNEY <ArrowIcon />
              </button>
            </div>
          </div>

          <div className={styles.reasonsGrid}>
            {reasons.map(([title, text]) => (
              <div key={title} className={styles.reasonItem}>
                <h3 className={styles.reasonTitle}>{title}</h3>
                <p className={styles.reasonText}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
  );
}

export default Join;
