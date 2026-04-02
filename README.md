# SEC Financial Data Explorer

Hi there! This is my project for the technical assessment. I built a small web app that fetches real financial data (like Revenue and Assets) from the SEC EDGAR API and shows it in a nice chart and table.

## 🏃 Quick Start
Just two commands to get it running:

1. `npm install` (to get all the packages)
2. `npm run dev` (to start the app)

Then just open `http://localhost:5173` in your browser.

## 📊 Exporting Data
The app has a **CSV Export** button that works for both views:
*   **Summary View:** Exports the full annual financial data (Revenue and Assets) for every year available, not just the filtered ones.
*   **Raw Data View:** Exports every single "us-gaap" fact from the SEC file into a detailed CSV.

## 🔍 Raw Data Explorer (Raw Table)
The **Raw Data View** includes a powerful table that lets you explore the entire SEC dataset for a company:
*   **Full Access:** It shows every single financial fact (thousands of rows) available in the SEC JSON file.
*   **Smart Search:** Search by Tag name, Label, or even the Description of the financial fact.
*   **Multi-Filters:** Filter data by **Specific Tags**, **Units** (like USD or Shares), **Forms** (10-K, 10-Q), and **Periods** (FY, Q1, Q2, etc.).
*   **Performance:** Uses a fixed-height vertical scroll and pagination (25-200 rows) so the browser doesn't lag with large datasets.
*   **User Friendly:** Features a **Sticky Header** and **Sticky Tag Column**, so you never lose track of what you're looking at while scrolling.

## 🤔 A few helpful notes
I did some research using **Google** to understand what a **CIK (Central Index Key)** is and how SEC data is structured, as I hadn't worked with it before. I also looked up the **default CIK numbers** for popular companies like Apple and Microsoft on Google to include them as quick-start options. I also relied on **VS Code's auto-suggestions** to help with some of the syntax and logic.

## 💡 A few things about my approach

*   **React + Context API:** I used React's built-in **Context API** for state management instead of something heavy like Redux. For an app this size, Context is much cleaner and does the job perfectly without making the code too complex.
*   **Tailwind for Styling:** I used Tailwind CSS because it's fast and helps keep the UI responsive. I made sure the app looks good on mobile and tablets too.
*   **Charts with Recharts:** For the data visualization, I picked Recharts. It’s easy to use and looks professional.
*   **Handling the SEC API:** The SEC doesn't allow direct browser requests easily. So, I added a **proxy** in the `vite.config.js` file. This basically tells the development server to act as a bridge to the SEC website so we don't hit CORS errors.

## 📊 Data Mapping
Since the SEC data is quite messy, I wrote a small logic in `src/utils/companyFacts.js` to specifically pick **Annual (10-K)** report data. This makes sure the chart shows clear year-by-year trends instead of mixed-up quarterly numbers.

## ⚠️ Known Issues / Limitations
*   **SEC Rate Limits:** If you search too many companies too fast, the SEC might temporarily block the requests (403 error). Just wait a few seconds and try again.
*   **CIK Search:** Right now, you search using a company's **CIK number** (like 0000320193 for Apple).
*   **Missing Data:** Not all companies use the same tags in their filings. If a company doesn't have the standard "Revenues" tag, the app will show a message that data isn't found for that specific one.

I hope you find the code clean and easy to follow. Thanks for checking it out!

* **Vercel Production Routing (`vercel.json`):** While `vite.config.js` successfully proxies requests in the local development environment to avoid CORS issues, Vercel does not use this config in production. This initially caused 404 API routing errors when deployed. To resolve this, I added a `vercel.json` file with specific `rewrites` rules. This acts as a production-level reverse proxy, seamlessly forwarding `/sec/api/*` requests to `https://data.sec.gov/*` and ensuring the app fetches live data correctly on the cloud.