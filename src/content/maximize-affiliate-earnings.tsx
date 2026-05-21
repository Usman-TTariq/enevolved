import Link from 'next/link'

export default function MaximizeAffiliateEarningsContent() {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      <p className="text-xl text-gray-600 dark:text-slate-400 leading-relaxed mb-8">
        Maximizing affiliate earnings in 2026 means combining the right offers, clear tracking, and consistent optimization. Earnytics gives publishers real-time data and reliable payouts so you can scale what works.
      </p>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-10 mb-4">Start with the Right Offers</h2>
      <p className="text-gray-700 dark:text-slate-300 mb-6">
        Promote merchants that match your audience and pay competitive commissions. Use Earnytics to compare EPC, conversion rates, and cookie windows before you commit traffic.
      </p>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-10 mb-4">Optimize Links and Landing Pages</h2>
      <p className="text-gray-700 dark:text-slate-300 mb-6">
        Test placement, CTAs, and deep links. Send users to relevant product pages instead of generic homepages when the network allows it.
      </p>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-10 mb-4">Track, Learn, and Scale</h2>
      <p className="text-gray-700 dark:text-slate-300 mb-6">
        Review clicks, conversions, and revenue by campaign weekly. Double down on top performers and pause underperforming links.
      </p>
      <div className="mt-12 p-8 bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Grow with Earnytics</h3>
        <p className="text-gray-700 dark:text-slate-300 mb-6">
          Join as a publisher for transparent tracking, quality advertisers, and on-time payouts.
        </p>
        <Link href="/publisher/register" className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-teal-600 transition-all duration-300 shadow-lg">
          Sign Up as Publisher
        </Link>
      </div>
    </div>
  )
}
