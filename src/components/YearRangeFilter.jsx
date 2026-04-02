export default function YearRangeFilter({ years, value, onChange }) {
  if (!years?.length) return null

  const from = value?.from ?? years[0]
  const to = value?.to ?? years[years.length - 1]

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* From Filter */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">From</label>
        <select
          value={from}
          onChange={(e) => {
            const nextFrom = Number(e.target.value)
            const clampedTo = Math.max(to, nextFrom)
            onChange({ from: nextFrom, to: clampedTo })
          }}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm font-semibold text-slate-800 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* To Filter */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">To</label>
        <select
          value={to}
          onChange={(e) => {
            const nextTo = Number(e.target.value)
            const clampedFrom = Math.min(from, nextTo)
            onChange({ from: clampedFrom, to: nextTo })
          }}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm font-semibold text-slate-800 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Reset Button */}
      <button
        type="button"
        className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg bg-white shadow-sm hover:bg-slate-50 transition-colors"
        onClick={() => onChange({ from: years[0], to: years[years.length - 1] })}
      >
        Reset
      </button>
    </div>
  )
}

