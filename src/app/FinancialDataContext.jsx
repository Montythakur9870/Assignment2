import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { fetchCompanyFacts } from '../api/secEdgar.js'
import { extractKeyFinancialSeries, flattenUsGaapFacts } from '../utils/companyFacts.js'
import { normalizeCik } from '../utils/cik.js'

const FinancialDataContext = createContext(null)

const DEFAULT_CIKS = [
  { label: 'Apple', cik: '0000320193' },
  { label: 'Microsoft', cik: '0000789019' },
  { label: 'Amazon', cik: '0001018724' },
  { label: 'Alphabet (Google)', cik: '0001652044' },
  { label: 'Tesla', cik: '0001318605' },
]

export function FinancialDataProvider({ children }) {
  const [cikInput, setCikInput] = useState(DEFAULT_CIKS[0].cik)
  const [selectedCik, setSelectedCik] = useState(DEFAULT_CIKS[0].cik)
  const [status, setStatus] = useState('idle') 
  const [error, setError] = useState('')
  const [companyFacts, setCompanyFacts] = useState(null)
  const [yearRange, setYearRange] = useState({ from: null, to: null })

  const abortRef = useRef(null)

  const loadCompany = useCallback(async (rawCik) => {
    const cik = normalizeCik(rawCik)
    if (!cik) return

    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setStatus('loading')
    setError('')

    try {
      const data = await fetchCompanyFacts(cik, { signal: controller.signal })
      setCompanyFacts(data)
      setSelectedCik(cik)
      setStatus('success')
    } catch (e) {
      if (e?.name === 'AbortError') return
      setCompanyFacts(null)
      setStatus('error')
      setError(e?.message || 'Something went wrong while fetching SEC data.')
    }
  }, [])

  useEffect(() => {
    loadCompany(selectedCik)
    return () => abortRef.current?.abort()
  }, []) 

  const extracted = useMemo(() => {
    if (!companyFacts) return null
    return extractKeyFinancialSeries(companyFacts)
  }, [companyFacts])

  const allFacts = useMemo(() => {
    if (!companyFacts) return []
    return flattenUsGaapFacts(companyFacts)
  }, [companyFacts])

  const availableYears = extracted?.years || []

  const effectiveRange = useMemo(() => {
    if (!availableYears.length) return { from: null, to: null }
    const min = availableYears[0]
    const max = availableYears[availableYears.length - 1]
    return {
      from: yearRange.from ?? min,
      to: yearRange.to ?? max,
    }
  }, [availableYears, yearRange.from, yearRange.to])

  const filteredRows = useMemo(() => {
    const rows = extracted?.rows || []
    const { from, to } = effectiveRange
    if (!from || !to) return rows
    return rows.filter((r) => r.year >= from && r.year <= to)
  }, [extracted, effectiveRange])

  const value = useMemo(
    () => ({
      popularCiks: DEFAULT_CIKS,
      cikInput,
      setCikInput,
      selectedCik,
      status,
      error,
      entityName: extracted?.entityName || '',
      metrics: extracted?.metrics || [],
      availableYears,
      yearRange: effectiveRange,
      setYearRange,
      rows: filteredRows,
      fullRows: extracted?.rows || [],
      allFacts,
      loadCompany,
    }),
    [
      cikInput,
      selectedCik,
      status,
      error,
      extracted,
      availableYears,
      effectiveRange,
      filteredRows,
      allFacts,
      loadCompany,
    ],
  )

  return (
    <FinancialDataContext.Provider value={value}>
      {children}
    </FinancialDataContext.Provider>
  )
}

export function useFinancialData() {
  const ctx = useContext(FinancialDataContext)
  if (!ctx) throw new Error('useFinancialData must be used within FinancialDataProvider')
  return ctx
}

