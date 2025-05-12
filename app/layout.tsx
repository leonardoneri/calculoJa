import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Analytics } from "@/components/Analytics"
import { Providers } from "@/components/Providers"
import { Suspense } from "react"
import Script from "next/script"

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap", // Otimiza a renderização da fonte
  preload: true
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ffffff'
}

export const metadata: Metadata = {
  title: "CálculoJá | Calculadoras Online Especializadas",
  description: "CálculoJá oferece mais de 25 calculadoras especializadas gratuitas para facilitar seu dia a dia: IMC, juros compostos, conversão de moedas e muito mais.",
  keywords: "calculadoras online, imc, juros compostos, conversão de moedas, cálculo já, calculadora financeira, calculadora de negócios, calculadora de saúde",
  generator: 'Next.js',
  applicationName: 'CálculoJá',
  referrer: 'origin-when-cross-origin',
  authors: [{ name: 'CálculoJá' }],
  colorScheme: 'light',
  creator: 'CálculoJá',
  publisher: 'CálculoJá',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://xn--clculoj-hwag.com.br'),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-video-preview': -1,
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'CálculoJá | Calculadoras Online Especializadas',
    description: 'CálculoJá oferece mais de 25 calculadoras especializadas gratuitas: IMC, juros compostos, conversão de moedas e muito mais.',
    url: 'https://xn--clculoj-hwag.com.br',
    siteName: 'CálculoJá',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: '/calculoja-og.png', // Você precisará criar esta imagem
        width: 1200,
        height: 630,
        alt: 'CálculoJá - Calculadoras Online',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CálculoJá | Calculadoras Online Especializadas',
    description: 'CálculoJá oferece mais de 25 calculadoras especializadas gratuitas para facilitar seu dia a dia.',
    images: ['/calculoja-og.png'],
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/calculoja-icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/calculoja-icon.svg" />
        <link rel="manifest" href="/manifest.json" />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2877556290224566"
          crossOrigin="anonymous"
          strategy="lazyOnload" // Alterado para lazyOnload para melhorar performance
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
              <Suspense fallback={<div className="min-h-[200px] flex items-center justify-center">Carregando...</div>}>
                {children}
              </Suspense>
            </main>
            <Footer />
          </div>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
