import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

export interface Post {
  slug: string
  title: string
  description: string
  date: string
  content: string
}

const postsDirectory = path.join(process.cwd(), 'content/blog')

export async function getAllPosts(): Promise<Post[]> {
  try {
    const fileNames = await fs.readdir(postsDirectory)
    const posts = await Promise.all(
      fileNames.map(async (file) => {
        const slug = file.replace(/\.mdx?$/, '')
        return getPostBySlug(slug)
      })
    )
    return posts
      .filter((post): post is Post => post !== undefined)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch (error) {
    console.error('Error getting posts:', error)
    return []
  }
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.mdx`)
    const fileContents = await fs.readFile(fullPath, 'utf8')
    const { data, content } = matter(fileContents)
    return {
      slug,
      title: data.title || slug,
      description: data.description || '',
      date: data.date || '',
      content,
    }
  } catch (error) {
    console.error(`Error getting post ${slug}:`, error)
    return undefined
  }
}
