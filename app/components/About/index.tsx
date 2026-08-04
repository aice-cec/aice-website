"use client";

import { forwardRef } from "react";
import Image from "next/image";
import styles from "./About.module.css";

const About = forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <div
      className={styles.contentPanel}
      ref={ref}
      aria-label="About AICE"
    >
      <p className={styles.sectionLabel}>ABOUT AICE</p>

      <h2 className={styles.heading}>
        WHAT IS <span className={styles.accent}>AICE?</span>
      </h2>

      <p className={styles.description}>
        AICE (AI Innovation Community for Excellence) is the official AI
        community of College of Engineering Chengannur. A platform where
        curious minds meet, ideas evolve, and innovation becomes impact.
      </p>

      <div className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.cardIcon} aria-hidden="true">
            <Image
              src="/assets/goal.svg"
              alt="mission"
              width={28}
              height={28}
            />
          </div>
          <div className={styles.cardBody}>
            <h3 className={styles.cardTitle}>MISSION</h3>
            <p className={styles.cardText}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon} aria-hidden="true">
            <Image
              src="/assets/eye.svg"
              alt="vision"
              width={28}
              height={28}
            />
          </div>
          <div className={styles.cardBody}>
            <h3 className={styles.cardTitle}>VISION</h3>
            <p className={styles.cardText}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

About.displayName = "About";

export default About;
