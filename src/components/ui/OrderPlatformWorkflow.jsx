import { useCallback, useEffect, useState } from 'react'
import {
  BLOCKED_ON_FAILURE,
  CLIENT,
  CONTROL_LINKS,
  EDGES,
  FLOW_VIEWBOX,
  NODES,
  PLATFORM_NODES,
  RUN_ORDER,
} from '../../data/orderPlatform'

const STATUS = {
  idle: { fill: '#12151b', stroke: 'rgb(255 255 255 / 0.2)', dot: '#4a505c', label: 'Waiting' },
  running: { fill: '#2a2312', stroke: '#e8c26a', dot: '#e8c26a', label: 'Running' },
  done: { fill: '#10201a', stroke: '#6ee7a8', dot: '#6ee7a8', label: 'Success' },
  failed: { fill: '#2a1214', stroke: '#fca5a5', dot: '#fca5a5', label: 'Failed' },
  blocked: { fill: '#1c1416', stroke: 'rgb(252 165 165 / 0.85)', dot: '#fca5a5', label: 'Blocked', dash: '4 3' },
}

const LANE_COLOR = {
  batch: '#e8c26a',
  gate: '#fca5a5',
  serve: '#6ee7a8',
  operational: '#7dd3fc',
  control: '#c4b5fd',
  platform: '#a3a9b4',
}

function anchor(node, side) {
  const { x, y, w, h } = node.box
  if (side === 'r') return [x + w, y + h / 2]
  if (side === 'l') return [x, y + h / 2]
  if (side === 't') return [x + w / 2, y]
  return [x + w / 2, y + h]
}

function edgePath([from, to, a, b]) {
  const [x1, y1] = anchor(NODES[from], a)
  const [x2, y2] = anchor(NODES[to], b)
  // Enters left of centre, so it stays visibly separate from the line leaving the same edge.
  if (a === 'r' && b === 'b') return `M${x1} ${y1}C${x2 - 34} ${y1} ${x2 - 34} ${y1} ${x2 - 34} ${y2 + 6}`
  if (a === 't' && b === 'l') return `M${x1} ${y1}C${x1} ${y2} ${x1} ${y2} ${x2} ${y2}`
  if (a === 'r' || a === 'l') {
    const mid = (x1 + x2) / 2
    return `M${x1} ${y1}C${mid} ${y1} ${mid} ${y2} ${x2} ${y2}`
  }
  const mid = (y1 + y2) / 2
  return `M${x1} ${y1}C${x1} ${mid} ${x2} ${mid} ${x2} ${y2}`
}

function statusOf(id, run) {
  const index = RUN_ORDER.indexOf(id)
  if (run.phase === 'idle' || index < 0) return 'idle'
  if (run.phase === 'done') return 'done'
  // Airflow supervises the whole run, so its state is the state of the run.
  if (id === 'airflow') return run.phase === 'failed' ? 'failed' : 'running'
  if (run.phase === 'failed') {
    if (id === 'dq') return 'failed'
    if (BLOCKED_ON_FAILURE.includes(id)) return 'blocked'
    return index < RUN_ORDER.indexOf('dq') ? 'done' : 'idle'
  }
  if (index < run.step) return 'done'
  return index === run.step ? 'running' : 'idle'
}

function runMessage(run) {
  if (run.phase === 'idle') return 'Simulated run. Select any stage to see how it works.'
  if (run.phase === 'done') return 'Run complete. Orders generated and dashboards refreshed.'
  if (run.phase === 'failed') return 'Quality check failed. Azure Monitor alert raised, and order generation stays blocked.'
  return `Step ${run.step + 1} of ${RUN_ORDER.length}: ${NODES[RUN_ORDER[run.step]].title}`
}

