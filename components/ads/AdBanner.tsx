"use client"

import { useEffect, useRef, useState } from "react"

interface AdBannerProps {
  position: "above-calculator" | "below-calculator" | "sidebar" | "in-content"
}

export default function AdBanner({
  position,
}: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null)
  const [adError, setAdError] = useState(false)
  const [adIsLoading, setAdIsLoading] = useState(true)
  const isProduction = process.env.NODE_ENV === 'production'
  const adClient = "ca-pub-2877556290224566"

  useEffect(() => {
    // Não tenta carregar anúncios em desenvolvimento
    if (!isProduction) {
      setAdIsLoading(false)
      return
    }

    // Função para inicializar o anúncio de forma segura
    const initAd = () => {
      if (!adRef.current || adError) return
      
      try {
        // Verificar se o AdSense está disponível
        if (typeof window.adsbygoogle !== 'undefined' && Array.isArray(window.adsbygoogle)) {
          
          const pushAd = () => {
            try {
              (window.adsbygoogle = window.adsbygoogle || []).push({})
              setAdIsLoading(false)
            } catch (error) {
              console.error(`Erro ao renderizar anúncio (${position}):`, error)
              setAdError(true)
              setAdIsLoading(false)
            }
          }
          
          // Tenta executar imediatamente, se falhar, aguarda um pouco
          try {
            pushAd()
          } catch (e) {
            // Tentar novamente após um pequeno atraso
            setTimeout(pushAd, 300)
          }
        } else {
          // Se o AdSense não estiver disponível, tenta novamente após um atraso
          setTimeout(initAd, 500)
        }
      } catch (error) {
        console.error(`Erro geral no AdSense (${position}):`, error)
        setAdError(true)
        setAdIsLoading(false)
      }
    }

    // Inicia o processo de carregamento do anúncio
    if (document.readyState === 'complete') {
      initAd()
    } else {
      window.addEventListener('load', initAd)
      return () => window.removeEventListener('load', initAd)
    }
    
    // Define um timeout para o carregamento do anúncio
    const adTimeout = setTimeout(() => {
      if (adIsLoading) {
        setAdIsLoading(false)
        setAdError(true)
      }
    }, 5000) // 5 segundos de timeout
    
    // Limpa o timeout ao desmontar o componente
    return () => clearTimeout(adTimeout)
  }, [position, isProduction, adError, adIsLoading])

  // Different ad sizes based on position
  const getAdSize = () => {
    switch (position) {
      case "above-calculator":
        return "min-h-[90px] md:min-h-[90px]"
      case "below-calculator":
        return "min-h-[250px] md:min-h-[90px]"
      case "sidebar":
        return "min-h-[600px] md:min-h-[600px]"
      case "in-content":
        return "min-h-[250px] md:min-h-[250px]"
      default:
        return "min-h-[250px] md:min-h-[250px]"
    }
  }

  // Em ambiente de desenvolvimento ou em caso de erro, mostrar apenas um placeholder
  if (!isProduction || adError) {
    return (
      <div className={`w-full ${getAdSize()} bg-gray-100 flex items-center justify-center mb-8 overflow-hidden`}>
        <span className="text-sm text-gray-500">
          {!isProduction 
            ? "Banner de anúncio (desativado em desenvolvimento)" 
            : "Não foi possível carregar o anúncio"}
        </span>
      </div>
    )
  }

  return (
    <div
      ref={adRef}
      className={`w-full ${getAdSize()} bg-gray-100 flex items-center justify-center mb-8 overflow-hidden relative`}
    >
      {adIsLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 z-10">
          <span className="text-sm text-gray-500">Carregando anúncio...</span>
        </div>
      )}
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%", height: "100%" }}
        data-ad-client={adClient}
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
      <span className="text-xs text-gray-400 absolute bottom-1 right-2">Anúncio</span>
    </div>
  )
}
