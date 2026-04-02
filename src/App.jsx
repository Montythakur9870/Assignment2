import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'

/**
 * Main Application Component
 * 
 * Sets up routing for the financial explorer.
 * We currently have a single root route leading to the HomePage,
 * but this structure allows for easy expansion (e.g. adding /about or /company/:cik).
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main route for the Financial Data Explorer */}
        <Route path="/" element={<HomePage />} />
        
        {/* Catch-all route to redirect users back to the explorer */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
