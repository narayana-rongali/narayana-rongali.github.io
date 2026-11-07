import { useEffect, useState } from 'react'
import {
  cloudServices,
  credentials,
  experience,
  heroStats,
  POC_REPO,
  pocs,
  production,
  profile,
  skillGroups,
  snowflakeWork,
  workflowHighlights,
} from '../../data/resume'
import { CLIENT } from '../../data/orderPlatform'
import OrderPlatformWorkflow from './OrderPlatformWorkflow'
import PipelineDag from './PipelineDag'
import QueryConsole from './QueryConsole'

const NAV_LINKS = [
  { id: 'workflow', label: 'Platform' },
  { id: 'production', label: 'Production' },
  { id: 'cloud', label: 'Cloud' },
  { id: 'experience', label: 'Experience' },
  { id: 'pocs', label: 'POCs' },
  { id: 'skills', label: 'Skills' },
  { id: 'query', label: 'Query' },
  { id: 'contact', label: 'Contact' },
]

const SECTION = 'mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24'
const PRIMARY_BUTTON =
  'inline-flex min-h-11 items-center rounded-full bg-gold px-5 text-sm font-semibold text-obsidian transition-colors hover:bg-[#f4d68e]'
const SECONDARY_BUTTON =
  'inline-flex min-h-11 items-center rounded-full border border-white/15 bg-white/5 px-5 text-sm transition-colors hover:border-amber-500/50'

function SectionHeading({ table, title, children }) {
  return (
    <header className="reveal mb-8 max-w-3xl md:mb-12">
      <p className="mb-3 break-words font-mono text-xs text-mist">
        <span className="text-gold">SELECT</span> * <span className="text-gold">FROM</span> {table};
      </p>
      <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">{title}</h2>
      {children && <p className="mt-4 text-pretty text-base leading-relaxed text-ink/80 md:text-lg">{children}</p>}
    </header>
  )
}

function Tags({ items }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li key={item} className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 font-mono text-[11px] text-ink/80">
          {item}
        </li>
      ))}
    </ul>
  )
}

