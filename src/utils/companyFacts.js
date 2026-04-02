const DEFAULT_METRICS = [
  {
    id: 'revenue',
    label: 'Revenue',
    gaapTags: ['Revenues', 'SalesRevenueNet'],
  },
  {
    id: 'assets',
    label: 'Assets',
    gaapTags: ['Assets'],
  },
]

export function extractKeyFinancialSeries(companyFacts, { metrics } = {}) {
  const safeFacts = companyFacts?.facts?.['us-gaap'] || {}
  const pickedMetrics = metrics?.length ? metrics : DEFAULT_METRICS

  const seriesByMetric = {}
  for (const metric of pickedMetrics) {
    const tag = metric.gaapTags.find((t) => safeFacts[t])
    if (!tag) continue
    const unitMap = safeFacts[tag]?.units || {}
    const unitKey = pickUnitKey(unitMap)
    const points = Array.isArray(unitMap[unitKey]) ? unitMap[unitKey] : []
    seriesByMetric[metric.id] = toAnnualSeries(points)
  }

  const allYears = new Set()
  Object.values(seriesByMetric).forEach((arr) =>
    arr.forEach((p) => allYears.add(p.year)),
  )

  const years = Array.from(allYears).sort((a, b) => a - b)
  const rows = years.map((year) => {
    const row = { year }
    for (const metric of pickedMetrics) {
      row[metric.id] = seriesByMetric[metric.id]?.find((p) => p.year === year)
        ?.value
    }
    return row
  })

  return {
    entityName: companyFacts?.entityName || '',
    cik: String(companyFacts?.cik || ''),
    metrics: pickedMetrics.filter((m) => seriesByMetric[m.id]),
    years,
    rows,
  }
}

export function flattenUsGaapFacts(companyFacts) {
  const gaap = companyFacts?.facts?.['us-gaap'] || {}
  const out = []

  for (const [tag, fact] of Object.entries(gaap)) {
    const units = fact?.units || {}
    for (const [unit, points] of Object.entries(units)) {
      if (!Array.isArray(points)) continue
      for (const p of points) {
        if (!p) continue
        out.push({
          tag,
          label: fact?.label || '',
          description: fact?.description || '',
          unit,
          val: p.val,
          fy: p.fy ?? null,
          fp: p.fp || '',
          form: p.form || '',
          frame: p.frame || '',
          start: p.start || '',
          end: p.end || '',
          filed: p.filed || '',
          accn: p.accn || '',
        })
      }
    }
  }

  out.sort((a, b) => {
    const filedA = a.filed || ''
    const filedB = b.filed || ''
    if (filedA !== filedB) return filedB.localeCompare(filedA)
    const tagA = a.tag || ''
    const tagB = b.tag || ''
    return tagA.localeCompare(tagB)
  })

  return out
}

function pickUnitKey(unitMap) {
  if (unitMap.USD) return 'USD'
  const keys = Object.keys(unitMap)
  return keys[0] || 'USD'
}

function toAnnualSeries(points) {
  const filtered = points
    .filter((p) => p && (p.fp === 'FY' || p.fp === 'CY'))
    .filter((p) => isAnnualForm(p.form))
    .filter((p) => Number.isFinite(Number(p.val)))
    .map((p) => ({
      year: Number(p.fy) || yearFromEnd(p.end),
      value: Number(p.val),
      filed: p.filed || '',
      end: p.end || '',
      form: p.form || '',
    }))
    .filter((p) => Number.isFinite(p.year))

  const bestByYear = new Map()
  for (const p of filtered) {
    const prev = bestByYear.get(p.year)
    if (!prev) {
      bestByYear.set(p.year, p)
      continue
    }
    if ((p.filed || '') > (prev.filed || '')) bestByYear.set(p.year, p)
  }

  return Array.from(bestByYear.values()).sort((a, b) => a.year - b.year)
}

function isAnnualForm(form) {
  if (!form) return false
  return form === '10-K' || form === '20-F' || form === '40-F'
}

function yearFromEnd(end) {
  if (!end) return NaN
  const y = Number(String(end).slice(0, 4))
  return Number.isFinite(y) ? y : NaN
}

