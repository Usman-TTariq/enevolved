'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { HelpCircle, ChevronDown, Rocket } from 'lucide-react'
import { MarketingHeader } from '@/components/marketing/MarketingHeader'
import { PublishersHeroPanel } from '@/components/marketing/PublishersHeroPanel'
import { SiteFooter } from '@/components/common/SiteFooter'
import { useTranslations } from '@/contexts/LocaleContext'
import { HOME_HERO_REEL_VIDEO_SRC } from '@/lib/home-marketing-videos'

const PAGE_BG = '#D6E6F2'
const LABEL = '#2B75FF'

/** Homepage H.264 clips — sharp at large sizes vs. small PNG mocks upscaled with `next/image`. */
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

export default function PublishersPage() {
  const { t } = useTranslations()
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const featureRows = [
    {
      titleKey: 'publishers.featureNetworkTitle' as const,
      descKey: 'publishers.featureNetworkDesc' as const,
      videoSrc: '/home-hero/Model_steps_out_202604220234.mp4',
      imageLeft: true,
    },
    {
      titleKey: 'publishers.featureMonetizeTitle' as const,
      descKey: 'publishers.featureMonetizeDesc' as const,
      videoSrc: HOME_HERO_REEL_VIDEO_SRC,
      imageLeft: false,
    },
    {
      titleKey: 'publishers.featureCouponTitle' as const,
      descKey: 'publishers.featureCouponDesc' as const,
      videoSrc: '/home-creator-cases/1.mp4',
      imageLeft: true,
    },
    {
      titleKey: 'publishers.featureAnalyticsTitle' as const,
      descKey: 'publishers.featureAnalyticsDesc' as const,
      videoSrc: '/home-creator-cases/4.mp4',
      imageLeft: false,
    },
  ] as const

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: PAGE_BG }}>
      <MarketingHeader active="publishers" />
      <PublishersHeroPanel />

      {/* Feature strips */}
      <div className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-24 lg:gap-32">
          {featureRows.map((row) => (
            <div key={row.titleKey} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <div className={`relative aspect-[16/10] w-full max-w-xl overflow-hidden rounded-3xl bg-neutral-900 shadow-sm ring-1 ring-black/5 lg:max-w-none ${row.imageLeft ? 'lg:order-1' : 'lg:order-2'}`}>
                <FeatureStripVideo
                  src={row.videoSrc}
                  className="absolute inset-0 h-full w-full object-cover"
                />
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
          <p className="mb-4 text-center font-medium text-neutral-600">{t('publishers.joinPublishers')}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Bloggers', 'Coupon sites', 'Influencers', 'Content creators', 'YouTube', 'Social'].map((label) => (
              <span
                key={label}
                className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm"
              >
                {label}
              </span>
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
            <h2 className="text-3xl font-bold text-neutral-900 md:text-4xl">{t('publishers.howItWorks')}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-neutral-600">{t('publishers.howItWorksDesc')}</p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: '01',
                title: 'Sign up free',
                desc: 'Create your publisher account in minutes. Tell us about your site or channel; most applications are reviewed within 24–48 hours.',
              },
              {
                step: '02',
                title: 'Browse & apply to offers',
                desc: 'Search thousands of offers by category, commission type, and brand. Apply to programs that match your audience and get approved by advertisers.',
              },
              {
                step: '03',
                title: 'Share links & creatives',
                desc: 'Grab tracking links, banners, and promo codes from your dashboard. Use our deep link generator and API if you need custom integration.',
              },
              {
                step: '04',
                title: 'Earn & get paid',
                desc: 'Track clicks and conversions in real time. Once you hit the payout threshold, get paid weekly via your preferred method—bank, PayPal, or other options.',
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
              {t('publishers.earnYourWay')}
            </p>
            <h2 className="text-3xl font-bold text-neutral-900 md:text-4xl">{t('publishers.waysToEarn')}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-neutral-600">
              Different advertisers run different commission models. You can promote offers that pay per sale, per lead, per click, or a mix—whatever fits your audience.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                label: 'Commission per sale (CPS)',
                text: 'Earn a percentage or fixed amount every time someone buys through your link. Ideal for product reviews, deal sites, and e-commerce content.',
              },
              {
                label: 'Cost per lead (CPL)',
                text: 'Get paid for each qualified lead—sign-up, quote request, or form submit. Great for finance, insurance, and B2B content.',
              },
              {
                label: 'Cost per action (CPA)',
                text: 'Earn when users complete a specific action: trial sign-up, app install, or subscription. Suits SaaS, apps, and subscription brands.',
              },
              {
                label: 'Rev share',
                text: 'Ongoing commission on recurring revenue. Perfect if you promote subscriptions or membership products and want long-term earnings.',
              },
              {
                label: 'Coupons & promo codes',
                text: 'Share exclusive codes and earn when your audience uses them at checkout. Popular with deal and coupon sites.',
              },
              {
                label: 'Hybrid & bonuses',
                text: 'Many programs combine models or offer bonus tiers when you hit targets. More volume often means higher rates.',
              },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-[#2B75FF]/25">
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
              {t('publishers.offerCatalog')}
            </p>
            <h2 className="text-3xl font-bold text-neutral-900 md:text-4xl">{t('publishers.topCategories')}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-neutral-600">
              From fashion to finance, find offers that match your niche. New programs are added regularly across verticals.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: 'E-commerce & retail', desc: 'Fashion, electronics, home—earn on every sale you refer.' },
              { name: 'Finance & insurance', desc: 'High CPL offers for loans, insurance, and credit products.' },
              { name: 'Travel & booking', desc: 'Hotels, flights, packages—commission per booking.' },
              { name: 'Health & wellness', desc: 'Supplements, fitness, and wellness brands with recurring commissions.' },
              { name: 'Software & SaaS', desc: 'Trials and subscriptions with CPA or rev share.' },
              { name: 'Education & courses', desc: 'Online courses, certifications, and learning platforms.' },
              { name: 'Telecom & utilities', desc: 'Broadband, mobile, and energy switching offers.' },
              { name: 'Gaming & apps', desc: 'App installs and in-game offers with CPI and CPA.' },
            ].map((item) => (
              <div
                key={item.name}
                className="max-w-[280px] rounded-xl border border-neutral-200 bg-neutral-50/80 px-6 py-4 shadow-sm transition hover:border-[#2B75FF]/30"
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
          <div className="mb-14 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider" style={{ color: LABEL }}>
              {t('publishers.publisherToolsLabel')}
            </p>
            <h2 className="text-3xl font-bold text-neutral-900 md:text-4xl">{t('publishers.publisherTools')}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-neutral-600">
              Links, creatives, reporting, and support—all in one dashboard so you can focus on creating content and growing earnings.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
                title: 'Tracking links',
                desc: 'Generate unique links per offer and campaign. Use deep links for app and category pages.',
              },
              {
                icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
                title: 'Banners & creatives',
                desc: 'Download ready-made banners, text links, and product feeds. Coupon and promo code lists.',
              },
              {
                icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
                title: 'Reports & analytics',
                desc: 'Clicks, conversions, and earnings in real time. Export by date, offer, and traffic source.',
              },
              {
                icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
                title: 'API & deep links',
                desc: 'Integrate with your site or app. Build custom links and automate reporting via our API.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:border-[#2B75FF]/25">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[#2B75FF]/20 bg-[#2B75FF]/5">
                  <svg className="h-6 w-6 text-[#2B75FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </div>
                <h3 className="mb-2 font-bold text-neutral-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-neutral-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider" style={{ color: LABEL }}>
                {t('publishers.getPaidOnTime')}
              </p>
              <h2 className="mb-6 text-3xl font-bold text-neutral-900 md:text-4xl">{t('publishers.payoutOptions')}</h2>
              <p className="mb-6 text-neutral-600">
                We know timely payouts matter. Earnytics runs weekly payout cycles so you don’t wait months to see your earnings. Once your balance meets the minimum and is approved, you choose how you get paid.
              </p>
              <p className="mb-8 text-neutral-600">
                Multiple payment methods are supported—including bank transfer, PayPal, and other options depending on your region. Payout thresholds are clear in your dashboard, and you can view pending vs. approved earnings at any time.
              </p>
              <ul className="space-y-3">
                {['Weekly payout runs', 'Low minimum threshold', 'Bank transfer, PayPal & more', 'Clear pending vs. approved breakdown'].map((item) => (
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
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8 shadow-sm">
              <h3 className="mb-6 text-lg font-bold text-neutral-900">{t('publishers.publishersAtGlance')}</h3>
              <div className="space-y-6">
                {[
                  { stat: '1.5k+', label: 'Active publishers' },
                  { stat: '18,420+', label: 'Live offers' },
                  { stat: '$84K+', label: 'Commission paid (MTD)' },
                  { stat: '30 days', label: 'Avg. payout cycle' },
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

      <section className="border-y border-neutral-200/80 bg-neutral-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-neutral-900 md:text-4xl">{t('publishers.whyPublishersChoose')}</h2>
              <p className="mb-4 text-neutral-600">
                Simple sign-up, instant access to offers, and transparent reporting. Start promoting in minutes.
              </p>
              <p className="mb-8 text-sm text-neutral-500">
                Whether you run a blog, a coupon site, or a social channel, we give you the tools and the offers to monetize your traffic without lock-in or hidden fees. Your audience, your content—we just connect you with brands that pay for results.
              </p>
              <ul className="space-y-4">
                {[
                  'Access 100+ trusted brands. Pick offers that fit your audience.',
                  'Competitive commissions. Get paid for every sale you drive.',
                  'Real-time tracking & weekly payouts. No guesswork, no delays.',
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
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white p-10 shadow-sm">
              <div className="flex items-center gap-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-[#2B75FF]/20 bg-[#2B75FF]/5">
                  <svg className="h-10 w-10 text-[#2B75FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900">{t('publishers.shareLinksEarn')}</p>
                </div>
              </div>
              <p className="mt-8 max-w-[220px] text-center text-sm text-neutral-600">One link. Multiple brands. Your audience, your earnings.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider" style={{ color: LABEL }}>
              {t('publishers.whoCanJoin')}
            </p>
            <h2 className="text-3xl font-bold text-neutral-900 md:text-4xl">{t('publishers.builtForEveryPublisher')}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-neutral-600">Blog, coupon site, social, or YouTube—monetize your audience your way.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
                title: 'Content & bloggers',
                desc: 'Reviews, guides, articles. Turn traffic into affiliate earnings with simple links.',
              },
              {
                icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
                title: 'Coupons & deals',
                desc: 'Share discounts and promo codes. Earn when your audience clicks and buys.',
              },
              {
                icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
                title: 'Social & influencers',
                desc: 'Monetize your following. Creators earn with every sale they drive.',
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 rounded-2xl border border-neutral-200 bg-neutral-50/80 p-6 shadow-sm transition hover:border-[#2B75FF]/30">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#2B75FF]/20 bg-[#2B75FF]/5">
                  <svg className="h-6 w-6 text-[#2B75FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-bold text-neutral-900">{item.title}</h3>
                  <p className="text-sm text-neutral-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-neutral-200/80 bg-neutral-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-neutral-900 md:text-4xl">{t('publishers.trackEarnGetPaid')}</h2>
              <p className="mb-4 text-neutral-600">
                Real-time stats, weekly payouts, and a dashboard built for publishers. No black boxes—clear numbers and on-time payments.
              </p>
              <p className="mb-10 text-sm text-neutral-500">
                See exactly which links and offers perform. Filter by date, advertiser, or campaign so you can double down on what works. Our reporting is built for publishers who care about data, not just totals.
              </p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {[
                  { value: '1.5k+', label: 'Active publishers' },
                  { value: '30K+', label: 'Top brands' },
                  { value: 'Weekly', label: 'Payouts' },
                ].map((stat, i) => (
                  <div key={i} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                    <p className="mb-1 text-2xl font-bold text-[#2B75FF]">{stat.value}</p>
                    <p className="text-sm font-medium text-neutral-600">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative h-80 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-900 shadow-sm ring-1 ring-black/5 lg:h-[400px]">
              <FeatureStripVideo src="/home-creator-cases/3.mp4" className="absolute inset-0 h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-2 text-center text-sm font-semibold uppercase tracking-wider" style={{ color: LABEL }}>
            {t('publishers.publisherPerks')}
          </p>
          <h2 className="mb-14 text-center text-3xl font-bold text-neutral-900 md:text-4xl">{t('publishers.whyPublishersLove')}</h2>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
            {[
              {
                icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
                title: 'Quick approval',
                desc: 'Get approved fast. Start promoting within 24–48 hours.',
              },
              {
                icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
                title: 'Real-time tracking',
                desc: 'Clicks, conversions, earnings—live. No delayed reports.',
              },
              {
                icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2h-2m-4-1V7a2 2 0 012-2h2a2 2 0 012 2v1m-4 4h12',
                title: 'Flexible payouts',
                desc: 'Weekly payouts. No hoops, no blocking minimums.',
              },
              {
                icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z',
                title: 'Dedicated support',
                desc: 'Publisher-specific support. Real humans, real help.',
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-5 rounded-2xl border border-neutral-200 bg-neutral-50/80 p-6 shadow-sm transition hover:border-[#2B75FF]/30">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[#2B75FF]/20 bg-[#2B75FF]/5">
                  <svg className="h-7 w-7 text-[#2B75FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-bold text-neutral-900">{item.title}</h3>
                  <p className="text-neutral-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-neutral-200/80 bg-neutral-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
              <h3 className="mb-4 text-xl font-bold text-neutral-900">{t('publishers.contentGuidelines')}</h3>
              <p className="mb-4 text-sm text-neutral-600">
                We want you to promote in a way that builds trust with your audience and with advertisers. Follow each program’s terms—typically that means no misleading claims, no incentivized traffic where prohibited, and clear disclosure when you use affiliate links.
              </p>
              <p className="text-sm text-neutral-500">
                Our team can help you understand program-specific rules. When in doubt, ask your account manager or check the offer description in the dashboard.
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
              <h3 className="mb-4 text-xl font-bold text-neutral-900">{t('publishers.publisherSupport')}</h3>
              <p className="mb-4 text-sm text-neutral-600">
                Stuck on tracking, payouts, or which offer to pick? Our publisher support team is there to help. Get answers via email or in-dashboard chat, and access guides and FAQs so you can get the most out of the platform.
              </p>
              <p className="text-sm text-neutral-500">
                We also run webinars and send tips on best practices—from optimizing conversion rates to scaling with new verticals.
              </p>
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
                q: 'How long does publisher approval take?',
                a: 'Most applications are reviewed within 24–48 hours. Some advertisers may take a bit longer. You’ll get an email when you’re approved for a program, and you can start grabbing links and creatives right away.',
              },
              {
                q: 'Is there a minimum traffic requirement?',
                a: 'Requirements vary by advertiser. Many programs accept new or small publishers; others look for a certain level of traffic or content quality. Your dashboard shows which programs you qualify for.',
              },
              {
                q: 'When and how do I get paid?',
                a: 'We run weekly payouts. Once your balance reaches the minimum and is approved (after any hold period set by the advertiser), you can request payment via your chosen method—bank transfer, PayPal, or other options depending on your region.',
              },
              {
                q: 'Can I promote the same offer on multiple sites?',
                a: 'Yes, as long as each site is approved under your account or you’ve disclosed it to the advertiser. Some programs have rules about sub-IDs or multiple domains—check the offer terms.',
              },
              {
                q: 'Do you offer deep links and API access?',
                a: 'Yes. You can generate deep links for product and category pages, and use our API to build custom integrations. Documentation is available in the publisher dashboard under Tools.',
              },
              {
                q: 'What if I have a dispute or missing conversion?',
                a: 'Contact publisher support with the campaign and conversion details. We’ll work with the advertiser to verify tracking and resolve the issue. Our goal is fair and transparent reporting for everyone.',
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
            <span>{t('publishers.readyToEarn')}</span>
          </h2>
          <p className="mb-8 text-neutral-600">{t('home.joinThousands')}</p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/get-started"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2B75FF] px-8 py-4 font-semibold text-white shadow-lg shadow-[#2B75FF]/25 transition hover:bg-[#2566e0]"
            >
              {t('publishers.createPublisherAccount')}
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-8 py-4 font-semibold text-neutral-800 transition hover:border-[#2B75FF]/50 hover:text-[#2B75FF]"
            >
              {t('publishers.contactPublisherTeam')}
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
