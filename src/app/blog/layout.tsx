import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog | Earnytics',
  description: 'Earnytics blog – guides, strategies, and best practices for affiliate marketing.',
  alternates: {
    canonical: '/blog',
  },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
