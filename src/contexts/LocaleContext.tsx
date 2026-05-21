'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import en from '@/messages/en.json'
import de from '@/messages/de.json'
import fr from '@/messages/fr.json'
import es from '@/messages/es.json'
import ar from '@/messages/ar.json'
import ru from '@/messages/ru.json'

const STORAGE_KEY = 'earnytics-locale'

const SUPPORTED_LOCALES = ['en', 'de', 'fr', 'es', 'ar', 'ru'] as const

const messages: Record<string, Record<string, unknown>> = {
  en: en as Record<string, unknown>,
  de: de as Record<string, unknown>,
  fr: fr as Record<string, unknown>,
  es: es as Record<string, unknown>,
  ar: ar as Record<string, unknown>,
  ru: ru as Record<string, unknown>,
}

function getNested(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.')
  let current: unknown = obj
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[key]
  }
  return typeof current === 'string' ? current : undefined
}

type LocaleContextValue = {
  locale: string
  setLocale: (code: string) => void
  t: (key: string) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<string>('en')

  useEffect(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
      if (stored && SUPPORTED_LOCALES.includes(stored as (typeof SUPPORTED_LOCALES)[number])) setLocaleState(stored)
    } catch {
      // ignore
    }
  }, [])

  const setLocale = useCallback((code: string) => {
    setLocaleState(code)
    try {
      localStorage.setItem(STORAGE_KEY, code)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('earnytics-locale-change', { detail: code }))
      }
    } catch {
      // ignore
    }
  }, [])

  const t = useCallback(
    (key: string): string => {
      const dict = messages[locale] ?? messages.en
      const value = getNested(dict, key)
      if (value !== undefined) return value
      const fallback = getNested(messages.en, key)
      return fallback ?? key
    },
    [locale]
  )

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) {
    return {
      locale: 'en',
      setLocale: () => {},
      t: (key: string) => key,
    }
  }
  return ctx
}

export function useTranslations() {
  return useLocale()
}
