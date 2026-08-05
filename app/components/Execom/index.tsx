"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import styles from "./Execom.module.css";
import teamData from "@/data/team-26/members.json";

export interface FacultyMember {
  id: string;
  name: string;
  role: string;
  dept: string;
  image: string;
  bio: string;
  linkedin?: string;
  email?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  dept: string;
  image: string;
  linkedin?: string;
  github?: string;
}

function ArrowLeftIcon() {
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
        d="M19 12H5M12 19l-7-7 7-7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRightIcon() {
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
        d="M5 12h14M12 5l7 7-7 7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      style={{ width: 14, height: 14 }}
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77Z" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      style={{ width: 14, height: 14 }}
    >
      <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z" />
    </svg>
  );
}

export function Execom() {
  const execomCarouselRef = useRef<HTMLDivElement>(null);
  const subExecomCarouselRef = useRef<HTMLDivElement>(null);
  const isExecomHovered = useRef(false);
  const isSubExecomHovered = useRef(false);
  const lastExecomInteraction = useRef(0);
  const lastSubExecomInteraction = useRef(0);

  const faculty: FacultyMember[] = teamData.faculty || [];
  const execom: TeamMember[] = teamData.execom || [];
  const subExecom: TeamMember[] = teamData.subExecom || [];

  const handleExecomUserTouch = () => {
    lastExecomInteraction.current = Date.now();
  };

  const handleSubExecomUserTouch = () => {
    lastSubExecomInteraction.current = Date.now();
  };

  useEffect(() => {
    const autoScroll = (
      ref: React.RefObject<HTMLDivElement | null>,
      isHovered: boolean,
      lastInteractionTime: number,
    ) => {
      const now = Date.now();
      const isInteractionActive = now - lastInteractionTime < 8000;

      if (ref.current && !isHovered && !isInteractionActive) {
        const container = ref.current;
        const maxScroll = container.scrollWidth - container.clientWidth;
        if (container.scrollLeft >= maxScroll - 10) {
          container.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          container.scrollBy({ left: 300, behavior: "smooth" });
        }
      }
    };

    const interval = setInterval(() => {
      autoScroll(
        execomCarouselRef,
        isExecomHovered.current,
        lastExecomInteraction.current,
      );
      autoScroll(
        subExecomCarouselRef,
        isSubExecomHovered.current,
        lastSubExecomInteraction.current,
      );
    }, 1750);

    return () => clearInterval(interval);
  }, []);

  const scrollContainer = (
    ref: React.RefObject<HTMLDivElement | null>,
    direction: "left" | "right",
    isExecom: boolean,
  ) => {
    if (isExecom) {
      lastExecomInteraction.current = Date.now();
    } else {
      lastSubExecomInteraction.current = Date.now();
    }
    if (ref.current) {
      const scrollAmount = direction === "left" ? -340 : 340;
      ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section id="execom" className={styles.section}>
      <div className={styles.glowLeft} />
      <div className={styles.glowRight} />

      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.heading}>
              MEET THE <span className={styles.headingAccent}>TEAM.</span>
            </h2>
          </div>
          <p className={styles.subtext}>
            The faculty advisors, executive committee, and sub-execom members
            bringing AI initiatives to life at CEC.
          </p>
        </div>

        {faculty.length > 0 && (
          <div className={styles.categoryGroup}>
            <div className={styles.facultyCard}>
              <div className={styles.facultyImageWrap}>
                <Image
                  src={faculty[0].image}
                  alt={faculty[0].name}
                  width={200}
                  height={200}
                  style={{ height: "auto" }}
                  className={styles.facultyImg}
                />
              </div>
              <div className={styles.facultyContent}>
                <h4 className={styles.facultyName}>{faculty[0].name}</h4>
                <p className={styles.facultyDept}>{faculty[0].role}</p>
                <p className={styles.facultyBio}>{faculty[0].bio}</p>
              </div>
            </div>
          </div>
        )}

        {execom.length > 0 && (
          <div className={styles.categoryGroup}>
            <div className={styles.categoryHeader}>
              <h3 className={styles.categoryTitle}>
                <span className={styles.categoryTitleDot} /> EXECUTIVE COMMITTEE
              </h3>
              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <div className={styles.carouselNav}>
                  <button
                    type="button"
                    className={styles.navArrowBtn}
                    onClick={() => scrollContainer(execomCarouselRef, "left", true)}
                    aria-label="Previous Execom members"
                  >
                    <ArrowLeftIcon />
                  </button>
                  <button
                    type="button"
                    className={styles.navArrowBtn}
                    onClick={() => scrollContainer(execomCarouselRef, "right", true)}
                    aria-label="Next Execom members"
                  >
                    <ArrowRightIcon />
                  </button>
                </div>
              </div>
            </div>

            <div
              className={styles.carouselContainer}
              ref={execomCarouselRef}
              onMouseEnter={() => (isExecomHovered.current = true)}
              onMouseLeave={() => (isExecomHovered.current = false)}
              onTouchStart={() => {
                isExecomHovered.current = true;
                handleExecomUserTouch();
              }}
              onTouchEnd={() => (isExecomHovered.current = false)}
              onPointerDown={handleExecomUserTouch}
              onClickCapture={handleExecomUserTouch}
              onScroll={handleExecomUserTouch}
            >
              <div className={styles.carouselTrack}>
                {execom.map((member) => (
                  <article key={member.id} className={styles.memberCard}>
                    <div>
                      <div className={styles.cardAvatarWrap}>
                        <Image
                          src={member.image}
                          alt={member.name}
                          width={280}
                          height={280}
                          style={{ height: "auto" }}
                          className={styles.avatarImg}
                        />
                      </div>
                      <p className={styles.roleBadge}>{member.role}</p>
                      <h4 className={styles.memberName}>{member.name}</h4>
                      <p className={styles.memberDept}>{member.dept}</p>
                    </div>
                    <div className={styles.memberFooter}>
                      <div className={styles.socialIcons}>
                        {member.linkedin && (
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.socialBtn}
                            aria-label={`${member.name} LinkedIn`}
                          >
                            <LinkedInIcon />
                          </a>
                        )}
                        {member.github && (
                          <a
                            href={member.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.socialBtn}
                            aria-label={`${member.name} GitHub`}
                          >
                            <GithubIcon />
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}

        {subExecom.length > 0 && (
          <div className={styles.categoryGroup}>
            <div className={styles.categoryHeader}>
              <h3 className={styles.categoryTitle}>
                <span className={styles.categoryTitleDot} /> SUB-EXECOM
              </h3>
              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <div className={styles.carouselNav}>
                  <button
                    type="button"
                    className={styles.navArrowBtn}
                    onClick={() =>
                      scrollContainer(subExecomCarouselRef, "left", false)
                    }
                    aria-label="Previous Sub-Execom members"
                  >
                    <ArrowLeftIcon />
                  </button>
                  <button
                    type="button"
                    className={styles.navArrowBtn}
                    onClick={() =>
                      scrollContainer(subExecomCarouselRef, "right", false)
                    }
                    aria-label="Next Sub-Execom members"
                  >
                    <ArrowRightIcon />
                  </button>
                </div>
              </div>
            </div>

            <div
              className={styles.carouselContainer}
              ref={subExecomCarouselRef}
              onMouseEnter={() => (isSubExecomHovered.current = true)}
              onMouseLeave={() => (isSubExecomHovered.current = false)}
              onTouchStart={() => {
                isSubExecomHovered.current = true;
                handleSubExecomUserTouch();
              }}
              onTouchEnd={() => (isSubExecomHovered.current = false)}
              onPointerDown={handleSubExecomUserTouch}
              onClickCapture={handleSubExecomUserTouch}
              onScroll={handleSubExecomUserTouch}
            >
              <div className={styles.carouselTrack}>
                {subExecom.map((member) => (
                  <article key={member.id} className={styles.memberCard}>
                    <div>
                      <div className={styles.cardAvatarWrap}>
                        <Image
                          src={member.image}
                          alt={member.name}
                          width={280}
                          height={280}
                          style={{ height: "auto" }}
                          className={styles.avatarImg}
                        />
                      </div>
                      <p className={styles.roleBadge}>{member.role}</p>
                      <h4 className={styles.memberName}>{member.name}</h4>
                      <p className={styles.memberDept}>{member.dept}</p>
                    </div>
                    <div className={styles.memberFooter}>
                      <div className={styles.socialIcons}>
                        {member.linkedin && (
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.socialBtn}
                            aria-label={`${member.name} LinkedIn`}
                          >
                            <LinkedInIcon />
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default Execom;
