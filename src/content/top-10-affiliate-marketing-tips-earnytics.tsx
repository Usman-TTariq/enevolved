import Link from 'next/link'

const tips = [
  'Choose offers that align with your audience and niche.',
  'Disclose affiliate relationships clearly on every post.',
  'Use deep links to product pages when possible.',
  'Create comparison and review content that solves real problems.',
  'Test headlines, CTAs, and placement on high-traffic pages.',
  'Diversify traffic across SEO, email, and social channels.',
  'Monitor EPC and conversion rate, not just click volume.',
  'Refresh old content with updated offers and screenshots.',
  'Negotiate exclusive codes or bonuses with merchants when you can.',
  'Partner with a network that pays on time and tracks accurately—like Earnytics.',
]

export default function Top10AffiliateMarketingTipsContent() {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      <p className="text-xl text-gray-600 dark:text-slate-400 leading-relaxed mb-8">
        Proven tactics from successful affiliates: focus on trust, data, and offers that convert. These ten tips help you grow revenue with Earnytics as your network.
      </p>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-10 mb-4">Top 10 Tips</h2>
      <ol className="list-decimal pl-6 text-gray-700 dark:text-slate-300 space-y-4 mb-8">
        {tips.map((tip, i) => (
          <li key={i}><strong className="text-gray-900 dark:text-white">Tip {i + 1}:</strong> {tip}</li>
        ))}
      </ol>
      <div className="mt-12 p-8 bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Apply These on Earnytics</h3>
        <p className="text-gray-700 dark:text-slate-300 mb-6">
          Access premium advertisers, real-time reporting, and reliable payouts in one platform.
        </p>
        <Link href="/publisher/register" className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-teal-600 transition-all duration-300 shadow-lg">
          Sign Up as Publisher
        </Link>
      </div>
    </div>
  )
}
