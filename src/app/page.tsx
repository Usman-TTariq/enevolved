'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BarChart3, Globe, Users, Monitor, Target, FileBarChart } from 'lucide-react'
import { MarketingHeader } from '@/components/marketing/MarketingHeader'
import { MarketingHeroCollage } from '@/components/marketing/MarketingHeroCollage'
import { SiteFooter } from '@/components/common/SiteFooter'
import { useTranslations } from '@/contexts/LocaleContext'
import { HOME_CREATOR_CASE_VIDEO_SRCS } from '@/lib/home-marketing-videos'

const LOCALE_CHANGE_EVENT = 'earnytics-locale-change'

const TRUSTED_BRAND_LOGOS = [
  { src: '/logo-aliexpress.svg', alt: 'AliExpress' },
  { src: '/logo-bloomchic.svg', alt: 'BLOOMCHIC' },
  { src: '/logo-carters.svg', alt: "Carter's" },
  { src: '/logo-macys.svg', alt: "Macy's" },
  { src: '/logo-nordvpn.svg', alt: 'NordVPN' },
  { src: '/logo-walmart.svg', alt: 'Walmart' },
] as const

/** Home — Partner with Brands: Figma-style pills + rotateY flip + lifestyle back */
const PARTNER_BRAND_CARDS = [
  {
    src: '/logo-aliexpress.svg',
    alt: 'AliExpress',
    flipSrc: '/home-partner-brands/flip-1.png',
    categoryKey: 'home.partnerBrandCatAliExpress',
    surface: 'bg-[#f5f5f5]',
    pillBorder: 'border-[#666e71]',
    pillText: 'text-[#666e71]',
  },
  {
    src: '/logo-bloomchic.svg',
    alt: 'BLOOMCHIC',
    flipSrc: '/home-partner-brands/flip-2.png',
    categoryKey: 'home.partnerBrandCatBloomchic',
    surface: 'bg-[#ffeded]',
    pillBorder: 'border-[#e25158]',
    pillText: 'text-[#e25158]',
  },
  {
    src: '/logo-carters.svg',
    alt: "Carter's",
    flipSrc: '/home-partner-brands/flip-3.png',
    categoryKey: 'home.partnerBrandCatCarters',
    surface: 'bg-[#eff6ff]',
    pillBorder: 'border-[#3055a4]',
    pillText: 'text-[#3055a4]',
  },
  {
    src: '/logo-macys.svg',
    alt: "Macy's",
    flipSrc: '/home-partner-brands/flip-4.png',
    categoryKey: 'home.partnerBrandCatMacys',
    surface: 'bg-[#f5f5f5]',
    pillBorder: 'border-[#585454]',
    pillText: 'text-[#585454]',
  },
  {
    src: '/logo-nordvpn.svg',
    alt: 'NordVPN',
    flipSrc: '/home-partner-brands/flip-5.png',
    categoryKey: 'home.partnerBrandCatNordvpn',
    surface: 'bg-[#edf6f9]',
    pillBorder: 'border-[#5f7d87]',
    pillText: 'text-[#5f7d87]',
  },
  {
    src: '/logo-walmart.svg',
    alt: 'Walmart',
    flipSrc: '/home-partner-brands/flip-6.png',
    categoryKey: 'home.partnerBrandCatWalmart',
    surface: 'bg-[#f0f8f4]',
    pillBorder: 'border-[#559171]',
    pillText: 'text-[#559171]',
  },
] as const

function CreatorCaseVideoTile({ src }: { src: string }) {
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
      { threshold: 0.2, rootMargin: '80px' }
    )
    io.observe(v)
    return () => io.disconnect()
  }, [])
  return (
    <div className="creator-case-tile relative aspect-[9/16] w-[min(11.5rem,78vw)] shrink-0 overflow-hidden rounded-[1.75rem] bg-neutral-300 ring-1 ring-black/[0.06] sm:w-52 sm:rounded-[2rem] md:w-60 md:rounded-[2.25rem]">
      <video
        ref={ref}
        className="absolute inset-0 h-full w-full object-cover"
        src={src}
        muted
        playsInline
        loop
        preload="metadata"
        aria-hidden
      />
    </div>
  )
}

