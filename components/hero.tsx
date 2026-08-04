'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'

const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max)
const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3)
const smoothStep = (value: number) => value * value * (3 - 2 * value)

export function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const robotRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const lettersRef = useRef<Array<HTMLSpanElement | null>>([])
  const aboutRef = useRef<HTMLDivElement>(null)
  const scrollCueRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<Array<HTMLDivElement | null>>([])

  useEffect(() => {
    const section = sectionRef.current
    const robot = robotRef.current
    const title = titleRef.current
    const about = aboutRef.current
    const scrollCue = scrollCueRef.current
    const compact = window.matchMedia('(max-width: 1023px)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!section || !robot || compact.matches) return

    let frame = 0
    let sectionTop = section.offsetTop
    let target = 0
    let current = 0
    let previous = performance.now()
    let running = false

    const getProgress = () => clamp((window.scrollY - sectionTop) / window.innerHeight, 0, 4)
    const render = (progress: number) => {
      const intro = easeOutCubic(smoothStep(clamp(progress / 0.9)))
      const titleExit = easeOutCubic(smoothStep(clamp((progress - 1.05) / 0.6)))
      const robotShift = easeOutCubic(smoothStep(clamp((progress - 1.7) / 0.9)))
      const aboutReveal = easeOutCubic(smoothStep(clamp((progress - 2.85) / 0.95)))

      // The landing frame is intentionally text-only; the mascot rises in
      // from below as the visitor starts scrolling.
      robot.style.transform = `translateX(calc(-50% + ${(-24 * robotShift).toFixed(3)}vw)) translateY(${((1 - intro) * 112).toFixed(2)}%)`
      robot.style.opacity = String(clamp(intro / 0.2).toFixed(3))

      if (title) {
        const spread = intro * 0.2
        ;[-1.5, -0.5, 0.5, 1.5].forEach((offset, index) => {
          const letter = lettersRef.current[index]
          if (letter) letter.style.transform = `translate3d(${(offset * spread).toFixed(3)}em, 0, 0)`
        })
        const opacity = 1 - titleExit
        const y = -window.innerHeight * (intro * 0.18 + titleExit * 0.62)
        title.style.opacity = String(opacity.toFixed(3))
        title.style.transform = `translateY(calc(-50% + ${y.toFixed(1)}px))`
        title.style.visibility = opacity < 0.01 ? 'hidden' : 'visible'
      }

      if (about) {
        const opacity = smoothStep(clamp(aboutReveal / 0.7))
        about.style.opacity = String(opacity.toFixed(3))
        about.style.transform = `translate3d(0, ${((1 - aboutReveal) * 56).toFixed(1)}px, 0)`
        about.style.visibility = opacity < 0.01 ? 'hidden' : 'visible'
      }

      cardsRef.current.forEach((card, index) => {
        if (!card) return
        const reveal = easeOutCubic(smoothStep(clamp((aboutReveal - 0.15 - index * 0.12) / 0.55)))
        card.style.opacity = String(reveal.toFixed(3))
        card.style.transform = `translate3d(0, ${((1 - reveal) * 20).toFixed(1)}px, 0)`
      })

      if (scrollCue) scrollCue.style.opacity = String((1 - smoothStep(clamp(intro / 0.45))).toFixed(3))
    }

    const animate = (time: number) => {
      const delta = Math.min((time - previous) / 1000, 0.1)
      previous = time
      current += (target - current) * (reduced.matches ? 1 : 1 - Math.exp(-12 * delta))
      render(current)
      if (Math.abs(target - current) > 0.0005 && !reduced.matches) frame = requestAnimationFrame(animate)
      else { current = target; render(current); running = false }
    }

    const update = () => {
      target = getProgress()
      if (!running) { running = true; previous = performance.now(); frame = requestAnimationFrame(animate) }
    }
    const resize = () => { sectionTop = section.offsetTop; target = getProgress(); current = target; render(current) }

    target = getProgress(); current = target; render(current)
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', resize, { passive: true })
    reduced.addEventListener('change', update)
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', resize); reduced.removeEventListener('change', update); cancelAnimationFrame(frame) }
  }, [])

  const cards = [
    { title: 'MISSION', icon: '◎', text: 'We create a space where curious minds learn, build, and turn ambitious AI ideas into impact.' },
    { title: 'VISION', icon: '◉', text: 'A collaborative community shaping the next generation of thoughtful AI innovators.' },
  ]

  return (
    <section id="home" ref={sectionRef} className="relative h-auto bg-black lg:h-[500vh]" aria-label="AICE home and about">
      <div id="about" className="absolute top-[300vh]" />
      <div className="relative flex min-h-screen flex-col items-center overflow-visible px-5 pb-12 pt-24 lg:sticky lg:top-0 lg:h-screen lg:min-h-0 lg:overflow-hidden lg:p-0">
        <div ref={titleRef} className="pointer-events-none absolute inset-x-0 top-20 z-0 flex w-full justify-center whitespace-nowrap font-tech text-[clamp(76px,28vw,130px)] font-black leading-none tracking-[.035em] text-white/15 lg:top-1/2 lg:text-[clamp(140px,18vw,300px)] lg:tracking-[.05em] lg:text-white">
          <div className="flex w-full animate-[title-reveal_900ms_cubic-bezier(0.16,1,0.3,1)_120ms_both]">
            <div className="flex w-1/2 justify-end pr-[0.0175em] lg:pr-[0.025em]">
              <span ref={(el) => { lettersRef.current[0] = el }} className="inline-block">A</span>
              <span ref={(el) => { lettersRef.current[1] = el }} className="inline-block">I</span>
            </div>
            <div className="flex w-1/2 justify-start pl-[0.0175em] lg:pl-[0.025em]">
              <span ref={(el) => { lettersRef.current[2] = el }} className="inline-block">C</span>
              <span ref={(el) => { lettersRef.current[3] = el }} className="inline-block">E</span>
            </div>
          </div>
        </div>

        <div ref={robotRef} className="relative z-10 mt-14 mb-9 w-[min(78vw,330px)] lg:absolute lg:bottom-0 lg:left-1/2 lg:mb-0 lg:mt-0 lg:w-[clamp(260px,42vw,580px)]">
          <div className="relative flex animate-[robot-float_5s_ease-in-out_1.1s_infinite] items-end justify-center">
            <Image src="/robot.png" alt="AICE AI robot mascot with glowing red eyes" width={1160} height={1450} priority draggable={false} className="block h-auto w-full object-contain drop-shadow-[0_-20px_60px_rgba(255,30,30,.08)]" />
            <div className="pointer-events-none absolute left-1/2 top-[24%] h-[50px] w-[200px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,#ff2020_0%,transparent_70%)] blur-3xl animate-[glow-pulse_3.2s_ease-in-out_infinite]" />
          </div>
        </div>

        <div ref={aboutRef} className="relative z-20 mx-auto w-full max-w-160 lg:absolute lg:right-[8%] lg:mx-0 lg:w-[clamp(320px,45vw,680px)]">
          <p className="mb-2 inline-block font-tech text-xs font-bold tracking-[.15em] after:mt-1 after:block after:h-0.5 after:w-12 after:bg-accent">ABOUT AICE</p>
          <h1 className="mb-3 font-tech text-[clamp(2rem,10vw,2.7rem)] font-extrabold leading-[1.1] lg:mb-5 lg:text-[clamp(2rem,3.5vw,3.5rem)]">WHAT IS <span className="text-accent drop-shadow-[0_0_15px_rgba(255,32,32,.25)]">AICE?</span></h1>
          <p className="mb-7 text-[.95rem] leading-[1.55] text-white/70 lg:mb-9 lg:text-[clamp(.95rem,1.1vw,1.1rem)] lg:leading-relaxed">AICE (AI Innovation Community for Excellence) is the official AI community of College of Engineering Chengannur. A platform where curious minds meet, ideas evolve, and innovation becomes impact.</p>
          <div className="flex flex-col gap-3.5 lg:gap-5">
            {cards.map((card, index) => <div key={card.title} ref={(element) => { cardsRef.current[index] = element }} className="flex gap-3.5 rounded-2xl border border-white/5 bg-white/[.02] p-4.5 backdrop-blur-xl transition hover:border-red-500/20 hover:bg-red-500/[.01] hover:shadow-[0_12px_36px_rgba(255,32,32,.06)] lg:gap-5 lg:p-6">
              <div className="flex h-10.5 w-10.5 shrink-0 items-center justify-center rounded-[10px] border border-red-500/10 bg-red-500/5 text-2xl text-accent lg:h-12 lg:w-12 lg:rounded-xl">{card.icon}</div>
              <div><h2 className="mb-1.5 font-tech text-sm font-bold tracking-[.1em]">{card.title}</h2><p className="text-[.84rem] leading-relaxed text-white/50 lg:text-sm">{card.text}</p></div>
            </div>)}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden h-45 bg-gradient-to-t from-black via-black/40 to-transparent lg:block" />
        <div ref={scrollCueRef} className="absolute bottom-7 left-1/2 z-30 hidden -translate-x-1/2 flex-col items-center gap-2.5 lg:flex">
          <span className="font-sans text-[.62rem] font-semibold tracking-[.3em] text-white/35">SCROLL</span>
          <span className="h-12 w-px overflow-hidden rounded bg-white/15"><span className="block h-2/5 w-full rounded bg-white/70 animate-[scroll-drop_1.8s_ease-in-out_2s_infinite]" /></span>
        </div>
      </div>
    </section>
  )
}
