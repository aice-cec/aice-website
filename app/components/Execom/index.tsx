"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Execom.module.css";
import teamData from "@/data/team-26/members.json";

gsap.registerPlugin(ScrollTrigger);

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

function LinkedInIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      style={{ width: size, height: size }}
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77Z" />
    </svg>
  );
}

function MailIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ width: size, height: size }}
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function TeamSection({
  title,
  members,
  center = false,
  reverse = false,
}: {
  title: string;
  members: TeamMember[];
  center?: boolean;
  reverse?: boolean;
}) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isHovered = useRef(false);
  const lastInteraction = useRef(0);

  const handleUserTouch = () => {
    lastInteraction.current = Date.now();
  };

  const displayMembers =
    members.length > 3 ? [...members, ...members, ...members] : members;

  useEffect(() => {
    if (members.length <= 3 || !carouselRef.current) return;
    const container = carouselRef.current;

    const setInitialPos = () => {
      const singleSetWidth = container.scrollWidth / 3;
      if (reverse) {
        container.scrollLeft = singleSetWidth * 2 - container.clientWidth;
      } else {
        container.scrollLeft = singleSetWidth;
      }
    };

    setInitialPos();
    const timer = setTimeout(setInitialPos, 100);
    return () => clearTimeout(timer);
  }, [members.length, reverse]);

  const handleScroll = () => {
    if (members.length <= 3 || !carouselRef.current) return;
    const container = carouselRef.current;
    const singleSetWidth = container.scrollWidth / 3;
    if (!singleSetWidth) return;

    if (container.scrollLeft >= singleSetWidth * 2.2) {
      container.scrollLeft -= singleSetWidth;
    } else if (container.scrollLeft <= singleSetWidth * 0.2) {
      container.scrollLeft += singleSetWidth;
    }
  };

  useEffect(() => {
    if (members.length <= 3) return;
    const interval = setInterval(() => {
      if (carouselRef.current && !isHovered.current) {
        const now = Date.now();
        if (now - lastInteraction.current > 2000) {
          const container = carouselRef.current;
          const singleSetWidth = container.scrollWidth / 3;
          if (reverse) {
            if (container.scrollLeft <= singleSetWidth + 340) {
              container.scrollLeft += singleSetWidth;
            }
            container.scrollBy({ left: -340, behavior: "smooth" });
          } else {
            if (container.scrollLeft >= singleSetWidth * 2 - 340) {
              container.scrollLeft -= singleSetWidth;
            }
            container.scrollBy({ left: 340, behavior: "smooth" });
          }
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [members.length, reverse]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(sectionRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.7,
        ease: "power3.out",
        clearProps: "all",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [members]);

  const scrollContainer = (direction: "left" | "right") => {
    lastInteraction.current = Date.now();
    if (carouselRef.current && members.length > 3) {
      const container = carouselRef.current;
      const singleSetWidth = container.scrollWidth / 3;
      if (direction === "right") {
        if (container.scrollLeft >= singleSetWidth * 2 - 340) {
          container.scrollLeft -= singleSetWidth;
        }
        container.scrollBy({ left: 340, behavior: "smooth" });
      } else {
        if (container.scrollLeft <= singleSetWidth + 340) {
          container.scrollLeft += singleSetWidth;
        }
        container.scrollBy({ left: -340, behavior: "smooth" });
      }
    }
  };

  if (!members || members.length === 0) return null;

  return (
    <div className={styles.categoryGroup} ref={sectionRef}>
      <div className={styles.categoryHeader}>
        <h3 className={styles.categoryTitle}>{title}</h3>
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
        onScroll={handleScroll}
        onMouseEnter={() => (isHovered.current = true)}
        onMouseLeave={() => (isHovered.current = false)}
        onTouchStart={() => {
          isHovered.current = true;
          handleUserTouch();
        }}
        onTouchEnd={() => (isHovered.current = false)}
        onPointerDown={handleUserTouch}
        onClickCapture={handleUserTouch}
      >
        <div
          className={`${styles.carouselTrack} ${center ? styles.centerTrack : ""}`}
        >
          {displayMembers.map((member, index) => (
            <article key={`${member.id}-${index}`} className={styles.memberCard}>
              <div className={styles.cardImageWrap}>
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 18rem"
                  className={styles.cardImage}
                />
                <div className={styles.cardOverlay} />
              </div>
              <div className={styles.cardInfo}>
                <div className={styles.cardInfoText}>
                  <h4 className={styles.memberName}>{member.name}</h4>
                  <p className={styles.memberRole}>{member.role}</p>
                </div>
                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.linkedinLink}
                    aria-label={`${member.name} LinkedIn`}
                  >
                    <LinkedInIcon size={32} />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Execom() {
  const sectionRef = useRef<HTMLElement>(null);
  const faculty: FacultyMember[] = teamData.faculty || [];
  const execom: TeamMember[] = teamData.execom || [];
  const subExecom: TeamMember[] = teamData.subExecom || [];

  const execomRoleOrder = [
    "Student Lead",
    "Treasurer",
    "Program Manager",
    "Webmaster",
    "Tech Lead",
    "Creative Lead",
    "Content Lead",
    "PR & Outreach Lead",
    "Media Lead",
    "Project Coordinator",
  ];

  const sortedExecom = [...execom].sort((a, b) => {
    const indexA = execomRoleOrder.indexOf(a.role);
    const indexB = execomRoleOrder.indexOf(b.role);
    return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
  });

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

  // GSAP scroll animation for heading + faculty card
  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Heading animation
      gsap.from(`.${styles.heading}`, {
        opacity: 0,
        y: 30,
        duration: 0.7,
        ease: "power3.out",
        clearProps: "all",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });

      // Subtext animation
      gsap.from(`.${styles.subtext}`, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        delay: 0.15,
        ease: "power3.out",
        clearProps: "all",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });

      // Faculty card slide-up
      gsap.from(`.${styles.facultyCard}`, {
        opacity: 0,
        y: 40,
        duration: 0.7,
        ease: "power3.out",
        clearProps: "all",
        scrollTrigger: {
          trigger: `.${styles.facultyCard}`,
          start: "top 88%",
          toggleActions: "play none none none",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="execom" className={styles.section} ref={sectionRef}>
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

        <TeamSection title="FACULTY ADVISOR" members={faculty} center />
        <TeamSection title="EXECUTIVE COMMITTEE" members={sortedExecom} />
        <TeamSection title="SUB-EXECOM" members={sortedSubExecom} reverse />
      </div>
    </section>
  );
}

export default Execom;
