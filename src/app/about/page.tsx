'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Users, FileText } from 'lucide-react'
import { MarketingHeader } from '@/components/marketing/MarketingHeader'
import { SiteFooter } from '@/components/common/SiteFooter'
import { useTranslations } from '@/contexts/LocaleContext'

/** Slightly blue-tinted page bg + stronger accents for readability */
const PAGE_BG = '#e8f1fb'
const ACCENT = '#1a5fdc'
const PANEL_BLUE = '#b8d4f5'

const NETWORK_LOGOS = [
  { src: '/logo-aliexpress.svg', alt: 'AliExpress' },
  { src: '/logo-bloomchic.svg', alt: 'BloomChic' },
  { src: '/logo-carters.svg', alt: "Carter's" },
  { src: '/logo-macys.svg', alt: "Macy's" },
  { src: '/logo-nordvpn.svg', alt: 'NordVPN' },
  { src: '/logo-walmart.svg', alt: 'Walmart' },
  { src: '/home-partner-brands/flip-1.png', alt: '' },
  { src: '/home-partner-brands/flip-2.png', alt: '' },
  { src: '/home-partner-brands/flip-3.png', alt: '' },
] as const

const TEAM_IMAGES = [
  '/home-influencers/influencer-1.png',
  '/home-influencers/influencer-2.png',
  '/home-influencers/influencer-3.png',
  '/home-influencers/influencer-4.png',
] as const

