'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Sparkles } from 'lucide-react'
import { MarketingHeader } from '@/components/marketing/MarketingHeader'
import { SiteFooter } from '@/components/common/SiteFooter'
import { useTranslations } from '@/contexts/LocaleContext'
import { BLOG_POSTS } from '@/lib/blog-data'

const PAGE_BG = '#D6E6F2'

export default function BlogPage() {
  const { t } = useTranslations()
  const topicFilters = useMemo(() => {
    const cats = Array.from(new Set(BLOG_POSTS.map((p) => p.category))).sort((a, b) => a.localeCompare(b))
    return ['All', ...cats]
  }, [])
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredPosts =
    selectedCategory === 'All' ? BLOG_POSTS : BLOG_POSTS.filter((post) => post.category === selectedCategory)

  const featured = filteredPosts[0]
  const gridPosts = filteredPosts.slice(1)

  return (
    <div className="min-h-screen bg-white font-sans">
      <MarketingHeader active="blog" />

      <section className="border-b border-neutral-200/90 bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-600">{t('blogListing.pageEyebrow')}</p>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl lg:text-[2.35rem]">
            {t('blogListing.pageTitle')}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-neutral-700">{t('blogListing.pageSubtitle')}</p>
        </div>
      </section>

      <section className="border-b border-neutral-200/80 bg-neutral-50 py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {topicFilters.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition sm:px-5 ${
                  selectedCategory === category
                    ? 'bg-[#2B75FF] text-white shadow-md shadow-[#2B75FF]/25'
                    : 'border border-neutral-300 bg-white text-neutral-800 hover:border-[#2B75FF]/40 hover:text-[#2B75FF]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {featured ? (
        <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-6xl">
            <article className="overflow-hidden rounded-3xl border-2 border-neutral-200 bg-white shadow-md">
              <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-2 lg:items-center lg:gap-12 lg:p-10">
                <div className="min-w-0">
                  <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#2B75FF]/12 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#1a5fdc] ring-1 ring-[#2B75FF]/20">
                    <Sparkles className="size-3.5 shrink-0" aria-hidden />
                    {t('blogListing.featuredBadge')}
                  </span>
                  <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-3xl lg:text-[1.85rem]">
                    {featured.title}
                  </h2>
                  <p className="mt-4 line-clamp-4 text-base leading-relaxed text-neutral-700">{featured.excerpt}</p>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-500">
                    <span>{featured.date}</span>
                    <span aria-hidden>·</span>
                    <span>{featured.readTime}</span>
                  </div>
                  <Link
                    href={`/blog/${featured.id}`}
                    className="mt-8 inline-flex items-center justify-center rounded-full bg-[#2B75FF] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#2B75FF]/25 transition hover:bg-[#2566e0]"
                  >
                    {t('blogListing.learnMore')}
                  </Link>
                </div>
                <Link
                  href={`/blog/${featured.id}`}
                  className="relative order-first aspect-[16/10] min-h-[200px] w-full overflow-hidden rounded-2xl bg-neutral-100 ring-1 ring-black/5 lg:order-none lg:min-h-[280px]"
                >
                  <Image
                    src={featured.image}
                    alt=""
                    fill
                    className="object-cover object-center transition duration-300 hover:scale-[1.02]"
                    sizes="(max-width: 1024px) 100vw, 560px"
                    priority
                  />
                </Link>
              </div>
            </article>
          </div>
        </section>
      ) : null}

      {(gridPosts.length > 0 || !featured) && (
        <section className="bg-white px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-6xl">
            {gridPosts.length > 0 ? (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
                {gridPosts.map((post) => (
                  <article
                    key={post.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:border-[#2B75FF]/35 hover:shadow-md"
                  >
                    <Link href={`/blog/${post.id}`} className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-neutral-100">
                      <Image
                        src={post.image}
                        alt=""
                        fill
                        className="object-cover object-center transition duration-300 group-hover:scale-[1.03]"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-neutral-800 shadow-sm ring-1 ring-black/5">
                        {post.category}
                      </span>
                    </Link>
                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <div className="mb-2 flex flex-wrap gap-x-2 text-xs text-neutral-500">
                        <span>{post.date}</span>
                        <span aria-hidden>·</span>
                        <span>{post.readTime}</span>
                      </div>
                      <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold leading-snug text-neutral-900 sm:text-xl">
                        <Link href={`/blog/${post.id}`} className="transition hover:text-[#2B75FF]">
                          {post.title}
                        </Link>
                      </h3>
                      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-neutral-600">{post.excerpt}</p>
                      <Link
                        href={`/blog/${post.id}`}
                        className="mt-4 inline-flex text-sm font-semibold text-[#2B75FF] transition hover:text-[#1a5fdc]"
                      >
                        {t('blogListing.readMore')}
                        <span className="ml-1" aria-hidden>
                          →
                        </span>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="py-16 text-center text-lg text-neutral-600">{t('blogListing.noPosts')}</p>
            )}
          </div>
        </section>
      )}

      <section className="border-t border-neutral-200/80 py-16 lg:py-20" style={{ backgroundColor: PAGE_BG }}>
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">{t('blogListing.ctaTitle')}</h2>
          <p className="mt-4 text-neutral-700">{t('blogListing.ctaDesc')}</p>
          <Link
            href="/get-started"
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-[#2B75FF] px-10 py-4 text-sm font-semibold text-white shadow-lg shadow-[#2B75FF]/25 transition hover:bg-[#2566e0]"
          >
            {t('blogListing.getStarted')}
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
