import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { formatUsdCompact } from '../utils/format.js'

export default function FinancialChart({ rows, metrics }) {
  if (!rows?.length) return null

  const colors = ['#0f172a', '#2563eb', '#16a34a', '#7c3aed']

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 10, right: 12, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="year" tick={{ fontSize: 12 }} />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(v) => formatUsdCompact(v)}
            width={86}
          />
          <Tooltip
            formatter={(value) => formatUsdCompact(value)}
            labelFormatter={(label) => `Year: ${label}`}
          />
          <Legend />
          {metrics.map((m, idx) => (
            <Bar
              key={m.id}
              dataKey={m.id}
              name={m.label}
              fill={colors[idx % colors.length]}
              radius={[6, 6, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

