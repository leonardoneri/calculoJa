import { MetadataRoute } from 'next'
import { getAllCalculators } from '@/lib/calculators'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.calculoja.com'
  const calculators = await getAllCalculators()
  
  // Data fixa para lastModified (atualizar periodicamente)
  const lastMod = new Date('2023-05-15').toISOString()
  
  // URLs para calculadoras
  const calculatorUrls = calculators.map((calculator) => ({
    url: `${baseUrl}/calculadora/${calculator.slug}`,
    lastModified: lastMod,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))
  
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