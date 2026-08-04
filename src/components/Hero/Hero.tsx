import { useEffect, useRef } from 'react'
import styles from './Hero.module.css'

const Hero = () => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const robotWrapRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const aboutPanelRef = useRef<HTMLDivElement>(null)
  const scrollCueRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    const section = sectionRef.current
    const robotWrap = robotWrapRef.current
    const title = titleRef.current
    const aboutPanel = aboutPanelRef.current
    const scrollCue = scrollCueRef.current

    if (!section || !robotWrap) return

    const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max)
    const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3)
    const smoothStep = (value: number) => value * value * (3 - 2 * value)
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const compactQuery = window.matchMedia('(max-width: 1024px)')

    let frameId = 0
    let sectionTop = section.offsetTop
    let targetProgress = 0
    let currentProgress = 0
    let previousTime = performance.now()
    let isAnimating = false

    const getScrollProgress = () => clamp((window.scrollY - sectionTop) / window.innerHeight, 0, 4)

    const resetInlineMotion = () => {
      ;[robotWrap, title, aboutPanel, scrollCue, ...cardRefs.current].forEach((element) => {
        if (element) element.removeAttribute('style')
      })
    }

    const render = (scrollProgress: number) => {
      const intro = easeOutCubic(smoothStep(clamp(scrollProgress / 0.9)))
      // A dedicated transition beat keeps the HOME and ABOUT typography from
      // sharing the screen: title exits, robot repositions, then copy appears.
      const titleExit = easeOutCubic(smoothStep(clamp((scrollProgress - 1.05) / 0.6)))
      const robotShift = easeOutCubic(smoothStep(clamp((scrollProgress - 1.7) / 0.9)))
      const about = easeOutCubic(smoothStep(clamp((scrollProgress - 2.85) / 0.95)))

      // Only composited properties are updated while scrolling. This keeps
      // trackpad and wheel input fluid instead of repeatedly triggering layout.
      const robotY = (1 - intro) * 82
      const robotX = robotShift * -24
      robotWrap.style.transform = `translate3d(calc(-50% + ${robotX.toFixed(3)}vw), ${robotY.toFixed(2)}%, 0)`
      robotWrap.style.opacity = String(clamp(intro / 0.18).toFixed(3))

      if (title) {
        const spread = intro * 0.68
        const letters = [styles.letterA, styles.letterI, styles.letterC, styles.letterE]
        const offsets = [-1.5, -0.5, 0.5, 1.5]

        letters.forEach((letter, index) => {
          const element = title.querySelector(`.${letter}`) as HTMLElement | null
          if (element) element.style.transform = `translate3d(${(offsets[index] * spread).toFixed(3)}em, 0, 0)`
        })

        const titleY = -window.innerHeight * (intro * 0.18 + titleExit * 0.62)
        const titleOpacity = 1 - titleExit
        title.style.opacity = String(titleOpacity.toFixed(3))
        title.style.transform = `translate3d(-50%, calc(-50% + ${titleY.toFixed(1)}px), 0)`
        title.style.visibility = titleOpacity < 0.01 ? 'hidden' : 'visible'
      }

      if (aboutPanel) {
        const panelOpacity = smoothStep(clamp(about / 0.7))
        aboutPanel.style.opacity = String(panelOpacity.toFixed(3))
        aboutPanel.style.transform = `translate3d(0, ${(1 - about) * 56}px, 0)`
        aboutPanel.style.visibility = panelOpacity < 0.01 ? 'hidden' : 'visible'
      }

      cardRefs.current.forEach((card, index) => {
        const cardProgress = easeOutCubic(smoothStep(clamp((about - 0.15 - index * 0.12) / 0.55)))
        card.style.opacity = String(cardProgress.toFixed(3))
        card.style.transform = `translate3d(0, ${(1 - cardProgress) * 20}px, 0)`
      })

      if (scrollCue) scrollCue.style.opacity = String((1 - smoothStep(clamp(intro / 0.45))).toFixed(3))
    }

    const animate = (time: number) => {
      const delta = Math.min((time - previousTime) / 1000, 0.1)
      previousTime = time
      const smoothing = motionQuery.matches ? 1 : 1 - Math.exp(-12 * delta)
      currentProgress += (targetProgress - currentProgress) * smoothing
      render(currentProgress)

      if (Math.abs(targetProgress - currentProgress) > 0.0005 && !motionQuery.matches) {
        frameId = requestAnimationFrame(animate)
      } else {
        currentProgress = targetProgress
        render(currentProgress)
        isAnimating = false
      }
    }

    const updateTarget = () => {
      if (compactQuery.matches) return
      targetProgress = getScrollProgress()
      if (!isAnimating) {
        isAnimating = true
        previousTime = performance.now()
        frameId = requestAnimationFrame(animate)
      }
    }

    const onResize = () => {
      sectionTop = section.offsetTop
      targetProgress = getScrollProgress()
      currentProgress = targetProgress
      if (!compactQuery.matches) render(currentProgress)
    }

    const onViewportModeChange = () => {
      if (compactQuery.matches) {
        cancelAnimationFrame(frameId)
        isAnimating = false
        resetInlineMotion()
        return
      }

      onResize()
    }

    if (compactQuery.matches) return

    targetProgress = getScrollProgress()
    currentProgress = targetProgress
    render(currentProgress)
    window.addEventListener('scroll', updateTarget, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
    compactQuery.addEventListener('change', onViewportModeChange)
    motionQuery.addEventListener('change', updateTarget)

    return () => {
      window.removeEventListener('scroll', updateTarget)
      window.removeEventListener('resize', onResize)
      compactQuery.removeEventListener('change', onViewportModeChange)
      motionQuery.removeEventListener('change', updateTarget)
      cancelAnimationFrame(frameId)
    }
  }, [])

  return (
    <div
      id="home"
      className={styles.heroOuter}
      ref={sectionRef}
      aria-label="AICE Hero and About Section"
    >
      <div id="about" className={styles.aboutAnchor} />

      <div className={styles.heroSticky}>
        <div className={styles.bgTitle} ref={titleRef} aria-hidden="true">
          <div className={styles.titleLetters}>
            <div className={styles.titleHalfLeft}>
              <span className={styles.letterA}>A</span>
              <span className={styles.letterI}>I</span>
            </div>
            <div className={styles.titleHalfRight}>
              <span className={styles.letterC}>C</span>
              <span className={styles.letterE}>E</span>
            </div>
          </div>
        </div>

        <div className={styles.robotWrap} ref={robotWrapRef}>
          <div className={styles.robotContainer}>
            <img
              src="/robot.png"
              alt="AICE AI Robot mascot with glowing red eyes"
              className={styles.robotImg}
              draggable="false"
            />
            <div className={styles.eyeGlow} aria-hidden="true" />
          </div>
        </div>

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
            <div className={styles.card} ref={(element) => { if (element) cardRefs.current[0] = element }}>
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

            <div className={styles.card} ref={(element) => { if (element) cardRefs.current[1] = element }}>
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

        <div className={styles.bottomFade} aria-hidden="true" />

        <div className={styles.scrollCue} ref={scrollCueRef} aria-label="Scroll to reveal content">
          <div className={styles.scrollCueText}>SCROLL</div>
          <div className={styles.scrollCueBar}>
            <div className={styles.scrollCueFill} />
          </div>
        </div>
      </div>

      <h1 className="visually-hidden">AICE — Artificial Intelligence Club of Engineers</h1>
    </div>
  )
}

export default Hero
