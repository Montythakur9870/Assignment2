import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { FinancialDataProvider } from './app/FinancialDataContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FinancialDataProvider>
      <App />
    </FinancialDataProvider>
  </StrictMode>,
)
