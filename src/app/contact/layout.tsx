import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact | Earnytics',
  description: 'Get in touch with Earnytics – support and partnership inquiries.',
  alternates: {
    canonical: '/contact',
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
