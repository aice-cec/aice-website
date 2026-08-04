import { useEffect, useRef } from 'react'
import styles from './About.module.css'

const About = () => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const robotRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const robot = robotRef.current
    const content = contentRef.current
    if (!section || !robot || !content) return

    let rafId: number

    const onScroll = () => {
      rafId = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect()
        const viewportH = window.innerHeight
        // progress: 0 when section enters viewport, 1 after scrolling 1 viewport height
        const scrolled = -rect.top
        const progress = Math.min(Math.max(scrolled / viewportH, 0), 1)
        const eased = 1 - Math.pow(1 - progress, 3) // cubic ease-out

        // Robot: slides from center (0vw) → left (~-24vw)
        const robotX = eased * -24
        robot.style.transform = `translateX(${robotX.toFixed(3)}vw)`
        // Fades in as section enters
        robot.style.opacity = String(Math.min(0.2 + eased * 0.8, 1))

        // Content: slides from right (+80px) + fades in, starts animating at progress > 0.2
        const contentProgress = Math.min(Math.max((eased - 0.2) / 0.8, 0), 1)
        const contentX = (1 - contentProgress) * 80
        content.style.transform = `translateX(${contentX.toFixed(2)}px)`
        content.style.opacity = String(contentProgress.toFixed(3))
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll() // run once on mount

    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div id="about" className={styles.aboutOuter} ref={sectionRef}>
      <div className={styles.aboutSticky}>

        {/* Left: Robot */}
        <div className={styles.robotPanel} ref={robotRef}>
          <img
            src="/robot.png"
            alt="AICE robot mascot"
            className={styles.robotImg}
            draggable="false"
          />
          {/* Red glow beneath robot */}
          <div className={styles.robotGlow} aria-hidden="true" />
        </div>

        {/* Right: About content */}
        <div className={styles.contentPanel} ref={contentRef} aria-label="About AICE">

          <p className={styles.sectionLabel}>ABOUT AICE</p>

          <h2 className={styles.heading}>
            WHAT IS <span className={styles.accent}>AICE?</span>
          </h2>

          <p className={styles.description}>
            AICE (AI Innovation Community for Excellence) is the official AI
            community of College of Engineering Chengannur. A platform where
            curious minds meet, ideas evolve, and innovation becomes impact.
          </p>

          <div className={styles.cards}>

            <div className={styles.card}>
              <div className={styles.cardIcon} aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 8v4l3 3"/>
                  <circle cx="12" cy="12" r="3" fill="var(--color-accent)" stroke="none"/>
                </svg>
              </div>
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>MISSION</h3>
                <p className={styles.cardText}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                  eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardIcon} aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <ellipse cx="12" cy="12" rx="10" ry="6"/>
                  <circle cx="12" cy="12" r="3" fill="var(--color-accent)" stroke="none"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                </svg>
              </div>
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>VISION</h3>
                <p className={styles.cardText}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                  eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

export default About
