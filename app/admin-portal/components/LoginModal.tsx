"use client";

import { useState } from "react";
import Image from "next/image";

interface LoginModalProps {
  onLoginSuccess: () => void;
  showToast: (text: string, isError?: boolean) => void;
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export function LoginModal({ onLoginSuccess, showToast }: LoginModalProps) {
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUser, password: loginPass }),
      });

      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Invalid credentials");
        return;
      }

      onLoginSuccess();
      showToast("Logged in successfully!");
    } catch (err) {
      setLoginError("Network Error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070709]/95 backdrop-blur-md">
      <div className="w-full max-w-md p-8 bg-[#121217] border border-white/10 rounded-2xl shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative w-10 h-10">
            <Image
              src="/logos/aice_logo.png"
              alt="AICE logo"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-white">
              AICE PR Admin
            </h2>
            <p className="text-xs text-gray-400">
              Please log in to manage events & forms
            </p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-400">
              User ID
            </label>
            <input
              type="text"
              value={loginUser}
              onChange={(e) => setLoginUser(e.target.value)}
              placeholder="Enter User ID"
              maxLength={60}
              required
              className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-400">
              Password
            </label>
            <div className="relative flex items-center w-full">
              <input
                type={showPass ? "text" : "password"}
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="Enter Password"
                maxLength={60}
                required
                className="w-full px-3.5 py-2.5 pr-10 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPass((prev) => !prev)}
                className="absolute right-2.5 p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors focus:outline-none"
                title={showPass ? "Hide password" : "Show password"}
              >
                {showPass ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {loginError && (
            <div className="p-2.5 text-xs text-center text-red-400 bg-orange-500/10 border border-red-500/20 rounded-lg">
              {loginError}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 mt-1 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-lg transition-colors shadow-lg"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}
