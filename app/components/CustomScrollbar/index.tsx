"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import styles from "./CustomScrollbar.module.css";

const SECTIONS = [
  { id: "home", label: "HOME" },
  { id: "about", label: "ABOUT" },
  { id: "join", label: "JOIN US" },
  { id: "events", label: "EVENTS" },
  { id: "execom", label: "EXECOM" },
];

export default function CustomScrollbar() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isJoinSection, setIsJoinSection] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [sectionPositions, setSectionPositions] = useState<
    Record<string, number>
  >({
    home: 0,
    about: 25,
    join: 50,
    events: 75,
    execom: 100,
  });

  const trackRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const dragStartScrollTop = useRef(0);

  const updatePositions = useCallback(() => {
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;

    if (docHeight <= 0) return;

    const newPositions: Record<string, number> = {};

    SECTIONS.forEach((sec) => {
      if (sec.id === "home") {
        newPositions[sec.id] = 0;
      } else if (sec.id === "about") {
        const heroEl = document.getElementById("home");
        const aboutTop = heroEl
          ? heroEl.offsetTop + window.innerHeight * 1.4
          : document.getElementById("about")?.offsetTop || 0;
        newPositions[sec.id] = Math.min(
          Math.max((aboutTop / docHeight) * 100, 0),
          100,
        );
      } else {
        const el = document.getElementById(sec.id);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          newPositions[sec.id] = Math.min(
            Math.max((top / docHeight) * 100, 0),
            100,
          );
        }
      }
    });

    setSectionPositions(newPositions);
  }, []);

  useEffect(() => {
    let rafId: number;

    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight =
          document.documentElement.scrollHeight - window.innerHeight;

        if (docHeight > 0) {
          const progress = Math.min(Math.max(scrollTop / docHeight, 0), 1);
          setScrollProgress(progress);
        }

        // Check if Join Us section intersects viewport center
        const joinEl = document.getElementById("join");
        if (joinEl) {
          const rect = joinEl.getBoundingClientRect();
          const vh = window.innerHeight;
          setIsJoinSection(rect.top <= vh * 0.5 && rect.bottom >= vh * 0.5);
        } else {
          setIsJoinSection(false);
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updatePositions, { passive: true });
    handleScroll();
    updatePositions();

    const timer1 = setTimeout(updatePositions, 500);
    const timer2 = setTimeout(updatePositions, 1500);
    const timer3 = setTimeout(updatePositions, 3000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updatePositions);
      cancelAnimationFrame(rafId);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [updatePositions]);

  const scrollToSection = (id: string) => {
    if (id === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (id === "about") {
      const heroEl = document.getElementById("home");
      const targetY = heroEl
        ? heroEl.offsetTop + window.innerHeight * 1.4
        : document.getElementById("about")?.offsetTop || 0;
      window.scrollTo({ top: targetY, behavior: "smooth" });
    } else {
      const el = document.getElementById(id);
      if (el) {
        const targetY = el.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top: targetY, behavior: "smooth" });
      }
    }
  };

  const scrollToPercentage = (percentage: number) => {
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({
      top: docHeight * percentage,
      behavior: "smooth",
    });
  };

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const percentage = Math.min(Math.max(clickY / rect.height, 0), 1);
    scrollToPercentage(percentage);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartScrollTop.current = window.scrollY;
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const deltaY = e.clientY - dragStartY.current;
      const deltaPercentage = deltaY / rect.height;

      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({
        top: dragStartScrollTop.current + deltaPercentage * docHeight,
        behavior: "instant" as ScrollBehavior,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <aside
      className={`${styles.scrollbarContainer} ${
        isHovered || isDragging ? styles.active : ""
      } ${isJoinSection ? styles.joinTheme : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Scroll position and navigation"
    >
      <div
        className={styles.track}
        ref={trackRef}
        onClick={handleTrackClick}
        aria-hidden="true"
      >
        <div
          className={styles.progressLine}
          style={{ height: `${scrollProgress * 100}%` }}
        />

        <div
          className={`${styles.thumb} ${isDragging ? styles.thumbDragging : ""}`}
          style={{ top: `${scrollProgress * 100}%` }}
          onMouseDown={handleMouseDown}
        >
          <div className={styles.thumbPulse} />
        </div>

        {SECTIONS.map((sec) => (
          <button
            key={sec.id}
            type="button"
            className={styles.dot}
            style={{
              top: `${sectionPositions[sec.id] ?? 0}%`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              scrollToSection(sec.id);
            }}
            title={sec.label}
          />
        ))}
      </div>
    </aside>
  );
}
