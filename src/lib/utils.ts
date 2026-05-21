/** Profile completeness: 5 sections. Uses stored flags, or infers from filled fields so dashboard shows real progress. */
export function calculateProfileCompleteness(profile: {
  logoSubmitted?: boolean
  profilePictureSubmitted?: boolean
  basicDetailsCompleted?: boolean
  companyDetailsCompleted?: boolean
  billingDetailsCompleted?: boolean
  paymentDetailsCompleted?: boolean
  website?: string | null
  description?: string | null
  address?: string | null
  city?: string | null
  country?: string | null
  paymentMethod?: string | null
  paymentEmail?: string | null
}): number {
  const totalFields = 5
  const hasBasic = Boolean(profile.basicDetailsCompleted || (profile.website?.trim() || profile.description?.trim()))
  const hasCompany = Boolean(profile.companyDetailsCompleted)
  const hasBilling = Boolean(profile.billingDetailsCompleted || profile.address?.trim() || profile.city?.trim() || profile.country?.trim())
  const hasPayment = Boolean(profile.paymentDetailsCompleted || profile.paymentMethod?.trim() || profile.paymentEmail?.trim())
  const hasBranding = Boolean(profile.logoSubmitted || profile.profilePictureSubmitted)
  let completedFields = 0
  if (hasBranding) completedFields++
  if (hasBasic) completedFields++
  if (hasCompany) completedFields++
  if (hasBilling) completedFields++
  if (hasPayment) completedFields++
  return Math.min(100, Math.round((completedFields / totalFields) * 100))
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function convertToCSV(data: any[], headers: string[]): string {
  const rows = data.map(item => 
    headers.map(header => {
      const value = item[header] || ''
      return `"${String(value).replace(/"/g, '""')}"`
    }).join(',')
  )
  
  return [headers.map(h => `"${h}"`).join(','), ...rows].join('\n')
}

/** Proxy Admitad CDN logos to avoid CORS/referrer block */
export function getLogoUrl(url: string | undefined): string | undefined {
  if (!url) return undefined
  try {
    const u = new URL(url)
    if (u.hostname === 'cdn.admitad-connect.com') {
      return `/api/image-proxy?url=${encodeURIComponent(url)}`
    }
  } catch {}
  return url
}

/** Parse region JSON (e.g. {"region":"RU"}) or return as-is */
export function formatRegion(region: string | undefined): string {
  if (!region) return '—'
  try {
    const parsed = JSON.parse(region) as Record<string, string>
    return parsed.region ?? parsed.code ?? parsed.name ?? region
  } catch {
    return region
  }
}

/**
 * URLs pasted from HTML/email often contain literal `&amp;` instead of `&`, or odd `?&` sequences.
 * Partnerize `/destination:` segments reject those unless normalized.
 */
export function normalizeHttpUrlPaste(url: string | null | undefined): string {
  if (url == null || typeof url !== 'string') return ''
  let s = url.trim()
  if (!s) return ''
  s = s.replace(/&amp;/gi, '&').replace(/&#0*38;/gi, '&').replace(/&#x0*26;/gi, '&')
  s = s.replace(/\?&+/g, '?').replace(/&&+/g, '&')
  return s
}

/**
 * True if the landing page host is the same store as the brand website/baseUrl host.
 * Treats apex and www as equivalent (e.g. belffin.com vs www.belffin.com).
 * Allows subdomains of the same root (e.g. shop.belffin.com vs www.belffin.com).
 */
export function landingHostMatchesStore(landingHost: string, refHost: string): boolean {
  const l = landingHost.toLowerCase()
  const r = refHost.toLowerCase()
  if (!l || !r) return false
  if (l === r) return true
  const stripWww = (h: string) => (h.startsWith('www.') ? h.slice(4) : h)
  const ls = stripWww(l)
  const rs = stripWww(r)
  if (ls === rs) return true
  return ls.endsWith('.' + rs) || rs.endsWith('.' + ls)
}

/**
 * Consumer-facing label for publishers (Impact campaign / storefront name).
 * Prefer `brandName` when set (e.g. "Belffin"); fall back to legal `name` (e.g. "Yok Rith Limited").
 */
export function advertiserDisplayName(advertiser: {
  name?: string | null
  brandName?: string | null
}): string {
  const b = advertiser.brandName?.trim()
  if (b) return b
  return advertiser.name?.trim() || '—'
}

/**
 * Read JSON from a `fetch` `Response` without throwing when the body is HTML or a plain-text gateway error (common on 502/504).
 */
export async function parseApiResponseJson<T = unknown>(
  res: Response
): Promise<{ ok: true; status: number; body: T } | { ok: false; status: number; message: string }> {
  const text = await res.text()
  const trimmed = text.trim()
  const status = res.status
  if (!trimmed) {
    return {
      ok: false,
      status,
      message:
        status === 504 || status === 502
          ? 'The server took too long to respond (gateway timeout). Try again in a moment.'
          : `Empty response (HTTP ${status}).`,
    }
  }
  const head = trimmed.slice(0, 120)
  if (
    trimmed.startsWith('<') ||
    /^An error occurred/i.test(head) ||
    /^Bad Gateway/i.test(head) ||
    /^Gateway time/i.test(head)
  ) {
    return {
      ok: false,
      status,
      message:
        status === 504 || status === 502
          ? 'Gateway timeout — creating the link took too long. Try again, or use the store homepage without a custom landing URL.'
          : `Server returned an error page instead of JSON (HTTP ${status}).`,
    }
  }
  try {
    return { ok: true, status, body: JSON.parse(text) as T }
  } catch {
    return { ok: false, status, message: trimmed.slice(0, 280) || `Invalid JSON (HTTP ${status}).` }
  }
}

export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}




