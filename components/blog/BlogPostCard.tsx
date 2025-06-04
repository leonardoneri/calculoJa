import Link from 'next/link'
import type { Post } from '@/lib/posts'
import { ArrowRight } from 'lucide-react'

interface BlogPostCardProps {
  post: Post
}

export default function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{post.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{post.description}</p>
        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          aria-label={`Ler artigo ${post.title}`}
        >
          Ler artigo <ArrowRight size={16} className="ml-1" />
        </Link>
      </div>
    </div>
  )
}