function NodeDetail({ id }) {
  const node = NODES[id]
  return (
    <div className="grid gap-5 md:grid-cols-[1fr_auto] md:gap-8">
      <div>
        <p className="leading-relaxed text-ink/90">{node.what}</p>
        <ul className="mt-3 space-y-1.5">
          {node.how.map((item) => (
            <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-ink/75">
              <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-gold" />
              {item}
            </li>
          ))}
        </ul>
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {node.tools.map((tool) => (
            <li key={tool} className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 font-mono text-[11px] text-ink/80">
              {tool}
            </li>
          ))}
        </ul>
      </div>
      {node.metric && (
        <div className="md:w-56 md:border-l md:border-white/10 md:pl-8">
          <p className="text-3xl font-semibold tracking-tight text-success">{node.metric.value}</p>
          <p className="mt-1 text-sm text-mist">{node.metric.label}</p>
        </div>
      )}
    </div>
  )
}

function FlowNode({ id, status, selected, onSelect }) {
  const node = NODES[id]
  const { x, y, w, h } = node.box
  const look = STATUS[status]
  const compact = h < 50
  return (
    <g
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`${node.title}, ${node.tag}. ${look.label}.`}
      className="wf-node"
      onClick={() => onSelect(id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(id)
        }
      }}
    >
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="9"
        fill={look.fill}
        stroke={selected ? '#ffffff' : status === 'idle' ? 'rgb(255 255 255 / 0.2)' : look.stroke}
        strokeWidth={selected ? 1.6 : 1}
        strokeDasharray={look.dash}
      />
      <rect x={x} y={y + 10} width="3" height={h - 20} rx="1.5" fill={LANE_COLOR[node.lane]} />
      <circle cx={x + w - 11} cy={y + h - 12} r="3.5" fill={look.dot} />
      <text x={x + 13} y={compact ? y + 18 : y + 24} fontSize="14" fontWeight="600" fill="#eef0f3" fontFamily="var(--font-sans)">
        {node.title}
      </text>
      <text x={x + 13} y={compact ? y + 35 : y + 43} fontSize="11.5" fill="#a3a9b4" fontFamily="var(--font-sans)">
        {node.tag}
      </text>
    </g>
  )
}

function FlowDiagram({ run, selected, onSelect }) {
  return (
    <svg viewBox={FLOW_VIEWBOX} className="h-auto w-full" role="group" aria-label={`Workflow of the ${CLIENT} order generation platform`}>
      <defs>
        <marker id="wf-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" markerUnits="userSpaceOnUse" orient="auto">
          <path d="M0 0L8 4L0 8z" fill="#a3a9b4" />
        </marker>
      </defs>
      {CONTROL_LINKS.map((id) => {
        const { x, w, y } = NODES[id].box
        const cx = x + w / 2
        return <path key={id} d={`M${cx} 44V${y}`} stroke="#c4b5fd" strokeOpacity="0.45" strokeDasharray="3 4" />
      })}
      {EDGES.map((edge) => {
        const [from, to] = edge
        const lit = statusOf(from, run) === 'done' && ['done', 'running'].includes(statusOf(to, run))
        return (
          <path
            key={`${from}-${to}`}
            d={edgePath(edge)}
            fill="none"
            stroke={lit ? '#6ee7a8' : '#ffffff'}
            strokeOpacity={lit ? 0.85 : 0.3}
            strokeWidth={lit ? 1.5 : 1}
            markerEnd="url(#wf-arrow)"
          />
        )
      })}
      {Object.keys(NODES).map((id) => (
        <FlowNode key={id} id={id} status={statusOf(id, run)} selected={selected === id} onSelect={onSelect} />
      ))}
    </svg>
  )
}

