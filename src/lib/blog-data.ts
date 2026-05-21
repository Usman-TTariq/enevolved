/**
 * Blog list and meta for list + detail pages. Content for each post is rendered in blog/[id]/page.
 */
export type BlogPostMeta = {
  id: string
  title: string
  excerpt: string
  category: string
  date: string
  author: string
  readTime: string
  image: string
  metaTitle?: string
  metaDescription?: string
}

export const BLOG_POSTS: BlogPostMeta[] = [
  {
    id: 'affiliate-marketing-beginner-guide-2026',
    title: 'Affiliate Marketing in 2026: A Beginner\'s Guide to Earning Online',
    excerpt: 'Learn what affiliate marketing services are, and how they work. A simple guide to start affiliate marketing in 2026 as a complete beginner.',
    category: 'Guide',
    date: 'March 12, 2026',
    author: 'Earnytics Team',
    readTime: '14 min read',
    image: '/Image%20(4).png',
    metaTitle: 'Comprehensive Affiliate Marketing Services: Beginner Guide 2026',
    metaDescription: 'Learn what affiliate marketing services are, and how they work. Here is a simple guide to start affiliate marketing in 2026 as a complete beginner.',
  },
  {
    id: 'earnytics-case-studies-real-results-affiliate-campaigns',
    title: 'Earnytics Case Studies: Real Results from Successful Affiliate Campaigns',
    excerpt: 'Explore the case studies of a leading affiliate marketing agency featuring real affiliate marketing results, ROI breakdowns, and scalable campaign strategies.',
    category: 'Case Studies',
    date: 'February 27, 2026',
    author: 'Earnytics Team',
    readTime: '14 min read',
    image: '/image%20(2).png',
    metaTitle: 'Affiliate Marketing Agency Real Results: Earnytics Case Studies',
    metaDescription: 'Explore the case studies of a leading affiliate marketing agency featuring real affiliate marketing results, ROI breakdowns, and scalable campaign strategies.',
  },
  {
    id: 'top-10-affiliate-marketing-tips-grow-revenue-earnytics',
    title: 'Top 10 Affiliate Marketing Tips to Grow Revenue Using Earnytics',
    excerpt: 'Learn proven strategies from an expert affiliate marketing agency to grow revenue, increase conversions, and scale with Earnytics.',
    category: 'Strategy',
    date: 'February 27, 2026',
    author: 'Earnytics Team',
    readTime: '12 min read',
    image: '/image%20(1).png',
    metaTitle: 'Top 10 Affiliate Marketing Tips to Grow Revenue Using Earnytics',
    metaDescription: 'Learn proven strategies from an expert affiliate marketing agency to grow revenue, increase conversions, and scale with Earnytics.',
  },
  {
    id: 'how-to-maximize-affiliate-earnings-earnytics-2026',
    title: 'How to Maximize Your Affiliate Earnings with Earnytics: A Beginner\'s Guide',
    excerpt: 'Learn how beginners can maximize affiliate earnings using the AI-powered affiliate marketing platform: Earnytics. Boost conversions, optimize links, and scale revenue smarter.',
    category: 'Guide',
    date: 'February 27, 2026',
    author: 'Earnytics Team',
    readTime: '15 min read',
    image: '/undefined%20(2).png',
    metaTitle: 'How to Maximize Your Affiliate Earnings with Earnytics (2026)?',
    metaDescription: 'Learn how beginners can maximize affiliate earnings using the AI-powered affiliate marketing platform: Earnytics. Boost conversions, optimize links, and scale revenue smarter.',
  },
  {
    id: '1',
    title: 'Getting Started with Affiliate Marketing: A Complete Guide',
    excerpt: 'Learn the fundamentals of affiliate marketing and how to build a successful strategy from day one.',
    category: 'Guide',
    date: 'February 1, 2026',
    author: 'Sarah Johnson',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    metaTitle: 'Getting Started with Affiliate Marketing | Earnytics',
    metaDescription: 'Learn the fundamentals of affiliate marketing and how to build a successful strategy from day one.',
  },
  {
    id: '2',
    title: 'Top 10 Strategies to Boost Your Affiliate Commissions',
    excerpt: 'Discover proven tactics that successful affiliates use to maximize their earnings and grow their business.',
    category: 'Strategy',
    date: 'January 28, 2026',
    author: 'Michael Chen',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    metaTitle: 'Top 10 Strategies to Boost Affiliate Commissions | Earnytics',
    metaDescription: 'Discover proven tactics that successful affiliates use to maximize their earnings and grow their business.',
  },
  {
    id: '3',
    title: 'Understanding Analytics: Track What Matters',
    excerpt: 'Deep dive into the key metrics every affiliate should monitor to optimize their performance.',
    category: 'Analytics',
    date: 'January 25, 2026',
    author: 'Emily Rodriguez',
    readTime: '10 min read',
    image: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=800&q=80',
    metaTitle: 'Understanding Analytics for Affiliates | Earnytics',
    metaDescription: 'Deep dive into the key metrics every affiliate should monitor to optimize their performance.',
  },
  {
    id: '4',
    title: 'Building Trust with Your Audience: Best Practices',
    excerpt: 'Learn how transparency and authenticity can transform your affiliate marketing results.',
    category: 'Best Practices',
    date: 'January 22, 2026',
    author: 'David Park',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
    metaTitle: 'Building Trust with Your Audience | Earnytics',
    metaDescription: 'Learn how transparency and authenticity can transform your affiliate marketing results.',
  },
  {
    id: '5',
    title: 'SEO for Affiliates: Ranking Your Content in 2026',
    excerpt: 'Stay ahead with the latest SEO strategies tailored for affiliate marketing content.',
    category: 'SEO',
    date: 'January 18, 2026',
    author: 'Lisa Thompson',
    readTime: '12 min read',
    image: 'https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=800&q=80',
    metaTitle: 'SEO for Affiliates 2026 | Earnytics',
    metaDescription: 'Stay ahead with the latest SEO strategies tailored for affiliate marketing content.',
  },
  {
    id: '6',
    title: 'Choosing the Right Niche: A Data-Driven Approach',
    excerpt: 'Use market research and data to select a profitable niche for your affiliate business.',
    category: 'Strategy',
    date: 'January 15, 2026',
    author: 'James Wilson',
    readTime: '9 min read',
    image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&q=80',
    metaTitle: 'Choosing the Right Affiliate Niche | Earnytics',
    metaDescription: 'Use market research and data to select a profitable niche for your affiliate business.',
  },
]

export type BlogPostId = BlogPostMeta['id']

export function getPostMeta(id: string): BlogPostMeta | null {
  return BLOG_POSTS.find((p) => p.id === id) ?? null
}
