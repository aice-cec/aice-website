import Link from "next/link";
import styles from "./NotFound.module.css";

export default function NotFound() {
  return (
    <main className={styles.notFound}>
      <h1 className={styles.title}>404</h1>
      <p className={styles.text}>Page not found.</p>

      <Link href="/" className={styles.button}>
        Go Home
      </Link>
    </main>
  );
}