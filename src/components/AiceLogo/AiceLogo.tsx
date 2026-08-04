interface AiceLogoProps {
  size?: number
  className?: string
}

/**
 * AICE brand mark — the angular 3D-fold "A" triangle logo.
 * Mirrors the user-provided white logo with inner fold crease.
 */
const AiceLogo = ({ size = 40, className }: AiceLogoProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="AICE logo mark"
  >
    <defs>
      {/* Outer face gradient — bright white top, slight grey at edges */}
      <linearGradient id="outerGrad" x1="100" y1="10" x2="100" y2="190" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#cccccc" stopOpacity="0.85" />
      </linearGradient>

      {/* Inner fold crease — the dark shadow under the fold */}
      <linearGradient id="foldGrad" x1="80" y1="120" x2="120" y2="185" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#888888" stopOpacity="0.6" />
        <stop offset="60%" stopColor="#444444" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#111111" stopOpacity="0.2" />
      </linearGradient>

      {/* Subtle glow filter */}
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/*
      Outer "A" triangle with rounded corners and a cutout.
      The shape: a thick-stroked equilateral triangle with an 
      inner triangular cutout — like the letter A.
    */}

    {/* Main outer ring — the thick triangle border of the A */}
    <path
      d={[
        /* Top apex — rounded */
        'M 100 12',
        'Q 100 10 103 13',
        /* Right leg going down-right */
        'L 185 162',
        'Q 188 168 182 170',
        /* Bottom-right corner going left */
        'L 118 170',
        /* Inner fold — goes up to the crease point */
        'L 100 138',
        /* Right inner side going back up-left */
        'L 82 170',
        /* Bottom-left corner */
        'L 18 170',
        'Q 12 168 15 162',
        /* Left leg going up to apex */
        'L 97 13',
        'Q 100 10 100 12',
        'Z',
      ].join(' ')}
      fill="url(#outerGrad)"
      filter="url(#glow)"
    />

    {/* Inner cutout — the hole of the "A" */}
    <path
      d={[
        'M 100 52',
        'L 148 148',
        'L 52 148',
        'Z',
      ].join(' ')}
      fill="#000000"
    />

    {/* Fold crease overlay — the shadow of the 3D fold going inward */}
    <path
      d={[
        'M 100 138',
        'L 82 170',
        'L 118 170',
        'Z',
      ].join(' ')}
      fill="url(#foldGrad)"
    />

    {/* Highlight on left face */}
    <path
      d="M 100 12 L 58 148 L 52 148 L 15 162 L 97 13 Q 100 10 100 12 Z"
      fill="white"
      fillOpacity="0.08"
    />
  </svg>
)

export default AiceLogo
