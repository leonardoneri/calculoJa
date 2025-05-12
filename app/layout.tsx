import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Analytics } from "@/components/Analytics"
import { Providers } from "@/components/Providers"
import { Suspense } from "react"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CálculoJá | Calculadoras Online Especializadas",
  description: "CálculoJá oferece mais de 25 calculadoras especializadas para facilitar seu dia a dia",
  keywords: "calculadoras, imc, juros compostos, conversão de moedas, calculadora online, cálculo já",
  generator: 'v0.dev'
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
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2877556290224566"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
              <Suspense>{children}</Suspense>
            </main>
            <Footer />
          </div>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