/** Home — influencer portrait cards (sources: influerncerDetailImg1/2/5/7 → public/home-influencers) */
const HOME_INFLUENCER_MARQUEE = [
  {
    src: '/home-influencers/influencer-1.png',
    nameKey: 'home.influencerMarquee1Name',
    categoryKey: 'home.influencerMarquee1Category',
  },
  {
    src: '/home-influencers/influencer-2.png',
    nameKey: 'home.influencerMarquee2Name',
    categoryKey: 'home.influencerMarquee2Category',
  },
  {
    src: '/home-influencers/influencer-3.png',
    nameKey: 'home.influencerMarquee3Name',
    categoryKey: 'home.influencerMarquee3Category',
  },
  {
    src: '/home-influencers/influencer-4.png',
    nameKey: 'home.influencerMarquee4Name',
    categoryKey: 'home.influencerMarquee4Category',
  },
] as const

/** Home — content publisher examples (Background-*.png → public/home-content-showcase) */
const HOME_CONTENT_SHOWCASE_IMAGES = [
  '/home-content-showcase/Background-1.png',
  '/home-content-showcase/Background-2.png',
  '/home-content-showcase/Background-5.png',
  '/home-content-showcase/Background.png',
  '/home-content-showcase/Background-4.png',
] as const

const HOME_CONTENT_SHOWCASE_FEATURES = [
  { Icon: Users, titleKey: 'home.contentShowcaseBlurb1Title', descKey: 'home.contentShowcaseBlurb1Desc' },
  { Icon: BarChart3, titleKey: 'home.contentShowcaseBlurb2Title', descKey: 'home.contentShowcaseBlurb2Desc' },
  { Icon: Globe, titleKey: 'home.contentShowcaseBlurb3Title', descKey: 'home.contentShowcaseBlurb3Desc' },
] as const

/** Figma-style site tiles: screenshot + logo strip (Earnytics Redesign) */
const HOME_CONTENT_SHOWCASE_MASONRY_LEFT = [
  { src: HOME_CONTENT_SHOWCASE_IMAGES[0] },
  { src: HOME_CONTENT_SHOWCASE_IMAGES[2] },
  { src: HOME_CONTENT_SHOWCASE_IMAGES[4] },
] as const
const HOME_CONTENT_SHOWCASE_MASONRY_RIGHT = [
  { src: HOME_CONTENT_SHOWCASE_IMAGES[1] },
  { src: HOME_CONTENT_SHOWCASE_IMAGES[3] },
] as const

const CONTENT_SHOWCASE_CARD_GAP_PX = 14

function ContentShowcaseSiteCard({ src }: { src: string }) {
  return (
    <article className="w-full shrink-0 rounded-[1.375rem] bg-[#fafafa] p-[5px] shadow-[0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-black/[0.05]">
      <div className="flex flex-col">
        <div
          className="relative w-full overflow-hidden rounded-[1.0625rem] bg-[#f0f0f0] ring-1 ring-[#f0f0f0]"
          style={{ aspectRatio: '668 / 392' }}
        >
          <Image src={src} alt="" fill className="object-cover object-top" sizes="280px" />
        </div>
        <div
          className="relative flex w-full shrink-0 items-center justify-center bg-[#fafafa]"
          style={{ aspectRatio: '329.189 / 47.2973' }}
          aria-hidden
        >
          <span className="h-1.5 w-10 rounded-full bg-neutral-200/90" />
        </div>
      </div>
    </article>
  )
}

const HOME_CONTENT_SHOWCASE_MASONRY_COLS = [
  { items: HOME_CONTENT_SHOWCASE_MASONRY_LEFT, durationSec: 18, direction: 'normal' as const },
  { items: HOME_CONTENT_SHOWCASE_MASONRY_RIGHT, durationSec: 21, direction: 'reverse' as const },
] as const

