import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/*', '/_next/*', '/admin/*'],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/ads.txt'],
      },
      {
        userAgent: 'Mediapartners-Google',
        allow: ['/ads.txt', '/'],
      }
    ],
    sitemap: 'https://xn--clculoj-hwag.com.br/sitemap.xml',
  }
} 