function Nav() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(null)

  // Only fires when a section crosses the middle of the screen, never on every scroll event.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    NAV_LINKS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-obsidian/95">
      <div className="scroll-progress absolute inset-x-0 bottom-[-1px] h-px origin-left bg-gold" aria-hidden="true" />
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <a href="#top" className="flex min-h-11 items-center font-semibold tracking-tight">
          {profile.name}
        </a>

        <nav aria-label="Sections" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              aria-current={active === id ? 'true' : undefined}
              className={`rounded-md px-3 py-2 text-sm transition-colors hover:text-ink ${
                active === id ? 'text-gold' : 'text-mist'
              }`}
            >
              {label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((value) => !value)}
          className="-mr-2 flex size-11 cursor-pointer items-center justify-center lg:hidden"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            {open ? <path d="M5 5l12 12M17 5L5 17" /> : <path d="M3 6h16M3 11h16M3 16h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label="Sections" className="border-t border-white/10 bg-obsidian px-5 py-2 sm:px-8 lg:hidden">
          {NAV_LINKS.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={() => setOpen(false)}
              className={`flex min-h-12 items-center border-b border-white/5 text-base last:border-0 ${
                active === id ? 'text-gold' : 'text-ink'
              }`}
            >
              {label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}

function Hero() {
  return (
    <section id="top" className="relative isolate overflow-x-clip pt-16">
      <div className="hero-grid" aria-hidden="true" />
      <div className="mx-auto max-w-6xl px-5 pb-10 pt-14 sm:px-8 md:pb-16 md:pt-24">
        <p className="font-mono text-xs text-mist sm:text-sm">
          {profile.name} <span className="text-white/30">/</span> {profile.role}
        </p>
        <h1 className="mt-5 text-[clamp(2.75rem,9vw,6.75rem)] font-semibold leading-[1] tracking-[-0.035em]">
          Architecting the <span className="gold-text">Flow.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-ink/85 md:text-xl">
          Senior Data Engineer &amp; Analyst. Designing resilient, scalable data pipelines and AI-driven architectures,
          with deep experience in supply chain data.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#workflow" className={PRIMARY_BUTTON}>See the platform workflow</a>
          {profile.resumeUrl && (
            <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className={SECONDARY_BUTTON}>Resume</a>
          )}
          <a href={profile.linkedin} target="_blank" rel="noreferrer" className={SECONDARY_BUTTON}>LinkedIn</a>
          {profile.github && (
            <a href={profile.github} target="_blank" rel="noreferrer" className={SECONDARY_BUTTON}>GitHub</a>
          )}
        </div>

        <dl className="mt-12 grid grid-cols-1 gap-x-6 gap-y-8 border-t border-white/10 pt-8 sm:grid-cols-2 lg:grid-cols-4">
          {heroStats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse justify-end gap-1.5">
              <dt className="text-sm leading-snug text-mist">{stat.label}</dt>
              <dd className="text-3xl font-semibold tracking-tight md:text-4xl">{stat.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-12">
          <PipelineDag />
          <p className="mt-3 text-xs text-mist">A composite view of the stack I work with, not one specific client system.</p>
        </div>
      </div>
    </section>
  )
}

function Workflow() {
  return (
    <section id="workflow" className={SECTION}>
      <SectionHeading table="order_platform" title="How the order-generation platform works.">
        For {CLIENT}, I built an automated order-generation and forecasting platform on ADF and Databricks. Run it below,
        make a quality check fail, or select any stage to see what it does and what it changed.
      </SectionHeading>
      <dl className="reveal mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {workflowHighlights.map((item) => (
          <div key={item.label} className="card flex flex-col-reverse justify-end gap-1 p-4">
            <dt className="text-sm leading-snug text-mist">{item.label}</dt>
            <dd className="text-2xl font-semibold tracking-tight">{item.value}</dd>
          </div>
        ))}
      </dl>
      <OrderPlatformWorkflow />
    </section>
  )
}

function Production() {
  return (
    <section id="production" className={SECTION}>
      <SectionHeading table="production" title="How I run data in production." />
      <div className="reveal card divide-y divide-white/10">
        {production.map((item) => (
          <div key={item.practice} className="grid gap-1.5 p-5 md:grid-cols-[12rem_1fr_13rem] md:gap-6 md:p-6">
            <h3 className="font-semibold">{item.practice}</h3>
            <p className="leading-relaxed text-ink/80">{item.how}</p>
            <p className="text-sm font-medium text-success md:text-right">{item.result}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Experience() {
  return (
    <section id="experience" className={SECTION}>
      <SectionHeading table="experience" title="Experience" />
      {experience.map((job) => (
        <article key={job.company} className="card reveal p-6 md:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h3 className="text-2xl font-semibold tracking-tight md:text-3xl">{job.company}</h3>
            <p className="font-mono text-xs text-mist">{job.period}</p>
          </div>
          <p className="mt-1 text-ink/80">{job.role}</p>
          <div className="mt-6 space-y-6">
            {job.groups.map((group) => (
              <div key={group.title} className="grid gap-2 md:grid-cols-[8rem_1fr] md:gap-6">
                <h4 className="font-mono text-xs uppercase tracking-wider text-gold md:pt-1">{group.title}</h4>
                <ul className="space-y-2">
                  {group.items.map((item) => (
                    <li key={item} className="leading-relaxed text-ink/80">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </article>
      ))}
    </section>
  )
}

function FlowChips({ steps }) {
  return (
    <ol className="flex flex-wrap items-center gap-y-2 font-mono text-[11px]" aria-label={`Data flow: ${steps.join(', then ')}`}>
      {steps.map((step, i) => (
        <li key={step} className="flex items-center">
          <span className="rounded-md border border-gold/25 bg-gold/[0.06] px-2 py-1 text-gold">{step}</span>
          {i < steps.length - 1 && <span aria-hidden="true" className="px-1.5 text-mist">→</span>}
        </li>
      ))}
    </ol>
  )
}

function WhereBadges({ where }) {
  return (
    <span className="flex shrink-0 gap-1">
      {where.map((place) => (
        <span
          key={place}
          className={`rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
            place === 'Production' ? 'border-gold/40 text-gold' : 'border-white/15 text-mist'
          }`}
        >
          {place}
        </span>
      ))}
    </span>
  )
}

function Cloud() {
  return (
    <section id="cloud" className={SECTION}>
      <SectionHeading table="cloud_services" title="Azure, AWS and Snowflake.">
        What I have used each service for. Production means client work; POC means the tested code below.
      </SectionHeading>
      <div className="grid gap-4 lg:grid-cols-2">
        {cloudServices.map((group) => (
          <div key={group.platform} className="card reveal p-5 sm:p-6">
            <h3 className="mb-2 text-xl font-semibold tracking-tight">{group.platform}</h3>
            <ul className="divide-y divide-white/5">
              {group.services.map((service) => (
                <li key={service.name} className="py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">{service.name}</span>
                    <WhereBadges where={service.where} />
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-ink/75">{service.use}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="card reveal mt-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xl font-semibold tracking-tight">Snowflake optimization</h3>
          <WhereBadges where={['Production', 'POC']} />
        </div>
        <p className="mt-2 max-w-3xl leading-relaxed text-ink/80">{snowflakeWork.production}</p>
        <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          {snowflakeWork.techniques.map((technique) => (
            <div key={technique.name}>
              <dt className="flex items-center gap-2 font-medium">
                {technique.name}
                {technique.poc && <span className="font-mono text-[10px] uppercase tracking-wider text-mist">POC</span>}
              </dt>
              <dd className="mt-1 text-sm leading-relaxed text-ink/75">{technique.what}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

function Pocs() {
  return (
    <section id="pocs" className={SECTION}>
      <SectionHeading table="pocs" title="POCs and small projects.">
        Self-contained builds outside client delivery, on synthetic data. Each one has code and tests you can run.
      </SectionHeading>
      <div className="grid gap-4 md:grid-cols-2">
        {pocs.map((poc) => (
          <article key={poc.id} className="card reveal flex flex-col p-6">
            <h3 className="text-2xl font-semibold tracking-tight">{poc.title}</h3>
            <p className="mt-3 leading-relaxed text-ink/85">{poc.goal}</p>
            <div className="mt-4">
              <FlowChips steps={poc.flow} />
            </div>
            <ul className="mt-4 flex-1 space-y-1.5">
              {poc.approach.map((item) => (
                <li key={item} className="text-sm leading-relaxed text-ink/75">{item}</li>
              ))}
            </ul>
            <div className="mt-5">
              <Tags items={poc.skills} />
            </div>
            {(poc.proof || (POC_REPO && poc.folder)) && (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                {poc.proof && (
                  <p className="flex items-center gap-2 text-sm text-success">
                    <span aria-hidden="true" className="size-1.5 rounded-full bg-success" />
                    {poc.proof}
                  </p>
                )}
                {POC_REPO && poc.folder && (
                  <a
                    href={`${POC_REPO}/tree/main/${poc.folder}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center text-sm text-gold underline underline-offset-4"
                  >
                    View code
                  </a>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}

function Skills() {
  return (
    <section id="skills" className={SECTION}>
      <SectionHeading table="skills" title="Skills" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skillGroups.map((group) => (
          <div key={group.name} className="card reveal p-5">
            <h3 className="mb-3 font-semibold">{group.name}</h3>
            <Tags items={group.skills} />
          </div>
        ))}
      </div>
    </section>
  )
}

function Query() {
  return (
    <section id="query" className={SECTION}>
      <SectionHeading table="tables" title="Query my resume.">
        A read-only SQL engine running in your browser, with WHERE, GROUP BY, ORDER BY and LIMIT. Pick a preset or write
        your own.
      </SectionHeading>
      <div className="reveal">
        <QueryConsole />
      </div>
    </section>
  )
}

function Credentials() {
  return (
    <section id="credentials" className={SECTION}>
      <SectionHeading table="credentials" title="Certifications and awards" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {credentials.map((item) => (
          <article key={item.title} className="card reveal p-5">
            <p className="font-mono text-[11px] uppercase tracking-wider text-gold">{item.kind}</p>
            <h3 className="mt-3 text-lg font-semibold leading-snug">{item.title}</h3>
            <p className="mt-1 font-mono text-xs text-mist">{item.meta}</p>
            {item.text && <p className="mt-3 text-sm leading-relaxed text-ink/75">{item.text}</p>}
          </article>
        ))}
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contact" className={SECTION}>
      <div className="reveal card p-6 sm:p-10 md:p-14">
        <h2 className="text-balance text-4xl font-semibold tracking-tight md:text-6xl">
          Have a pipeline that needs to <span className="gold-text">hold up?</span>
        </h2>
        <p className="mt-4 break-words text-lg text-ink/80">{profile.email}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={`mailto:${profile.email}`} className={PRIMARY_BUTTON}>Email me</a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer" className={SECONDARY_BUTTON}>LinkedIn</a>
          {profile.resumeUrl && (
            <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className={SECONDARY_BUTTON}>Resume PDF</a>
          )}
          {profile.github && (
            <a href={profile.github} target="_blank" rel="noreferrer" className={SECONDARY_BUTTON}>GitHub</a>
          )}
        </div>
      </div>
      <footer className="mt-10 text-sm text-mist">
        {profile.name} / {profile.role}
      </footer>
    </section>
  )
}

export default function PortfolioUI() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Workflow />
        <Production />
        <Cloud />
        <Experience />
        <Pocs />
        <Skills />
        <Query />
        <Credentials />
        <Contact />
      </main>
    </>
  )
}
