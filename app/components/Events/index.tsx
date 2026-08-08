"use client";

import { useEffect, useState } from "react";
import styles from "./Event.module.css";
import eventsData from "@/data/events.json";

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

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className={styles.arrowIcon}
    >
      <path
        d="M5 12h14M13 6l6 6-6 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
      className={styles.metaIcon}
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
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
      className={styles.metaIcon}
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function Events() {
  const [eventsList, setEventsList] = useState<EventItem[]>(
    eventsData as EventItem[]
  );

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setEventsList(data);
        }
      })
      .catch(() => {});
  }, []);

  // Filter upcoming events & sort chronologically
  const upcomingEvents = eventsList
    .filter((e) => !e.isPast)
    .sort((a, b) => {
      const timeA = a.dateISO ? new Date(a.dateISO).getTime() : 0;
      const timeB = b.dateISO ? new Date(b.dateISO).getTime() : 0;
      const validA = !isNaN(timeA) && timeA > 0;
      const validB = !isNaN(timeB) && timeB > 0;
      if (!validA && !validB) return 0;
      if (!validA) return 1;
      if (!validB) return -1;
      return timeA - timeB;
    });

  // If fewer than 3 upcoming events, fallback to showing featured past events to keep 3 cards grid full
  let displayEvents = upcomingEvents.slice(0, 3);
  if (displayEvents.length < 3) {
    const remainingCount = 3 - displayEvents.length;
    const pastFillers = eventsList
      .filter((e) => e.isPast && !displayEvents.some((d) => d.id === e.id))
      .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime())
      .slice(0, remainingCount);
    displayEvents = [...displayEvents, ...pastFillers];
  }

  const now = new Date();

  return (
    <section id="events" className={styles.section}>
      <div className={styles.glowRight} />
      <div className={styles.glowLeft} />

      <div className={styles.container}>
        {/* Header Row */}
        <div className={styles.headerRow}>
          <div>
            <h2 className={styles.heading}>
              UPCOMING <span className={styles.headingAccent}>EVENTS</span>
            </h2>
            <p className={styles.subheading}>
              Join our interactive workshops, hackathons, and open build sessions.
            </p>
          </div>

          <a href="/events" className={styles.viewAllLink}>
            VIEW ALL EVENTS
            <span className={styles.arrowTranslate}>
              <ArrowIcon />
            </span>
          </a>
        </div>

        {/* 3-Column Events Grid */}
        <div className={styles.eventsGrid}>
          {displayEvents.length === 0 ? (
            <div className={styles.emptyCard}>
              <div className={styles.emptyTitle}>Stay Tuned for Upcoming Events</div>
              <div className={styles.emptyDesc}>
                We are preparing exciting workshops and hackathons. Explore past events in the archive.
              </div>
              <a href="/events" className={styles.viewAllLink}>
                EXPLORE ARCHIVE <ArrowIcon />
              </a>
            </div>
          ) : (
            displayEvents.map((event) => {
              const hasDeadline = Boolean(event.registrationDeadline);
              const isExpired =
                hasDeadline &&
                new Date(event.registrationDeadline!).getTime() < now.getTime();
              const hasRegLink = Boolean(event.registrationLink);

              return (
                <article
                  key={event.id || event.title}
                  className={`${styles.eventCard} ${
                    event.featured ? styles.featuredCard : ""
                  }`}
                >

                  {/* Card Top Header & Body */}
                  <div className={styles.cardTop}>
                    <div className={styles.cardHeader}>
                      <div className={styles.dateBadge}>
                        <span className={styles.dateNum}>{event.date}</span>
                        <span className={styles.dateMonth}>{event.month}</span>
                      </div>

                      {event.featured && (
                        <span className={styles.featuredBadge}>FEATURED</span>
                      )}
                    </div>

                    <span className={styles.cardType}>
                      {(event.type || event.label || "EVENT").toUpperCase()}
                    </span>

                    <h3 className={styles.cardTitle}>{event.title}</h3>

                    <p className={styles.cardDesc}>{event.description}</p>
                  </div>

                  {/* Card Bottom Meta & Button */}
                  <div className={styles.cardBottom}>
                    <div className={styles.cardMeta}>
                      {event.time && (
                        <div className={styles.metaRow}>
                          <CalendarIcon />
                          <span>{event.time}</span>
                        </div>
                      )}
                      {event.place && (
                        <div className={styles.metaRow}>
                          <MapPinIcon />
                          <span>{event.place}</span>
                        </div>
                      )}
                    </div>

                    {event.isPast ? (
                      <a href="/events" className={styles.detailsBtn}>
                        ARCHIVE <ArrowIcon />
                      </a>
                    ) : hasRegLink ? (
                      isExpired ? (
                        <span className={styles.closedBtn}>CLOSED</span>
                      ) : (
                        <a
                          href={event.registrationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.regBtn}
                        >
                          REGISTER <ArrowIcon />
                        </a>
                      )
                    ) : (
                      <a href="/events" className={styles.detailsBtn}>
                        DETAILS <ArrowIcon />
                      </a>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

export default Events;
