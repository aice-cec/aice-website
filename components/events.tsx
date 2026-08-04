const upcomingEvents = [
  {
    date: '06',
    month: 'SEP',
    title: 'AICE BUILD NIGHT',
    type: 'Hands-on workshop',
    time: '5:30 PM — 8:30 PM',
    place: 'Innovation Lab, CEC',
    description: 'An open build session for turning ambitious AI ideas into working prototypes.',
    featured: true,
  },
  {
    date: '13',
    month: 'SEP',
    title: 'PROMPTCRAFT',
    type: 'Masterclass',
    time: '10:00 AM — 1:00 PM',
    place: 'Seminar Hall',
    description: 'Learn practical prompting patterns for research, design, and development.',
  },
  {
    date: '27',
    month: 'SEP',
    title: 'AI RESEARCH CIRCLE',
    type: 'Community session',
    time: '2:00 PM — 4:00 PM',
    place: 'Library Discussion Room',
    description: 'A guided discussion on new papers, experiments, and emerging AI ideas.',
  },
]

const pastEvents = [
  { date: '18 AUG', title: 'NEURAL NETWORKS 101', label: 'Workshop', stat: '120+ builders' },
  { date: '02 AUG', title: 'AICE ORIENTATION', label: 'Community', stat: '240+ attendees' },
  { date: '19 JUL', title: 'HACK THE FUTURE', label: 'Hackathon', stat: '18 projects' },
]

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-5 w-5">
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className="h-4 w-4">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" strokeLinecap="round" />
    </svg>
  )
}

export function Events() {
  return (
    <section id="events" className="relative overflow-hidden border-t border-white/8 bg-[#050505] py-20 sm:py-28 lg:py-36">
      <div className="pointer-events-none absolute -right-40 top-16 h-130 w-130 rounded-full bg-red-600/8 blur-[130px]" />
      <div className="pointer-events-none absolute -left-32 bottom-0 h-100 w-100 rounded-full bg-white/4 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="mb-12 flex flex-col gap-7 lg:mb-16 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-4 flex items-center gap-3 font-tech text-xs font-bold tracking-[.24em] text-red-500">
              <span className="h-px w-10 bg-red-500" /> AICE / EVENTS
            </p>
            <h2 className="font-tech text-[clamp(2.8rem,6vw,5.8rem)] font-black leading-[.88] tracking-[-.05em] text-white">
              MAKE THE NEXT<br />MOVE <span className="text-red-500">MATTER.</span>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-white/55 sm:text-base">
            Workshops, build sessions, conversations, and challenges for people who want to push AI forward together.
          </p>
        </div>

        <div className="mb-7 flex items-center justify-between border-b border-white/10 pb-4 sm:mb-8">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_12px_#ff2020]" />
            <h3 className="font-tech text-lg font-bold tracking-[.1em] sm:text-xl">UPCOMING</h3>
          </div>
          <a href="#join" className="group flex items-center gap-2 font-tech text-xs font-bold tracking-[.12em] text-white/60 transition hover:text-white">
            VIEW CALENDAR <span className="transition-transform group-hover:translate-x-1"><ArrowIcon /></span>
          </a>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.35fr_.65fr] lg:gap-5">
          {upcomingEvents.map((event, index) => (
            <article
              key={event.title}
              className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[.025] transition duration-500 hover:-translate-y-1 hover:border-red-500/40 hover:bg-white/[.045] ${event.featured ? 'min-h-95 p-6 sm:p-9 lg:row-span-2 lg:min-h-140' : 'min-h-58 p-6 sm:p-7'}`}
            >
              {event.featured && <>
                <div className="pointer-events-none absolute -right-12 -top-12 h-72 w-72 rounded-full border border-red-500/20" />
                <div className="pointer-events-none absolute right-8 top-8 font-tech text-[8rem] font-black leading-none text-white/[.025] sm:text-[11rem]">01</div>
              </>}
              <div className={`relative flex h-full ${event.featured ? 'flex-col justify-between gap-10' : 'gap-5'}`}>
                <div className={`shrink-0 ${event.featured ? 'flex items-start justify-between' : ''}`}>
                  <div className="inline-flex min-w-16 flex-col rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-center backdrop-blur">
                    <span className="font-tech text-2xl font-bold leading-none text-white">{event.date}</span>
                    <span className="mt-1 font-tech text-[.62rem] font-bold tracking-[.18em] text-red-500">{event.month}</span>
                  </div>
                  {event.featured && <span className="rounded-full border border-red-500/25 bg-red-500/10 px-3 py-1.5 font-tech text-[.62rem] font-bold tracking-[.14em] text-red-400">FEATURED</span>}
                </div>
                <div className={event.featured ? 'max-w-xl' : 'flex-1'}>
                  <p className="mb-2 font-tech text-[.65rem] font-bold tracking-[.18em] text-red-500">{event.type.toUpperCase()}</p>
                  <h4 className={`font-tech font-black tracking-[-.035em] text-white ${event.featured ? 'text-3xl sm:text-5xl' : 'text-2xl sm:text-3xl'}`}>{event.title}</h4>
                  <p className={`mt-3 max-w-lg text-sm leading-relaxed text-white/55 ${event.featured ? 'sm:text-base' : ''}`}>{event.description}</p>
                </div>
                <div className={`flex items-center justify-between gap-3 text-xs text-white/50 ${event.featured ? 'border-t border-white/10 pt-5' : 'self-end'}`}>
                  <span className="flex items-center gap-2"><CalendarIcon /> {event.time}</span>
                  <span className="hidden sm:inline">{event.place}</span>
                  <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white transition group-hover:border-red-500 group-hover:bg-red-500 group-hover:text-black" aria-label={`Learn more about ${event.title}`}><ArrowIcon /></button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-18 border-t border-white/10 pt-7 sm:mt-24 sm:pt-8">
          <div className="mb-7 flex items-center justify-between sm:mb-8">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full border border-white/50" />
              <h3 className="font-tech text-lg font-bold tracking-[.1em] text-white/85 sm:text-xl">PAST EVENTS</h3>
            </div>
            <span className="font-tech text-[.65rem] font-bold tracking-[.16em] text-white/35">2026 ARCHIVE</span>
          </div>

          <div className="grid gap-3 md:grid-cols-3 md:gap-4">
            {pastEvents.map((event, index) => (
              <article key={event.title} className="group relative overflow-hidden rounded-2xl border border-white/8 bg-white/[.015] p-5 transition duration-300 hover:border-white/25 hover:bg-white/[.035] sm:p-6">
                <span className="absolute -right-2 -top-6 font-tech text-7xl font-black text-white/[.025]">0{index + 1}</span>
                <p className="relative mb-12 font-tech text-[.65rem] font-bold tracking-[.18em] text-white/45">{event.date}</p>
                <div className="relative">
                  <p className="mb-2 text-xs font-semibold text-red-400">{event.label}</p>
                  <h4 className="font-tech text-xl font-bold tracking-[-.03em] text-white">{event.title}</h4>
                  <p className="mt-4 text-sm text-white/45">{event.stat}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
