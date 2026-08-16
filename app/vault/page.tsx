"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import styles from "./Vault.module.css";

const DEFAULT_PIN = process.env.NEXT_PUBLIC_EVENT_PIN || "7268";

// Clean SVG Icons
function VolumeMuteIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

function VolumeUpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function AwardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  );
}

// Web Audio Synthesizer
function createCyberAudio() {
  if (typeof window === "undefined") return null;
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) return null;
  return new AudioCtx();
}

function playSynthClick(ctx: AudioContext | null, muted: boolean) {
  if (!ctx || muted) return;
  try {
    if (ctx.state === "suspended") ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch {}
}

function playSynthBuzz(ctx: AudioContext | null, muted: boolean) {
  if (!ctx || muted) return;
  try {
    if (ctx.state === "suspended") ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch {}
}

function playSynthChime(ctx: AudioContext | null, muted: boolean) {
  if (!ctx || muted) return;
  try {
    if (ctx.state === "suspended") ctx.resume();
    const now = ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5];
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(f, now + idx * 0.08);
      gain.gain.setValueAtTime(0.15, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.3);
    });
  } catch {}
}

// Particle Confetti
function triggerConfetti() {
  if (typeof window === "undefined") return;
  const canvas = document.createElement("canvas");
  canvas.className = styles.confettiCanvas;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ["#ff2020", "#ffd700", "#ffffff", "#ef4444", "#38bdf8", "#34d399"];
  const particles: Array<{
    x: number;
    y: number;
    size: number;
    color: string;
    speedX: number;
    speedY: number;
    rotation: number;
    rotationSpeed: number;
    opacity: number;
  }> = [];

  for (let i = 0; i < 90; i++) {
    particles.push({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2 + 30,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedX: (Math.random() - 0.5) * 14,
      speedY: (Math.random() - 0.8) * 16,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 8,
      opacity: 1,
    });
  }

  let frame = 0;
  function animate() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let activeCount = 0;

    particles.forEach((p) => {
      if (p.opacity > 0.02) {
        activeCount++;
        p.x += p.speedX;
        p.y += p.speedY;
        p.speedY += 0.35;
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.012;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        ctx.restore();
      }
    });

    frame++;
    if (activeCount > 0 && frame < 150) {
      requestAnimationFrame(animate);
    } else {
      canvas.remove();
    }
  }

  requestAnimationFrame(animate);
}

