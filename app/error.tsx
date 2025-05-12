'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Erro na aplicação:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg w-full">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Algo deu errado!</h2>
        <p className="text-gray-700 mb-6">
          Ocorreu um erro ao carregar esta página. Por favor, tente novamente mais tarde.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => reset()}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md"
          >
            Tentar novamente
          </button>
          <a 
            href="/"
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md text-center"
          >
            Voltar para a página inicial
          </a>
        </div>
      </div>
    </div>
  )
} 