export default function AboutPage() {
  const { t } = useTranslations()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: PAGE_BG }}>
      <MarketingHeader active="about" />

      {/* Hero */}
      <section className="px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14 lg:px-8 lg:pb-20 lg:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-neutral-600">{t('about.aboutUs')}</p>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold leading-snug tracking-tight text-neutral-900 sm:text-3xl lg:text-[2.05rem] lg:leading-[1.25]">
            {t('about.marketingHeroPart1')}{' '}
            <span style={{ color: ACCENT }}>{t('about.marketingHeroHighlight')}</span>{' '}
            {t('about.marketingHeroPart2')}
          </h1>
        </div>
      </section>

      {/* Who we are + Values */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="rounded-3xl border-2 border-neutral-300 bg-white p-8 shadow-md sm:p-10">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1a5fdc]/18 text-[#1a5fdc] ring-1 ring-[#1a5fdc]/25">
              <Users className="h-6 w-6" strokeWidth={1.75} aria-hidden />
            </div>
            <h2 className="mb-6 text-2xl font-bold text-neutral-900">{t('about.whoWeAreTitle')}</h2>
            <div className="mb-8 flex flex-wrap gap-3">
              {TEAM_IMAGES.map((src) => (
                <div
                  key={src}
                  className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-neutral-300 bg-neutral-100 ring-2 ring-white sm:h-[4.5rem] sm:w-[4.5rem]"
                >
                  <Image src={src} alt="" fill className="object-cover object-top" sizes="72px" />
                </div>
              ))}
            </div>
            <p className="text-base leading-relaxed text-neutral-700">{t('about.whoWeAreDesc')}</p>
          </div>

          <div className="rounded-3xl border-2 border-neutral-300 bg-white p-8 shadow-md sm:p-10">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-200 text-amber-900 ring-1 ring-amber-400/40">
              <FileText className="h-6 w-6" strokeWidth={1.75} aria-hidden />
            </div>
            <h2 className="mb-6 text-2xl font-bold text-neutral-900">{t('about.valuesInActionTitle')}</h2>
            <p className="mb-8 text-base leading-relaxed text-neutral-700">{t('about.valuesInActionDesc')}</p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border-2 border-neutral-900 bg-transparent px-8 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
            >
              {t('about.contactUsCta')}
            </Link>
          </div>
        </div>
      </section>

      {/* Leading networks */}
      <section className="border-y-2 border-neutral-200 bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">{t('about.leadingNetworksTitle')}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-base text-neutral-700">{t('about.leadingNetworksLead')}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:gap-6">
            {NETWORK_LOGOS.map(({ src, alt }) => {
              const isSvg = src.endsWith('.svg')
              return (
                <div
                  key={src}
                  className="flex aspect-[5/3] items-center justify-center rounded-2xl border-2 border-neutral-300 bg-gradient-to-b from-white to-neutral-50/90 px-4 py-5 shadow-md ring-1 ring-neutral-200/80 sm:px-5 sm:py-6"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- mixed svg/png; sized to fill card */}
                  <img
                    src={src}
                    alt={alt}
                    className={
                      isSvg
                        ? 'h-auto max-h-[min(5.25rem,38vw)] w-auto max-w-[88%] object-contain sm:max-h-24 md:max-h-[5.5rem]'
                        : 'h-auto max-h-[min(9rem,52vw)] w-auto max-w-[92%] rounded-lg object-contain shadow-sm sm:max-h-36 md:max-h-40'
                    }
                    loading="lazy"
                  />
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Get in touch — panel + form */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div
          className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border-2 border-[#7aa3d9] shadow-lg shadow-[#1a5fdc]/10 sm:rounded-[2.5rem]"
          style={{ backgroundColor: PANEL_BLUE }}
        >
          <div className="grid gap-10 p-8 lg:grid-cols-12 lg:gap-12 lg:p-12 xl:p-14">
            <div className="flex flex-col justify-center lg:col-span-5">
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                {t('about.getInTouchBlockTitle')}
              </h2>
              <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-[#1a5fdc]">{t('about.emailLabel')}</p>
              <a
                href={`mailto:${t('footer.supportEmail')}`}
                className="mt-1 text-lg font-semibold text-[#1a5fdc] underline decoration-2 underline-offset-4 hover:text-[#154cbd]"
              >
                {t('footer.supportEmail')}
              </a>
              <div className="mt-10 border-t-2 border-neutral-800/15 pt-8">
                <p className="text-sm font-semibold text-neutral-800">{t('home.trustedByBandLine1')}</p>
                <p className="text-lg font-bold text-neutral-900">{t('home.trustedByBandLine2')}</p>
                <div className="mt-4 flex flex-wrap items-center gap-6">
                  {['/logo-walmart.svg', '/logo-macys.svg', '/logo-nordvpn.svg'].map((src) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={src} src={src} alt="" className="h-8 w-auto object-contain sm:h-9" />
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-neutral-300 bg-white p-6 shadow-lg sm:p-8 lg:col-span-7">
              {submitted ? (
                <p className="py-12 text-center text-neutral-700">{t('about.formSubmittedNote')}</p>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="about-name" className="mb-1.5 block text-sm font-semibold text-neutral-800">
                      {t('about.formName')}
                    </label>
                    <input
                      id="about-name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full rounded-xl border-2 border-neutral-300 bg-white px-4 py-3 text-neutral-900 outline-none transition focus:border-[#1a5fdc] focus:ring-4 focus:ring-[#1a5fdc]/20"
                    />
                  </div>
                  <div>
                    <label htmlFor="about-email" className="mb-1.5 block text-sm font-semibold text-neutral-800">
                      {t('about.formEmail')}
                    </label>
                    <input
                      id="about-email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded-xl border-2 border-neutral-300 bg-white px-4 py-3 text-neutral-900 outline-none transition focus:border-[#1a5fdc] focus:ring-4 focus:ring-[#1a5fdc]/20"
                    />
                  </div>
                  <div>
                    <label htmlFor="about-phone" className="mb-1.5 block text-sm font-semibold text-neutral-800">
                      {t('about.formPhone')}
                    </label>
                    <input
                      id="about-phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full rounded-xl border-2 border-neutral-300 bg-white px-4 py-3 text-neutral-900 outline-none transition focus:border-[#1a5fdc] focus:ring-4 focus:ring-[#1a5fdc]/20"
                    />
                  </div>
                  <div>
                    <label htmlFor="about-subject" className="mb-1.5 block text-sm font-semibold text-neutral-800">
                      {t('about.formSubject')}
                    </label>
                    <input
                      id="about-subject"
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full rounded-xl border-2 border-neutral-300 bg-white px-4 py-3 text-neutral-900 outline-none transition focus:border-[#1a5fdc] focus:ring-4 focus:ring-[#1a5fdc]/20"
                    />
                  </div>
                  <div>
                    <label htmlFor="about-message" className="mb-1.5 block text-sm font-semibold text-neutral-800">
                      {t('about.formDetailsPlaceholder')}
                    </label>
                    <textarea
                      id="about-message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full resize-y rounded-xl border-2 border-neutral-300 bg-white px-4 py-3 text-neutral-900 outline-none transition focus:border-[#1a5fdc] focus:ring-4 focus:ring-[#1a5fdc]/20"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[#1a5fdc] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#1a5fdc]/35 transition hover:bg-[#154cbd] sm:w-auto sm:px-10"
                  >
                    {t('about.formSubmit')}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
