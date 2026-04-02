import { normalizeCik } from '../utils/cik.js'

const BASE_URL = '/sec/api/xbrl/companyfacts'

export async function fetchCompanyFacts(rawCik, { signal } = {}) {
  const cik = normalizeCik(rawCik)
  const url = `${BASE_URL}/CIK${cik}.json`

  const res = await fetch(url, {
    signal,
    headers: {
      Accept: 'application/json',
    },
  })

  if (!res.ok) {
    const body = await safeReadText(res)
    const msg = body?.trim()
      ? `SEC API error (${res.status}): ${body.trim()}`
      : `SEC API error (${res.status})`
    throw new Error(msg)
  }

  return await res.json()
}

async function safeReadText(res) {
  try {
    return await res.text()
  } catch {
    return ''
  }
}