function VaultContent() {
  const searchParams = useSearchParams();
  const targetPin = searchParams?.get("pin") || DEFAULT_PIN;
  const isDevMode = searchParams?.get("dev") === "true";

  // Audio State
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Phase State: "LOCKED" | "DECRYPTING" | "UNLOCKED"
  const [phase, setPhase] = useState<"LOCKED" | "DECRYPTING" | "UNLOCKED">("LOCKED");
  const [fullName, setFullName] = useState("");
  const [digits, setDigits] = useState<string[]>(["", "", "", ""]);
  const [isShaking, setIsShaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const [confirmedClaim, setConfirmedClaim] = useState<any | null>(null);

  // Initialize Web Audio
  const initAudio = useCallback(() => {
    if (!audioCtx) {
      const ctx = createCyberAudio();
      if (ctx) setAudioCtx(ctx);
    }
  }, [audioCtx]);

  // Initial load
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  // Submit and Unlock Verification
  const handleUnlockSubmit = async (
    e?: React.FormEvent,
    overridePin?: string,
    overrideName?: string
  ) => {
    if (e) e.preventDefault();
    initAudio();

    const cleanName = (overrideName !== undefined ? overrideName : fullName).trim();
    if (!cleanName) {
      setErrorMessage("Please enter your name.");
      nameInputRef.current?.focus();
      playSynthBuzz(audioCtx, isMuted);
      return;
    }

    const fullPin = overridePin !== undefined ? overridePin : digits.join("");
    if (fullPin.length < 4) {
      setErrorMessage("Please enter all 4 digits of the PIN.");
      const firstEmpty = digits.findIndex((d) => d === "");
      if (firstEmpty !== -1) inputRefs.current[firstEmpty]?.focus();
      playSynthBuzz(audioCtx, isMuted);
      return;
    }

    if (fullPin !== targetPin) {
      playSynthBuzz(audioCtx, isMuted);
      setIsShaking(true);
      setErrorMessage("Invalid 4-digit passcode. Try again.");
      setTimeout(() => {
        setIsShaking(false);
        setDigits(["", "", "", ""]);
        inputRefs.current[0]?.focus();
      }, 500);
      return;
    }

    // Correct PIN: Proceed to submit claim and unlock
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/vault/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin: fullPin,
          fullName: cleanName,
        }),
      });

      const data = await res.json();
      if (data.success && data.claim) {
        setConfirmedClaim(data.claim);
        playSynthChime(audioCtx, isMuted);
        setPhase("DECRYPTING");

        setTimeout(() => {
          setPhase("UNLOCKED");
          triggerConfetti();
        }, 1000);
      } else {
        setErrorMessage(data.error || "Failed to unlock. Please try again.");
        playSynthBuzz(audioCtx, isMuted);
      }
    } catch {
      setErrorMessage("Network error. Please try again.");
      playSynthBuzz(audioCtx, isMuted);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle single digit change
  const handleDigitChange = (index: number, val: string) => {
    initAudio();
    const char = val.slice(-1);
    if (char && !/^\d$/.test(char)) return;

    playSynthClick(audioCtx, isMuted);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setErrorMessage("");

    if (char && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // When all 4 digits are filled, automatically submit
    const fullPin = newDigits.join("");
    if (fullPin.length === 4 && !newDigits.includes("")) {
      if (fullName.trim()) {
        handleUnlockSubmit(undefined, fullPin, fullName);
      } else {
        setErrorMessage("Please enter your name.");
        nameInputRef.current?.focus();
        playSynthBuzz(audioCtx, isMuted);
      }
    }
  };

  // Handle Key Down (Backspace, Arrow keys)
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    initAudio();
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        setDigits(newDigits);
      } else {
        const newDigits = [...digits];
        newDigits[index] = "";
        setDigits(newDigits);
      }
      playSynthClick(audioCtx, isMuted);
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 3) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === "Enter") {
      handleUnlockSubmit();
    }
  };

  // Handle Paste
  const handlePaste = (e: React.ClipboardEvent) => {
    initAudio();
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pasted.length === 0) return;

    const newDigits = ["", "", "", ""];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);
    playSynthClick(audioCtx, isMuted);

    if (pasted.length === 4) {
      if (fullName.trim()) {
        handleUnlockSubmit(undefined, pasted, fullName);
      } else {
        setErrorMessage("Please enter your name.");
        nameInputRef.current?.focus();
      }
    } else {
      inputRefs.current[pasted.length]?.focus();
    }
  };

  // Dev Reset
  const handleDevReset = async () => {
    if (!confirm("Reset all event claims back to 0?")) return;
    try {
      await fetch("/api/vault/claim?action=reset", { method: "POST" });
      setConfirmedClaim(null);
      setPhase("LOCKED");
      setDigits(["", "", "", ""]);
      setFullName("");
      alert("Claims reset.");
    } catch {}
  };

  const isTopWinner = confirmedClaim && confirmedClaim.rank <= 3;

  return (
    <main className={styles.page}>
      {/* Site Official Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <div className={styles.mainContent}>
        {/* Subtle controls row */}
        <div className={styles.topControlsRow}>
          <button
            onClick={() => {
              initAudio();
              setIsMuted(!isMuted);
            }}
            className={styles.controlBtn}
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
          >
            {isMuted ? <VolumeMuteIcon /> : <VolumeUpIcon />}
            <span>{isMuted ? "SOUND OFF" : "SOUND ON"}</span>
          </button>

          {isDevMode && (
            <button onClick={handleDevReset} className={styles.controlBtn}>
              <ResetIcon />
              <span>RESET</span>
            </button>
          )}
        </div>

        {/* PHASE 1: MINIMAL LOCKED VAULT SCREEN */}
        {phase === "LOCKED" && (
          <div className={`${styles.vaultCard} ${isShaking ? styles.shakeAnimation : ""}`}>
            <div className={styles.lockIconWrapper}>
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>

            <h1 className={styles.vaultTitle}>
              ACCESS <span className={styles.titleAccent}>VAULT</span>
            </h1>

            <p className={styles.vaultSubtitle}>
              Enter your name and the 4-digit event PIN to crack the vault and claim your reward.
            </p>

            <form className={styles.passcodeForm} onSubmit={(e) => handleUnlockSubmit(e)}>
              {/* Name Input */}
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Your Name</label>
                <input
                  ref={nameInputRef}
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setErrorMessage("");
                  }}
                  placeholder="Enter your full name"
                  className={styles.nameInput}
                  autoComplete="name"
                />
              </div>

              {/* 4-Digit PIN Input */}
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>4-Digit Passcode</label>
                <div className={styles.pinContainer} onPaste={handlePaste}>
                  {digits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className={`${styles.pinBox} ${digit ? styles.pinBoxFilled : ""} ${
                        isShaking ? styles.pinBoxError : ""
                      }`}
                      autoComplete="off"
                      aria-label={`PIN Digit ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Feedback Message */}
              <div className={styles.feedbackMessage}>
                {errorMessage && <span className={styles.feedbackError}>{errorMessage}</span>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={styles.unlockSubmitBtn}
              >
                <span>{isSubmitting ? "UNLOCKING..." : "UNLOCK VAULT"}</span>
                <ArrowRightIcon />
              </button>
            </form>
          </div>
        )}

        {/* TRANSITION: DECRYPTING CIPHER */}
        {phase === "DECRYPTING" && (
          <div className={`${styles.vaultCard} ${styles.decryptingCard}`}>
            <div className={styles.decryptMatrix}>ACCESS GRANTED</div>
            <div className={styles.decryptProgress}>
              <div className={styles.decryptBar} />
            </div>
            <p className={styles.vaultSubtitle}>
              Decrypting prize vault...
            </p>
          </div>
        )}

        {/* PHASE 2: ULTRA MINIMAL REWARDS SCREEN (NO CARDS, NO GRADIENTS) */}
        {phase === "UNLOCKED" && (
          <div className={styles.minimalRewardsContainer}>
            <h1 className={styles.minimalRewardsTitle}>EVENT REWARDS</h1>
            <p className={styles.minimalRewardsSubtitle}>
              Congratulations, {confirmedClaim?.fullName || fullName}! You have cracked the passcode.
            </p>

            {/* Rank 1, 2, 3 (Top 3 Winners get Prize text & QR code) */}
            {isTopWinner ? (
              <>
                {confirmedClaim?.rewardDescription && (
                  <div className={styles.minimalRewardHighlight}>
                    <AwardIcon />
                    <span>{confirmedClaim.rewardDescription}</span>
                  </div>
                )}

                {/* QR Section - Only for Top 3 Winners */}
                <div className={styles.minimalQrSection}>
                  <div className={styles.minimalQrWrapper}>
                    <QRCodeSVG
                      value={`https://aice-cec.vercel.app/vault?verify=${confirmedClaim?.passCode || "AICE-EVENT"}`}
                      size={150}
                      level="M"
                    />
                  </div>

                  {confirmedClaim?.passCode && (
                    <div className={styles.minimalPassCode}>
                      CODE: {confirmedClaim.passCode}
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Rank > 3 (All 3 Prizes are claimed) */
              <div className={styles.minimalOverNotice}>
                <p className={styles.minimalOverText}>
                  All 3 prizes have already been claimed! Thank you for participating and great job on cracking the passcode.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Site Official Footer */}
      <Footer />
    </main>
  );
}

export default function VaultPage() {
  return (
    <Suspense fallback={<div className={styles.page} />}>
      <VaultContent />
    </Suspense>
  );
}
