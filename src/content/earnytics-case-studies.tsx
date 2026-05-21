import Link from 'next/link'

const cases = [
  {
    title: 'Finance publisher — 34% revenue lift',
    summary: 'Switched underperforming finance offers to higher-EPC programs on Earnytics and optimized comparison pages. Revenue rose 34% in 90 days with the same traffic.',
  },
  {
    title: 'Lifestyle blog — 2.1× conversion rate',
    summary: 'Replaced generic homepage links with deep links and added honest product reviews. Conversion rate doubled while maintaining audience trust.',
  },
  {
    title: 'Coupon site — faster payouts, fewer disputes',
    summary: 'Consolidated fragmented networks into Earnytics for unified reporting and on-time payments, reducing operational overhead.',
  },
]

export default function EarnyticsCaseStudiesContent() {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      <p className="text-xl text-gray-600 dark:text-slate-400 leading-relaxed mb-8">
        Real campaigns on Earnytics show how publishers improve ROI with better offers, tracking, and optimization—not guesswork.
      </p>
      {cases.map((c) => (
        <div key={c.title} className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">{c.title}</h2>
          <p className="text-gray-700 dark:text-slate-300">{c.summary}</p>
        </div>
      ))}
      <div className="mt-12 p-8 bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Build Your Next Case Study</h3>
        <p className="text-gray-700 dark:text-slate-300 mb-6">
          Join Earnytics and use the same tools top publishers rely on for measurable growth.
        </p>
        <Link href="/publisher/register" className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-teal-600 transition-all duration-300 shadow-lg">
          Sign Up as Publisher
        </Link>
      </div>
    </div>
  )
}
