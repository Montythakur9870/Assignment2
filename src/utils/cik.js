export function normalizeCik(input) {
  const digits = String(input ?? '')
    .trim()
    .replace(/[^\d]/g, '')

  if (!digits) return ''
  if (digits.length > 10) return digits.slice(-10)
  return digits.padStart(10, '0')
}

