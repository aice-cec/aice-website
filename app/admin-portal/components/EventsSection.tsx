"use client";

import { useRef } from "react";
import { EventItem } from "../types";

function CalendarIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

interface EventsSectionProps {
  events: EventItem[];
  filteredEvents: EventItem[];
  selectedEventId: string | null;
  currentTab: "upcoming" | "past";
  setCurrentTab: (tab: "upcoming" | "past") => void;
  form: EventItem;
  selectEvent: (ev: EventItem) => void;
  handleCreateNewEvent: () => void;
  handleDeleteCurrentEvent: () => void;
  handleInputChange: (field: keyof EventItem, value: any) => void;
}

export function EventsSection({
  filteredEvents,
  selectedEventId,
  currentTab,
  setCurrentTab,
  form,
  selectEvent,
  handleCreateNewEvent,
  handleDeleteCurrentEvent,
  handleInputChange,
}: EventsSectionProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const deadlineInputRef = useRef<HTMLInputElement>(null);
  const isComingSoon =
    form.date === "SOON" ||
    form.date === "TBA" ||
    (!form.dateISO && Boolean(form.date) && form.date !== "");
  return (
    <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 min-w-0 pb-36">
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
                  <span>
                    {item.date === "SOON" || item.date === "TBA" || (!item.dateISO && item.date)
                      ? "Coming Soon"
                      : item.dateISO || `${item.date || ""} ${item.month || ""}`}
                  </span>
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
      <section className="flex flex-col gap-6 min-w-0">
        <div className="p-5 md:p-6 bg-[#121217] border border-white/10 rounded-xl min-w-0">
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
                maxLength={150}
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
                onChange={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(500, Math.max(100, e.target.scrollHeight))}px`;
                  handleInputChange("description", e.target.value);
                }}
                ref={(el) => {
                  if (el) {
                    el.style.height = "auto";
                    el.style.height = `${Math.min(500, Math.max(100, el.scrollHeight))}px`;
                  }
                }}
                placeholder="Short description of the event..."
                rows={4}
                maxLength={1500}
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors resize-y min-h-[100px] max-h-[500px] overflow-y-auto break-words [field-sizing:content]"
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
                maxLength={100}
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-400">
                  Event Date *
                </label>
                <label className="flex items-center gap-1.5 text-xs text-red-400 font-medium cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isComingSoon}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleInputChange("dateISO", "");
                        handleInputChange("date", "SOON");
                        handleInputChange("month", "COMING");
                      } else {
                        const today = new Date().toISOString().split("T")[0];
                        handleInputChange("dateISO", today);
                      }
                    }}
                    className="w-3.5 h-3.5 accent-red-500 rounded cursor-pointer"
                  />
                  Coming Soon / TBA
                </label>
              </div>

              {isComingSoon ? (
                <div className="flex items-center justify-between px-3.5 py-2.5 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-300">
                  <span className="font-semibold text-xs flex items-center gap-2 uppercase tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    Date: Coming Soon / TBA
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date().toISOString().split("T")[0];
                      handleInputChange("dateISO", today);
                    }}
                    className="text-xs text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded transition-colors font-medium"
                  >
                    Select Calendar Date
                  </button>
                </div>
              ) : (
                <div className="relative flex items-center">
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={form.dateISO || ""}
                    onClick={(e) => {
                      try {
                        e.currentTarget.showPicker?.();
                      } catch (err) {}
                    }}
                    onChange={(e) => handleInputChange("dateISO", e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-red-500 transition-colors cursor-pointer [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        dateInputRef.current?.showPicker?.();
                      } catch (err) {}
                    }}
                    className="absolute right-3 p-1 text-gray-400 hover:text-white transition-colors"
                    title="Open Calendar Picker"
                  >
                    <CalendarIcon />
                  </button>
                </div>
              )}
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
                maxLength={100}
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
                placeholder="e.g. SDPK ROOM"
                maxLength={100}
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400">
                Registration Form Link
              </label>
              <input
                type="text"
                value={form.registrationLink || ""}
                onChange={(e) =>
                  handleInputChange("registrationLink", e.target.value)
                }
                placeholder="https://forms.gle/... or /aice-build-night"
                maxLength={250}
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400">
                Registration Deadline
              </label>
              <div className="relative flex items-center">
                <input
                  ref={deadlineInputRef}
                  type="datetime-local"
                  value={form.registrationDeadline || ""}
                  onClick={(e) => {
                    try {
                      e.currentTarget.showPicker?.();
                    } catch (err) {}
                  }}
                  onChange={(e) =>
                    handleInputChange(
                      "registrationDeadline",
                      e.target.value
                    )
                  }
                  className="w-full pl-3.5 pr-10 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-red-500 transition-colors cursor-pointer [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:hidden"
                />
                <button
                  type="button"
                  onClick={() => {
                    try {
                      deadlineInputRef.current?.showPicker?.();
                    } catch (err) {}
                  }}
                  className="absolute right-3 p-1 text-gray-400 hover:text-white transition-colors"
                  title="Open DateTime Picker"
                >
                  <CalendarIcon />
                </button>
              </div>
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
                maxLength={60}
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
              <div className="relative z-10">
                <div className="inline-block px-2.5 py-1 mb-2 text-xs font-extrabold bg-black/40 border border-white/10 rounded-lg">
                  {isComingSoon
                    ? "COMING SOON"
                    : `${form.date || "01"} ${form.month || "JAN"}`}
                </div>
                <div className="text-xl font-black mb-1.5 text-white break-words">
                  {form.title || "Event Name"}
                </div>
                <div className="text-xs text-white/60 mb-4 break-words">
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
  );
}
