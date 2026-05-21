'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { getPostMeta } from '@/lib/blog-data'
import MaximizeAffiliateEarningsContent from '@/content/maximize-affiliate-earnings'
import Top10AffiliateMarketingTipsContent from '@/content/top-10-affiliate-marketing-tips-earnytics'
import EarnyticsCaseStudiesContent from '@/content/earnytics-case-studies'
import AffiliateMarketingBeginnerGuide2026Content from '@/content/affiliate-marketing-beginner-guide-2026'

function GettingStartedContent() {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      <p className="text-xl text-gray-600 dark:text-slate-400 leading-relaxed mb-8">
        Affiliate marketing has become one of the most popular ways to earn passive income online. Whether you&apos;re a blogger, content creator, or business owner, understanding the fundamentals can help you build a successful affiliate strategy.
      </p>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-10 mb-4">What is Affiliate Marketing?</h2>
      <p className="text-gray-700 dark:text-slate-300 mb-6">
        Affiliate marketing is a performance-based marketing strategy where you earn commissions by promoting other companies&apos; products or services. When someone makes a purchase through your unique affiliate link, you receive a percentage of the sale.
      </p>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-10 mb-4">How Does It Work?</h2>
      <p className="text-gray-700 dark:text-slate-300 mb-4">The affiliate marketing process involves four key players:</p>
      <ul className="list-disc pl-6 text-gray-700 dark:text-slate-300 space-y-2 mb-6">
        <li><strong>The Merchant:</strong> The company or brand selling the product</li>
        <li><strong>The Affiliate Network:</strong> The platform connecting merchants and affiliates (like Earnytics)</li>
        <li><strong>The Affiliate (You):</strong> The publisher promoting the products</li>
        <li><strong>The Customer:</strong> The end user who makes a purchase</li>
      </ul>
      <div className="my-8 p-6 bg-cyan-50 dark:bg-slate-800 border-l-4 border-cyan-500 rounded-r-lg">
        <p className="text-gray-800 dark:text-slate-200">
          <strong>Pro Tip:</strong> Start with products or services you already use and trust. Authentic recommendations convert better than generic promotions.
        </p>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-10 mb-4">Steps to Get Started</h2>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">1. Choose Your Niche</h3>
      <p className="text-gray-700 dark:text-slate-300 mb-6">
        Focus on a specific topic or industry where you have expertise or genuine interest. Popular niches include technology, health &amp; wellness, fashion, and personal finance. A focused niche helps you build authority and attract a targeted audience.
      </p>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">2. Join an Affiliate Network</h3>
      <p className="text-gray-700 dark:text-slate-300 mb-6">
        Sign up with reputable affiliate networks like Earnytics that offer transparent tracking, reliable payouts, and a wide range of quality merchants. Look for networks that provide: Real-time performance tracking, competitive commission rates, on-time payments, dedicated support.
      </p>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">3. Create Quality Content</h3>
      <p className="text-gray-700 dark:text-slate-300 mb-6">
        Whether it&apos;s blog posts, videos, social media content, or email newsletters, focus on providing value to your audience. Your content should educate, inform, or entertain—not just sell. When you naturally incorporate affiliate links into valuable content, your conversion rates improve significantly.
      </p>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">4. Drive Traffic</h3>
      <p className="text-gray-700 dark:text-slate-300 mb-6">
        Use multiple channels to attract visitors: SEO, social media, email marketing, and paid ads. Optimize content for search engines and share on platforms where your audience spends time.
      </p>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">5. Track and Optimize</h3>
      <p className="text-gray-700 dark:text-slate-300 mb-6">
        Monitor your performance metrics closely. Track which content performs best, which products convert well, and where your traffic comes from. Use this data to refine your strategy and double down on what works.
      </p>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-10 mb-4">Common Mistakes to Avoid</h2>
      <ul className="list-disc pl-6 text-gray-700 dark:text-slate-300 space-y-3 mb-6">
        <li><strong>Promoting too many products:</strong> Focus on quality over quantity</li>
        <li><strong>Ignoring disclosure requirements:</strong> Always disclose affiliate relationships</li>
        <li><strong>Not building an audience first:</strong> Focus on value before monetization</li>
        <li><strong>Giving up too soon:</strong> Affiliate success takes time and consistency</li>
      </ul>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-10 mb-4">Final Thoughts</h2>
      <p className="text-gray-700 dark:text-slate-300 mb-6">
        Affiliate marketing offers incredible potential for passive income, but it requires dedication, strategic planning, and authentic engagement with your audience. Start small, learn continuously, and scale as you gain experience. With platforms like Earnytics providing the tools and support you need, you&apos;re well-equipped to succeed.
      </p>
      <div className="mt-12 p-8 bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Ready to Start Your Affiliate Journey?</h3>
        <p className="text-gray-700 dark:text-slate-300 mb-6">
          Join Earnytics today and get access to thousands of premium advertisers, real-time tracking, and reliable payouts.
        </p>
        <Link href="/publisher/register" className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-teal-600 transition-all duration-300 shadow-lg">
          Sign Up as Publisher
        </Link>
      </div>
    </div>
  )
}

