"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./Navbar.module.css";
import { showToast } from "@/app/components/Toast";

const navLinks = [
  { label: "HOME", href: "/#home", id: "nav-home" },
  { label: "ABOUT", href: "/#about", id: "nav-about" },
  { label: "EVENTS", href: "/#events", id: "nav-events" },
  { label: "EXECOM", href: "/#execom", id: "nav-execom" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [onRedSection, setOnRedSection] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("HOME");

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 20);

      const joinEl = document.getElementById("join");
      if (joinEl) {
        const rect = joinEl.getBoundingClientRect();
        if (rect.top <= 60 && rect.bottom >= 60) {
          setOnRedSection(true);
        } else {
          setOnRedSection(false);
        }
      } else {
        setOnRedSection(false);
      }

      const sections = [
        { id: "execom", label: "EXECOM" },
        { id: "events", label: "EVENTS" },
        { id: "join", label: "" },
        { id: "about", label: "ABOUT" },
        { id: "home", label: "HOME" },
      ];

      const offset = 150;
      let currentActive = "HOME";

      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= offset) {
            currentActive = s.label;
            break;
          }
        }
      }

      setActiveLink(currentActive);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    label?: string,
  ) => {
    setMobileOpen(false);

    if (href.startsWith("#") || href.startsWith("/#")) {
      const targetId = href.replace(/^\/#?/, "").replace("#", "");
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        e.preventDefault();
        if (label) setActiveLink(label);

        let targetY = 0;
        if (targetId === "about") {
          const heroEl = document.getElementById("home");
          targetY = heroEl
            ? heroEl.offsetTop + window.innerHeight * 1.4
            : targetElement.offsetTop;
        } else if (targetId === "home") {
          targetY = 0;
        } else {
          targetY =
            targetElement.getBoundingClientRect().top + window.scrollY - 70;
        }

        const startY = window.scrollY || window.pageYOffset;
        const distance = targetY - startY;
        const duration = 1500; // 1.5 seconds smooth scroll
        let startTime: number | null = null;

        const originalScrollBehavior =
          document.documentElement.style.scrollBehavior;
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
            document.documentElement.style.scrollBehavior =
              originalScrollBehavior;
          }
        };

        requestAnimationFrame(animateScroll);
      }
    }
  };

  return (
    <header
      className={`${styles.navbar} ${scrolled ? styles.scrolled : ""} ${onRedSection ? styles.onRed : ""}`}
      role="banner"
    >
      <div className={styles.container}>
        <a
          href="#home"
          className={styles.logo}
          id="logo"
          aria-label="AICE Home"
          onClick={(e) => handleNavClick(e, "#home", "HOME")}
        >
          <span className={styles.logoMark}>
            <Image
              src="/logos/aice_logo.png"
              alt="AICE Logo"
              width={36}
              height={36}
              priority
            />
          </span>
          <span className={styles.logoText}>AICE</span>
        </a>

        <nav
          className={`${styles.navLinks} ${mobileOpen ? styles.navLinksOpen : ""}`}
          role="navigation"
          aria-label="Main Navigation"
        >
          {navLinks.map((link) => (
            <a
              key={link.id}
              id={link.id}
              href={link.href}
              className={`${styles.navLink} ${activeLink === link.label ? styles.active : ""}`}
              onClick={(e) => handleNavClick(e, link.href, link.label)}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          id="cta-join-now"
          className={styles.ctaBtn}
          aria-label="Join AICE now"
          onClick={() => {
            setMobileOpen(false);
            showToast("Membership registration is coming soon! Stay tuned.");
          }}
        >
          JOIN NOW
          <svg
            className={styles.ctaArrow}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>

        <button
          className={`${styles.hamburger} ${mobileOpen ? styles.hamburgerOpen : ""}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          id="hamburger-btn"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
