export function formatUsdCompact(value) {
  const num = Number(value)
  if (!Number.isFinite(num)) return '—'

  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(num)
}