export default function Home() {
  const [, setLocaleVersion] = useState(0)
  const { t, locale } = useTranslations()

  const heroTagline2Full = useMemo(
    () => `${t('hero.taglineLine2Highlight')} ${t('hero.taglineLine2Rest')}`.trim(),
    [locale, t],
  )
  const [heroTagline2Len, setHeroTagline2Len] = useState(0)

  useEffect(() => {
    setHeroTagline2Len(0)
  }, [heroTagline2Full])

  useEffect(() => {
    if (heroTagline2Len >= heroTagline2Full.length) return undefined
    const ch = heroTagline2Full[heroTagline2Len]
    const delayMs = ch === ' ' ? 220 : 72
    const id = window.setTimeout(() => setHeroTagline2Len((n) => n + 1), delayMs)
    return () => window.clearTimeout(id)
  }, [heroTagline2Len, heroTagline2Full])

  useEffect(() => {
    const handler = () => setLocaleVersion((v) => v + 1)
    window.addEventListener(LOCALE_CHANGE_EVENT, handler)
    return () => window.removeEventListener(LOCALE_CHANGE_EVENT, handler)
  }, [])

  return (
    <div className="min-h-screen bg-white" key={locale}>
      <MarketingHeader active="home" />

      {/* Hero — light split layout + rounded collage (Earnytics palette); images: /home-hero/banner-a|b.png */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-cyan-50/80">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          aria-hidden
          style={{
            backgroundImage:
              'radial-gradient(900px 420px at 85% 15%, rgba(45,212,191,0.18), transparent 55%), radial-gradient(600px 360px at 10% 90%, rgba(14,165,233,0.12), transparent 50%)',
          }}
        />
        <div className="relative z-10 mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-14 md:py-20 lg:py-24 xl:py-28">
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-x-14 lg:gap-y-10 xl:gap-x-20">
            <div className="relative z-30 max-w-xl min-w-0 lg:max-w-[34rem] lg:pr-2">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600 sm:text-sm">
                {t('hero.preHeading')}
              </p>
              <h1
                className="font-heading text-4xl font-bold leading-[1.12] tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl xl:text-[3.45rem] [overflow-wrap:anywhere]"
                aria-label={`${t('hero.taglineLine1')} ${heroTagline2Full}`}
              >
                <span className="block">{t('hero.taglineLine1')}</span>
                <span className="mt-1 block min-h-[1.2em] max-w-full break-words">
                  <span className="bg-gradient-to-r from-cyan-600 via-teal-500 to-slate-400 bg-clip-text text-transparent">
                    {heroTagline2Full.slice(0, heroTagline2Len)}
                  </span>
                  <span
                    className="ml-0.5 inline-block h-[0.78em] w-[2px] translate-y-px rounded-sm bg-neutral-900 align-baseline animate-pulse"
                    aria-hidden
                  />
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-500 lg:mt-8 lg:text-xl">
                {t('hero.description')}
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4 sm:mt-11 sm:gap-5 lg:mt-12">
                <Link
                  href="/get-started"
                  className="inline-flex min-h-[52px] items-center justify-center rounded-full border-2 border-neutral-900/15 bg-gradient-to-r from-amber-100 via-white to-cyan-100 px-9 py-3.5 text-base font-semibold text-neutral-900 shadow-[0_8px_24px_-4px_rgba(15,23,42,0.18)] ring-1 ring-inset ring-white/90 transition hover:scale-[1.02] hover:border-neutral-900/25 hover:shadow-[0_12px_28px_-6px_rgba(15,23,42,0.22)]"
                >
                  {t('nav.getStarted')}
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex min-h-[52px] items-center justify-center rounded-full border-2 border-neutral-300 bg-white/95 px-8 py-3.5 text-base font-semibold text-neutral-800 shadow-[0_4px_14px_-2px_rgba(15,23,42,0.12)] transition hover:border-cyan-500 hover:bg-cyan-50/95 hover:text-cyan-900 hover:shadow-[0_8px_20px_-4px_rgba(6,182,212,0.25)]"
                >
                  {t('hero.getInTouch')}
                </Link>
              </div>
            </div>

            <MarketingHeroCollage />
          </div>
        </div>
      </section>

      {/* Trusted brands — headline + divider + marquee row (compact band, larger logos) */}
      <section className="border-t border-neutral-200 bg-white py-5 sm:py-6 lg:py-6">
        <div className="mx-auto max-w-[1600px] px-5 sm:px-8 md:px-10 lg:px-14 xl:px-16 2xl:px-[clamp(2.5rem,8vw,8.75rem)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-5 lg:gap-8">
            <div className="flex shrink-0 items-center md:max-w-[12rem]">
              <p className="text-base font-semibold leading-tight tracking-tight text-neutral-700 sm:text-[1.0625rem]">
                <span className="block">{t('home.trustedByBandLine1')}</span>
                <span className="block">{t('home.trustedByBandLine2')}</span>
              </p>
            </div>
            <div className="hidden w-px shrink-0 self-stretch bg-neutral-200 md:block md:min-h-16 lg:min-h-[4.5rem]" aria-hidden />
            <div className="group/trusted relative min-h-[3.25rem] min-w-0 flex-1 overflow-hidden sm:min-h-[3.5rem] md:min-h-16 lg:min-h-[4.5rem]">
              <div className="trusted-marquee-track flex w-max shrink-0 items-center gap-5 will-change-transform animate-trusted-marquee md:gap-6">
                {[...TRUSTED_BRAND_LOGOS, ...TRUSTED_BRAND_LOGOS].map(({ src, alt }, i) => (
                  <div
                    key={`${alt}-${i}`}
                    className="relative flex h-[3.25rem] w-[min(10.5rem,40vw)] shrink-0 items-center justify-center px-3 py-0 sm:h-14 sm:w-44 md:h-16 md:w-[13.5rem] md:px-4 lg:h-[4.5rem] lg:w-[14.5rem]"
                  >
                    <Image
                      src={src}
                      alt={i < TRUSTED_BRAND_LOGOS.length ? alt : ''}
                      width={240}
                      height={96}
                      className="h-11 w-auto max-w-[10.5rem] object-contain object-center transition duration-300 hover:opacity-90 sm:h-12 sm:max-w-[12rem] md:h-14 md:max-w-[14rem] lg:h-16 lg:max-w-[15rem]"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our influencers — infinite horizontal marquee (duplicate strip for seamless -50% loop) */}
      <section
        id="influencers"
        className="scroll-mt-[100px] border-t border-neutral-200 bg-gradient-to-b from-neutral-50 via-neutral-100/80 to-neutral-100 py-10 sm:py-12 md:py-14"
      >
        <div className="mx-auto max-w-[1600px] px-5 sm:px-8 md:px-10 lg:px-14 xl:px-16 2xl:px-[clamp(2.5rem,8vw,8.75rem)]">
          <h2 className="mb-8 text-center font-heading text-4xl font-bold leading-[1.1] tracking-tight text-neutral-900 sm:mb-10 sm:text-5xl sm:tracking-tighter md:mb-12 md:text-6xl md:leading-[1.08] lg:text-[3.5rem] xl:text-[3.75rem]">
            {t('home.influencersMarqueeTitle')}
          </h2>
          <div
            className="group/influencers relative overflow-hidden py-1"
            role="region"
            aria-label={t('home.influencersMarqueeTitle')}
          >
            <div className="influencer-marquee-track flex w-max shrink-0 items-stretch gap-6 will-change-transform animate-trusted-marquee sm:gap-7 md:gap-8">
              {[...HOME_INFLUENCER_MARQUEE, ...HOME_INFLUENCER_MARQUEE].map((card, i) => {
                const isClone = i >= HOME_INFLUENCER_MARQUEE.length
                return (
                  <article
                    key={`${card.src}-${i}`}
                    aria-hidden={isClone}
                    className="relative w-[10.5rem] shrink-0 overflow-hidden rounded-[1.625rem] bg-neutral-200 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.18)] ring-1 ring-black/[0.06] sm:w-44 sm:rounded-[1.875rem] md:w-[13rem] lg:w-[14rem]"
                  >
                    <div className="group/card relative aspect-[3/4] w-full">
                      <Image
                        src={card.src}
                        alt={isClone ? '' : t(card.nameKey)}
                        fill
                        className="object-cover object-top"
                        sizes="(max-width: 640px) 168px, 224px"
                      />
                      <div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-80"
                        aria-hidden
                      />
                    </div>
                    <div className="absolute inset-x-2.5 bottom-2.5 rounded-2xl border border-white/60 bg-white/90 px-3 py-2.5 shadow-sm backdrop-blur-md sm:inset-x-3 sm:bottom-3 sm:rounded-[1.125rem] sm:px-3.5 sm:py-3">
                      <p className="truncate text-sm font-semibold tracking-tight text-neutral-900 sm:text-[0.9375rem]">
                        {t(card.nameKey)}
                      </p>
                      <p className="mt-1.5 inline-flex max-w-full truncate rounded-full bg-neutral-900/[0.06] px-2 py-0.5 text-[0.6875rem] font-medium uppercase tracking-wide text-neutral-600 sm:text-xs">
                        {t(card.categoryKey)}
                      </p>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Content websites — split copy + fixed-height two-column vertical marquee */}
      <section className="border-t border-neutral-200 bg-white py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="mx-auto max-w-[1600px] px-5 sm:px-8 md:px-10 lg:px-14 xl:px-16 2xl:px-[clamp(2.5rem,8vw,8.75rem)]">
          <h2 className="mb-4 text-center font-heading text-4xl font-bold leading-[1.1] tracking-tight text-neutral-900 sm:mb-5 sm:text-5xl sm:tracking-tighter md:text-6xl md:leading-[1.08] lg:text-[3.5rem] xl:text-[3.75rem]">
            {t('home.contentShowcaseTitle')}
          </h2>
          <p className="mx-auto mb-12 max-w-3xl text-center text-base leading-relaxed text-neutral-600 sm:mb-14 sm:text-lg md:mb-16 md:text-xl">
            {t('home.contentShowcaseLead')}
          </p>

          <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-14 xl:gap-16">
            <div className="flex flex-col gap-12 lg:col-span-5 lg:gap-14">
              {HOME_CONTENT_SHOWCASE_FEATURES.map(({ Icon, titleKey, descKey }) => (
                <div key={titleKey} className="max-w-xl">
                  <Icon className="mb-4 h-7 w-7 text-sky-500 sm:h-8 sm:w-8" strokeWidth={1.5} aria-hidden />
                  <h3 className="mb-3 font-heading text-2xl font-bold leading-snug tracking-tight text-neutral-900 sm:text-3xl md:text-[1.75rem] md:leading-tight lg:text-3xl">
                    {t(titleKey)}
                  </h3>
                  <p className="text-base leading-relaxed text-neutral-600 sm:text-lg">{t(descKey)}</p>
                </div>
              ))}
            </div>

            <div
              className="group/content-masonry overflow-hidden rounded-2xl bg-white p-2 ring-1 ring-black/[0.06] sm:rounded-3xl sm:p-3 lg:col-span-7 lg:flex lg:justify-end"
              role="region"
              aria-label={t('home.contentShowcaseTitle')}
            >
              {/* Tighter strip: narrower max width, shorter column clip, faster marquee */}
              <div className="relative w-full min-w-0 max-w-[min(100%,580px)] sm:max-w-[600px] lg:max-w-[580px] lg:ml-auto">
                <div className="relative h-[min(68vh,680px)] min-h-[min(100%,320px)] max-h-[680px] w-full">
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-white to-transparent sm:h-20"
                    aria-hidden
                  />
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-white to-transparent sm:h-20"
                    aria-hidden
                  />
                  <div
                    className="grid h-full min-h-0 grid-cols-2"
                    style={{ gap: `${CONTENT_SHOWCASE_CARD_GAP_PX}px` }}
                  >
                    {HOME_CONTENT_SHOWCASE_MASONRY_COLS.map(({ items, durationSec, direction }, colIdx) => (
                      <div
                        key={colIdx}
                        className={`relative min-h-0 min-w-0 overflow-hidden ${colIdx === 1 ? 'lg:mt-7' : ''}`}
                      >
                        <div
                          className={`content-showcase-col-track flex w-full flex-col will-change-transform animate-content-showcase-col ${
                            direction === 'reverse' ? '[animation-direction:reverse]' : ''
                          }`}
                          style={{ animationDuration: `${durationSec}s` }}
                        >
                          <div
                            className="flex flex-col"
                            style={{
                              gap: `${CONTENT_SHOWCASE_CARD_GAP_PX}px`,
                              paddingBottom: `${CONTENT_SHOWCASE_CARD_GAP_PX}px`,
                            }}
                          >
                            {items.map(({ src }) => (
                              <ContentShowcaseSiteCard key={src} src={src} />
                            ))}
                          </div>
                          <div
                            className="flex flex-col"
                            style={{
                              gap: `${CONTENT_SHOWCASE_CARD_GAP_PX}px`,
                              paddingBottom: `${CONTENT_SHOWCASE_CARD_GAP_PX}px`,
                            }}
                            aria-hidden
                          >
                            {items.map(({ src }) => (
                              <ContentShowcaseSiteCard key={`${src}-dup`} src={src} />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Advantages — viewport-wide band + glass cards */}
      <section className="w-full border-t border-neutral-200 bg-white">
        <div className="relative w-full overflow-hidden rounded-none aspect-[4/3] min-h-[22rem] sm:aspect-[16/9] sm:min-h-[20rem] lg:aspect-[1880/960] lg:min-h-0 max-h-[min(92vh,960px)]">
          <Image
            src="/home-advantages/our-advantages-hero.png"
            alt=""
            fill
            className="object-cover object-[50%_50%]"
            sizes="100vw"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[rgba(0,0,0,0.12)]"
            aria-hidden
          />
          <div className="relative z-10 flex h-full min-h-0 w-full flex-col items-center justify-between gap-10 px-5 py-10 sm:gap-12 sm:px-6 sm:py-12 md:gap-14 md:px-10 md:py-14 lg:gap-16 lg:px-[clamp(1.25rem,6vw,8.125rem)] lg:py-20">
            <h2 className="max-w-[31.25rem] text-center font-heading text-4xl font-semibold leading-[1.2] text-white sm:text-5xl lg:text-[60px]">
              {t('home.ourAdvantagesTitle')}
            </h2>
            <div className="flex w-full flex-col gap-6 md:flex-row md:items-stretch md:gap-8">
              {(
                [
                  {
                    Icon: Monitor,
                    titleKey: 'home.ourAdvantagesCard1' as const,
                    tint: '#bcd2ff',
                  },
                  {
                    Icon: Target,
                    titleKey: 'home.ourAdvantagesCard2' as const,
                    tint: '#fff7a0',
                  },
                  {
                    Icon: FileBarChart,
                    titleKey: 'home.ourAdvantagesCard3' as const,
                    tint: '#bef7be',
                  },
                ] as const
              ).map(({ Icon, titleKey, tint }) => (
                <div
                  key={titleKey}
                  className="flex min-h-0 min-w-0 flex-1 basis-0 flex-col overflow-hidden rounded-[28px] border border-white/25 bg-[rgba(255,255,255,0.25)] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.18)] backdrop-blur-[35px] md:rounded-[32px]"
                >
                  <div className="flex flex-1 flex-col items-start gap-4 px-6 pb-6 pt-8 text-left sm:px-8 sm:pb-6 sm:pt-8">
                    <div
                      className="flex size-12 shrink-0 items-center justify-center rounded-full shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.06)]"
                      style={{ backgroundColor: tint }}
                    >
                      <Icon className="size-6 text-[#262626]" strokeWidth={2} aria-hidden />
                    </div>
                    <p className="w-full font-heading text-xl font-semibold leading-[1.4] text-white sm:text-2xl lg:text-[28px]">
                      {t(titleKey)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Partner with Brands — Figma: py-[60px] row, gap-40, 400² / 340×400 cards, rotateY flip */}
      <section className="border-t border-neutral-200 bg-[#f5f5f6] pt-11 sm:pt-12 md:pt-14">
        <div className="mx-auto max-w-[1600px] px-5 sm:px-8 md:px-10 lg:px-14 xl:px-16 2xl:px-[clamp(2.5rem,8vw,8.75rem)]">
          <h2 className="text-center font-heading text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl md:text-[2.5rem]">
            {t('home.partnerBrandsTitle')}
          </h2>
        </div>
        <div
          className="group/partner-brands relative mt-8 w-full overflow-hidden py-[60px] md:mt-10"
          role="region"
          aria-label={t('home.partnerBrandsTitle')}
        >
          <div
            className="partner-brands-mask-inner relative"
            style={{
              WebkitMaskImage:
                'linear-gradient(90deg, transparent 0%, #000 2.5%, #000 97.5%, transparent 100%)',
              maskImage:
                'linear-gradient(90deg, transparent 0%, #000 2.5%, #000 97.5%, transparent 100%)',
            }}
          >
            <div className="partner-brands-marquee-track flex w-max shrink-0 items-center gap-10 px-4 will-change-transform animate-partner-brands-marquee md:px-6">
              {[...PARTNER_BRAND_CARDS, ...PARTNER_BRAND_CARDS].map((card, i) => {
                const isDuplicateStrip = i >= PARTNER_BRAND_CARDS.length
                const isWide = i % 2 === 1
                const sizeClass = isWide
                  ? 'aspect-[340/400] w-[min(calc(100vw-2rem),340px)] sm:w-[340px]'
                  : 'aspect-square w-[min(calc(100vw-2rem),400px)] sm:w-[400px]'
                return (
                  <article
                    key={`${card.alt}-${i}`}
                    aria-hidden={isDuplicateStrip}
                    className={`partner-flip-root group/partner-card relative shrink-0 cursor-pointer overflow-hidden rounded-[56px] ring-1 ring-black/[0.06] ${sizeClass}`}
                  >
                    <div className="partner-flip-scene size-full">
                      <div className="partner-flip-inner relative size-full">
                        <div
                          className={`partner-flip-face partner-flip-front-face absolute inset-0 flex flex-col items-center justify-center gap-6 overflow-hidden rounded-[56px] px-4 ${card.surface}`}
                        >
                          <div className="relative flex h-8 shrink-0 items-center justify-center px-3">
                            <span
                              aria-hidden
                              className={`pointer-events-none absolute inset-0 rounded-[38px] border border-solid ${card.pillBorder}`}
                            />
                            <span
                              className={`relative font-hero text-[16px] font-bold leading-[1.2] whitespace-nowrap ${card.pillText}`}
                            >
                              {t(card.categoryKey)}
                            </span>
                          </div>
                          <div className="flex h-24 w-full max-w-[270px] shrink-0 items-center justify-center px-0 py-6">
                            <Image
                              src={card.src}
                              alt={isDuplicateStrip ? '' : card.alt}
                              width={220}
                              height={88}
                              className="h-auto max-h-14 w-auto max-w-[90%] object-contain sm:max-h-16"
                            />
                          </div>
                        </div>
                        <div className="partner-flip-face partner-flip-back-face absolute inset-0 overflow-hidden rounded-[56px] bg-neutral-200">
                          <Image
                            src={card.flipSrc}
                            alt=""
                            fill
                            className="object-cover object-center"
                            sizes="(max-width: 640px) 90vw, 400px"
                          />
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Our Creator Cases — horizontal reel of vertical story videos */}
      <section className="border-t border-neutral-200 bg-[#f4f4f5] py-12 sm:py-14 md:py-16" aria-labelledby="creator-cases-heading">
        <div className="mx-auto max-w-[1600px] px-5 sm:px-8 md:px-10 lg:px-14 xl:px-16 2xl:px-[clamp(2.5rem,8vw,8.75rem)]">
          <h2
            id="creator-cases-heading"
            className="mb-10 text-center font-heading text-3xl font-bold tracking-tight text-neutral-900 sm:mb-12 sm:text-4xl md:text-5xl"
          >
            {t('home.creatorCasesTitle')}
          </h2>
        </div>
        <div className="w-full snap-x snap-mandatory overflow-x-auto overflow-y-visible overscroll-x-contain px-5 pb-2 pt-1 [scrollbar-width:thin] sm:px-8 md:px-10 lg:px-14 xl:px-16 2xl:px-[clamp(2.5rem,8vw,8.75rem)]">
          <div className="mx-auto flex w-max gap-4 pb-2 pt-1 sm:gap-5 md:gap-6">
            {HOME_CREATOR_CASE_VIDEO_SRCS.map((src) => (
              <div key={src} className="snap-start shrink-0">
                <CreatorCaseVideoTile src={src} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
