'use client'

import Link from 'next/link'
import { useState, type ReactNode } from 'react'
import { useTranslations } from '@/contexts/LocaleContext'

const NAV_NAVY = '#262626'
const NAV_MUTED = '#595959'
const NAV_DOT = '#5496ff'

function MarketingNavLink({
  href,
  active,
  children,
}: {
  href: string
  active?: boolean
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      style={{ color: active ? NAV_NAVY : NAV_MUTED }}
      className={`inline-flex items-end gap-1 whitespace-nowrap pb-0.5 font-sans capitalize leading-[1.2] tracking-tight transition-opacity text-[17px] md:text-[19px] lg:text-[21px] xl:text-[22px] ${
        active ? 'font-semibold' : 'font-normal hover:opacity-80'
      }`}
    >
      <span>{children}</span>
      {active ? (
        <span
          className="mb-1 inline-block size-[6px] shrink-0 rounded-full"
          style={{ backgroundColor: NAV_DOT }}
          aria-hidden
        />
      ) : null}
    </Link>
  )
}

export type MarketingHeaderActive =
  | 'home'
  | 'influencers'
  | 'publishers'
  | 'advertisers'
  | 'about'
  | 'blog'
  | 'contact'

export function MarketingHeader({ active }: { active: MarketingHeaderActive }) {
  const { t } = useTranslations()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const is = (key: MarketingHeaderActive) => active === key

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-neutral-200/90 bg-white">
        <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-8 md:px-10 lg:px-14 xl:px-16 2xl:px-[clamp(2.5rem,8vw,8.75rem)]">
          <div className="flex min-h-[72px] w-full items-center justify-between gap-3 py-2 sm:min-h-[76px] md:min-h-[80px] md:gap-4 md:py-2.5 lg:min-h-[88px]">
            <div className="flex min-w-0 max-w-[14rem] shrink-0 items-center sm:max-w-none md:max-w-[15rem]">
              <Link href="/" className="flex shrink-0 items-center py-0.5" aria-label="Earnytics home">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/Untitled%20design%20(2).svg"
                  alt="Earnytics"
                  className="h-9 w-auto max-w-[170px] object-contain object-left sm:h-10 md:h-11 md:max-h-[52px]"
                />
              </Link>
            </div>

            <nav className="hidden min-w-0 shrink-0 items-center gap-8 md:flex" aria-label="Main">
              <MarketingNavLink href="/" active={is('home')}>
                {t('nav.home')}
              </MarketingNavLink>
              <MarketingNavLink href="/publishers" active={is('publishers')}>
                {t('nav.publishers')}
              </MarketingNavLink>
              <MarketingNavLink href="/advertisers" active={is('advertisers')}>
                {t('nav.advertisers')}
              </MarketingNavLink>
              <MarketingNavLink href="/about" active={is('about')}>
                {t('nav.aboutUs')}
              </MarketingNavLink>
              <MarketingNavLink href="/blog" active={is('blog')}>
                {t('nav.blog')}
              </MarketingNavLink>
              <MarketingNavLink href="/contact" active={is('contact')}>
                {t('nav.contact')}
              </MarketingNavLink>
            </nav>

            <div className="flex shrink-0 items-center gap-3 sm:gap-3">
              <Link
                href="/login"
                style={{ color: NAV_NAVY }}
                className="hidden h-12 items-center rounded-full px-6 text-[17px] font-normal leading-[1.2] transition-opacity hover:opacity-80 sm:inline-flex md:text-[19px] lg:text-[21px] xl:text-[22px]"
              >
                {t('nav.logIn')}
              </Link>
              <Link
                href="/signup"
                className="hidden h-12 items-center justify-center rounded-full border border-[#262626] bg-[#262626] px-6 text-[17px] font-normal leading-[1.2] transition-transform hover:scale-[1.02] sm:inline-flex md:text-[19px] lg:text-[21px] xl:text-[22px]"
              >
                <span className="bg-gradient-to-r from-[#fff4df] to-[#a8d3ff] bg-clip-text text-transparent">
                  {t('nav.signUp')}
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 transition hover:border-neutral-300 hover:text-neutral-900 md:hidden"
                aria-label="Open menu"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {sidebarOpen ? (
        <>
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md" onClick={() => setSidebarOpen(false)} />
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
            <div className="pointer-events-auto mx-4 w-full max-w-md rounded-lg bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900">{t('menu.quickMenu')}</h2>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition hover:bg-gray-200"
                  aria-label="Close menu"
                >
                  <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <div className="mb-5 flex gap-2">
                  <Link
                    href="/login"
                    onClick={() => setSidebarOpen(false)}
                    className="flex-1 rounded-full border border-gray-200 py-3 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    {t('nav.logIn')}
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setSidebarOpen(false)}
                    className="flex-1 rounded-full bg-[#1a1a1a] py-3 text-center text-sm font-medium text-white transition hover:bg-black"
                  >
                    {t('nav.signUp')}
                  </Link>
                </div>
                <nav className="mb-5 flex flex-col gap-1 border-b border-gray-100 pb-5" aria-label="Site">
                  <Link
                    href="/"
                    onClick={() => setSidebarOpen(false)}
                    className={`py-2 text-sm ${is('home') ? 'font-semibold text-gray-900' : 'font-medium text-gray-600 hover:text-gray-900'}`}
                  >
                    {t('nav.home')}
                  </Link>
                  <Link
                    href="/publishers"
                    onClick={() => setSidebarOpen(false)}
                    className={`py-2 text-sm ${is('publishers') ? 'font-semibold text-gray-900' : 'font-medium text-gray-600 hover:text-gray-900'}`}
                  >
                    {t('nav.publishers')}
                  </Link>
                  <Link
                    href="/advertisers"
                    onClick={() => setSidebarOpen(false)}
                    className={`py-2 text-sm ${is('advertisers') ? 'font-semibold text-gray-900' : 'font-medium text-gray-600 hover:text-gray-900'}`}
                  >
                    {t('nav.advertisers')}
                  </Link>
                  <Link
                    href="/about"
                    onClick={() => setSidebarOpen(false)}
                    className={`py-2 text-sm ${is('about') ? 'font-semibold text-gray-900' : 'font-medium text-gray-600 hover:text-gray-900'}`}
                  >
                    {t('nav.aboutUs')}
                  </Link>
                  <Link
                    href="/blog"
                    onClick={() => setSidebarOpen(false)}
                    className={`py-2 text-sm ${is('blog') ? 'font-semibold text-gray-900' : 'font-medium text-gray-600 hover:text-gray-900'}`}
                  >
                    {t('nav.blog')}
                  </Link>
                </nav>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/login"
                      onClick={() => setSidebarOpen(false)}
                      className="group flex items-center justify-between rounded-lg p-4 transition hover:bg-gray-50"
                    >
                      <span className="font-medium text-gray-900">{t('menu.publisherLogin')}</span>
                      <svg className="h-5 w-5 text-gray-400 transition group-hover:text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/login"
                      onClick={() => setSidebarOpen(false)}
                      className="group flex items-center justify-between rounded-lg p-4 transition hover:bg-gray-50"
                    >
                      <span className="font-medium text-gray-900">{t('menu.advertiserLogin')}</span>
                      <svg className="h-5 w-5 text-gray-400 transition group-hover:text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/login"
                      onClick={() => setSidebarOpen(false)}
                      className="group flex items-center justify-between rounded-lg p-4 transition hover:bg-gray-50"
                    >
                      <span className="font-medium text-gray-900">{t('menu.influencerLogin')}</span>
                      <svg className="h-5 w-5 text-gray-400 transition group-hover:text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/get-started"
                      onClick={() => setSidebarOpen(false)}
                      className="group flex items-center justify-between rounded-lg p-4 transition hover:bg-gray-50"
                    >
                      <span className="font-medium text-gray-900">{t('menu.registerNewAccount')}</span>
                      <svg className="h-5 w-5 text-gray-400 transition group-hover:text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      onClick={() => setSidebarOpen(false)}
                      className="group flex items-center justify-between rounded-lg p-4 transition hover:bg-gray-50"
                    >
                      <span className="font-medium text-gray-900">{t('menu.contact')}</span>
                      <svg className="h-5 w-5 text-gray-400 transition group-hover:text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </li>
                </ul>
                <div className="flex items-center justify-center gap-4 border-t border-gray-200 p-4 pt-2">
                  <a
                    href="https://www.facebook.com/earnytics.official"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-cyan-300 hover:text-cyan-500"
                    aria-label="Facebook"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.instagram.com/earn_ytics/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-cyan-300 hover:text-cyan-500"
                    aria-label="Instagram"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                  <a
                    href="https://x.com/earnytics55924"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-cyan-300 hover:text-cyan-500"
                    aria-label="X"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  )
}
