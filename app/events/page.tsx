"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { renderTextWithLinks } from "@/lib/formatText";
import styles from "./Events.module.css";

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
  registrationLink?: string;
  registrationDeadline?: string;
}

function CalendarIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
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

function MapPinIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ArrowRightIcon() {
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
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function SearchIcon() {
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
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [tab, setTab] = useState<"all" | "upcoming" | "past">("all");
  const [category, setCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEvents(data);
        } else {
          setEvents([]);
        }
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => {
      const cat = e.type || e.label;
      if (cat) set.add(cat);
    });
    return ["All", ...Array.from(set)];
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events
      .filter((e) => {
        // Tab filter
        if (tab === "upcoming" && e.isPast) return false;
        if (tab === "past" && !e.isPast) return false;

        // Category filter
        if (category !== "All") {
          const cat = e.type || e.label || "";
          if (cat.toLowerCase() !== category.toLowerCase()) return false;
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const title = e.title.toLowerCase();
          const desc = (e.description || "").toLowerCase();
          const place = (e.place || "").toLowerCase();
          if (!title.includes(q) && !desc.includes(q) && !place.includes(q)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (tab === "all" && Boolean(a.isPast) !== Boolean(b.isPast)) {
          return a.isPast ? 1 : -1;
        }

        const timeA = a.dateISO ? new Date(a.dateISO).getTime() : 0;
        const timeB = b.dateISO ? new Date(b.dateISO).getTime() : 0;

        const validA = !isNaN(timeA) && timeA > 0;
        const validB = !isNaN(timeB) && timeB > 0;

        if (!validA && !validB) return 0;
        if (!validA) return 1;
        if (!validB) return -1;

        if (tab === "past" || (tab === "all" && a.isPast && b.isPast)) {
          return timeB - timeA;
        }
        return timeA - timeB;
      });
  }, [events, tab, category, searchQuery]);

  const now = new Date();

  return (
    <div className={styles.wrapper}>
      <div className={styles.glowRight} />
      <div className={styles.glowLeft} />

      <Navbar />

      <main className={styles.container}>
        <div className={styles.heroHeader}>
          <h1 className={styles.heroTitle}>
            AICE <span className={styles.titleAccent}>EVENTS</span>
          </h1>

          <p className={styles.heroSubtitle}>
            Hands-on workshops, hackathons, expert talks, and open build
            sessions designed to fuel your innovation in Artificial
            Intelligence.
          </p>
        </div>

        <div className={styles.filterBar}>
          <div className={styles.tabGroup}>
            {(["all", "upcoming", "past"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`${styles.tabBtn} ${
                  tab === t ? styles.tabBtnActive : ""
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className={styles.searchWrapper}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events by title or keyword..."
              className={styles.searchInput}
            />
            <div className={styles.searchIcon}>
              <SearchIcon />
            </div>
          </div>
        </div>

        {categories.length > 1 && (
          <div className={styles.categoryScroll}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`${styles.categoryPill} ${
                  category === cat ? styles.categoryPillActive : ""
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className={styles.eventsGrid}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={styles.skeletonCard}>
                <div
                  className={styles.skeletonBlock}
                  style={{ width: "35%", height: "1.5rem" }}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  <div
                    className={styles.skeletonBlock}
                    style={{ width: "80%", height: "2rem" }}
                  />
                  <div
                    className={styles.skeletonBlock}
                    style={{ width: "100%", height: "3rem" }}
                  />
                </div>
                <div
                  className={styles.skeletonBlock}
                  style={{ width: "100%", height: "2.5rem" }}
                />
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <CalendarIcon />
            </div>
            <h3 className={styles.emptyTitle}>
              Stay Tuned for Upcoming Events
            </h3>
            <p className={styles.emptyText}>
              We are preparing exciting workshops and hackathons.
            </p>
            {(searchQuery.trim() || category !== "All" || tab !== "all") && (
              <button
                onClick={() => {
                  setTab("all");
                  setCategory("All");
                  setSearchQuery("");
                }}
                className={styles.resetBtn}
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className={styles.eventsGrid}>
            {filteredEvents.map((event) => {
              const hasDeadline = Boolean(event.registrationDeadline);
              const isExpired =
                hasDeadline &&
                new Date(event.registrationDeadline!).getTime() < now.getTime();
              const hasRegLink = Boolean(event.registrationLink);

              return (
                <article
                  key={event.id || event.title}
                  className={`${styles.eventCard} ${
                    event.featured ? styles.eventCardFeatured : ""
                  }`}
                >
                  <div className={styles.cardContent}>
                    <div>
                      <div className={styles.cardHeader}>
                        <div className={styles.dateBadge}>
                          <span className={styles.dateNum}>
                            {event.date === "SOON" ||
                            event.date === "COMING" ||
                            event.date === "TBA" ||
                            (!event.dateISO && event.date)
                              ? "COMING"
                              : event.date || "COMING"}
                          </span>
                          <span className={styles.dateMonth}>
                            {event.date === "SOON" ||
                            event.date === "COMING" ||
                            event.date === "TBA" ||
                            (!event.dateISO && event.date)
                              ? "SOON"
                              : event.month || ""}
                          </span>
                        </div>

                        {event.featured && (
                          <span className={styles.featuredBadge}>FEATURED</span>
                        )}
                      </div>

                      <span className={styles.cardType}>
                        {event.type || event.label || "EVENT"}
                      </span>

                      <h3 className={styles.cardTitle}>{event.title}</h3>

                      <p className={styles.cardDesc}>
                        {renderTextWithLinks(event.description)}
                      </p>
                    </div>

                    <div className={styles.cardMeta}>
                      {event.time && (
                        <div className={styles.metaItem}>
                          <CalendarIcon />
                          <span>{event.time}</span>
                        </div>
                      )}

                      {event.place && (
                        <div className={styles.metaItem}>
                          <MapPinIcon />
                          <span>{event.place}</span>
                        </div>
                      )}

                      {event.stat && (
                        <div className={styles.statBadge}>{event.stat}</div>
                      )}
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    {event.isPast ? (
                      <div className={styles.concludedBtn}>EVENT CONCLUDED</div>
                    ) : hasRegLink ? (
                      isExpired ? (
                        <div className={styles.closedBtn}>
                          REGISTRATION CLOSED
                        </div>
                      ) : (
                        <a
                          href={event.registrationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.regBtn}
                        >
                          REGISTER NOW <ArrowRightIcon />
                        </a>
                      )
                    ) : (
                      <Link href="/#join" className={styles.detailsBtn}>
                        VIEW DETAILS <ArrowRightIcon />
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
