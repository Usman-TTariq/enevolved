'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { HelpCircle, ChevronDown, Rocket } from 'lucide-react'
import { MarketingHeader } from '@/components/marketing/MarketingHeader'
import { AdvertisersHeroPanel } from '@/components/marketing/AdvertisersHeroPanel'
import { SiteFooter } from '@/components/common/SiteFooter'
import { useTranslations } from '@/contexts/LocaleContext'
import { HOME_HERO_REEL_VIDEO_SRC } from '@/lib/home-marketing-videos'

const PAGE_BG = '#D6E6F2'
const LABEL = '#2B75FF'

const ADVERTISER_LOGOS = [
  { src: '/logo-aliexpress.svg', alt: 'AliExpress' },
  { src: '/logo-bloomchic.svg', alt: 'BloomChic' },
  { src: '/logo-carters.svg', alt: "Carter's" },
  { src: '/logo-macys.svg', alt: "Macy's" },
  { src: '/logo-nordvpn.svg', alt: 'NordVPN' },
  { src: '/logo-walmart.svg', alt: 'Walmart' },
] as const

function FeatureStripVideo({ src, className }: { src: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) void v.play().catch(() => {})
          else v.pause()
        })
      },
      { threshold: 0.2, rootMargin: '100px' }
    )
    io.observe(v)
    return () => io.disconnect()
  }, [])
  return (
    <video
      ref={ref}
      className={className}
      src={src}
      muted
      playsInline
      loop
      preload="metadata"
      aria-hidden
    />
  )
}

