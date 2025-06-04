import type { Metadata } from 'next'
import { getAllPosts } from '@/lib/posts'
import BlogPostCard from '@/components/blog/BlogPostCard'

export const metadata: Metadata = {
  title: 'Blog - CálculoJá',
  description: 'Artigos e dicas sobre calculadoras e matemática para o dia a dia.'
}

export default async function BlogPage() {
  const posts = await getAllPosts()

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Blog</h1>
        <p className="text-lg text-gray-600">Dicas e artigos sobre nossas calculadoras e temas relacionados.</p>
      </div>

      {posts.length === 0 ? (
        <p className="text-center">Nenhum artigo encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map(post => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
