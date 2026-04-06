

## Full Project Structure (Start to End)

Neeche complete flow diya hai: app start hone se lekar graph render hone tak, aur kaunsi file kis file se connected hai.

### 1) Project File Map (with purpose)

```text
Assignment2/
	index.html                      -> root HTML shell, loads src/main.jsx
	package.json                    -> scripts + dependencies
	vite.config.js                  -> dev proxy (/sec -> data.sec.gov) + plugins
	vercel.json                     -> production rewrite for /sec/*
	tailwind.config.js              -> Tailwind content paths
	postcss.config.js               -> Tailwind + autoprefixer pipeline
	eslint.config.js                -> lint rules
	.env.example                    -> VITE_SEC_USER_AGENT example
	public/
		favicon.svg                   -> app favicon
		icons.svg                     -> static icon asset
	src/
		main.jsx                      -> React bootstrap + Provider wrapping
		App.jsx                       -> routing layer
		index.css                     -> global CSS + Tailwind import
		App.css                       -> old starter styles (currently not imported)
		api/
			secEdgar.js                 -> SEC companyfacts fetch function
		app/
			FinancialDataContext.jsx    -> global state + fetch + derived data + year filtering
		pages/
			HomePage.jsx                -> main page orchestration
		components/
			CompanyPicker.jsx           -> CIK input + quick select + submit
			YearRangeFilter.jsx         -> from/to year controls
			FinancialChart.jsx          -> Recharts bar chart
			FinancialTable.jsx          -> yearly summary table
			AllFactsExplorer.jsx        -> raw facts filters + table + pagination
			Spinner.jsx                 -> loading UI
		utils/
			cik.js                      -> CIK normalization rules
			companyFacts.js             -> metric extraction + annual filtering + flattening
			format.js                   -> compact USD formatter
			csv.js                      -> CSV creation + browser download
			csv.test.js                 -> CSV utility unit test
		assets/
			hero.png/react.svg/vite.svg -> image assets
```

### 2) Startup Flow

1. `index.html` loads `src/main.jsx`.
2. `main.jsx` renders `<App />` inside `<FinancialDataProvider>`.
3. `App.jsx` sets routes (`/` and fallback `*`) to `HomePage`.
4. On first load, `FinancialDataContext.jsx` triggers `loadCompany` with default CIK (Apple).

### 3) How API Request Works

1. User enters/selects a CIK in `CompanyPicker.jsx`.
2. Submit calls `loadCompany(rawCik)` from context.
3. `normalizeCik` (`src/utils/cik.js`) cleans input:
	 - non-digit characters removed
	 - empty input returns `''`
	 - if >10 digits, last 10 kept
	 - if <10 digits, left-pad with zeros
4. `fetchCompanyFacts` (`src/api/secEdgar.js`) requests:
	 - `/sec/api/xbrl/companyfacts/CIK{cik}.json`
5. In local dev, `vite.config.js` proxy forwards `/sec/*` to `https://data.sec.gov/*`.
6. In production, `vercel.json` rewrite forwards `/sec/:path*` to `https://data.sec.gov/:path*`.
7. If API fails, context sets `status = 'error'` and shows error card in UI.

### 4) Data Processing for Graph/Table (Key Metrics Tab)

Main logic: `src/utils/companyFacts.js` -> `extractKeyFinancialSeries(...)`

Default metrics and tag priority:
- Revenue: first available tag from `Revenues`, then `SalesRevenueNet`
- Assets: tag `Assets`

Unit selection rule:
- Prefer `USD`
- If USD missing, use first available unit key

Annual filtering rules (`toAnnualSeries`):
- Keep only rows where `fp` is `FY` or `CY`
- Keep only annual forms: `10-K`, `20-F`, `40-F`
- Keep only finite numeric values
- Year resolution: `fy` first, otherwise derive from `end` date
- Remove invalid years

Deduplication rule per year:
- If multiple entries exist for same year, keep the one with latest `filed` date

