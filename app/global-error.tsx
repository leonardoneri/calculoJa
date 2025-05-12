'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Registra o erro no console para fins de depuração
    console.error('Erro global na aplicação:', error)
  }, [error])

  return (
    <html>
      <body>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '1rem',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center'
        }}>
          <div style={{
            backgroundColor: '#fef2f2',
            borderRadius: '0.5rem',
            border: '1px solid #fee2e2',
            padding: '2rem',
            maxWidth: '32rem',
            width: '100%'
          }}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#b91c1c', marginBottom: '1rem' }}>
              Erro crítico!
            </h1>
            <p style={{ color: '#374151', marginBottom: '1.5rem' }}>
              Ocorreu um erro crítico na aplicação. Por favor, tente novamente ou volte mais tarde.
            </p>
            <button
              onClick={() => reset()}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                padding: '0.75rem 1.5rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </body>
    </html>
  )
} 