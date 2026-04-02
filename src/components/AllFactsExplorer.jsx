import { useEffect, useMemo, useState } from 'react'
import { downloadTextFile, toCsv } from '../utils/csv.js'

function uniqSorted(arr) {
  return Array.from(new Set(arr.filter(Boolean))).sort((a, b) =>
    String(a).localeCompare(String(b)),
  )
}

export default function AllFactsExplorer({ facts, cik }) {
  const [query, setQuery] = useState('')
  const [tag, setTag] = useState('')
  const [unit, setUnit] = useState('')
  const [form, setForm] = useState('')
  const [fp, setFp] = useState('')
  const [pageSize, setPageSize] = useState(50)
  const [page, setPage] = useState(1)

  const tags = useMemo(() => uniqSorted(facts.map((f) => f.tag)), [facts])
  const units = useMemo(() => uniqSorted(facts.map((f) => f.unit)), [facts])
  const forms = useMemo(() => uniqSorted(facts.map((f) => f.form)), [facts])
  const fps = useMemo(() => uniqSorted(facts.map((f) => f.fp)), [facts])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return facts.filter((f) => {
      if (tag && f.tag !== tag) return false
      if (unit && f.unit !== unit) return false
      if (form && f.form !== form) return false
      if (fp && f.fp !== fp) return false
      if (!q) return true
      const hay = `${f.tag} ${f.label} ${f.description} ${f.form} ${f.unit}`.toLowerCase()
      return hay.includes(q)
    })
  }, [facts, query, tag, unit, form, fp])

  useEffect(() => {
    setPage(1)
  }, [query, tag, unit, form, fp, pageSize])

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(page, totalPages)
  const startIdx = (safePage - 1) * pageSize
  const endIdx = Math.min(total, startIdx + pageSize)
  const pageRows = filtered.slice(startIdx, endIdx)

  const canExport = total > 0

  return (
    <div className="flex flex-col gap-6">
      {/* Filters Section */}
      <div className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <div className="grid gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Search</label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tag, label, description…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 shadow-inner outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Tag</label>
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 shadow-inner outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value="">All Tags</option>
              {tags.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Unit</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 shadow-inner outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value="">All Units</option>
              {units.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Form</label>
            <select
              value={form}
              onChange={(e) => setForm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 shadow-inner outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value="">All Forms</option>
              {forms.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Period (FP)</label>
            <select
              value={fp}
              onChange={(e) => setFp(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 shadow-inner outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value="">All</option>
              {fps.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Page size</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 shadow-inner outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            >
              {[25, 50, 100, 200].map((n) => (
                <option key={n} value={n}>
                  {n} per page
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2 lg:pt-0">
          <div className="rounded-lg bg-slate-100 px-3 py-2 text-right text-xs font-medium text-slate-600">
            Showing <span className="font-bold text-slate-900">{total > 0 ? startIdx + 1 : 0}</span>–
            <span className="font-bold text-slate-900">{endIdx}</span> of{' '}
            <span className="font-bold text-slate-900">{total}</span>
          </div>
        </div>
      </div>

      {/* Table Section with Internal Vertical Scroll */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="max-h-[60vh] min-h-[300px] overflow-auto sm:max-h-[70vh]">
          <table className="min-w-full border-separate border-spacing-0">
            <thead className="sticky top-0 z-20">
              <tr className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="sticky left-0 z-30 bg-slate-50 px-6 py-4 shadow-[1px_0_0_0_rgba(0,0,0,0.1)]">Tag</th>
                <th className="px-6 py-4">Label</th>
                <th className="px-6 py-4">Value</th>
                <th className="px-6 py-4 text-center">Unit</th>
                <th className="px-6 py-4 text-center">Form</th>
                <th className="px-6 py-4 text-center">FY</th>
                <th className="px-6 py-4 text-center">FP</th>
                <th className="px-6 py-4 text-center">End</th>
                <th className="px-6 py-4 text-center">Filed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-900">
              {pageRows.map((f, idx) => (
                <tr 
                  key={`${f.tag}-${f.unit}-${f.accn}-${f.end}-${idx}`} 
                  className="group hover:bg-slate-50/80 transition-colors"
                >
                  <td className="sticky left-0 z-10 bg-white px-6 py-4 font-mono text-xs font-medium text-emerald-700 shadow-[1px_0_0_0_rgba(0,0,0,0.1)] group-hover:bg-slate-50">
                    {f.tag}
                  </td>
                  <td className="max-w-xs truncate px-6 py-4 font-medium text-slate-800" title={f.label}>
                    {f.label || '—'}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">
                    {typeof f.val === 'number' ? f.val.toLocaleString() : String(f.val ?? '—')}
                  </td>
                  <td className="px-6 py-4 text-center text-xs font-semibold text-slate-500">{f.unit}</td>
                  <td className="px-6 py-4 text-center text-xs">
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">{f.form || '—'}</span>
                  </td>
                  <td className="px-6 py-4 text-center font-medium text-slate-600">{f.fy ?? '—'}</td>
                  <td className="px-6 py-4 text-center font-medium text-slate-600">{f.fp || '—'}</td>
                  <td className="px-6 py-4 text-center text-xs text-slate-500">{f.end || '—'}</td>
                  <td className="px-6 py-4 text-center text-xs text-slate-500">{f.filed || '—'}</td>
                </tr>
              ))}
              {!pageRows.length && (
                <tr>
                  <td className="px-6 py-12 text-center text-sm text-slate-400" colSpan={9}>
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-3xl">🔍</span>
                      No results for the current filters.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
        <div className="text-sm text-slate-500">
          Page <span className="font-bold text-slate-900">{safePage}</span> of{' '}
          <span className="font-bold text-slate-900">{totalPages}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setPage(1)}
              disabled={safePage <= 1}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-all hover:bg-white hover:text-emerald-600 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-30"
              title="First Page"
            >
              «
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-bold text-slate-700 transition-all hover:bg-white hover:text-emerald-600 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-30"
            >
              ‹ Prev
            </button>
            
            <div className="mx-2 flex items-center px-4 font-mono text-sm font-bold text-emerald-600">
              {safePage}
            </div>

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-bold text-slate-700 transition-all hover:bg-white hover:text-emerald-600 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-30"
            >
              Next ›
            </button>
            <button
              type="button"
              onClick={() => setPage(totalPages)}
              disabled={safePage >= totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-all hover:bg-white hover:text-emerald-600 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-30"
              title="Last Page"
            >
              »
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
