"use client";

import { useState, useEffect } from "react";
import styles from "./Toast.module.css";

type ToastListener = (msg: string) => void;
const listeners: Set<ToastListener> = new Set();

export function showToast(message: string) {
  listeners.forEach((listener) => listener(message));
}

export function ToastContainer() {
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);

  useEffect(() => {
    const handleToast: ToastListener = (msg: string) => {
      setToast({ id: Date.now(), message: msg });
    };
    listeners.add(handleToast);
    return () => {
      listeners.delete(handleToast);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  return (
    <div key={toast.id} className={styles.toast} role="status" aria-live="polite">
      <div className={styles.toastIcon}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={styles.iconSvg}
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <circle cx="12" cy="8" r="1" fill="currentColor" />
        </svg>
      </div>
      <span className={styles.toastText}>{toast.message}</span>
    </div>
  );
}

export default ToastContainer;
