/**
 * Base URL for the site (used for canonical, Open Graph, etc.)
 * Set NEXT_PUBLIC_APP_URL in env (e.g. https://earnytics.com); fallback for dev.
 */
export function getSiteBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '')
  if (url) return url
  if (typeof window !== 'undefined') return window.location.origin
  return 'https://earnytics.com'
}
