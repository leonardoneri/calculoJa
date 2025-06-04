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
    sitemap: 'https://www.calculoja.com/sitemap.xml',
  }
}
