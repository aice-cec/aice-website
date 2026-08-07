import Link from "next/link";
import Image from "next/image";
import styles from "./NotFound.module.css";

export default function NotFound() {
  return (
    <main className={styles.container}>
      {/* Visual background layers */}
      <div className={styles.gridBackground} aria-hidden="true" />
      <div className={styles.glowAmbientRed} aria-hidden="true" />
      <div className={styles.glowAmbientCyan} aria-hidden="true" />

      {/* Header bar with AICE branding */}
      <header className={styles.headerBar}>
        <Link href="/" className={styles.logoRow} aria-label="AICE Home">
          <Image
            src="/logos/aice_logo.png"
            alt="AICE Logo"
            width={32}
            height={32}
            style={{ width: "auto", height: "auto" }}
            priority
          />
          <span className={styles.logoText}>AICE</span>
        </Link>
      </header>

      {/* Main hero content split layout */}
      <div className={styles.contentWrapper}>
        <div className={styles.textContent}>
          <h1 className={styles.errorCode}>404</h1>

          <h2 className={styles.title}>Lost in the Neural Network?</h2>

          <p className={styles.description}>
            The link or page you are searching for doesn’t exist or has been
            moved. Our AI mascot is searching for it, but in the meantime, let’s
            get you back on track!
          </p>

          <div className={styles.actionRow}>
            <Link href="/" className={styles.primaryBtn}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Return Home
            </Link>
          </div>
        </div>

        {/* Robot Mascot section using public/robot/robot-404.png */}
        <div className={styles.robotWrapper}>
          <div className={styles.robotCard}>
            <div className={styles.robotAura} aria-hidden="true" />
            <div className={styles.robotImgContainer}>
              <Image
                src="/robot/robot-404.png"
                alt="AICE Robot 404 Mascot"
                fill
                sizes="(max-width: 868px) 100vw, 680px"
                className={styles.robotImg}
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <footer className={styles.footerBar}>
        <p className={styles.footerText}>
          &copy; {new Date().getFullYear()} AICE — College of Engineering
          Chengannur
        </p>
      </footer>
    </main>
  );
}
