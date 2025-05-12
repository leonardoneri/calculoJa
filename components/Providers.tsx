"use client"

import type { ReactNode } from "react"
import { ThemeProvider } from "next-themes"
import ClientAdSense from "@/components/ads/ClientAdSense"
import { Suspense } from "react"

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="light"
      forcedTheme="light"
      enableSystem={false}
      enableColorScheme={false}
    >
      {children}
      <Suspense fallback={null}>
        <ClientAdSense />
      </Suspense>
    </ThemeProvider>
  )
}
