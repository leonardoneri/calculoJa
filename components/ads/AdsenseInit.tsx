'use client'

import { useEffect } from 'react'

interface AdsenseInitProps {
  clientId: string
}

const AdsenseInit: React.FC<AdsenseInitProps> = ({ clientId }) => {
  // Apenas carrega o AdSense em produção
  const isProduction = process.env.NODE_ENV === 'production'

  // Inicialização segura do AdSense
  useEffect(() => {
    if (!isProduction) return

    // Carrega o script do AdSense dinamicamente
    const loadAdsenseScript = () => {
      try {
        const script = document.createElement('script')
        script.async = true
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`
        script.onerror = (e) => console.error('Erro ao carregar o script do AdSense:', e)
        document.head.appendChild(script)
        
        // Define adsbygoogle globalmente
        if (!window.adsbygoogle) {
          window.adsbygoogle = []
        }
      } catch (error) {
        console.error('Erro ao inicializar o AdSense:', error)
      }
    }

    // Esperar pelo carregamento completo da página antes de inicializar
    if (document.readyState === 'complete') {
      loadAdsenseScript()
    } else {
      window.addEventListener('load', loadAdsenseScript)
      return () => window.removeEventListener('load', loadAdsenseScript)
    }
  }, [clientId, isProduction])

  // Este componente não renderiza nada visualmente
  return null
}

export default AdsenseInit 