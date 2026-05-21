import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Boost your Sales with Top Affiliates | Join as an Advertiser',
  description:
    'Looking to grow through AI affiliate marketing? Earnytics helps advertisers reach targeted audiences, increase conversions, and drive measurable ROI through smart affiliate partnerships in the USA.',
  alternates: {
    canonical: '/advertisers',
  },
}

export default function AdvertisersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
