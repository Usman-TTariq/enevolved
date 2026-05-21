import type { Metadata } from 'next'
import { getPostMeta } from '@/lib/blog-data'

type Props = { params: Promise<{ id: string }>; children: React.ReactNode }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const post = getPostMeta(id)
  if (!post) return { title: 'Post not found | Earnytics' }
  const metaTitle = post.metaTitle ?? `${post.title} | Earnytics`
  const metaDescription = post.metaDescription ?? post.excerpt
  return {
    title: metaTitle,
    description: metaDescription,
    alternates: {
      canonical: `/blog/${id}`,
    },
  }
}

export default function BlogPostLayout({ children }: Props) {
  return <>{children}</>
}
