"use client";

import { useEffect, useRef, useState } from "react";
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

  const trackRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const dragStartScrollTop = useRef(0);

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
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

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
        {/* Filled progress line */}
        <div
          className={styles.progressLine}
          style={{ height: `${scrollProgress * 100}%` }}
        />

        {/* Floating Thumb */}
        <div
          className={`${styles.thumb} ${isDragging ? styles.thumbDragging : ""}`}
          style={{ top: `${scrollProgress * 100}%` }}
          onMouseDown={handleMouseDown}
        >
          <div className={styles.thumbPulse} />
        </div>

        {/* Section Waypoint Dots */}
        {SECTIONS.map((sec) => (
          <button
            key={sec.id}
            type="button"
            className={styles.dot}
            onClick={(e) => {
              e.stopPropagation();
              document
                .getElementById(sec.id)
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            title={sec.label}
          />
        ))}
      </div>
    </aside>
  );
}
