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
  bgImage?: string;
  registrationLink?: string;
  registrationDeadline?: string;
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
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
      strokeWidth="1.6"
      aria-hidden="true"
      className={styles.calendarIcon}
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" strokeLinecap="round" />
    </svg>
  );
}

export function Events() {
  const [eventsList, setEventsList] = useState<EventItem[]>(
    eventsData as EventItem[],
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

  const upcomingEvents = eventsList
    .filter((e) => !e.isPast)
    .sort(
      (a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime(),
    );

  const now = new Date();

  return (
    <section id="events" className={styles.section}>
      <div className={styles.glowRight} />
      <div className={styles.glowLeft} />

      <div className={styles.container}>
        <div className={styles.header}>
          <div style={{ maxWidth: "42rem" }}>
            <h2 className={styles.heading}>
              UPCOMING <span className={styles.headingAccent}>EVENTS</span>
            </h2>
          </div>
        </div>

        <div className={styles.sectionDivider}>
          <a href="#join" className={styles.viewCalendarLink}>
            VIEW ALL EVENTS
            <span className={styles.arrowTranslate}>
              <ArrowIcon />
            </span>
          </a>
        </div>

        <div className={styles.upcomingGrid}>
          {upcomingEvents.map((event) => {
            const hasDeadline = Boolean(event.registrationDeadline);
            const isExpired =
              hasDeadline &&
              new Date(event.registrationDeadline!).getTime() < now.getTime();
            const hasRegLink = Boolean(event.registrationLink);

            return (
              <article
                key={event.id || event.title}
                className={`${styles.upcomingCard} ${
                  event.featured ? styles.featuredCard : styles.standardCard
                }`}
              >
                {event.bgImage && (
                  <div
                    className={styles.cardBgOverlay}
                    style={{ backgroundImage: `url(${event.bgImage})` }}
                  />
                )}
                {event.featured && (
                  <>
                    <div className={styles.featuredCircle} />
                    <div className={styles.featuredNumber}>01</div>
                  </>
                )}
                <div className={styles.cardMain}>
                  <div className={styles.cardHeader}>
                    <div className={styles.dateBadge}>
                      <span className={styles.dateNum}>{event.date}</span>
                      <span className={styles.dateMonth}>{event.month}</span>
                    </div>
                    {event.featured && (
                      <span className={styles.featuredBadge}>FEATURED</span>
                    )}
                  </div>
                  <div className={styles.cardBody}>
                    <p className={styles.cardType}>
                      {(event.type || event.label || "").toUpperCase()}
                    </p>
                    <h4
                      className={
                        event.featured
                          ? styles.cardTitleFeatured
                          : styles.cardTitleStandard
                      }
                    >
                      {event.title}
                    </h4>
                    <p className={styles.cardDesc}>{event.description}</p>
                  </div>
                </div>

                <div className={styles.cardMeta}>
                  <span className={styles.timeSpan}>
                    <CalendarIcon /> {event.time}
                  </span>
                  {event.place && (
                    <span className={styles.placeSpan}>{event.place}</span>
                  )}
                  {hasRegLink ? (
                    isExpired ? (
                      <span className={styles.regClosedBtn}>CLOSED</span>
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
                    <button
                      type="button"
                      className={styles.iconBtn}
                      aria-label={`Learn more about ${event.title}`}
                    >
                      <ArrowIcon />
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Events;
