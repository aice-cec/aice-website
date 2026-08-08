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
  team?: string;
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

function TeamSection({
  title,
  members,
}: {
  title: string;
  members: TeamMember[];
}) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const isHovered = useRef(false);
  const lastInteraction = useRef(0);

  const handleUserTouch = () => {
    lastInteraction.current = Date.now();
  };

  useEffect(() => {
    if (members.length <= 3) return;
    const interval = setInterval(() => {
      const now = Date.now();
      if (
        carouselRef.current &&
        !isHovered.current &&
        now - lastInteraction.current > 8000
      ) {
        const container = carouselRef.current;
        const maxScroll = container.scrollWidth - container.clientWidth;
        if (container.scrollLeft >= maxScroll - 10) {
          container.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          container.scrollBy({ left: 300, behavior: "smooth" });
        }
      }
    }, 1750);
    return () => clearInterval(interval);
  }, [members.length]);

  const scrollContainer = (direction: "left" | "right") => {
    lastInteraction.current = Date.now();
    if (carouselRef.current) {
      const scrollAmount = direction === "left" ? -340 : 340;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (!members || members.length === 0) return null;

  return (
    <div className={styles.categoryGroup}>
      <div className={styles.categoryHeader}>
        <h3 className={styles.categoryTitle}>
          <span className={styles.categoryTitleDot} /> {title}
        </h3>
        {members.length > 3 && (
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div className={styles.carouselNav}>
              <button
                type="button"
                className={styles.navArrowBtn}
                onClick={() => scrollContainer("left")}
                aria-label={`Previous ${title} members`}
              >
                <ArrowLeftIcon />
              </button>
              <button
                type="button"
                className={styles.navArrowBtn}
                onClick={() => scrollContainer("right")}
                aria-label={`Next ${title} members`}
              >
                <ArrowRightIcon />
              </button>
            </div>
          </div>
        )}
      </div>

      <div
        className={styles.carouselContainer}
        ref={carouselRef}
        onMouseEnter={() => (isHovered.current = true)}
        onMouseLeave={() => (isHovered.current = false)}
        onTouchStart={() => {
          isHovered.current = true;
          handleUserTouch();
        }}
        onTouchEnd={() => (isHovered.current = false)}
        onPointerDown={handleUserTouch}
        onClickCapture={handleUserTouch}
        onScroll={handleUserTouch}
      >
        <div className={styles.carouselTrack}>
          {members.map((member) => (
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
  );
}

export function Execom() {
  const faculty: FacultyMember[] = teamData.faculty || [];
  const execom: TeamMember[] = teamData.execom || [];
  const subExecom: TeamMember[] = teamData.subExecom || [];

  const teamOrder = [
    "Finance Team",
    "Co-Treasurer",
    "Web Team",
    "Tech Team",
    "Content Team",
    "Creative Team",
    "PR & Outreach Team",
    "Media Team",
  ];

  const sortedSubExecom = [...subExecom].sort((a, b) => {
    const indexA = teamOrder.indexOf(a.team || a.role || "");
    const indexB = teamOrder.indexOf(b.team || b.role || "");
    return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
  });

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

        <TeamSection title="EXECUTIVE COMMITTEE" members={execom} />
        <TeamSection title="SUB-EXECOM" members={sortedSubExecom} />
      </div>
    </section>
  );
}

export default Execom;
