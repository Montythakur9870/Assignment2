import { describe, expect, test } from 'vitest'
import { toCsv } from './csv.js'

describe('toCsv', () => {
  test('renders header + rows and escapes commas/quotes/newlines', () => {
    const csv = toCsv(
      [
        { Year: 2024, Revenue: 123, Note: 'plain' },
        { Year: 2025, Revenue: 456, Note: 'a,b' },
        { Year: 2026, Revenue: 789, Note: 'quote " here' },
        { Year: 2027, Revenue: 101, Note: 'line\nbreak' },
      ],
      { columns: ['Year', 'Revenue', 'Note'] },
    )

    expect(csv.split('\n')[0]).toBe('Year,Revenue,Note')
    expect(csv).toContain('2024,123,plain')
    expect(csv).toContain('2025,456,"a,b"')
    expect(csv).toContain('2026,789,"quote "" here"')
    expect(csv).toContain('2027,101,"line\nbreak"')
  })
})

