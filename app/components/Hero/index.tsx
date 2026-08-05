"use client";

import { useEffect, useRef } from "react";
import styles from "./Hero.module.css";
import Image from "next/image";
import About from "@/app/components/About";

const Hero = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const robotWrapRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const eyeGlowRef = useRef<HTMLDivElement>(null);
  const aboutPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const robotWrap = robotWrapRef.current;
    const eyeGlow = eyeGlowRef.current;
    const title = titleRef.current;
    const aboutPanel = aboutPanelRef.current;

    if (!section || !robotWrap) return;

    let rafId: number;

    const onScroll = () => {
      rafId = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const viewportH = window.innerHeight;
        const viewportW = window.innerWidth;
        const isMobile = viewportW <= 1024;

        const scrolled = -rect.top;

        const progress1 = Math.min(Math.max(scrolled / (viewportH * 0.5), 0), 1);
        const eased1 = 1 - Math.pow(1 - progress1, 3);

        const progress2 = Math.min(
          Math.max((scrolled - viewportH * 0.5) / (viewportH * 0.5), 0),
          1,
        );
        const eased2 = 1 - Math.pow(1 - progress2, 3);

        if (isMobile) {
          const robotY = 130 - eased1 * 130;
          const robotOpacity =
            Math.min(progress1 * 2.5, 1) * Math.max(1 - eased2 * 2.5, 0);

          robotWrap.style.transform = `translate(-50%, ${robotY.toFixed(1)}%)`;
          robotWrap.style.opacity = String(robotOpacity.toFixed(3));
        } else {
          const robotY = 130 - eased1 * 130;
          const robotX = eased2 * -24;
          const robotOpacity = Math.min(progress1 * 2.5, 1);

          robotWrap.style.transform = `translateX(calc(-50% + ${robotX.toFixed(3)}vw)) translateY(${robotY.toFixed(2)}%)`;
          robotWrap.style.opacity = String(robotOpacity.toFixed(3));
        }

        if (title) {
          const minSpacing = 0.06;
          const maxSpacing = isMobile ? 0.22 : 0.45;
          const spacing = minSpacing + eased1 * (maxSpacing - minSpacing);
          const spread = spacing * 2;

          const a = title.querySelector(`.${styles.letterA}`) as HTMLElement;
          const i = title.querySelector(`.${styles.letterI}`) as HTMLElement;
          const c = title.querySelector(`.${styles.letterC}`) as HTMLElement;
          const e = title.querySelector(`.${styles.letterE}`) as HTMLElement;

          if (a && i && c && e) {
            a.style.transform = `translateX(${-1.5 * spread}em)`;
            i.style.transform = `translateX(${-0.5 * spread}em)`;
            c.style.transform = `translateX(${0.5 * spread}em)`;
            e.style.transform = `translateX(${1.5 * spread}em)`;
          }

          const titleY = eased1 * -30 + eased2 * -450;
          const titleOpacity = Math.max(1 - eased2 * 3.5, 0);

          title.style.opacity = String(titleOpacity.toFixed(3));
          title.style.transform = `translate(-50%, calc(-50% + ${titleY.toFixed(1)}px))`;
          title.style.visibility = titleOpacity <= 0 ? "hidden" : "visible";
        }

        if (aboutPanel) {
          if (isMobile) {
            const aboutY = (1 - eased2) * 40;
            const aboutOpacity = Math.min(Math.max(progress2 * 1.5, 0), 1);

            aboutPanel.style.opacity = String(aboutOpacity.toFixed(3));
            aboutPanel.style.transform = `translate(-50%, calc(-50% + ${aboutY.toFixed(1)}px))`;
            aboutPanel.style.visibility =
              aboutOpacity <= 0 ? "hidden" : "visible";
          } else {
            const aboutY = (1 - eased2) * 200;
            const aboutOpacity = Math.min(Math.max((eased2 - 0.2) / 0.6, 0), 1);

            aboutPanel.style.opacity = String(aboutOpacity.toFixed(3));
            aboutPanel.style.transform = `translateY(${aboutY.toFixed(1)}px)`;
            aboutPanel.style.visibility =
              aboutOpacity <= 0 ? "hidden" : "visible";
          }
        }

        if (eyeGlow) {
          eyeGlow.style.opacity = String((0.3 + eased1 * 0.5).toFixed(2));
        }
      });
    };

    robotWrap.style.transform = "translateX(-50%) translateY(130%)";
    robotWrap.style.opacity = "0";
    if (aboutPanel) {
      aboutPanel.style.transform =
        window.innerWidth <= 1024
          ? "translate(-50%, calc(-50% + 50px))"
          : "translateY(200px)";
      aboutPanel.style.opacity = "0";
      aboutPanel.style.visibility = "hidden";
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      id="home"
      className={styles.heroOuter}
      ref={sectionRef}
      aria-label="AICE Hero"
    >
      <div id="about" className={styles.aboutAnchor} />

      <div className={styles.heroSticky}>
        <div className={styles.bgTitle} ref={titleRef} aria-hidden="true">
          <span className={styles.letterA}>A</span>
          <span className={styles.letterI}>I</span>
          <span className={styles.letterC}>C</span>
          <span className={styles.letterE}>E</span>
        </div>

        <div className={styles.robotWrap} ref={robotWrapRef}>
          <div className={styles.robotContainer}>
            <img
              src="/robot/robot.png"
              alt="robot"
              className={styles.robotImg}
              draggable="false"
            />
            <div
              className={styles.eyeGlow}
              ref={eyeGlowRef}
              aria-hidden="true"
            />
          </div>
        </div>

        <About ref={aboutPanelRef} />

        <div className={styles.bottomFade} aria-hidden="true" />
      </div>

      <h1 className="visually-hidden">AICE</h1>
    </div>
  );
};

export default Hero;
