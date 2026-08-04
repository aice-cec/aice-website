import { useEffect, useRef } from 'react'
import styles from './Hero.module.css'

const Hero = () => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const robotWrapRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const eyeGlowRef = useRef<HTMLDivElement>(null)
  const aboutPanelRef = useRef<HTMLDivElement>(null)
  const scrollCueRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const robotWrap = robotWrapRef.current
    const eyeGlow = eyeGlowRef.current
    const title = titleRef.current
    const aboutPanel = aboutPanelRef.current
    const scrollCue = scrollCueRef.current

    if (!section || !robotWrap) return

    let rafId: number

    const onScroll = () => {
      rafId = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect()
        const viewportH = window.innerHeight

        // 300vh outer container height: 200vh total scroll travel split into 2 phases of 100vh each
        const scrolled = -rect.top

        // Phase 1 (Hero Pop-Up & Letter Spacing): scrolled from 0 to viewportH
        const progress1 = Math.min(Math.max(scrolled / viewportH, 0), 1)
        const eased1 = 1 - Math.pow(1 - progress1, 3) // cubic ease-out

        // Phase 2 (About Shift & Upward Motion): scrolled from viewportH to 2 * viewportH
        const progress2 = Math.min(Math.max((scrolled - viewportH) / viewportH, 0), 1)
        const eased2 = 1 - Math.pow(1 - progress2, 3) // cubic ease-out

        // 1. Robot animation:
        // - Phase 1: Rises/pops up from below (Y = 130% → 0%)
        // - Phase 2: Slides horizontally to the left (X = 0vw → -24vw)
        const robotY = 130 - eased1 * 130
        const robotX = eased2 * -24
        const robotOpacity = Math.min(progress1 * 2.5, 1)

        robotWrap.style.transform = `translateX(calc(-50% + ${robotX.toFixed(3)}vw)) translateY(${robotY.toFixed(2)}%)`
        robotWrap.style.opacity = String(robotOpacity.toFixed(3))

        // 2. AICE Title animation:
        // - Phase 1: Letter-spacing expands (0.06em → 0.45em) as robot pops up between 'I' and 'C'
        // - Phase 2: Floats UPWARDS off top of screen (-30px → -480px) and fades out
        if (title) {
          const minSpacing = 0.06
          const maxSpacing = 0.45
          const spacing = minSpacing + eased1 * (maxSpacing - minSpacing)
          const spread = spacing * 2

          const a = title.querySelector(`.${styles.letterA}`) as HTMLElement
          const i = title.querySelector(`.${styles.letterI}`) as HTMLElement
          const c = title.querySelector(`.${styles.letterC}`) as HTMLElement
          const e = title.querySelector(`.${styles.letterE}`) as HTMLElement

          a.style.transform = `translateX(${-1.5 * spread}em)`
          i.style.transform = `translateX(${-0.5 * spread}em)`
          c.style.transform = `translateX(${0.5 * spread}em)`
          e.style.transform = `translateX(${1.5 * spread}em)`

          const titleY = eased1 * -30 + eased2 * -450
          const titleOpacity = Math.max(1 - eased2 * 3.5, 0)

          title.style.opacity = String(titleOpacity.toFixed(3))
          title.style.transform =`translate(-50%, calc(-50% + ${titleY.toFixed(1)}px))`
          title.style.visibility = titleOpacity <= 0 ? 'hidden' : 'visible'
        }

        // 3. About Content Panel animation:
        // - Phase 2: Comes from BELOW (slides up from +200px to 0px) and fades in
        if (aboutPanel) {
          const aboutY = (1 - eased2) * 200
          const aboutOpacity =  Math.max((eased2 - 0.6) / 0.7, 0)

          aboutPanel.style.opacity = String(aboutOpacity.toFixed(3))
          aboutPanel.style.transform = `translateY(${aboutY.toFixed(1)}px)`
          aboutPanel.style.visibility = aboutOpacity <= 0 ? 'hidden' : 'visible'
        }

        // 4. Eye Glow:
        if (eyeGlow) {
          eyeGlow.style.opacity = String((0.3 + eased1 * 0.5).toFixed(2))
        }

        // 5. Scroll Cue: fades out as user scrolls through Phase 1
        if (scrollCue) {
          scrollCue.style.opacity = String(Math.max(1 - progress1 * 3, 0))
        }
      })
    }

    // Set initial state for 0 scroll (Robot hidden below, AICE text unexpanded)
    robotWrap.style.transform = 'translateX(-50%) translateY(130%)'
    robotWrap.style.opacity = '0'
    if (aboutPanel) {
      aboutPanel.style.transform = 'translateY(200px)'
      aboutPanel.style.opacity = '0'
      aboutPanel.style.visibility = 'hidden'
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div
      id="home"
      className={styles.heroOuter}
      ref={sectionRef}
      aria-label="AICE Hero and About Section"
    >
      {/* Anchor for #about navigation */}
      <div id="about" className={styles.aboutAnchor} />

      <div className={styles.heroSticky}>
        {/* Giant AICE background text — split to perfectly center the middle gap */}
        <div className={styles.bgTitle} ref={titleRef} aria-hidden="true">
          <span className={styles.letterA}>A</span>
          <span className={styles.letterI}>I</span>
          <span className={styles.letterC}>C</span>
          <span className={styles.letterE}>E</span>
        </div>

        {/* Unified Robot mascot */}
        <div className={styles.robotWrap} ref={robotWrapRef}>
          <div className={styles.robotContainer}>
            <img
              src="/robot.png"
              alt="AICE AI Robot mascot with glowing red eyes"
              className={styles.robotImg}
              draggable="false"
            />
            <div className={styles.eyeGlow} ref={eyeGlowRef} aria-hidden="true" />
          </div>
        </div>

        {/* Right side About Content Panel (Phase 2) */}
        <div className={styles.contentPanel} ref={aboutPanelRef} aria-label="About AICE">
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
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4l3 3" />
                  <circle cx="12" cy="12" r="3" fill="var(--color-accent)" stroke="none" />
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
                  <ellipse cx="12" cy="12" rx="10" ry="6" />
                  <circle cx="12" cy="12" r="3" fill="var(--color-accent)" stroke="none" />
                  <line x1="2" y1="12" x2="22" y2="12" />
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

        {/* Bottom fade */}
        <div className={styles.bottomFade} aria-hidden="true" />

        {/* Scroll cue — visible before scrolling */}
        <div className={styles.scrollCue} ref={scrollCueRef} aria-label="Scroll to reveal content">
          <div className={styles.scrollCueText}>SCROLL</div>
          <div className={styles.scrollCueBar}>
            <div className={styles.scrollCueFill} />
          </div>
        </div>
      </div>

      {/* Accessible heading */}
      <h1 className="visually-hidden">AICE — Artificial Intelligence Club of Engineers</h1>
    </div>
  )
}

export default Hero
