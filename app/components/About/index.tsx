"use client";

import { forwardRef } from "react";
import Image from "next/image";
import styles from "./About.module.css";

const About = forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <div className={styles.contentPanel} ref={ref} aria-label="About AICE">
      <p className={styles.sectionLabel}>ABOUT AICE</p>

      <h2 className={styles.heading}>
        WHAT IS <span className={styles.accent}>AICE?</span>
      </h2>

      <p className={styles.description}>
        AICE (AI Innovation Community for Excellence) is the official AI
        community of College of Engineering Chengannur. A platform where curious
        minds meet, ideas evolve, and innovation becomes impact.
      </p>

      <div className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon} aria-hidden="true">
              <Image
                src="/assets/goal.svg"
                alt="mission"
                width={24}
                height={24}
              />
            </div>
            <h3 className={styles.cardTitle}>MISSION</h3>
          </div>
          <p className={styles.cardText}>
            To foster AI learning, innovation, research, and entrepreneurship
            through hands-on experiences and collaboration, inspiring
            responsible real-world solutions, strengthening academia-industry
            connections, and cultivating an inclusive community of continuous
            learning.
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon} aria-hidden="true">
              <Image src="/assets/eye.svg" alt="vision" width={24} height={24} />
            </div>
            <h3 className={styles.cardTitle}>VISION</h3>
          </div>
          <p className={styles.cardText}>
            To build a dynamic, future-ready AI ecosystem that cultivates
            innovation, leadership, and ethical responsibility, empowering
            students to engineer scalable, real-world solutions that create
            lasting societal and industrial impact.
          </p>
        </div>
      </div>
    </div>
  );
});

About.displayName = "About";

export default About;
