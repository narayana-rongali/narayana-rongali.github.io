// A small read-only SQL engine for the resume warehouse.
// Supports SELECT, WHERE (AND), COUNT(*), GROUP BY, ORDER BY, LIMIT, SHOW TABLES and DESCRIBE.

const WRITE_VERBS = /^\s*(drop|delete|update|insert|truncate|alter|create|grant|merge)\b/i

export const SQL_KEYWORDS = new Set([
  'select', 'from', 'where', 'and', 'group', 'by', 'order', 'limit', 'asc', 'desc', 'as',
  'like', 'show', 'tables', 'describe', 'count', 'is', 'null', 'not',
])

class SqlError extends Error {}

function stripTrailing(sql) {
  return sql.trim().replace(/;\s*$/, '').trim()
}

function parseLiteral(raw) {
  const value = raw.trim()
  const quoted = value.match(/^'(.*)'$/s) || value.match(/^"(.*)"$/s)
  if (quoted) return quoted[1]
  if (/^null$/i.test(value)) return null
  if (/^true$/i.test(value)) return true
  if (/^false$/i.test(value)) return false
  if (value !== '' && !Number.isNaN(Number(value))) return Number(value)
  throw new SqlError(`Could not read value ${value}. Text values need single quotes.`)
}

function parseCondition(text) {
  const nullCheck = text.match(/^\s*(\w+)\s+is\s+(not\s+)?null\s*$/i)
  if (nullCheck) {
    const negate = Boolean(nullCheck[2])
    return { column: nullCheck[1], test: (v) => (v === null || v === undefined) !== negate }
  }
  const match = text.match(/^\s*(\w+)\s*(<=|>=|!=|<>|=|<|>|\blike\b)\s*(.+?)\s*$/i)
  if (!match) throw new SqlError(`Could not parse condition: ${text.trim()}`)
  const [, column, op, rawValue] = match
  const value = parseLiteral(rawValue)
  const operator = op.toLowerCase()

  if (operator === 'like') {
    const pattern = String(value)
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/%/g, '.*')
      .replace(/_/g, '.')
    const regex = new RegExp(`^${pattern}$`, 'is')
    return { column, test: (v) => v != null && regex.test(String(v)) }
  }

  const normalise = (v) => (typeof v === 'string' ? v.toLowerCase() : v)
  const right = normalise(value)
  const tests = {
    '=': (l) => l === right,
    '!=': (l) => l !== right,
    '<>': (l) => l !== right,
    '<': (l) => l != null && l < right,
    '>': (l) => l != null && l > right,
    '<=': (l) => l != null && l <= right,
    '>=': (l) => l != null && l >= right,
  }
  return { column, test: (v) => tests[operator](normalise(v)) }
}

// Splits on AND outside of quotes.
function splitConditions(text) {
  const parts = []
  let current = ''
  let quote = null
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quote) {
      if (ch === quote) quote = null
      current += ch
      continue
    }
    if (ch === "'" || ch === '"') {
      quote = ch
      current += ch
      continue
    }
    if (/^and\b/i.test(text.slice(i)) && /\s/.test(text[i - 1] || ' ')) {
      parts.push(current)
      current = ''
      i += 2
      continue
    }
    current += ch
  }
  if (quote) throw new SqlError('Unterminated string in WHERE clause.')
  parts.push(current)
  return parts
}

function parseSelectList(text) {
  return text.split(',').map((part) => {
    const match = part.trim().match(/^(.+?)(?:\s+as\s+(\w+))?$/i)
    const expr = match[1].trim()
    const alias = match[2]
    if (/^count\s*\(\s*\*\s*\)$/i.test(expr)) return { count: true, name: alias || 'count' }
    if (expr === '*') return { star: true }
    if (!/^\w+$/.test(expr)) throw new SqlError(`Unsupported expression: ${expr}`)
    return { column: expr, name: alias || expr }
  })
}

function assertColumn(rows, column, tableName) {
  if (rows.length && !(column in rows[0])) {
    const known = Object.keys(rows[0]).join(', ')
    throw new SqlError(`Column "${column}" does not exist on ${tableName}. Columns: ${known}.`)
  }
}

function compareValues(a, b) {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b))
}

