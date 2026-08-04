import { useState, useEffect } from 'react'
import AiceLogo from '../AiceLogo/AiceLogo'
import styles from './Navbar.module.css'

const navLinks = [
  { label: 'HOME', href: '#home', id: 'nav-home' },
  { label: 'ABOUT', href: '#about', id: 'nav-about' },
  { label: 'EVENTS', href: '#events', id: 'nav-events' },
  { label: 'EXECOM', href: '#execom', id: 'nav-execom' },
 
]

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeLink, setActiveLink] = useState('HOME')

  useEffect(() => {
    const handleScroll = () => {
      const vh = window.innerHeight
      const currentY = window.scrollY

      setScrolled(currentY > 20)

      // Dynamically highlight HOME vs ABOUT based on scroll depth
      if (currentY < vh * 1.5) {
        setActiveLink('HOME')
      } else if (currentY >= vh * 1.5) {
        setActiveLink('ABOUT')
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`} role="banner">
      <div className={styles.container}>

        {/* Logo mark + wordmark */}
        <a href="#home" className={styles.logo} id="logo" aria-label="AICE Home">
          <AiceLogo size={36} className={styles.logoMark} />
          <span className={styles.logoText}>AICE</span>
        </a>

        {/* Nav Pills */}
        <nav
          className={`${styles.navPill} ${mobileOpen ? styles.navPillOpen : ''}`}
          role="navigation"
          aria-label="Main navigation"
        >
          {navLinks.map((link) => (
            <a
              key={link.id}
              id={link.id}
              href={link.href}
              className={`${styles.navLink} ${activeLink === link.label ? styles.active : ''}`}
              onClick={() => {
                setActiveLink(link.label)
                setMobileOpen(false)
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <a href="#join" id="cta-join-now" className={styles.ctaBtn} aria-label="Join AICE now">
          JOIN NOW
          <svg
            className={styles.ctaArrow}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>

        {/* Hamburger */}
        <button
          className={`${styles.hamburger} ${mobileOpen ? styles.hamburgerOpen : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          id="hamburger-btn"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  )
}

export default Navbar
