# SEC Financial Data Explorer

This project was built for a technical assessment.

I wanted to make something practical, so I used real SEC EDGAR data and focused on two common metrics: Revenue and Assets. The app lets you view company data in a chart + summary table, and also inspect the full raw company-facts response.

## Quick Start

```bash
npm install
npm run dev
```

Then open: `http://localhost:5173`

## What the app can do

- Search company data using CIK
- Show annual trends (10-K focused) for Revenue and Assets
- Show a raw-data explorer for all available us-gaap facts
- Export CSV from both summary and raw-data views

## CSV Export Behavior

- Summary view export: includes all available annual Revenue/Assets rows (not only currently filtered rows)
- Raw data view export: includes all rows shown from the full us-gaap dataset

## Raw Data Explorer

The raw table is meant for browsing large SEC datasets without freezing the UI.

- Search by tag, label, or description
- Filter by tags, units, forms (10-K / 10-Q), and period type (FY, Q1, Q2, etc.)
- Scrollable fixed-height table with pagination (25-200 rows)
- Sticky header + sticky tag column for easier navigation

## Notes on the implementation

- State management: React Context API (kept it lightweight instead of using Redux)
- Styling: Tailwind CSS
- Charts: Recharts
- API access in local development: Vite proxy (to avoid browser CORS issues)

I had not worked with SEC data before this, so I spent time understanding CIKs and how company-facts data is structured before finalizing the mapping logic.

## Data Mapping Choice

SEC filings can be noisy when annual and quarterly values are mixed together. The logic in `src/utils/companyFacts.js` prioritizes annual (10-K) values so the trend chart remains clear year-over-year.

## Known Limitations

- SEC rate limits can temporarily return 403 if too many requests are sent quickly
- Input is currently CIK-based (no ticker/company-name lookup yet)
- Some companies use alternate tags, so standard fields like Revenues may be missing

## Deployment Note (Vercel)

`vite.config.js` proxy works in local development, but Vercel does not use it in production.

To fix production API routing, `vercel.json` includes rewrite rules that forward:

- `/sec/api/*` -> `https://data.sec.gov/*`

This solved the 404 issues on deployment.