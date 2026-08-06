"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";

export interface EventItem {
  id: string;
  dateISO: string;
  date: string;
  month?: string;
  title: string;
  type?: string;
  label?: string;
  time?: string;
  place?: string;
  description?: string;
  stat?: string;
  featured?: boolean;
  isPast?: boolean;
  bgImage?: string;
  registrationLink?: string;
  registrationDeadline?: string;
}

const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];
const TOKEN_KEY = "aice_admin_token";

// SVG Icons
function EyeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  );
}

function ImportIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      width="15"
      height="15"
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
  );
}

export default function AdminPortalPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<"upcoming" | "past">("upcoming");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [savedSnapshot, setSavedSnapshot] = useState<string>("");

  // Login form state
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Form state for selected event
  const [form, setForm] = useState<EventItem>({
    id: "",
    dateISO: "",
    date: "",
    month: "",
    title: "",
    type: "",
    label: "",
    time: "",
    place: "",
    description: "",
    stat: "",
    featured: false,
    isPast: false,
    bgImage: "",
    registrationLink: "",
    registrationDeadline: "",
  });

  // Modal / Toast state
  const [toastMsg, setToastMsg] = useState<{
    text: string;
    isError?: boolean;
  } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ show: false, title: "", message: "", onConfirm: () => {} });

  const showToast = (text: string, isError = false) => {
    setToastMsg({ text, isError });
    setTimeout(() => {
      setToastMsg(null);
    }, 3500);
  };

  // Check auth on mount
  useEffect(() => {
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch initial events
  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setEvents(data);
        setSavedSnapshot(JSON.stringify(data));
        setSelectedEventId(data[0].id);
        setForm(data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch events:", err);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Handle selecting an event
  const selectEvent = (ev: EventItem) => {
    setSelectedEventId(ev.id);
    setForm(ev);
  };

  // Update event in state on form change
  const handleInputChange = (field: keyof EventItem, value: any) => {
    const updatedForm = { ...form, [field]: value };

    if (field === "dateISO" && typeof value === "string" && value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        updatedForm.date = String(d.getDate()).padStart(2, "0");
        updatedForm.month = MONTHS[d.getMonth()];
      }
    }

    if (field === "type") {
      updatedForm.label = value;
    }

    setForm(updatedForm);

    setEvents((prev) =>
      prev.map((e) => (e.id === updatedForm.id ? updatedForm : e)),
    );
  };

  // Login Handler
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

      sessionStorage.setItem(TOKEN_KEY, data.token);
      setIsAuthenticated(true);
      showToast("Logged in successfully!");
    } catch (err) {
      setLoginError("Network Error");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    setIsAuthenticated(false);
    showToast("Logged out");
  };

  // Create new event
  const handleCreateNewEvent = () => {
    const newId = "event-" + Date.now();
    const d = new Date();
    const todayISO = d.toISOString().split("T")[0];

    const newEv: EventItem = {
      id: newId,
      dateISO: todayISO,
      date: String(d.getDate()).padStart(2, "0"),
      month: MONTHS[d.getMonth()],
      title: "NEW EVENT",
      type: "Workshop",
      label: "Workshop",
      time: "5:00 PM — 7:00 PM",
      place: "Innovation Lab, CEC",
      description: "Description of the new event.",
      featured: false,
      isPast: false,
      bgImage: "",
      registrationLink: "",
      registrationDeadline: "",
    };

    const updated = [newEv, ...events];
    setEvents(updated);
    if (newEv.isPast) setCurrentTab("past");
    else setCurrentTab("upcoming");
    selectEvent(newEv);
    showToast("New event created!");
  };

  // Delete event
  const handleDeleteCurrentEvent = () => {
    if (!selectedEventId) return;

    setConfirmModal({
      show: true,
      title: "Delete Event",
      message: `Are you sure you want to delete "${form.title || "this event"}"?`,
      onConfirm: () => {
        const remaining = events.filter((e) => e.id !== selectedEventId);
        setEvents(remaining);
        if (remaining.length > 0) {
          selectEvent(remaining[0]);
        } else {
          setSelectedEventId(null);
        }
        showToast("Event deleted!");
      },
    });
  };

  // Discard changes
  const handleDiscardChanges = () => {
    if (savedSnapshot) {
      const restored: EventItem[] = JSON.parse(savedSnapshot);
      setEvents(restored);
      if (selectedEventId && restored.some((e) => e.id === selectedEventId)) {
        const match = restored.find((e) => e.id === selectedEventId)!;
        setForm(match);
      } else if (restored.length > 0) {
        selectEvent(restored[0]);
      }
      showToast("Changes discarded");
    }
  };

  // Save Changes to Supabase API
  const handlePublishChanges = async () => {
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) {
      setIsAuthenticated(false);
      showToast("Please log in first!", true);
      return;
    }

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify(events),
      });

      const data = await res.json();
      if (res.status === 401) {
        sessionStorage.removeItem(TOKEN_KEY);
        setIsAuthenticated(false);
        showToast("Session expired. Please log in again.", true);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to save events");
      }

      setSavedSnapshot(JSON.stringify(events));
      showToast("Successfully saved all event changes!");
    } catch (err: any) {
      showToast("Save Error: " + err.message, true);
    }
  };

  // Export JSON
  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(events, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "events.json";
    a.click();
    URL.revokeObjectURL(url);
    showToast("events.json exported!");
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        if (Array.isArray(data)) {
          setEvents(data);
          if (data.length > 0) selectEvent(data[0]);
          showToast("JSON imported successfully!");
        }
      } catch (err) {
        showToast("Invalid JSON file!", true);
      }
    };
    reader.readAsText(file);
  };

  const isDirty = JSON.stringify(events) !== savedSnapshot;
  const filteredEvents = events.filter((e) =>
    currentTab === "past" ? e.isPast : !e.isPast,
  );

  return (
    <div className="min-h-screen bg-[#070709] text-gray-100 font-sans flex flex-col">
      {/* Login Modal */}
      {!isAuthenticated && (
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
                  Please log in to manage events
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
                <div className="p-2.5 text-xs text-center text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg">
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
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-[#121217]/80 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9">
            <Image
              src="/logos/aice_logo.png"
              alt="AICE logo"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-white">
              AICE PR Admin
            </h1>
            <p className="text-xs text-gray-400">
              Event Management & Live Sync
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap max-sm:w-full max-sm:overflow-x-auto max-sm:pb-1">
          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-200 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ExportIcon /> Export JSON
          </button>

          <label className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-200 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 cursor-pointer transition-colors">
            <ImportIcon /> Import JSON
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>

          <button
            onClick={handlePublishChanges}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-md"
          >
            <SendIcon /> Publish Changes
          </button>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-lg transition-colors"
          >
            <LogoutIcon /> Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        {/* Sidebar Event List */}
        <aside className="flex flex-col bg-[#121217] border border-white/10 rounded-xl overflow-hidden h-fit max-h-[300px] lg:max-h-[calc(100vh-120px)] lg:sticky lg:top-24">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <span className="text-sm font-bold text-white">Events</span>
            <button
              onClick={handleCreateNewEvent}
              className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              + New Event
            </button>
          </div>

          <div className="flex border-b border-white/10 bg-black/20">
            <button
              onClick={() => setCurrentTab("upcoming")}
              className={`flex-1 py-2 text-xs font-medium border-b-2 transition-colors ${
                currentTab === "upcoming"
                  ? "text-white bg-white/5 border-red-500"
                  : "text-gray-400 border-transparent hover:text-white"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setCurrentTab("past")}
              className={`flex-1 py-2 text-xs font-medium border-b-2 transition-colors ${
                currentTab === "past"
                  ? "text-white bg-white/5 border-red-500"
                  : "text-gray-400 border-transparent hover:text-white"
              }`}
            >
              Past
            </button>
          </div>

          <div className="p-3 overflow-y-auto flex flex-col gap-2 max-h-60 lg:max-h-full">
            {filteredEvents.length === 0 ? (
              <div className="p-4 text-xs text-center text-gray-500">
                No events found
              </div>
            ) : (
              filteredEvents.map((item) => (
                <div
                  key={item.id}
                  onClick={() => selectEvent(item)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    item.id === selectedEventId
                      ? "border-red-500 bg-red-500/10"
                      : "border-white/10 bg-white/[0.02] hover:bg-white/5"
                  }`}
                >
                  <div className="text-sm font-bold text-white truncate mb-1">
                    {item.title || "Untitled Event"}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{item.dateISO || ""}</span>
                    {item.featured && (
                      <span className="px-1.5 py-0.5 text-[10px] font-extrabold uppercase bg-red-500/20 text-red-400 rounded">
                        Featured
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Content Section: Form & Live Preview */}
        <section className="flex flex-col gap-6">
          {/* Form Card */}
          <div className="p-5 md:p-6 bg-[#121217] border border-white/10 rounded-xl">
            <div className="flex items-center justify-between pb-3 mb-5 border-b border-white/10">
              <span className="text-base font-bold text-white truncate">
                Edit Event: {form.title || ""}
              </span>
              <button
                onClick={handleDeleteCurrentEvent}
                className="px-3 py-1.5 text-xs font-semibold text-red-400 bg-red-500/15 border border-red-500/30 hover:bg-red-500/25 rounded-lg transition-colors"
              >
                Delete Event
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-gray-400">
                  Event Name / Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="e.g. AICE BUILD NIGHT"
                  required
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-gray-400">
                  Description *
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Short description of the event..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors resize-y"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400">
                  Type / Category
                </label>
                <input
                  type="text"
                  value={form.type || form.label || ""}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                  placeholder="e.g. Hands-on workshop"
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400">
                  Card Background Image URL
                </label>
                <input
                  type="url"
                  value={form.bgImage || ""}
                  onChange={(e) => handleInputChange("bgImage", e.target.value)}
                  placeholder="https://domain.com/image.jpg"
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400">
                  Event Date (Date Picker) *
                </label>
                <input
                  type="date"
                  value={form.dateISO || ""}
                  onChange={(e) => handleInputChange("dateISO", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400">
                  Time Range
                </label>
                <input
                  type="text"
                  value={form.time || ""}
                  onChange={(e) => handleInputChange("time", e.target.value)}
                  placeholder="e.g. 5:30 PM — 8:30 PM"
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400">
                  Venue / Location
                </label>
                <input
                  type="text"
                  value={form.place || ""}
                  onChange={(e) => handleInputChange("place", e.target.value)}
                  placeholder="e.g. Innovation Lab, CEC"
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400">
                  Registration Form Link
                </label>
                <input
                  type="url"
                  value={form.registrationLink || ""}
                  onChange={(e) =>
                    handleInputChange("registrationLink", e.target.value)
                  }
                  placeholder="https://forms.gle/..."
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400">
                  Registration Deadline
                </label>
                <input
                  type="datetime-local"
                  value={form.registrationDeadline || ""}
                  onChange={(e) =>
                    handleInputChange("registrationDeadline", e.target.value)
                  }
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400">
                  Stat / Badge (Past events)
                </label>
                <input
                  type="text"
                  value={form.stat || ""}
                  onChange={(e) => handleInputChange("stat", e.target.value)}
                  placeholder="e.g. 120+ builders"
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div className="md:col-span-2 flex flex-wrap gap-6 mt-2">
                <label className="flex items-center gap-2 text-xs font-medium text-gray-200 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(form.featured)}
                    onChange={(e) =>
                      handleInputChange("featured", e.target.checked)
                    }
                    className="w-4 h-4 accent-red-500 rounded cursor-pointer"
                  />
                  Featured Event (Highlight on Homepage)
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-gray-200 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(form.isPast)}
                    onChange={(e) =>
                      handleInputChange("isPast", e.target.checked)
                    }
                    className="w-4 h-4 accent-red-500 rounded cursor-pointer"
                  />
                  Mark as Past Event
                </label>
              </div>
            </div>
          </div>

          {/* Live Card Preview Card */}
          <div className="p-5 md:p-6 bg-[#121217] border border-white/10 rounded-xl">
            <div className="text-base font-bold text-white pb-3 mb-4 border-b border-white/10">
              Live Card Preview
            </div>
            <div className="p-4 bg-[#050505] border border-dashed border-white/10 rounded-xl">
              <div className="relative max-w-md p-6 bg-white/[0.03] border border-white/15 rounded-2xl overflow-hidden">
                {form.bgImage && (
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-25 z-0"
                    style={{ backgroundImage: `url('${form.bgImage}')` }}
                  />
                )}
                <div className="relative z-10">
                  <div className="inline-block px-2.5 py-1 mb-2 text-xs font-extrabold bg-black/40 border border-white/10 rounded-lg">
                    {`${form.date || "01"} ${form.month || "JAN"}`}
                  </div>
                  <div className="text-xl font-black mb-1.5 text-white">
                    {form.title || "Event Name"}
                  </div>
                  <div className="text-xs text-white/60 mb-4">
                    {form.description || "Description..."}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs text-white/60">
                    <span>{form.time || "TBA"}</span>
                    <span>{form.place || "CEC"}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold text-white ${
                        form.registrationLink
                          ? form.registrationDeadline &&
                            new Date(form.registrationDeadline) < new Date()
                            ? "bg-gray-600"
                            : "bg-red-600"
                          : "bg-white/15"
                      }`}
                    >
                      {form.registrationLink
                        ? form.registrationDeadline &&
                          new Date(form.registrationDeadline) < new Date()
                          ? "CLOSED"
                          : "REGISTER"
                        : "DETAILS"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Unsaved Changes Bar */}
      {isDirty && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between gap-6 px-5 py-3 bg-[#121217]/95 backdrop-blur-md border border-red-500/40 rounded-xl shadow-2xl max-sm:w-[calc(100%-2rem)] max-sm:flex-col max-sm:gap-3">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-white">
            <span className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_#ef4444]" />
            You have unsaved changes
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDiscardChanges}
              className="px-3 py-1.5 text-xs font-semibold text-red-400 bg-red-500/15 border border-red-500/30 hover:bg-red-500/25 rounded-lg transition-colors"
            >
              Discard
            </button>
            <button
              onClick={handlePublishChanges}
              className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-md"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070709]/85 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-[#121217] border border-white/10 rounded-2xl shadow-2xl">
            <div className="text-lg font-extrabold text-white mb-2">
              {confirmModal.title}
            </div>
            <p className="text-xs text-gray-400 mb-5">{confirmModal.message}</p>
            <div className="flex justify-end gap-2.5">
              <button
                onClick={() =>
                  setConfirmModal({ ...confirmModal, show: false })
                }
                className="px-4 py-2 text-xs font-semibold text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal({ ...confirmModal, show: false });
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg text-xs font-semibold text-white shadow-2xl transition-all ${
            toastMsg.isError ? "bg-red-600" : "bg-emerald-600"
          }`}
        >
          {toastMsg.text}
        </div>
      )}
    </div>
  );
}