function runQuery(input, tables) {
  const sql = stripTrailing(input)
  if (!sql) throw new SqlError('Type a query, or pick one of the presets.')

  if (WRITE_VERBS.test(sql)) {
    throw new SqlError('Permission denied. This warehouse is read-only, and the IAM roles are tight.')
  }
  if (/^show\s+tables$/i.test(sql)) {
    return {
      columns: ['table_name', 'row_count'],
      rows: Object.entries(tables).map(([table_name, rows]) => ({ table_name, row_count: rows.length })),
    }
  }
  const describe = sql.match(/^(?:describe|desc)\s+(\w+)$/i)
  if (describe) {
    const rows = tables[describe[1].toLowerCase()]
    if (!rows) throw new SqlError(`Table "${describe[1]}" does not exist. Try SHOW TABLES.`)
    return {
      columns: ['column', 'type'],
      rows: Object.keys(rows[0]).map((column) => ({
        column,
        type: typeof (rows.find((r) => r[column] != null) || {})[column],
      })),
    }
  }

  const match = sql.match(
    /^select\s+(.+?)\s+from\s+(\w+)(?:\s+where\s+(.+?))?(?:\s+group\s+by\s+(\w+))?(?:\s+order\s+by\s+(\w+)(?:\s+(asc|desc))?)?(?:\s+limit\s+(\d+))?$/is,
  )
  if (!match) throw new SqlError('Syntax error. Expected SELECT ... FROM ... [WHERE] [GROUP BY] [ORDER BY] [LIMIT].')

  const [, selectText, tableRaw, whereText, groupBy, orderBy, orderDir, limit] = match
  const tableName = tableRaw.toLowerCase()
  const source = tables[tableName]
  if (!source) throw new SqlError(`Table "${tableRaw}" does not exist. Try SHOW TABLES.`)

  let rows = [...source]
  if (whereText) {
    const conditions = splitConditions(whereText).map(parseCondition)
    conditions.forEach((c) => assertColumn(source, c.column, tableName))
    rows = rows.filter((row) => conditions.every((c) => c.test(row[c.column])))
  }

  const select = parseSelectList(selectText)
  const hasCount = select.some((s) => s.count)
  let columns
  let output

  if (hasCount || groupBy) {
    if (select.some((s) => s.star)) throw new SqlError('SELECT * cannot be combined with an aggregate.')
    if (groupBy) assertColumn(source, groupBy, tableName)
    const groups = new Map()
    rows.forEach((row) => {
      const key = groupBy ? row[groupBy] : '__all__'
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push(row)
    })
    if (!groupBy && groups.size === 0) groups.set('__all__', [])

    select.forEach((s) => {
      if (s.column && s.column !== groupBy) {
        throw new SqlError(`Column "${s.column}" must appear in GROUP BY or be inside COUNT(*).`)
      }
    })
    columns = select.map((s) => s.name)
    output = [...groups.entries()].map(([key, members]) => {
      const row = {}
      select.forEach((s) => {
        row[s.name] = s.count ? members.length : key
      })
      return row
    })
  } else {
    columns = select.flatMap((s) => (s.star ? Object.keys(source[0]) : [s.name]))
    select.forEach((s) => s.column && assertColumn(source, s.column, tableName))
    // Project after sorting so ORDER BY can reach columns outside the select list.
    output = rows.map((row) => {
      const projected = { __source: row }
      select.forEach((s) => {
        if (s.star) Object.assign(projected, row)
        else projected[s.name] = row[s.column]
      })
      return projected
    })
  }

  if (orderBy) {
    const direction = orderDir?.toLowerCase() === 'desc' ? -1 : 1
    const known = columns.includes(orderBy) || (source[0] && orderBy in source[0])
    if (!known) throw new SqlError(`Cannot order by "${orderBy}": no such column.`)
    const read = (row) => (orderBy in row ? row[orderBy] : row.__source?.[orderBy])
    output = [...output].sort((a, b) => direction * compareValues(read(a), read(b)))
  }
  if (limit !== undefined) output = output.slice(0, Number(limit))

  return { columns, rows: output }
}

export function executeSql(input, tables) {
  const startedAt = performance.now()
  try {
    const { columns, rows } = runQuery(input, tables)
    return { ok: true, columns, rows, elapsedMs: performance.now() - startedAt }
  } catch (error) {
    if (error instanceof SqlError) return { ok: false, message: error.message }
    throw error
  }
}
