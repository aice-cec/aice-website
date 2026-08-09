"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Hero.module.css";
import Image from "next/image";
import About from "@/app/components/About";

const Hero = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const robotWrapRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const eyeGlowRef = useRef<HTMLDivElement>(null);
  const aboutPanelRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);

  const mousePosRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });
  const mouseActiveRef = useRef<boolean>(false);
  const animFrameRef = useRef<number | null>(null);

  const updateSpotlightCSS = () => {
    if (stickyRef.current) {
      stickyRef.current.style.setProperty(
        "--mouse-x",
        `${mousePosRef.current.x}px`,
      );
      stickyRef.current.style.setProperty(
        "--mouse-y",
        `${mousePosRef.current.y}px`,
      );
      stickyRef.current.style.setProperty(
        "--spotlight-opacity",
        mouseActiveRef.current ? "1" : "0",
      );
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stickyRef.current) return;
    const rect = stickyRef.current.getBoundingClientRect();
    mousePosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    mouseActiveRef.current = true;

    if (!animFrameRef.current) {
      animFrameRef.current = requestAnimationFrame(() => {
        updateSpotlightCSS();
        animFrameRef.current = null;
      });
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stickyRef.current) return;
    const rect = stickyRef.current.getBoundingClientRect();
    mousePosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    mouseActiveRef.current = true;
    updateSpotlightCSS();
  };

  const handleMouseLeave = () => {
    mouseActiveRef.current = false;
    updateSpotlightCSS();
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!stickyRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = stickyRef.current.getBoundingClientRect();
    mousePosRef.current = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
    mouseActiveRef.current = true;

    if (!animFrameRef.current) {
      animFrameRef.current = requestAnimationFrame(() => {
        updateSpotlightCSS();
        animFrameRef.current = null;
      });
    }
  };

  const handleTouchEnd = () => {
    mouseActiveRef.current = false;
    updateSpotlightCSS();
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

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

      <div
        className={styles.heroSticky}
        ref={stickyRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className={styles.spotlightContainer} aria-hidden="true">
          <div className={styles.spotlightPattern}>
            <svg
              viewBox="0 0 1000 600"
              width="100%"
              height="100%"
              preserveAspectRatio="none"
              className={styles.vectorPatternSvg}
            >
              <defs>
                <linearGradient id="g0" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ff7700" />
                  <stop offset="30%" stopColor="#aa2200" />
                  <stop offset="85%" stopColor="#440000" />
                  <stop offset="100%" stopColor="#0a0000" />
                </linearGradient>
                <linearGradient id="g1" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ff9900" />
                  <stop offset="25%" stopColor="#cc3300" />
                  <stop offset="80%" stopColor="#660000" />
                  <stop offset="100%" stopColor="#110000" />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ffbb00" />
                  <stop offset="25%" stopColor="#ee4400" />
                  <stop offset="80%" stopColor="#880000" />
                  <stop offset="100%" stopColor="#150000" />
                </linearGradient>
                <linearGradient id="g3" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ffdd00" />
                  <stop offset="20%" stopColor="#ff5500" />
                  <stop offset="75%" stopColor="#aa0000" />
                  <stop offset="100%" stopColor="#1a0000" />
                </linearGradient>
                <linearGradient id="g4" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ffee00" />
                  <stop offset="20%" stopColor="#ff6600" />
                  <stop offset="75%" stopColor="#bb0000" />
                  <stop offset="100%" stopColor="#200000" />
                </linearGradient>
                <linearGradient id="g5" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ffff22" />
                  <stop offset="20%" stopColor="#ff7700" />
                  <stop offset="75%" stopColor="#cc0000" />
                  <stop offset="100%" stopColor="#220000" />
                </linearGradient>
                <linearGradient id="g6" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ffdd00" />
                  <stop offset="20%" stopColor="#ff5500" />
                  <stop offset="75%" stopColor="#bb0000" />
                  <stop offset="100%" stopColor="#1e0000" />
                </linearGradient>
                <linearGradient id="g7" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ffaa00" />
                  <stop offset="22%" stopColor="#ff3300" />
                  <stop offset="75%" stopColor="#aa0000" />
                  <stop offset="100%" stopColor="#1a0000" />
                </linearGradient>
                <linearGradient id="g8" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ff7700" />
                  <stop offset="22%" stopColor="#ee1100" />
                  <stop offset="75%" stopColor="#990000" />
                  <stop offset="100%" stopColor="#180000" />
                </linearGradient>
                <linearGradient id="g9" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ff5500" />
                  <stop offset="25%" stopColor="#dd0000" />
                  <stop offset="75%" stopColor="#880000" />
                  <stop offset="100%" stopColor="#150000" />
                </linearGradient>
                <linearGradient id="g10" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ff3300" />
                  <stop offset="25%" stopColor="#cc0000" />
                  <stop offset="75%" stopColor="#770000" />
                  <stop offset="100%" stopColor="#120000" />
                </linearGradient>
                <linearGradient id="g11" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ee2200" />
                  <stop offset="25%" stopColor="#bb0000" />
                  <stop offset="75%" stopColor="#660000" />
                  <stop offset="100%" stopColor="#100000" />
                </linearGradient>
                <linearGradient id="g12" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#dd1100" />
                  <stop offset="25%" stopColor="#aa0000" />
                  <stop offset="75%" stopColor="#550000" />
                  <stop offset="100%" stopColor="#0e0000" />
                </linearGradient>
                <linearGradient id="g13" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#cc0000" />
                  <stop offset="25%" stopColor="#990000" />
                  <stop offset="75%" stopColor="#440000" />
                  <stop offset="100%" stopColor="#0c0000" />
                </linearGradient>
                <linearGradient id="g14" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#bb0000" />
                  <stop offset="25%" stopColor="#880000" />
                  <stop offset="75%" stopColor="#380000" />
                  <stop offset="100%" stopColor="#0a0000" />
                </linearGradient>
                <linearGradient id="g15" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#aa0000" />
                  <stop offset="25%" stopColor="#770000" />
                  <stop offset="75%" stopColor="#300000" />
                  <stop offset="100%" stopColor="#080000" />
                </linearGradient>
                <linearGradient id="g16" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#990000" />
                  <stop offset="25%" stopColor="#660000" />
                  <stop offset="75%" stopColor="#280000" />
                  <stop offset="100%" stopColor="#060000" />
                </linearGradient>
                <linearGradient id="g17" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#880000" />
                  <stop offset="25%" stopColor="#550000" />
                  <stop offset="75%" stopColor="#200000" />
                  <stop offset="100%" stopColor="#040000" />
                </linearGradient>
                <linearGradient id="g18" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#770000" />
                  <stop offset="25%" stopColor="#440000" />
                  <stop offset="75%" stopColor="#180000" />
                  <stop offset="100%" stopColor="#020000" />
                </linearGradient>
                <linearGradient id="g19" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#550000" />
                  <stop offset="25%" stopColor="#330000" />
                  <stop offset="75%" stopColor="#100000" />
                  <stop offset="100%" stopColor="#000000" />
                </linearGradient>

                <linearGradient id="vertVignette" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#000000" stopOpacity="0.85" />
                  <stop offset="15%" stopColor="#000000" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#000000" stopOpacity="0" />
                  <stop offset="85%" stopColor="#000000" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0.85" />
                </linearGradient>

                <radialGradient id="centerArcGlow" cx="28%" cy="50%" r="45%">
                  <stop offset="0%" stopColor="#ffee66" stopOpacity="0.35" />
                  <stop offset="40%" stopColor="#ff5500" stopOpacity="0.2" />
                  <stop offset="80%" stopColor="#aa0000" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </radialGradient>
              </defs>

              <rect width="1000" height="600" fill="#000000" />

              <rect x="5" y="0" width="42" height="600" fill="url(#g0)" />
              <rect x="55" y="0" width="42" height="600" fill="url(#g1)" />
              <rect x="105" y="0" width="42" height="600" fill="url(#g2)" />
              <rect x="155" y="0" width="42" height="600" fill="url(#g3)" />
              <rect x="205" y="0" width="42" height="600" fill="url(#g4)" />
              <rect x="255" y="0" width="42" height="600" fill="url(#g5)" />
              <rect x="305" y="0" width="42" height="600" fill="url(#g6)" />
              <rect x="355" y="0" width="42" height="600" fill="url(#g7)" />
              <rect x="405" y="0" width="42" height="600" fill="url(#g8)" />
              <rect x="455" y="0" width="42" height="600" fill="url(#g9)" />
              <rect x="505" y="0" width="42" height="600" fill="url(#g10)" />
              <rect x="555" y="0" width="42" height="600" fill="url(#g11)" />
              <rect x="605" y="0" width="42" height="600" fill="url(#g12)" />
              <rect x="655" y="0" width="42" height="600" fill="url(#g13)" />
              <rect x="705" y="0" width="42" height="600" fill="url(#g14)" />
              <rect x="755" y="0" width="42" height="600" fill="url(#g15)" />
              <rect x="805" y="0" width="42" height="600" fill="url(#g16)" />
              <rect x="855" y="0" width="42" height="600" fill="url(#g17)" />
              <rect x="905" y="0" width="42" height="600" fill="url(#g18)" />
              <rect x="955" y="0" width="40" height="600" fill="url(#g19)" />

              <rect width="1000" height="600" fill="url(#centerArcGlow)" />
              <rect width="1000" height="600" fill="url(#vertVignette)" />
            </svg>
          </div>
          <div className={styles.spotlightGlow} />
        </div>

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
