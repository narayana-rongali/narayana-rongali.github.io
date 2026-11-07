import { useCallback, useMemo, useRef, useState } from 'react'
import { presetQueries, warehouse } from '../../data/resume'
import { executeSql, SQL_KEYWORDS } from '../../lib/miniSql'

function highlight(sql) {
  const tokens = sql.split(/('[^']*'?|\b\w+\b)/g)
  return tokens.map((token, i) => {
    if (token.startsWith("'")) return <span key={i} className="text-success">{token}</span>
    if (SQL_KEYWORDS.has(token.toLowerCase())) return <span key={i} className="text-gold">{token}</span>
    if (/^\d+$/.test(token)) return <span key={i} className="text-sky-300">{token}</span>
    return <span key={i}>{token}</span>
  })
}

function formatCell(value) {
  if (value === null || value === undefined) return <span className="text-white/40">NULL</span>
  if (typeof value === 'boolean') return String(value)
  return value
}

// Ligatures off, so the highlighted layer and the transparent textarea stay aligned.
const EDITOR_TEXT =
  'font-mono text-[13px] leading-6 sm:text-sm sm:leading-6 p-4 whitespace-pre-wrap break-words [font-variant-ligatures:none]'

const initialSql = presetQueries[0].sql
// Timing is left out of the first result so the prerendered HTML matches on hydration.
const initialResult = { ...executeSql(initialSql, warehouse), elapsedMs: null }

export default function QueryConsole() {
  const [sql, setSql] = useState(initialSql)
  const [result, setResult] = useState(initialResult)
  const backdrop = useRef(null)

  const run = useCallback((text) => setResult(executeSql(text, warehouse)), [])
  const highlighted = useMemo(() => highlight(sql), [sql])

  const rowLabel = result.ok ? `${result.rows.length} ${result.rows.length === 1 ? 'row' : 'rows'}` : ''

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-4 py-3">
        <span className="mr-1 font-mono text-[11px] uppercase tracking-widest text-mist">Try</span>
        {presetQueries.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => {
              setSql(preset.sql)
              run(preset.sql)
            }}
            className={`min-h-9 cursor-pointer rounded-full border px-3 text-xs transition-colors ${
              sql === preset.sql
                ? 'border-gold/60 bg-gold/10 text-gold'
                : 'border-white/10 text-ink/85 hover:border-amber-500/50'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="relative bg-black/30">
        <pre
          ref={backdrop}
          aria-hidden="true"
          className={`${EDITOR_TEXT} pointer-events-none absolute inset-0 m-0 overflow-hidden text-ink/90`}
        >
          {highlighted}
          {'\n'}
        </pre>
        <textarea
          aria-label="SQL query"
          spellCheck="false"
          autoCapitalize="off"
          autoCorrect="off"
          rows={Math.max(4, sql.split('\n').length)}
          value={sql}
          onChange={(event) => setSql(event.target.value)}
          onScroll={(event) => {
            if (backdrop.current) backdrop.current.scrollTop = event.target.scrollTop
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
              event.preventDefault()
              run(sql)
            }
          }}
          className={`sql-input ${EDITOR_TEXT} relative block w-full bg-transparent`}
        />
      </div>

      <div className="flex items-center justify-between gap-4 border-y border-white/10 px-4 py-2.5">
        <p className="font-mono text-[11px] text-mist" role="status">
          {result.ok
            ? result.elapsedMs === null
              ? rowLabel
              : `${rowLabel} in ${result.elapsedMs.toFixed(2)} ms`
            : 'Query failed'}
        </p>
        <button
          type="button"
          onClick={() => run(sql)}
          className="min-h-9 cursor-pointer rounded-full bg-gold px-4 text-xs font-semibold text-obsidian transition-colors hover:bg-[#f4d68e]"
        >
          Run query <span className="ml-1 hidden font-mono font-normal opacity-60 sm:inline">Ctrl+Enter</span>
        </button>
      </div>

      <div className="scroll-thin max-h-96 min-h-32 overflow-auto" tabIndex={0} aria-label="Query results">
        {result.ok ? (
          <table className="w-full border-collapse text-left text-[13px]">
            <thead>
              <tr>
                {result.columns.map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className="sticky top-0 whitespace-nowrap border-b border-white/10 bg-panel px-4 py-2.5 font-mono text-[11px] font-medium uppercase tracking-wider text-gold"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row, i) => (
                <tr key={i} className="border-b border-white/5 last:border-0">
                  {result.columns.map((column) => (
                    <td key={column} className="min-w-40 max-w-md px-4 py-2.5 align-top leading-relaxed text-ink/90">
                      {formatCell(row[column])}
                    </td>
                  ))}
                </tr>
              ))}
              {result.rows.length === 0 && (
                <tr>
                  <td colSpan={result.columns.length} className="px-4 py-6 text-mist">
                    No rows matched.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <p className="px-4 py-5 font-mono text-[13px] leading-6 text-red-300">{result.message}</p>
        )}
      </div>
    </div>
  )
}
