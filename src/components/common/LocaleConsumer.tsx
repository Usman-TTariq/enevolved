'use client'

import { useLocale } from '@/contexts/LocaleContext'

/**
 * Wraps page content so it re-renders when locale changes (key forces remount).
 * Needed because in App Router the page slot may not re-render on context change.
 */
export default function LocaleConsumer({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale()
  return <div key={locale} className="contents">{children}</div>
}
