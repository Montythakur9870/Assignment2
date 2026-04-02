import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    proxy: {
      '/sec': {
        target: 'https://data.sec.gov',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/sec/, ''),
        headers: {
          'User-Agent':
            process.env.VITE_SEC_USER_AGENT ||
            'FinancialDataExplorer/1.0 (learning@example.com)',
          Accept: 'application/json',
        },
      },
    },
  },
  test: {
    environment: 'node',
  },
})
