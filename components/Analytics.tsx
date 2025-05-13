"use client"

import Script from "next/script"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { Suspense } from "react"

// Substitua por sua ID do Google Analytics
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ""
// Substitua por sua ID do Google Tag Manager
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || ""

// Script elements to be rendered regardless of analytics tracking
function AnalyticsScripts() {
  if (!GA_MEASUREMENT_ID || !GTM_ID || GA_MEASUREMENT_ID === "" || GTM_ID === "") {
    return null; // Não carrega os scripts se os IDs não estiverem configurados
  }

  return (
    <>
      {/* Google Analytics */}
      <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `,
        }}
      />

      {/* Google Tag Manager */}
      <Script
        id="google-tag-manager"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `,
        }}
      />
    </>
  )
}

// Component that uses client-side hooks
function AnalyticsTracking() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname && typeof window !== 'undefined' && (window as any).gtag && GA_MEASUREMENT_ID) {
      // Track page views
      (window as any).gtag("config", GA_MEASUREMENT_ID, {
        page_path: pathname,
      })
    }
  }, [pathname, searchParams])

  return null
}

export function Analytics() {
  return (
    <>
      <AnalyticsScripts />
      <Suspense fallback={null}>
        <AnalyticsTracking />
      </Suspense>
    </>
  )
}
