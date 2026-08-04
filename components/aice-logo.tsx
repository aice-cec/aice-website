type AiceLogoProps = { className?: string }

export function AiceLogo({ className }: AiceLogoProps) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M100 12Q100 10 103 13L185 162Q188 168 182 170H118L100 138L82 170H18Q12 168 15 162L97 13Q100 10 100 12Z" fill="url(#outer)" />
      <path d="M100 52L148 148H52L100 52Z" fill="#000" />
      <path d="M100 138L82 170H118L100 138Z" fill="url(#fold)" />
      <defs>
        <linearGradient id="outer" x1="100" y1="10" x2="100" y2="190" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" /><stop offset="1" stopColor="#ccc" />
        </linearGradient>
        <linearGradient id="fold" x1="80" y1="120" x2="120" y2="185" gradientUnits="userSpaceOnUse">
          <stop stopColor="#888" /><stop offset="1" stopColor="#111" />
        </linearGradient>
      </defs>
    </svg>
  )
}
