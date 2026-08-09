"use client";

import Map from "./Map";
import Image from "next/image";
import styles from "./Footer.module.css";

function ArrowUpIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      style={{ width: 16, height: 16 }}
    >
      <path d="M12 19V5" />
      <path d="M6 11l6-6 6 6" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      style={{ width: 16, height: 16 }}
    >
      <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.25-3.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      style={{ width: 16, height: 16 }}
    >
      <path d="M5.2 3.5A2.2 2.2 0 1 1 5.2 7.9a2.2 2.2 0 0 1 0-4.4ZM3.2 9h4v11h-4V9Zm6.4 0h3.8v1.5h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V20h-4v-4.82c0-1.15-.02-2.63-1.6-2.63-1.6 0-1.85 1.25-1.85 2.55V20h-4V9Z" />
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
      style={{ width: 16, height: 16 }}
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/*BRAND*/}

          <div className={styles.brandCol}>
            <a
              href="#home"
              className={styles.logoRow}
              aria-label="AICE Home"
            >
              <Image
                src="/logos/aice_logo.png"
                alt="AICE Logo"
                width={56}
                height={56}
                style={{ height: "auto" }}
              />

              <span className={styles.logoText}></span>
            </a>

            <p className={styles.tagline}>
              AI INNOVATION COMMUNITY FOR EXCELLENCE
            </p>

            <p className={styles.collegeText}>
              COLLEGE OF ENGINEERING CHENGANNUR
            </p>

            <p className={styles.subDescription}>
              Cultivating curious minds, fostering innovation, and building
              real-world AI solutions at CEC.
            </p>

            {/* CONNECT WITH US*/}

            <div className={styles.rightCol}>
              <p className={styles.columnLabel}>CONNECT WITH US</p>

              <div className={styles.socialRow}>
                <a
                  href="https://www.instagram.com/aice.cec"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialItem}
                  aria-label="AICE Instagram"
                >
                  <div className={styles.socialBtn}>
                    <InstagramIcon />
                  </div>

                </a>
                <a
                  href="https://www.linkedin.com/company/aice-cec"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialItem}
                  aria-label="AICE LinkedIn"
                >
                  <div className={styles.socialBtn}>
                    <LinkedInIcon />
                  </div>
              
                </a>
                <a
                  href="mailto:aice@ceconline.edu"
                  className={styles.socialItem}
                  aria-label="Send Email to AICE"
                >
                  <div className={styles.socialBtn}>
                    <MailIcon />
                  </div>
                </a>
              </div>
            </div>
         </div>
         <div className={styles.MapWrap}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3937.1798097474593!2d76.61261467582871!3d9.317330560600364!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b0622ea027eb08f%3A0x41105b207db821c6!2sCollege%20of%20Engineering%20Chengannur!5e0!3m2!1sen!2sin!4v1786270661445!5m2!1sen!2sin"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Location Map"
            />
         </div>
        </div>

        {/*BOTTOM BAR*/}

        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()}{" "}
            <span>AICE CEC</span>. All rights reserved.
          </p>

          <button
            type="button"
            className={styles.scrollTopBtn}
            onClick={scrollToTop}
          >
            BACK TO TOP
            <ArrowUpIcon />
          </button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;