const team = [
  { role: 'PRESIDENT', title: 'Community Lead', index: '01', accent: 'from-red-500/35 via-red-500/5 to-transparent' },
  { role: 'VICE PRESIDENT', title: 'Strategy Lead', index: '02', accent: 'from-white/20 via-white/5 to-transparent' },
  { role: 'TECH LEAD', title: 'Build Systems', index: '03', accent: 'from-red-500/25 via-transparent to-transparent' },
  { role: 'CREATIVE LEAD', title: 'Brand & Story', index: '04', accent: 'from-white/15 via-transparent to-transparent' },
  { role: 'COMMUNITY LEAD', title: 'People & Culture', index: '05', accent: 'from-red-500/20 via-transparent to-transparent' },
  { role: 'OPERATIONS LEAD', title: 'Making it happen', index: '06', accent: 'from-white/15 via-transparent to-transparent' },
]

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="h-5 w-5">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  )
}

export function Execom() {
  return (
    <section id="execom" className="relative overflow-hidden bg-black py-20 sm:py-28 lg:py-36">
      <div className="pointer-events-none absolute left-1/2 top-20 h-125 w-125 -translate-x-1/2 rounded-full border border-white/[.045]" />
      <div className="pointer-events-none absolute left-1/2 top-36 h-80 w-80 -translate-x-1/2 rounded-full border border-red-500/10" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="mx-auto mb-14 max-w-3xl text-center lg:mb-18">
          <p className="mb-4 font-tech text-xs font-bold tracking-[.24em] text-red-500">THE PEOPLE BEHIND AICE</p>
          <h2 className="font-tech text-[clamp(2.8rem,6vw,6rem)] font-black leading-[.86] tracking-[-.06em] text-white">
            BUILT BY<br /><span className="text-white/35">CURIOUS MINDS.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-white/55 sm:text-base">
            A multidisciplinary crew building the community, experiences, and momentum that make AICE move.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {team.map((member) => (
            <article key={member.index} className="group relative min-h-72 overflow-hidden rounded-2xl border border-white/8 bg-white/[.018] p-6 transition duration-500 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[.035] sm:p-7">
              <div className={`absolute inset-x-0 top-0 h-36 bg-gradient-to-b ${member.accent} opacity-70 transition duration-500 group-hover:opacity-100`} />
              <div className="absolute right-5 top-4 font-tech text-7xl font-black tracking-[-.1em] text-white/[.035] transition duration-500 group-hover:text-red-500/12">{member.index}</div>
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-black/40 font-tech text-sm font-bold tracking-[.08em] text-white/75 backdrop-blur-sm transition group-hover:border-red-500/40 group-hover:text-red-400">
                  {member.index}
                </div>
                <div>
                  <p className="mb-2 font-tech text-[.65rem] font-bold tracking-[.18em] text-red-500">{member.role}</p>
                  <h3 className="font-tech text-2xl font-bold tracking-[-.035em] text-white">{member.title}</h3>
                  <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-white/40">
                    <span>AICE EXE COMMITTEE</span>
                    <span className="text-white/70 transition group-hover:rotate-90 group-hover:text-red-400"><PlusIcon /></span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-5 rounded-2xl border border-white/8 bg-white/[.018] px-6 py-5 sm:flex-row sm:items-center sm:px-7">
          <p className="max-w-xl text-sm leading-relaxed text-white/55">Interested in helping AICE create what comes next? New contributors are always welcome.</p>
          <a href="#join" className="shrink-0 rounded-full border border-white/15 px-5 py-2.5 font-tech text-[.68rem] font-bold tracking-[.14em] text-white transition hover:border-red-500 hover:bg-red-500 hover:text-black">JOIN THE CREW</a>
        </div>
      </div>
    </section>
  )
}
