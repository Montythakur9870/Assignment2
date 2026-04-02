import { useMemo, useState } from 'react'
import { useFinancialData } from '../app/FinancialDataContext.jsx'
import CompanyPicker from '../components/CompanyPicker.jsx'
import AllFactsExplorer from '../components/AllFactsExplorer.jsx'
import FinancialChart from '../components/FinancialChart.jsx'
import FinancialTable from '../components/FinancialTable.jsx'
import Spinner from '../components/Spinner.jsx'
import YearRangeFilter from '../components/YearRangeFilter.jsx'
import { downloadTextFile, toCsv } from '../utils/csv.js'

export default function HomePage() {
  const {
    popularCiks,
    cikInput,
    setCikInput,
    selectedCik,
    status,
    error,
    entityName,
    metrics,
    availableYears,
    yearRange,
    setYearRange,
    rows,
    fullRows,
    allFacts,
    loadCompany,
  } = useFinancialData()

  const [activeTab, setActiveTab] = useState('key') 
  const canExport = activeTab === 'key' ? (rows?.length && metrics?.length) : (allFacts?.length)

  const handleExportCsv = () => {
    if (activeTab === 'key') {
      const exportRows = (fullRows || []).map((r) => {
        const out = { Year: r.year }
        for (const m of metrics) out[m.label] = r[m.id]
        return out
      })
      const columns = ['Year', ...metrics.map((m) => m.label)]
      const csv = toCsv(exportRows, { columns })
      const filename = `financials_${selectedCik || 'cik'}_all_years.csv`
      downloadTextFile(filename, csv)
    } else {
      const columns = [
        'tag',
        'label',
        'unit',
        'val',
        'fy',
        'fp',
        'form',
        'frame',
        'start',
        'end',
        'filed',
        'accn',
      ]
      const csv = toCsv(allFacts, { columns })
      const filename = `raw_facts_${selectedCik || 'cik'}.csv`
      downloadTextFile(filename, csv)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">
              Financial Data Explorer
            </h1>
            <p className="truncate text-xs sm:text-sm text-slate-500">
              SEC EDGAR Facts • CIK {selectedCik || '—'}
              {entityName ? ` • ${entityName}` : ''}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 space-y-6">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <CompanyPicker
            popularCiks={popularCiks}
            cikInput={cikInput}
            selectedCik={selectedCik}
            onCikInputChange={setCikInput}
            onSubmit={loadCompany}
            isLoading={status === 'loading'}
          />
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-800">
                {activeTab === 'key' ? 'Key Financial Overview' : 'Detailed Fact Explorer'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 italic">
                {activeTab === 'key'
                  ? 'Showing core metrics from annual filings (10-K / 20-F).'
                  : 'Browsing through raw us-gaap datapoints from the SEC payload.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('key')}
                  className={`px-4 py-1.5 text-xs font-bold transition-all rounded-md ${
                    activeTab === 'key'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Summary
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-1.5 text-xs font-bold transition-all rounded-md ${
                    activeTab === 'all'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Raw Data
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {activeTab === 'key' && (
                  <YearRangeFilter
                    years={availableYears}
                    value={yearRange}
                    onChange={setYearRange}
                  />
                )}
                
                <button
                  type="button"
                  disabled={!canExport}
                  onClick={handleExportCsv}
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                >
                  CSV Export
                </button>
              </div>
            </div>
          </div>

          <div className="min-h-[200px]">
            {status === 'loading' && (
              <div className="py-12">
                <Spinner label="Loading company financials..." />
              </div>
            )}

            {status === 'error' && (
              <div className="rounded-lg border-l-4 border-rose-500 bg-rose-50 p-4">
                <div className="flex items-center gap-2 text-rose-800 font-bold mb-1">
                  <span>⚠️</span> API Error
                </div>
                <div className="text-sm text-rose-700">{error}</div>
              </div>
            )}

            {status === 'success' && (
              <>
                {activeTab === 'key' && (
                  <div className="space-y-6">
                    {!metrics.length ? (
                      <p className="text-center py-10 text-slate-400">Data not found for this company.</p>
                    ) : rows.length === 0 ? (
                      <p className="text-center py-10 text-slate-400">No annual reports in this time window.</p>
                    ) : (
                      <div className="animate-in fade-in duration-500">
                        <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                          <FinancialChart rows={rows} metrics={metrics} />
                        </div>
                        <FinancialTable rows={rows} metrics={metrics} />
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'all' && (
                  <div className="animate-in slide-in-from-bottom-2 duration-300">
                    <AllFactsExplorer facts={allFacts} cik={selectedCik} />
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
