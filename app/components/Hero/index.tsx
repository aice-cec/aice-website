"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Hero.module.css";
import Image from "next/image";
import About from "@/app/components/About";

const Hero = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const robotWrapRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const eyeGlowRef = useRef<HTMLDivElement>(null);
  const aboutPanelRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleLoaded = () => setIsLoaded(true);

    window.addEventListener("aice-loading-complete", handleLoaded);

    const fallback = setTimeout(() => {
      setIsLoaded(true);
    }, 3800);

    return () => {
      window.removeEventListener("aice-loading-complete", handleLoaded);
      clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const robotWrap = robotWrapRef.current;
    const eyeGlow = eyeGlowRef.current;
    const title = titleRef.current;
    const aboutPanel = aboutPanelRef.current;
    const cta = ctaRef.current;

    if (!section || !robotWrap) return;

    let rafId: number;

    const onScroll = () => {
      rafId = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const viewportH = window.innerHeight;
        const viewportW = window.innerWidth;
        const isMobile = viewportW <= 1024;

        const scrolled = -rect.top;

        const progress1 = Math.min(
          Math.max(scrolled / (viewportH * 0.7), 0),
          1,
        );
        const eased1 = 1 - Math.pow(1 - progress1, 3);

        const progress2 = Math.min(
          Math.max((scrolled - viewportH * 0.7) / (viewportH * 0.7), 0),
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
          const minSpacing = 0;
          const maxSpacing = isMobile ? 0.55 : 0.45;
          const spacing = minSpacing + eased1 * (maxSpacing - minSpacing);
          const spread = spacing * 1.7;

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

          const subWords = title.querySelectorAll(`.${styles.subWord}`);
          const subWordOpacity = Math.min(Math.max((eased1 - 0.2) / 0.6, 0), 1);
          const subWordY = (1 - subWordOpacity) * 12;

          subWords.forEach((word) => {
            const el = word as HTMLElement;
            el.style.opacity = String(subWordOpacity.toFixed(3));
            el.style.transform = `translateX(-50%) translateY(${subWordY.toFixed(1)}px)`;
          });

          const titleY = eased1 * -30 + eased2 * -450;
          const titleOpacity = Math.max(1 - eased2 * 1.5, 0);

          title.style.opacity = String(titleOpacity.toFixed(3));
          title.style.filter = `blur(${(eased2 * 12).toFixed(1)}px)`;
          title.style.transform = `translate(-50%, calc(-50% + ${titleY.toFixed(1)}px))`;
          title.style.visibility = titleOpacity <= 0 ? "hidden" : "visible";
        }

        if (cta) {
          const ctaY = eased1 * -50 + eased2 * -450;
          const ctaOpacity = Math.max(1 - eased1 * 5.0, 0);

          cta.style.opacity = String(ctaOpacity.toFixed(3));
          cta.style.filter = `blur(${(eased1 * 15 + eased2 * 12).toFixed(1)}px)`;
          cta.style.transform = `translate(-50%, calc(-50% + ${ctaY.toFixed(1)}px))`;
          cta.style.pointerEvents = ctaOpacity <= 0.05 ? "none" : "auto";
          cta.style.visibility = ctaOpacity <= 0 ? "hidden" : "visible";
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
            const aboutOpacity = Math.min(Math.max((eased2 - 0.6) / 0.4, 0), 1);

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

  const handleCtaClick = () => {
    const section = sectionRef.current;
    if (!section) return;

    const targetY = section.offsetTop + window.innerHeight * 1.4;
    const startY = window.scrollY || window.pageYOffset;
    const distance = targetY - startY;
    const duration = 1500; // 1.5 seconds smooth scroll
    let startTime: number | null = null;

    // Disable CSS scroll-behavior: smooth during JS animation to prevent frame buffering freeze
    const originalScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const animateScroll = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = easeInOutCubic(progress);

      window.scrollTo(0, startY + distance * easeProgress);

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        document.documentElement.style.scrollBehavior = originalScrollBehavior;
      }
    };

    requestAnimationFrame(animateScroll);
  };

  return (
    <div
      id="home"
      className={`${styles.heroOuter} ${isLoaded ? styles.loaded : ""}`}
      ref={sectionRef}
      aria-label="AICE Hero"
    >
      <div id="about" className={styles.aboutAnchor} />

      <div className={styles.heroSticky}>
        <div className={styles.bgTitle} ref={titleRef} aria-hidden="true">
          <div className={styles.letterA}>
            <span className={styles.letterChar}>A</span>
            <span className={styles.subWord}>AI</span>
          </div>
          <div className={styles.letterI}>
            <span className={styles.letterChar}>I</span>
            <span className={styles.subWord}>INNOVATION</span>
          </div>
          <div className={styles.letterC}>
            <span className={styles.letterChar}>C</span>
            <span className={styles.subWord}>COMMUNITY</span>
          </div>
          <div className={styles.letterE}>
            <span className={styles.letterChar}>E</span>
            <span className={`${styles.subWord} ${styles.subWordE}`}>
              <span>FOR</span>
              <span>EXCELLENCE</span>
            </span>
          </div>
        </div>

        <button
          type="button"
          className={styles.squareCta}
          ref={ctaRef}
          onClick={handleCtaClick}
          aria-label="Explore AICE"
          id="hero-square-cta"
        >
          <span className={styles.squareCtaText}>EXPLORE AICE</span>
          <svg
            className={styles.squareCtaArrow}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="square"
            strokeLinejoin="miter"
            aria-hidden="true"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>

        <div className={styles.robotWrap} ref={robotWrapRef}>
          <div className={styles.robotContainer}>
            <img
              src="/robot/robot.webp"
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
