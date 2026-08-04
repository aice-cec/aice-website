'use client'

import { useEffect, useState } from 'react'
import { AiceLogo } from './aice-logo'

const links = [
  { label: 'HOME', href: '#home' },
  { label: 'ABOUT', href: '#about' },
  { label: 'EVENTS', href: '#events' },
  { label: 'EXECOM', href: '#execom' },
  
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('HOME')

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 20)
      setActive(y >= window.innerHeight * 2.85 ? 'ABOUT' : 'HOME')
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`fixed inset-x-0 top-0 z-50 h-20 transition duration-300 ${scrolled ? 'border-b border-white/6 bg-black/70 backdrop-blur-xl' : ''}`}>
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-8 lg:px-10">
        <a href="#home" className="flex items-center gap-2 text-white transition hover:opacity-85" aria-label="AICE home">
          <AiceLogo className="h-8 w-8 shrink-0 sm:h-9 sm:w-9" />
          <span className="font-tech text-[1.15rem] font-extrabold tracking-[0.1em] sm:text-[1.45rem]">AICE</span>
        </a>

        <nav className={`absolute left-0 right-0 top-20 overflow-hidden border-t border-white/10 bg-black/95 px-4 py-3 opacity-0 pointer-events-none transition-all duration-300 md:static md:flex md:pointer-events-auto md:items-center md:gap-1 md:rounded-full md:border md:border-white/10 md:bg-white/7 md:px-2 md:py-1.5 md:opacity-100 md:backdrop-blur ${open ? 'max-h-80 opacity-100 pointer-events-auto' : 'max-h-0 md:max-h-none'}`} aria-label="Main navigation">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => { setActive(link.label); setOpen(false) }}
              className={`block rounded-lg px-4 py-3 font-tech text-sm font-semibold tracking-[0.12em] transition md:rounded-full md:px-5 md:py-2 md:text-xs ${active === link.label ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/8 hover:text-white'}`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a href="#join" className="hidden items-center gap-2 rounded-full bg-white px-6 py-3 font-sans text-xs font-bold tracking-[0.08em] text-black transition hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-lg hover:shadow-white/15 md:flex">
          JOIN NOW <span aria-hidden="true">→</span>
        </a>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-lg transition hover:bg-white/8 md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          <span className={`h-0.5 w-6 rounded bg-white transition ${open ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`h-0.5 w-4 rounded bg-white transition ${open ? 'opacity-0' : ''}`} />
          <span className={`h-0.5 w-6 rounded bg-white transition ${open ? '-translate-y-2 -rotate-45' : ''}`} />
        </button>
      </div>
    </header>
  )
}
