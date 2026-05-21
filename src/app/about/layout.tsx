import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us | Earnytics',
  description: 'Learn about Earnytics – our mission, values, and approach to affiliate marketing.',
  alternates: {
    canonical: '/about',
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
