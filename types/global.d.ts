// Estende o objeto Window para incluir propriedades específicas do AdSense
interface Window {
  adsbygoogle?: any[]
  gtag?: (...args: any[]) => void
}

// Adicione outras declarações globais conforme necessário aqui 