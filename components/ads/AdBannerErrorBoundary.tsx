'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

/**
 * Componente de ErrorBoundary específico para anúncios.
 * Evita que erros nos anúncios afetem o restante da aplicação.
 */
class AdBannerErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_: Error): State {
    // Atualiza o estado para que a próxima renderização mostre a UI de fallback
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Registrar o erro no serviço de logging ou console
    console.error('Erro no componente de anúncio:', error)
    console.error('Detalhes do erro:', errorInfo)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Renderizar um espaço vazio ou um elemento mínimo quando ocorrer um erro
      return <div className="h-12 mb-8"></div>
    }

    return this.props.children
  }
}

export default AdBannerErrorBoundary 