function StepList({ title, ids, run, openId, onToggle }) {
  return (
    <div>
      <h3 className="mb-2 font-mono text-[11px] uppercase tracking-wider text-mist">{title}</h3>
      <ol className="divide-y divide-white/10 rounded-xl border border-white/10">
        {ids.map((id) => {
          const node = NODES[id]
          const look = STATUS[statusOf(id, run)]
          const open = openId === id
          return (
            <li key={id}>
              <button
                type="button"
                aria-expanded={open}
                onClick={() => onToggle(id)}
                className="flex min-h-14 w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left"
              >
                <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full" style={{ background: look.dot }} />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold leading-snug">{node.title}</span>
                  <span className="block text-xs text-mist">{node.tag}</span>
                </span>
                <span className="sr-only">{look.label}</span>
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className={`shrink-0 text-mist transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
                  <path d="M2.5 5l4.5 4.5L11.5 5" />
                </svg>
              </button>
              {open && (
                <div className="border-t border-white/5 px-4 pb-5 pt-3">
                  <NodeDetail id={id} />
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

const LEGEND = [
  ['batch', 'Batch'],
  ['gate', 'Quality gate'],
  ['serve', 'Serving'],
  ['operational', 'Operational'],
  ['control', 'Orchestration'],
  ['platform', 'Across the platform'],
]

export default function OrderPlatformWorkflow() {
  const [run, setRun] = useState({ phase: 'idle', step: -1 })
  const [failDq, setFailDq] = useState(false)
  const [selected, setSelected] = useState('adf')
  const [openId, setOpenId] = useState('adf')

  const start = useCallback(() => {
    setRun({ phase: 'running', step: 0 })
    setSelected(RUN_ORDER[0])
  }, [])

  // The diagram costs nothing at rest: this timer only exists during a run someone started.
  useEffect(() => {
    if (run.phase !== 'running') return undefined
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 300 : 1200
    const timer = setTimeout(() => {
      const current = RUN_ORDER[run.step]
      if (failDq && current === 'dq') {
        setRun({ phase: 'failed', step: run.step })
        return
      }
      const next = run.step + 1
      if (next >= RUN_ORDER.length) {
        setRun({ phase: 'done', step: next })
        return
      }
      setRun({ phase: 'running', step: next })
      setSelected(RUN_ORDER[next])
    }, delay)
    return () => clearTimeout(timer)
  }, [run, failDq])

  const running = run.phase === 'running'

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-white/10 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={start}
          disabled={running}
          className="inline-flex min-h-11 cursor-pointer items-center rounded-full bg-gold px-5 text-sm font-semibold text-obsidian transition-colors hover:bg-[#f4d68e] disabled:cursor-default disabled:opacity-60"
        >
          {running ? 'Running...' : run.phase === 'idle' ? 'Run the nightly pipeline' : 'Run again'}
        </button>
        <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm text-ink/85">
          <input
            type="checkbox"
            checked={failDq}
            onChange={(event) => setFailDq(event.target.checked)}
            className="size-4 accent-amber-400"
          />
          Fail a data quality check
        </label>
        <p role="status" className="w-full font-mono text-xs leading-relaxed text-mist lg:ml-auto lg:w-auto">
          {runMessage(run)}
        </p>
      </div>

      {/* Six stages across stay readable only on wide screens. */}
      <div className="hidden xl:block">
        <div className="scroll-thin px-6 pt-6">
          <FlowDiagram run={run} selected={selected} onSelect={setSelected} />
        </div>
        <ul className="flex flex-wrap gap-x-5 gap-y-1 px-6 pt-4 text-xs text-mist" aria-hidden="true">
          {LEGEND.map(([lane, label]) => (
            <li key={lane} className="flex items-center gap-1.5">
              <i className="h-2.5 w-[3px] rounded-sm" style={{ background: LANE_COLOR[lane] }} />
              {label}
            </li>
          ))}
        </ul>
        <div className="mt-5 min-h-52 border-t border-white/10 p-6">
          <h3 className="mb-3 text-xl font-semibold tracking-tight">{NODES[selected].title}</h3>
          <NodeDetail id={selected} />
        </div>
      </div>

      <div className="space-y-5 p-4 sm:p-6 xl:hidden">
        <StepList
          title="Nightly run, in order"
          ids={RUN_ORDER}
          run={run}
          openId={openId}
          onToggle={(id) => setOpenId((current) => (current === id ? null : id))}
        />
        <StepList
          title="Across the platform"
          ids={PLATFORM_NODES}
          run={run}
          openId={openId}
          onToggle={(id) => setOpenId((current) => (current === id ? null : id))}
        />
      </div>
    </div>
  )
}
