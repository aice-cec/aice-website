"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./LoadingScreen.module.css";

interface LoadingScreenProps {
  onComplete?: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isFinishedRef = useRef(false);

  const finishLoading = () => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    setIsFading(true);
    onComplete?.();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("aice-loading-complete"));
    }
    setTimeout(() => {
      setIsLoading(false);
      document.body.style.overflow = "";
    }, 600);
  };

  const handleVideoReady = () => {
    setIsVideoReady(true);
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.0;
      videoRef.current.play().catch(() => {
        setTimeout(finishLoading, 1000);
      });
    }
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";

    if (videoRef.current && videoRef.current.readyState >= 3) {
      handleVideoReady();
    }

    const fallbackTimer = setTimeout(finishLoading, 2500);

    return () => {
      clearTimeout(fallbackTimer);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isLoading) return null;

  return (
    <div
      className={`${styles.loadingOverlay} ${isFading ? styles.fadeOut : ""}`}
      aria-label="Loading AICE"
      role="status"
    >
      <div
        className={`${styles.videoWrap} ${isVideoReady ? styles.videoReady : ""}`}
      >
        <video
          ref={videoRef}
          src="/assets/loading.webm"
          className={styles.video}
          autoPlay
          muted
          playsInline
          preload="auto"
          onCanPlayThrough={handleVideoReady}
          onLoadedData={handleVideoReady}
          onEnded={finishLoading}
        />
      </div>
    </div>
  );
}