export default function AdvertisersPage() {
  const { t } = useTranslations()
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const featureRows = [
    {
      titleKey: 'advertisers.featureScaleTitle' as const,
      descKey: 'advertisers.featureScaleDesc' as const,
      videoSrc: '/home-hero/Model_steps_out_202604220234.mp4',
      imageLeft: true,
    },
    {
      titleKey: 'advertisers.featureTrackTitle' as const,
      descKey: 'advertisers.featureTrackDesc' as const,
      videoSrc: HOME_HERO_REEL_VIDEO_SRC,
      imageLeft: false,
    },
    {
      titleKey: 'advertisers.featurePartnerTitle' as const,
      descKey: 'advertisers.featurePartnerDesc' as const,
      videoSrc: '/home-creator-cases/1.mp4',
      imageLeft: true,
    },
    {
      titleKey: 'advertisers.featureOptimizeTitle' as const,
      descKey: 'advertisers.featureOptimizeDesc' as const,
      videoSrc: '/home-creator-cases/4.mp4',
      imageLeft: false,
    },
  ] as const

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: PAGE_BG }}>
      <MarketingHeader active="advertisers" />
      <AdvertisersHeroPanel />

      <div className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-24 lg:gap-32">
          {featureRows.map((row) => (
            <div key={row.titleKey} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <div
                className={`relative aspect-[16/10] w-full max-w-xl overflow-hidden rounded-3xl bg-neutral-900 shadow-sm ring-1 ring-black/5 lg:max-w-none ${row.imageLeft ? 'lg:order-1' : 'lg:order-2'}`}
              >
                <FeatureStripVideo src={row.videoSrc} className="absolute inset-0 h-full w-full object-cover" />
              </div>
              <div className={row.imageLeft ? 'lg:order-2' : 'lg:order-1'}>
                <h2 className="font-[family-name:var(--font-heading)] text-3xl font-semibold leading-tight tracking-tight text-neutral-900 md:text-4xl lg:text-[2.75rem]">
                  {t(row.titleKey)}
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-neutral-600 md:text-xl">{t(row.descKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="border-y border-neutral-200/80 bg-neutral-50 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-1 text-center text-sm font-semibold uppercase tracking-wider" style={{ color: LABEL }}>
            {t('advertisers.logoStripEyebrow')}
          </p>
          <p className="mb-8 text-center font-medium text-neutral-600">{t('advertisers.asSeenOn')}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-8 opacity-90 grayscale">
            {ADVERTISER_LOGOS.map(({ src, alt }) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt={alt} className="h-8 w-auto max-w-[140px] object-contain sm:h-9" />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider" style={{ color: LABEL }}>
              {t('advertisers.simpleProcess')}
            </p>
            <h2 className="text-3xl font-bold text-neutral-900 md:text-4xl">{t('advertisers.howItWorks')}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-neutral-600">{t('advertisers.howItWorksDesc')}</p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: '01',
                title: 'Sign up & onboard',
                desc: 'Create your advertiser account, complete verification, and get access to our partner dashboard. Most brands are live within 48 hours.',
              },
              {
                step: '02',
                title: 'Create your offers',
                desc: 'Set up campaigns with your commission structure (CPA, CPS, CPL, or hybrid). Define tracking links, caps, and payouts that suit your goals.',
              },
              {
                step: '03',
                title: 'Connect with publishers',
                desc: 'Our network of vetted publishers can apply to your program. Approve partners that match your niche and start driving qualified traffic.',
              },
              {
                step: '04',
                title: 'Track, optimize & scale',
                desc: 'Use real-time reporting to see clicks, conversions, and ROI. Optimize offers and scale with top-performing publishers.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative rounded-2xl border border-neutral-200 bg-neutral-50/80 p-6 shadow-sm transition hover:border-[#2B75FF]/30"
              >
                <span className="text-4xl font-bold text-[#2B75FF]/25">{item.step}</span>
                <h3 className="mt-2 text-lg font-bold text-neutral-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-neutral-200/80 bg-neutral-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider" style={{ color: LABEL }}>
              {t('advertisers.flexibleModels')}
            </p>
            <h2 className="text-3xl font-bold text-neutral-900 md:text-4xl">{t('advertisers.programTypes')}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-neutral-600">{t('advertisers.programTypesIntro')}</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                label: 'CPA (Cost per action)',
                text: 'Pay only when a user completes a defined action—sale, lead, sign-up, or download. Ideal for measurable ROI.',
              },
              {
                label: 'CPS (Cost per sale)',
                text: 'Commission on every sale referred by a publisher. The most common model for e-commerce and direct response.',
              },
              {
                label: 'CPL (Cost per lead)',
                text: 'Pay per qualified lead. Perfect for B2B, insurance, finance, and any business where lead quality matters.',
              },
              {
                label: 'CPI (Cost per install)',
                text: 'Pay per app install or software trial. Suited for mobile apps, SaaS, and product trials.',
              },
              {
                label: 'Rev share',
                text: 'Share a percentage of recurring revenue with publishers. Great for subscriptions and long-term customer value.',
              },
              {
                label: 'Hybrid & custom',
                text: 'Combine models or set custom rules. We support tiered commissions, bonuses, and seasonal campaigns.',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-[#2B75FF]/25"
              >
                <h3 className="mb-2 font-bold text-neutral-900">{item.label}</h3>
                <p className="text-sm leading-relaxed text-neutral-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider" style={{ color: LABEL }}>
              {t('advertisers.whoWeWorkWith')}
            </p>
            <h2 className="text-3xl font-bold text-neutral-900 md:text-4xl">{t('advertisers.industriesWeServe')}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-neutral-600">{t('advertisers.industriesIntro')}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              {
                name: 'E-commerce & retail',
                desc: 'Drive sales with coupon sites, content creators, and comparison engines.',
              },
              {
                name: 'Finance & insurance',
                desc: 'Quality leads from comparison and review sites with full compliance support.',
              },
              {
                name: 'SaaS & software',
                desc: 'Trial sign-ups and subscriptions via tech bloggers and B2B publishers.',
              },
              {
                name: 'Travel & hospitality',
                desc: 'Bookings and package sales through travel affiliates and influencers.',
              },
              {
                name: 'Health & wellness',
                desc: 'Supplement, fitness, and wellness brands with compliant publisher networks.',
              },
              {
                name: 'Education & courses',
                desc: 'Student sign-ups and course sales through education and lifestyle publishers.',
              },
            ].map((item) => (
              <div
                key={item.name}
                className="max-w-xs rounded-xl border border-neutral-200 bg-neutral-50/80 px-6 py-4 shadow-sm transition hover:border-[#2B75FF]/30"
              >
                <h3 className="mb-1 font-bold text-neutral-900">{item.name}</h3>
                <p className="text-sm text-neutral-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-neutral-200/80 bg-neutral-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm lg:p-10">
              <div className="flex w-full items-end justify-center gap-3">
                {[40, 65, 45, 80, 55].map((h, i) => (
                  <div key={i} className="flex-1 max-w-[48px] rounded-t bg-[#2B75FF]/80" style={{ height: `${h}px` }} />
                ))}
                <div className="flex flex-col gap-2 self-end">
                  {[30, 50, 70].map((h, i) => (
                    <div key={i} className="w-10 rounded-t bg-[#2B75FF]/50" style={{ height: `${h}px` }} />
                  ))}
                </div>
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-[#2B75FF]/50 text-sm font-bold text-[#2B75FF]">
                  %
                </div>
              </div>
              <p className="mt-4 text-center text-sm font-medium text-neutral-500">{t('advertisers.millionsChartCaption')}</p>
            </div>
            <div>
              <h2 className="mb-6 text-3xl font-bold text-neutral-900 md:text-4xl">{t('advertisers.millionsOfOpportunities')}</h2>
              <p className="mb-4 text-neutral-600">{t('advertisers.millionsIntro')}</p>
              <p className="mb-8 text-sm text-neutral-500">{t('advertisers.millionsIntro2')}</p>
              <ul className="space-y-4">
                {[
                  'Every publisher brings a unique audience—no overlap, maximum reach.',
                  'Cost-effective: pay commission only when traffic converts to a sale.',
                  'Fast, trackable results with trusted publishers and real-time reporting.',
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#2B75FF]/40 bg-[#2B75FF]/10">
                      <svg className="h-4 w-4 text-[#2B75FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-neutral-700">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider" style={{ color: LABEL }}>
              {t('advertisers.sectionDareEyebrow')}
            </p>
            <h2 className="text-3xl font-bold text-neutral-900 md:text-4xl">{t('advertisers.sectionDareTitle')}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-neutral-600">{t('advertisers.sectionDareDesc')}</p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
                title: 'Innovative partnership',
                desc: 'Reach your audience globally through a large partner database and diverse channels.',
              },
              {
                icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
                title: 'Product-related search',
                desc: 'Publishers run PLAs with detailed info that drives qualified traffic to your site.',
              },
              {
                icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
                title: 'Social presence',
                desc: 'Creators and influencers monetize their reach—you pay only for results.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-8 text-center shadow-sm transition hover:border-[#2B75FF]/30"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-[#2B75FF]/20 bg-[#2B75FF]/5">
                  <svg className="h-7 w-7 text-[#2B75FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-bold text-neutral-900">{item.title}</h3>
                <p className="text-neutral-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-neutral-200/80 bg-neutral-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div className="relative h-80 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-900 shadow-sm ring-1 ring-black/5 lg:h-[400px]">
              <FeatureStripVideo src="/home-creator-cases/3.mp4" className="absolute inset-0 h-full w-full object-cover" />
            </div>
            <div>
              <h2 className="mb-6 text-3xl font-bold text-neutral-900 md:text-4xl">{t('advertisers.weDeliverSuccess')}</h2>
              <p className="mb-4 text-neutral-600">{t('advertisers.weDeliverPara1')}</p>
              <p className="mb-10 text-sm text-neutral-500">{t('advertisers.weDeliverPara2')}</p>
              <div className="grid grid-cols-3 gap-6">
                {[
                  { value: '80%', labelKey: 'advertisers.salesLift' as const },
                  { value: '90%', labelKey: 'advertisers.traffic' as const },
                  { value: '99%', labelKey: 'advertisers.uptime' as const },
                ].map((stat, i) => (
                  <div key={i} className="rounded-xl border border-neutral-200 bg-white p-4 text-center shadow-sm">
                    <p className="mb-1 text-2xl font-bold text-[#2B75FF]">{stat.value}</p>
                    <p className="text-sm font-medium text-neutral-600">{t(stat.labelKey)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-2 text-center text-sm font-semibold uppercase tracking-wider" style={{ color: LABEL }}>
            {t('advertisers.whyChooseOurNetwork')}
          </p>
          <h2 className="mb-14 text-center text-3xl font-bold text-neutral-900 md:text-4xl">{t('advertisers.whatMakesUsDifferent')}</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z',
                title: 'User-friendly',
                desc: 'Platform is easy to use and onboard.',
              },
              {
                icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
                title: 'Cost-effective',
                desc: 'Pay commission only after sale.',
              },
              {
                icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
                title: 'High-quality',
                desc: 'High-quality publisher base and data.',
              },
              {
                icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
                title: 'Monitoring',
                desc: 'Performance monitoring and reports.',
              },
              {
                icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
                title: 'Relationship',
                desc: 'Dedicated relationship managers.',
              },
              {
                icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',
                title: 'Optimize',
                desc: 'Optimize with detailed reporting.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-6 shadow-sm transition hover:border-[#2B75FF]/30"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-[#2B75FF]/20 bg-[#2B75FF]/5">
                  <svg className="h-6 w-6 text-[#2B75FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-bold text-neutral-900">{item.title}</h3>
                <p className="text-sm text-neutral-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-neutral-200/80 bg-neutral-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider" style={{ color: LABEL }}>
                {t('advertisers.performanceFirst')}
              </p>
              <h2 className="mb-6 text-3xl font-bold text-neutral-900 md:text-4xl">{t('advertisers.realRoi')}</h2>
              <p className="mb-6 text-neutral-600">{t('advertisers.realRoiPara1')}</p>
              <p className="mb-8 text-neutral-600">{t('advertisers.realRoiPara2')}</p>
              <ul className="space-y-3">
                {[
                  'Real-time conversion and click reporting',
                  'Publisher-level performance breakdown',
                  'Fraud detection and quality controls',
                  'Flexible payment terms and invoicing',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-neutral-700">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2B75FF]/15">
                      <svg className="h-3 w-3 text-[#2B75FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
              <h3 className="mb-6 text-lg font-bold text-neutral-900">{t('advertisers.whyAdvertisersTrust')}</h3>
              <div className="space-y-6">
                {[
                  { stat: '30k+', label: 'Active advertisers' },
                  { stat: '18,420+', label: 'Live offers' },
                  { stat: '$5M+', label: 'Annual affiliate revenue tracked' },
                  { stat: '30', label: 'Avg. days to first conversion' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between border-b border-neutral-200 py-3 last:border-0">
                    <span className="text-neutral-600">{item.label}</span>
                    <span className="text-xl font-bold text-[#2B75FF]">{item.stat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-24 lg:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: LABEL }}>
              {t('advertisers.support')}
            </p>
            <h2 className="mb-4 flex flex-wrap items-center justify-center gap-3 text-3xl font-bold text-neutral-900 md:text-4xl">
              <span style={{ color: LABEL }}>
                <HelpCircle className="h-8 w-8 md:h-9 md:w-9" strokeWidth={2} />
              </span>
              <span>{t('advertisers.faq')}</span>
            </h2>
          </div>
          <dl className="space-y-4">
            {[
              {
                q: 'How quickly can I launch my affiliate program?',
                a: 'Most advertisers are live within 24–48 hours after completing verification. You can create offers, set commission structures, and invite or approve publishers as soon as your account is active.',
              },
              {
                q: 'What commission models do you support?',
                a: 'We support CPA, CPS, CPL, CPI, revenue share, and hybrid or custom models. You set the rules—caps, tiers, and payment terms—per offer or campaign.',
              },
              {
                q: 'How do I know my traffic and conversions are real?',
                a: 'We use advanced tracking with fraud detection and quality checks. You get real-time reporting at click and conversion level, with the option to review publisher quality before approval.',
              },
              {
                q: 'Is there a minimum spend or contract?',
                a: 'No long-term contracts. You pay commission only when you get results. Setup and platform access are straightforward; minimums depend on your chosen plan and can be discussed with our team.',
              },
              {
                q: 'Can I work with specific publishers only?',
                a: 'Yes. You can run an invite-only program, approve publishers manually, or use both. You have full control over who promotes your brand.',
              },
            ].map(({ q, a }, i) => (
              <div
                key={q}
                className={`overflow-hidden rounded-xl border transition-all duration-300 ${
                  openFaq === i ? 'border-[#2B75FF]/50 bg-white shadow-md shadow-[#2B75FF]/10' : 'border-neutral-200 bg-neutral-50/80 hover:border-neutral-300'
                }`}
              >
                <dt>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="pr-4 font-semibold text-neutral-900">{q}</span>
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-200 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`}
                    >
                      <ChevronDown className="h-4 w-4 text-[#2B75FF]" strokeWidth={2.5} />
                    </span>
                  </button>
                </dt>
                <dd className={`px-6 pb-5 transition-all duration-300 ${openFaq === i ? 'block' : 'hidden'}`}>
                  <p className="border-l-2 border-[#2B75FF]/40 pl-4 text-sm leading-loose text-neutral-600">{a}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-t border-neutral-200/80 py-24 lg:py-28" style={{ backgroundColor: PAGE_BG }}>
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 flex flex-wrap items-center justify-center gap-3 text-3xl font-bold text-neutral-900 md:text-4xl">
            <span style={{ color: LABEL }}>
              <Rocket className="h-8 w-8 md:h-9 md:w-9" strokeWidth={2} />
            </span>
            <span>{t('advertisers.readyToGrow')}</span>
          </h2>
          <p className="mb-8 text-neutral-600">{t('home.joinThousands')}</p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/get-started"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2B75FF] px-8 py-4 font-semibold text-white shadow-lg shadow-[#2B75FF]/25 transition hover:bg-[#2566e0]"
            >
              {t('advertisers.createAdvertiserAccount')}
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-8 py-4 font-semibold text-neutral-800 transition hover:border-[#2B75FF]/50 hover:text-[#2B75FF]"
            >
              {t('advertisers.talkToSales')}
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
