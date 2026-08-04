import { AiceLogo } from './aice-logo'

const reasons = [
  ['01', 'LEARN TOGETHER', 'Explore tools, research, and ideas with people who are actively making things.'],
  ['02', 'BUILD IN PUBLIC', 'Turn weekend experiments into real projects, events, and collaborative work.'],
  ['03', 'FIND YOUR PEOPLE', 'Meet a community that stays curious, generous, and ready to try the hard thing.'],
]

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-5 w-5">
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Join() {
  return (
    <>
      <section id="join" className="relative overflow-hidden bg-red-500 py-20 text-black sm:py-28 lg:py-36">
        <div className="pointer-events-none absolute -left-24 top-1/2 h-110 w-110 -translate-y-1/2 rounded-full border border-black/15" />
        <div className="pointer-events-none absolute -right-18 top-0 h-100 w-100 rounded-full bg-black/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
            <div>
              <p className="mb-5 font-tech text-xs font-bold tracking-[.22em] text-black/65">BECOME PART OF AICE</p>
              <h2 className="max-w-4xl font-tech text-[clamp(3.2rem,8vw,8rem)] font-black leading-[.8] tracking-[-.075em]">
                YOUR NEXT<br />IDEA STARTS<br />HERE.
              </h2>
            </div>
            <div className="rounded-3xl border border-black/15 bg-black px-6 py-7 text-white shadow-2xl shadow-red-950/20 sm:p-8">
              <p className="font-tech text-[.65rem] font-bold tracking-[.18em] text-red-400">OPEN TO CEC STUDENTS</p>
              <p className="mt-4 max-w-sm text-lg leading-snug text-white/80">Bring your questions, your half-finished projects, and the appetite to make something meaningful.</p>
              <a href="#contact" className="mt-8 flex w-full items-center justify-between rounded-full bg-white px-5 py-4 font-tech text-xs font-bold tracking-[.13em] text-black transition hover:bg-black hover:text-white hover:outline hover:outline-1 hover:outline-white">
                START YOUR AICE JOURNEY <ArrowIcon />
              </a>
            </div>
          </div>

          <div className="mt-16 grid gap-5 border-t border-black/15 pt-8 md:grid-cols-3">
            {reasons.map(([number, title, text]) => (
              <div key={number} className="border-l border-black/25 pl-4">
                <span className="font-tech text-xs font-bold tracking-[.15em] text-black/45">{number}</span>
                <h3 className="mt-4 font-tech text-lg font-black tracking-[-.025em]">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-black/65">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer id="contact" className="border-t border-white/8 bg-black py-10 sm:py-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-9 px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col justify-between gap-7 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-3">
                <AiceLogo className="h-9 w-9" />
                <span className="font-tech text-2xl font-extrabold tracking-[.1em]">AICE</span>
              </div>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/45">AI Innovation Community for Excellence — College of Engineering Chengannur.</p>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-3 font-tech text-[.68rem] font-bold tracking-[.14em] text-white/50">
              <a href="#home" className="transition hover:text-red-400">HOME</a>
              <a href="#about" className="transition hover:text-red-400">ABOUT</a>
              <a href="#events" className="transition hover:text-red-400">EVENTS</a>
              <a href="#execom" className="transition hover:text-red-400">EXECOM</a>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-3 border-t border-white/8 pt-5 text-[.65rem] font-medium tracking-[.12em] text-white/30 sm:flex-row">
            <span>© 2026 AICE. ALL RIGHTS RESERVED.</span>
            <span>DESIGNED FOR WHAT&apos;S NEXT.</span>
          </div>
        </div>
      </footer>
    </>
  )
}
