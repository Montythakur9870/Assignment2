import { formatUsdCompact } from '../utils/format.js'

export default function FinancialTable({ rows, metrics }) {
  if (!rows?.length) return null

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
              <th className="sticky left-0 z-10 bg-slate-50 px-6 py-4 shadow-[1px_0_0_0_rgba(0,0,0,0.1)]">Year</th>
              {metrics.map((m) => (
                <th key={m.id} className="px-6 py-4">
                  {m.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-900">
            {rows.map((r) => (
              <tr key={r.year} className="group hover:bg-slate-50/80 transition-colors">
                <td className="sticky left-0 z-10 bg-white px-6 py-4 font-bold text-slate-900 shadow-[1px_0_0_0_rgba(0,0,0,0.1)] group-hover:bg-slate-50">
                  {r.year}
                </td>
                {metrics.map((m) => (
                  <td key={m.id} className="px-6 py-4 font-medium text-slate-700">
                    {formatUsdCompact(r[m.id])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

