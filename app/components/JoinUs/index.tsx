import styles from "./JoinUs.module.css";

const reasons = [
  [
    "01",
    "LEARN TOGETHER",
    "Explore tools, research, and ideas with people who are actively making things.",
  ],
  [
    "02",
    "BUILD IN PUBLIC",
    "Turn weekend experiments into real projects, events, and collaborative work.",
  ],
  [
    "03",
    "FIND YOUR PEOPLE",
    "Meet a community that stays curious, generous, and ready to try the hard thing.",
  ],
];

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

export function Join() {
  return (
    <>
      <section id="join" className={styles.joinSection}>
        <div className={styles.decoratorCircleLeft} />
        <div className={styles.decoratorGlowRight} />
        <div className={styles.container}>
          <div className={styles.mainGrid}>
            <div>
              <p className={styles.subtitle}>BECOME PART OF AICE</p>
              <h2 className={styles.heading}>
                YOUR NEXT
                <br />
                IDEA STARTS
                <br />
                HERE.
              </h2>
            </div>
            <div className={styles.card}>
              <p className={styles.cardBadge}>OPEN TO CEC STUDENTS</p>
              <p className={styles.cardText}>
                Bring your questions, your half-finished projects, and the
                appetite to make something meaningful.
              </p>
              <a href="#contact" className={styles.ctaButton}>
                START YOUR AICE JOURNEY <ArrowIcon />
              </a>
            </div>
          </div>

          <div className={styles.reasonsGrid}>
            {reasons.map(([number, title, text]) => (
              <div key={number} className={styles.reasonItem}>
                <span className={styles.reasonNumber}>{number}</span>
                <h3 className={styles.reasonTitle}>{title}</h3>
                <p className={styles.reasonText}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default Join;
