'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { TrendingUp, Shield, BarChart3, Globe } from 'lucide-react'
import { useTranslations } from '@/contexts/LocaleContext'
import { HOME_CREATOR_CASE_VIDEO_SRCS } from '@/lib/home-marketing-videos'

const ACCENT = '#5496ff'
const NAVY = '#262626'

function CollageVideo({ src, className }: { src: string; className?: string }) {
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
      { threshold: 0.15, rootMargin: '80px' }
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

const BRAND_STRIP = [
  '/home-partner-brands/flip-1.png',
  '/home-partner-brands/flip-2.png',
  '/home-partner-brands/flip-3.png',
  '/home-partner-brands/flip-4.png',
] as const

export function AdvertisersHeroPanel() {
  const { t } = useTranslations()
  const [, , , v3, v4, v5] = HOME_CREATOR_CASE_VIDEO_SRCS

  return (
    <section className="px-4 pb-8 pt-6 sm:px-6 lg:px-8 lg:pb-12 lg:pt-8">
      <div className="mx-auto max-w-[min(100rem,calc(100vw-2rem))] overflow-hidden rounded-[2.5rem] bg-[#f5f5f5] lg:rounded-[3rem]">
        <div className="flex flex-col gap-10 px-5 py-10 pl-6 pr-5 sm:px-8 sm:py-12 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:pl-14 lg:pr-0 lg:pt-14 lg:pb-10">
          <div className="max-w-xl shrink-0 space-y-8 lg:max-w-[26rem] xl:max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-neutral-500">{t('advertisers.heroFor')}</p>
            <h1
              className="font-[family-name:var(--font-heading)] text-3xl font-bold leading-snug tracking-tight sm:text-4xl lg:text-[2.35rem] xl:text-[2.65rem]"
              style={{ color: NAVY }}
            >
              <span style={{ color: ACCENT }} className="block">
                {t('advertisers.pageHeroAccent')}
              </span>
              <span className="block">{t('advertisers.pageHeroLine2')}</span>
              <span className="block">{t('advertisers.pageHeroLine3')}</span>
              <span className="block">{t('advertisers.pageHeroLine4')}</span>
            </h1>
            <p className="max-w-md text-lg leading-relaxed text-neutral-600">{t('advertisers.heroDesc')}</p>
            <Link
              href="/get-started"
              className="inline-flex h-14 items-center justify-center rounded-full bg-[#7db3ff] px-10 text-lg font-medium text-[#262626] transition-colors hover:border hover:border-[#2B75FF] hover:bg-white hover:text-[#2B75FF]"
            >
              {t('advertisers.pageHeroCta')}
            </Link>
          </div>

          <div className="relative min-h-[420px] w-full max-w-[38rem] shrink lg:max-w-none lg:flex-1 lg:pr-8 xl:pr-14">
            <div className="relative mx-auto flex h-full min-h-[420px] w-full max-w-md items-center justify-end gap-2 sm:max-w-lg lg:mx-0 lg:max-w-none lg:justify-center lg:gap-3">
              <div className="absolute left-0 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-4 sm:left-1">
                {BRAND_STRIP.map((src) => (
                  <div
                    key={src}
                    className="relative size-[3.25rem] overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 sm:size-[3.75rem]"
                  >
                    <Image src={src} alt="" fill className="object-cover" sizes="60px" />
                  </div>
                ))}
              </div>

              <div className="relative ml-14 flex flex-1 justify-center sm:ml-16 lg:ml-20">
                <div className="grid w-full max-w-[28rem] grid-cols-2 gap-2 sm:max-w-[32rem] sm:gap-3 lg:max-w-[36rem]">
                  <div className="flex flex-col gap-2 sm:gap-3">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                      <CollageVideo src={v5} className="absolute inset-0 h-full w-full object-cover" />
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl bg-[#bef7be]/90 px-3 py-2.5 backdrop-blur-sm ring-1 ring-black/5 sm:px-4 sm:py-3">
                      <TrendingUp className="size-5 shrink-0 text-[#262626] sm:size-6" strokeWidth={1.75} aria-hidden />
                      <span className="font-[family-name:var(--font-heading)] text-base font-medium capitalize text-[#262626] sm:text-lg">
                        {t('advertisers.catPerformance')}
                      </span>
                    </div>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                      <Image
                        src="/home-influencers/influencer-2.png"
                        alt=""
                        fill
                        className="object-cover object-top"
                        sizes="200px"
                      />
                    </div>
                    <div className="flex items-start justify-between gap-2 rounded-2xl bg-[#e8e0ff]/95 px-3 py-3 backdrop-blur-sm ring-1 ring-black/5 sm:px-4">
                      <span className="font-[family-name:var(--font-heading)] text-base font-medium capitalize leading-snug text-[#262626] sm:text-lg">
                        {t('advertisers.catReporting')}
                      </span>
                      <BarChart3 className="size-6 shrink-0 text-[#262626] opacity-80 sm:size-7" strokeWidth={1.75} aria-hidden />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 rounded-2xl bg-[#ffd8e3]/95 px-3 py-2.5 ring-1 ring-black/5 sm:px-4 sm:py-3">
                      <Shield className="size-5 shrink-0 text-[#262626] sm:size-6" strokeWidth={1.75} aria-hidden />
                      <span className="font-[family-name:var(--font-heading)] text-base font-medium capitalize text-[#262626] sm:text-lg">
                        {t('advertisers.catBrandSafe')}
                      </span>
                    </div>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                      <CollageVideo src={v4} className="absolute inset-0 h-full w-full object-cover" />
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl bg-[#fff7a0] px-3 py-2.5 ring-1 ring-black/5 sm:px-4 sm:py-3">
                      <Globe className="size-5 shrink-0 text-[#262626] sm:size-6" strokeWidth={1.75} aria-hidden />
                      <span className="font-[family-name:var(--font-heading)] text-base font-medium capitalize text-[#262626] sm:text-lg">
                        {t('advertisers.catGlobal')}
                      </span>
                    </div>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                      <CollageVideo src={v3} className="absolute inset-0 h-full w-full object-cover" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
