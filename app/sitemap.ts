import { MetadataRoute } from 'next'
import { getAllCalculators } from '@/lib/calculators'
import fs from 'fs/promises'
import path from 'path'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://xn--clculoj-hwag.com.br'
  const calculators = await getAllCalculators()

  const calculatorsDir = path.join(process.cwd(), 'content/calculators')

  const calculatorUrls = await Promise.all(
    calculators.map(async (calculator) => {
      const filePath = path.join(calculatorsDir, `${calculator.slug}.mdx`)
      let mtime = new Date()
      try {
        const stats = await fs.stat(filePath)
        mtime = stats.mtime
      } catch {
        // ignore errors and use current date
      }

      return {
        url: `${baseUrl}/calculadora/${calculator.slug}`,
        lastModified: mtime.toISOString(),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      }
    })
  )

  const latestCalculatorDate = calculatorUrls.reduce<Date>((latest, item) => {
    const d = new Date(item.lastModified)
    return d > latest ? d : latest
  }, new Date(0))

  const lastMod = latestCalculatorDate.toISOString()
  
  // URLs para categorias
  const categoryUrls = [
    {
      url: `${baseUrl}/categoria/health`,
      lastModified: lastMod,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/categoria/finance`,
      lastModified: lastMod,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/categoria/business`,
      lastModified: lastMod,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/categoria/conversion`,
      lastModified: lastMod,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/recursos-humanos`,
      lastModified: lastMod,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/emprestimos-financiamentos`,
      lastModified: lastMod,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ]
  
  // URLs estáticas
  const staticUrls = [
    {
      url: baseUrl,
      lastModified: lastMod,
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/sobre`,
      lastModified: lastMod,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ]
  
  return [...staticUrls, ...categoryUrls, ...calculatorUrls]
} 