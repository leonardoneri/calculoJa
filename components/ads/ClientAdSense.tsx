'use client'

import { useEffect } from 'react'

const ClientAdSense = () => {
  const isProduction = process.env.NODE_ENV === 'production'
  const clientId = "ca-pub-2877556290224566"

  useEffect(() => {
    if (!isProduction) return

    try {
      // Carrega o script do AdSense dinamicamente
      const script = document.createElement('script')
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`
      script.async = true
      script.crossOrigin = "anonymous"
      script.id = "google-adsense"
      
      script.onerror = (e) => console.error('Erro ao carregar o script do AdSense:', e)
      
      // Adiciona o script apenas se ele ainda não existir
      if (!document.getElementById('google-adsense')) {
        document.head.appendChild(script)
      }

      // Inicializa o array adsbygoogle
      window.adsbygoogle = window.adsbygoogle || []
    } catch (error) {
      console.error('Erro ao carregar o AdSense:', error)
    }
  }, [clientId, isProduction])

  return null
}

export default ClientAdSense 