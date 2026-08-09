"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./Footer.module.css";

function ArrowUpIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className={styles.icon}
    >
      <path
        d="M12 19V5M5 12l7-7 7 7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.topGlow} />

      <div className={styles.container}>
        <div className={styles.grid}>
          {/* ─── Column 1: Brand & Socials ─── */}
          <div className={styles.brandCol}>
            <Link href="/" className={styles.logoRow} aria-label="AICE Home">
              <Image
                src="/logos/aice_logo.png"
                alt="AICE Logo"
                width={32}
                height={32}
                style={{ height: "auto" }}
              />
              <span className={styles.logoText}>AICE</span>
            </Link>
            <p className={styles.description}>
              Empowering the next generation of AI leaders at the College of
              Engineering Chengannur.
            </p>
            <div className={styles.socialRow}>
              <a
                href="https://www.instagram.com/aice.cec"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIcon}
                aria-label="AICE Instagram"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://www.linkedin.com/company/aice-cec"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIcon}
                aria-label="AICE LinkedIn"
              >
                <LinkedInIcon />
              </a>
              <a
                href="mailto:aice@ceconline.edu"
                className={styles.socialIcon}
                aria-label="Send Email to AICE"
              >
                <MailIcon />
              </a>
            </div>
          </div>

          {/* ─── Column 2: Community Links ─── */}
          <div className={styles.linksCol}>
            <h3 className={styles.colTitle}>COMMUNITY</h3>
            <div className={styles.linksList}>
              <Link href="/#about" className={styles.linkItem}>About</Link>
              <Link href="/events" className={styles.linkItem}>Events</Link>
              <Link href="/#team" className={styles.linkItem}>Team</Link>
              <Link href="/register" className={styles.linkItem}>Join Us</Link>
            </div>
          </div>

          {/* ─── Column 3: Location ─── */}
          <div className={styles.locationCol}>
            <h3 className={styles.colTitle}>LOCATION</h3>
            <div className={styles.mapContainer}>
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3936.5681144026365!2d76.61555531478174!3d9.317556993318263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b0622ea027eb08f%3A0x41105adcc29d74a0!2sCollege%20of%20Engineering%20Chengannur!5e0!3m2!1sen!2sin!4v1692257223531!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>

        {/* ─── Bottom Bar ─── */}
        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            &copy; {new Date().getFullYear()} AICE CEC.
          </p>
          <button
            type="button"
            className={styles.scrollTopBtn}
            onClick={scrollToTop}
          >
            Back to top <ArrowUpIcon />
          </button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
