import { useMemo } from 'react'
import { normalizeCik } from '../utils/cik.js'

export default function CompanyPicker({
  popularCiks,
  cikInput,
  selectedCik, // Added this prop
  onCikInputChange,
  onSubmit,
  isLoading,
}) {
  const normalized = useMemo(() => normalizeCik(cikInput), [cikInput])

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(normalized)
      }}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        {/* CIK Input */}
        <div className="flex-1 space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Company CIK</label>
          <input
            value={cikInput}
            onChange={(e) => onCikInputChange(e.target.value)}
            inputMode="numeric"
            placeholder="e.g. 0000320193"
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300"
          />
        </div>
        
        <div className="flex-1 space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Quick Select</label>
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all cursor-pointer"
            value={popularCiks.some(c => c.cik === selectedCik) ? selectedCik : ""}
            onChange={(e) => {
              const cik = e.target.value
              if (!cik) return
              onCikInputChange(cik)
              onSubmit(cik)
            }}
          >
            <option value="">Choose from popular…</option>
            {popularCiks.map((c) => (
              <option key={c.cik} value={c.cik}>
                {c.label} ({c.cik})
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={!normalized || isLoading}
          className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-2 rounded-lg text-sm font-bold shadow-lg transition-all active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:scale-100 disabled:cursor-not-allowed h-[38px] md:mb-0"
        >
          {isLoading ? 'Loading…' : 'Explore'}
        </button>
      </div>

      <p className="text-[10px] text-slate-400 font-medium">
        SEC requests a real contact in <span className="bg-slate-100 px-1 rounded font-mono">VITE_SEC_USER_AGENT</span> for API usage.
      </p>
    </form>
  )
}

