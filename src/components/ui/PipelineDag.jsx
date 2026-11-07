import { useEffect, useRef } from 'react'

const COLUMNS = [
  { label: 'Source', nodes: [['orders', 'Order systems'], ['sqlserver', 'SQL Server'], ['teradata', 'Teradata']] },
  { label: 'Ingest', nodes: [['glue', 'AWS Glue'], ['adf', 'Data Factory']] },
  { label: 'Lake', nodes: [['s3', 'S3'], ['lake', 'Data Lake']] },
  { label: 'Transform', nodes: [['databricks', 'Databricks / PySpark']] },
  { label: 'Warehouse', nodes: [['redshift', 'Redshift'], ['synapse', 'Synapse']] },
  { label: 'Serve', nodes: [['powerbi', 'Power BI']] },
]

const EDGES = [
  ['orders', 'glue'],
  ['sqlserver', 'adf'],
  ['teradata', 'adf'],
  ['glue', 's3'],
  ['adf', 'lake'],
  ['s3', 'databricks'],
  ['lake', 'databricks'],
  ['databricks', 'redshift'],
  ['databricks', 'synapse'],
  ['redshift', 'powerbi'],
  ['synapse', 'powerbi'],
]

// Left-to-right, like the Airflow graph view.
function wideLayout() {
  const width = 150
  const height = 44
  const nodes = {}
  COLUMNS.forEach((column, c) => {
    column.nodes.forEach(([id, label], r) => {
      const center = 150 + (r - (column.nodes.length - 1) / 2) * 84
      nodes[id] = { label, c, x: c * 206, y: center - height / 2, width, height }
    })
  })
  const edge = (a, b) => {
    const x1 = a.x + a.width
    const y1 = a.y + a.height / 2
    const x2 = b.x
    const y2 = b.y + b.height / 2
    const mid = (x1 + x2) / 2
    return `M${x1} ${y1}C${mid} ${y1} ${mid} ${y2} ${x2} ${y2}`
  }
  const headers = COLUMNS.map((column, c) => ({ label: column.label, x: c * 206, y: 18 }))
  return { viewBox: '0 0 1180 268', nodes, edge, headers, fontSize: 13, statusGap: 13 }
}

// Top-to-bottom for phones and tablets, where six columns cannot stay readable.
function tallLayout() {
  const height = 42
  const nodes = {}
  COLUMNS.forEach((column, c) => {
    const count = column.nodes.length
    const width = count === 1 ? 180 : count === 2 ? 136 : 102
    const gap = 7
    const total = count * width + (count - 1) * gap
    column.nodes.forEach(([id, label], r) => {
      nodes[id] = { label, c, x: (320 - total) / 2 + r * (width + gap), y: 24 + c * 88, width, height }
    })
  })
  const edge = (a, b) => {
    const x1 = a.x + a.width / 2
    const y1 = a.y + a.height
    const x2 = b.x + b.width / 2
    const y2 = b.y
    const mid = (y1 + y2) / 2
    return `M${x1} ${y1}C${x1} ${mid} ${x2} ${mid} ${x2} ${y2}`
  }
  const headers = COLUMNS.map((column, c) => ({ label: column.label, x: 0, y: 16 + c * 88 }))
  return { viewBox: '0 0 320 512', nodes, edge, headers, fontSize: 12, statusGap: 9 }
}

const CYCLE = 8

function DagSvg({ layout, className }) {
  const ref = useRef(null)

  // SMIL keeps the animation free of JavaScript. It only needs pausing while out of view.
  useEffect(() => {
    const svg = ref.current
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      svg.pauseAnimations()
      return undefined
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) svg.unpauseAnimations()
      else svg.pauseAnimations()
    })
    observer.observe(svg)
    return () => observer.disconnect()
  }, [])

  const { viewBox, nodes, edge, headers, fontSize, statusGap } = layout

  return (
    <svg ref={ref} viewBox={viewBox} className={className} role="img" aria-label="Pipeline graph from source systems through ingestion, lake, transformation and warehouse to Power BI">
      {headers.map((header) => (
        <text key={header.label} x={header.x} y={header.y} fontSize="11" letterSpacing="1.5" fill="#a3a9b4" fontFamily="var(--font-mono)">
          {header.label.toUpperCase()}
        </text>
      ))}

      {EDGES.map(([from, to]) => (
        <path key={`${from}-${to}`} d={edge(nodes[from], nodes[to])} fill="none" stroke="#ffffff" strokeOpacity="0.2" />
      ))}

      <g className="dag-motion">
        {EDGES.map(([from, to], i) => (
          <circle key={`${from}-${to}`} r="3" fill="#e8c26a">
            <animateMotion dur="3.2s" begin={`${-(i * 0.47).toFixed(2)}s`} repeatCount="indefinite" path={edge(nodes[from], nodes[to])} />
          </circle>
        ))}
      </g>

      {Object.entries(nodes).map(([id, node]) => (
        <g key={id}>
          <rect x={node.x} y={node.y} width={node.width} height={node.height} rx="8" fill="#12151b" stroke="#ffffff" strokeOpacity="0.18" />
          <circle cx={node.x + statusGap} cy={node.y + node.height / 2} r="4" fill="#6ee7a8">
            {/* Each column runs after the one before it: queued, running, success. */}
            <animate
              attributeName="fill"
              values="#4a505c;#e8c26a;#6ee7a8;#6ee7a8;#4a505c"
              keyTimes="0;0.2;0.3;0.92;1"
              dur={`${CYCLE}s`}
              begin={`${(node.c * 0.8 - CYCLE).toFixed(1)}s`}
              repeatCount="indefinite"
            />
          </circle>
          <text x={node.x + statusGap + 8} y={node.y + node.height / 2 + fontSize * 0.34} fontSize={fontSize} fill="#eef0f3" fontFamily="var(--font-sans)">
            {node.label}
          </text>
        </g>
      ))}
    </svg>
  )
}

const WIDE = wideLayout()
const TALL = tallLayout()

export default function PipelineDag() {
  return (
    <figure className="card overflow-hidden">
      <figcaption className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b border-white/10 px-4 py-3 font-mono text-[11px] text-mist sm:px-6">
        <span>
          <span className="text-white/50">dag_id</span> data_platform
        </span>
        <span className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-gold" />running</span>
          <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-success" />success</span>
        </span>
      </figcaption>
      <div className="px-3 py-5 sm:px-6 sm:py-6">
        <DagSvg layout={WIDE} className="hidden h-auto w-full lg:block" />
        <DagSvg layout={TALL} className="mx-auto h-auto w-full max-w-md lg:hidden" />
      </div>
    </figure>
  )
}
