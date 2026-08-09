"use client";

import { forwardRef } from "react";
import Image from "next/image";
import styles from "./About.module.css";

const About = forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <div className={styles.contentPanel} ref={ref} aria-label="About AICE">
      <div className={styles.topRow}>
        <p className={styles.sectionLabel}>ABOUT AICE</p>
        <h2 className={styles.heading}>
          WHAT IS <span className={styles.accent}>AICE?</span>
        </h2>
        <p className={styles.description}>
          AICE (AI Innovation Community for Excellence) is the official AI
          community of College of Engineering Chengannur. A platform where curious
          minds meet, ideas evolve, and innovation becomes impact.
        </p>
      </div>

      <div className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.cardStripe} aria-hidden="true" />
          <div className={styles.cardBody}>
            <div className={styles.cardIconWrap} aria-hidden="true">
              <Image
                src="/assets/goal.svg"
                alt="mission"
                width={22}
                height={22}
              />
            </div>
            <div>
              <h3 className={styles.cardTitle}>MISSION</h3>
              <p className={styles.cardText}>
                To foster AI learning, innovation, research, and entrepreneurship
                through hands-on experiences and collaboration, inspiring
                responsible real-world solutions.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardStripe} aria-hidden="true" />
          <div className={styles.cardBody}>
            <div className={styles.cardIconWrap} aria-hidden="true">
              <Image
                src="/assets/eye.svg"
                alt="vision"
                width={22}
                height={22}
              />
            </div>
            <div>
              <h3 className={styles.cardTitle}>VISION</h3>
              <p className={styles.cardText}>
                To build a dynamic, future-ready AI ecosystem that cultivates
                innovation, leadership, and ethical responsibility, empowering
                students to create lasting impact.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

About.displayName = "About";

export default About;