export default function BlogPostPage() {
  const params = useParams()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const id = typeof params?.id === 'string' ? params.id : ''
  const post = getPostMeta(id)

  if (!post) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Post not found</h1>
          <Link href="/blog" className="text-cyan-500 hover:text-cyan-400 font-medium">Back to Blog</Link>
        </div>
      </div>
    )
  }

  const isMaximizePost = id === 'how-to-maximize-affiliate-earnings-earnytics-2026'
  const isTop10TipsPost = id === 'top-10-affiliate-marketing-tips-grow-revenue-earnytics'
  const isCaseStudiesPost = id === 'earnytics-case-studies-real-results-affiliate-campaigns'
  const isGettingStarted = id === '1'
  const isAffiliateBeginnerGuidePost = id === 'affiliate-marketing-beginner-guide-2026'

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">Earnytics</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">Home</Link>
              <Link href="/advertisers" className="text-gray-700 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">For Advertisers</Link>
              <Link href="/publishers" className="text-gray-700 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">For Publishers</Link>
              <Link href="/about" className="text-gray-700 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">About</Link>
              <Link href="/blog" className="text-cyan-500 dark:text-cyan-400 font-medium transition-colors">Blog</Link>
              <Link href="/contact" className="text-gray-700 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">Contact</Link>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
              <svg className="w-6 h-6 text-gray-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 space-y-3">
            <Link href="/" className="block text-gray-700 dark:text-slate-300 hover:text-cyan-500">Home</Link>
            <Link href="/advertisers" className="block text-gray-700 dark:text-slate-300 hover:text-cyan-500">For Advertisers</Link>
            <Link href="/publishers" className="block text-gray-700 dark:text-slate-300 hover:text-cyan-500">For Publishers</Link>
            <Link href="/about" className="block text-gray-700 dark:text-slate-300 hover:text-cyan-500">About</Link>
            <Link href="/blog" className="block text-cyan-500 font-medium">Blog</Link>
            <Link href="/contact" className="block text-gray-700 dark:text-slate-300 hover:text-cyan-500">Contact</Link>
          </div>
        )}
      </nav>

      <article className="py-12 lg:py-16 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 mb-6">
            <Link href="/blog" className="hover:text-cyan-500">Blog</Link>
            <span>/</span>
            <span className="text-gray-700 dark:text-slate-300">{post.title}</span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <span className="inline-block px-3 py-1 bg-cyan-500 text-white text-xs font-semibold rounded-full">{post.category}</span>
            <span className="text-sm text-gray-500 dark:text-slate-400">{post.date} · {post.readTime}</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">{post.title}</h1>
          <div className="flex items-center gap-3 pb-8 border-b border-gray-200 dark:border-slate-700">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 flex items-center justify-center text-white font-bold text-lg">
              {post.author.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{post.author}</p>
              <p className="text-sm text-gray-500 dark:text-slate-400">Earnytics</p>
            </div>
          </div>
          <div className="my-8 rounded-2xl overflow-hidden">
            <img src={post.image} alt={post.title} className="w-full h-auto" />
          </div>

          {isMaximizePost && <MaximizeAffiliateEarningsContent />}
          {isTop10TipsPost && <Top10AffiliateMarketingTipsContent />}
          {isCaseStudiesPost && <EarnyticsCaseStudiesContent />}
          {isGettingStarted && <GettingStartedContent />}
          {isAffiliateBeginnerGuidePost && <AffiliateMarketingBeginnerGuide2026Content />}
          {!isMaximizePost && !isTop10TipsPost && !isCaseStudiesPost && !isGettingStarted && !isAffiliateBeginnerGuidePost && (
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-slate-400">This article is coming soon. Check back later or explore other posts.</p>
              <Link href="/blog" className="inline-block mt-4 text-cyan-500 hover:text-cyan-400 font-medium">Back to Blog</Link>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-slate-700">
            <Link href="/blog" className="inline-flex items-center gap-2 text-cyan-500 hover:text-cyan-400 font-medium">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back to Blog
            </Link>
          </div>
        </div>
      </article>

      <footer className="bg-slate-900 text-slate-300 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent mb-4">Earnytics</h3>
              <p className="text-sm text-slate-400 mb-4">Your trusted affiliate network for transparent partnerships and reliable payouts.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Explore More</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link></li>
                <li><Link href="/about" className="hover:text-cyan-400 transition-colors">About</Link></li>
                <li><Link href="/blog" className="hover:text-cyan-400 transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal Information</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/imprint" className="hover:text-cyan-400 transition-colors">Imprint</Link></li>
                <li><Link href="/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-cyan-400 transition-colors">Terms & Conditions</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Get Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:partner@earnytics.com" className="hover:text-cyan-400 transition-colors">partner@earnytics.com</a></li>
                <li><a href="mailto:support@earnytics.com" className="hover:text-cyan-400 transition-colors">support@earnytics.com</a></li>
                <li><a href="tel:+18472087685" className="hover:text-cyan-400 transition-colors">+1 847 208 7685</a></li>
                <li className="pt-2">734 S Charlotte St<br/>Lombard, IL 60148</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 text-center text-sm text-slate-400">
            <p>© {new Date().getFullYear()} EARNYTICS LLC. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