Final output shape:
- `years`: sorted unique years
- `rows`: each row = `{ year, revenue?, assets? }`
- `metrics`: only those metrics returned that actually exist in data

### 5) Year Filter Conditions (Summary Tab)

Context computes:
- `availableYears` from extracted data
- default range = min year to max year (if user not selected)
- `filteredRows = rows where year >= from && year <= to`

`YearRangeFilter.jsx` guard conditions:
- If user increases `from` above current `to`, `to` auto-clamps to `from`
- If user decreases `to` below current `from`, `from` auto-clamps to `to`
- Reset button restores full range

### 6) Graph Data Kaise Aata Hai

Graph source chain:

`SEC API -> extractKeyFinancialSeries -> context.rows (year-filtered) -> FinancialChart`

`FinancialChart.jsx`:
- Receives `rows` and `metrics`
- X-axis uses `year`
- Each metric creates one `<Bar dataKey={metric.id}>`
- Y-axis + tooltip values formatted by `formatUsdCompact`

So chart bars directly depend on:
- selected company CIK
- annual filtering logic
- selected year range

### 7) Raw Data Explorer Filters and Conditions

Raw data source:

`SEC API -> flattenUsGaapFacts -> context.allFacts -> AllFactsExplorer`

Flatten logic (`flattenUsGaapFacts`):
- Iterate every us-gaap tag
- Iterate every unit under each tag
- Iterate every point in that unit
- Build flat rows with fields like tag, label, description, unit, val, fy, fp, form, end, filed, accn
- Sort by `filed` descending, then `tag` ascending

Filters in `AllFactsExplorer.jsx`:
- Exact match filters: `tag`, `unit`, `form`, `fp`
- Search filter (`query`): case-insensitive substring match across
	- tag
	- label
	- description
	- form
	- unit
- All filters are combined with AND logic

Pagination conditions:
- page size options: `25`, `50`, `100`, `200`
- any filter/search/page-size change resets page to `1`
- page is clamped so it never goes above total pages

### 8) CSV Export Logic

Implemented in `HomePage.jsx` with `toCsv` (`src/utils/csv.js`).

Summary tab export:
- Uses `fullRows` (all extracted annual rows)
- Not limited to current year filter
- Columns = `Year` + metric labels

Raw tab export:
- Uses full `allFacts` dataset
- Fixed columns: tag, label, unit, val, fy, fp, form, frame, start, end, filed, accn

CSV utility behavior:
- Escapes commas/quotes/newlines
- Uses `\r\n` line endings (Excel-friendly)
- Prepends UTF-8 BOM for better Excel compatibility

### 9) UI States and What User Sees

Context status states:
- `idle`
- `loading`
- `success`
- `error`

`HomePage.jsx` rendering conditions:
- `loading` -> spinner
- `error` -> API error panel
- `success` + `key` tab:
	- no metrics -> "Data not found for this company"
	- metrics present but no rows in selected range -> "No annual reports in this time window"
	- else -> chart + table
- `success` + `all` tab -> raw facts explorer

### 10) File-to-File Connection Map

- `index.html` -> `src/main.jsx`
- `src/main.jsx` -> `src/App.jsx`, `src/app/FinancialDataContext.jsx`
- `src/App.jsx` -> `src/pages/HomePage.jsx`
- `src/pages/HomePage.jsx` -> context + all UI components + CSV utils
- `src/app/FinancialDataContext.jsx` -> API (`src/api/secEdgar.js`) + transforms (`src/utils/companyFacts.js`) + CIK util (`src/utils/cik.js`)
- `src/components/FinancialChart.jsx` -> `src/utils/format.js`
- `src/components/FinancialTable.jsx` -> `src/utils/format.js`
- `src/components/CompanyPicker.jsx` -> `src/utils/cik.js`

If you want, I can also add one architecture diagram (Mermaid) in this README so flow visual form me bhi clear ho jaye.