export function toCsv(rows, { columns } = {}) {
  const safeRows = Array.isArray(rows) ? rows : []
  const cols =
    columns && columns.length
      ? columns
      : inferColumnsFromRows(safeRows)

  const header = cols.map(escapeCsvCell).join(',')
  const lines = safeRows.map((row) =>
    cols.map((key) => escapeCsvCell(row?.[key])).join(','),
  )

  // Use \r\n for better Windows/Excel support
  return [header, ...lines].join('\r\n')
}

export function downloadTextFile(filename, text) {
  // Adding BOM (\uFEFF) so Excel realizes it's UTF-8
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + text], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function inferColumnsFromRows(rows) {
  const set = new Set()
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue
    for (const key of Object.keys(row)) set.add(key)
  }
  return Array.from(set)
}

function escapeCsvCell(value) {
  if (value === null || value === undefined) return ''
  // Convert numbers or booleans to string
  const s = String(value)
  // If the cell contains commas, quotes, or newlines, escape it with quotes
  if (/[",\n\r]/.test(s)) {
    return `"${s.replaceAll('"', '""')}"`
  }
  return s
}

