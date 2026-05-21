import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Join Earnytics as a Publisher For Premium Brands',
  description:
    'Earn more as an Earnytics publisher. Promote 100+ trusted brands, track clicks and conversions in real time, and get paid weekly. Built for bloggers, influencers, and coupon sites.',
  alternates: {
    canonical: '/publishers',
  },
}

export default function PublishersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
