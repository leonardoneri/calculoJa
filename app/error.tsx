'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Registra o erro no console para fins de depuração
    console.error('Erro na aplicação:', error)
  }, [error])

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="bg-red-50 rounded-lg border border-red-200 p-6 mb-8">
        <h1 className="text-3xl font-bold text-red-700 mb-4">Algo deu errado!</h1>
        <p className="text-lg text-gray-700 mb-6">
          Ocorreu um erro ao carregar esta página. Por favor, tente novamente mais tarde.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => reset()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
          >
            Tentar novamente
          </button>
          
          <Link
            href="/"
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg"
          >
            Voltar para a página inicial
          </Link>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Categorias disponíveis</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold mb-3 text-blue-700">Saúde</h3>
            <div className="flex flex-col space-y-2">
              <Link href="/categoria/health" className="text-blue-600 hover:text-blue-800 hover:underline py-1">
                Ver calculadoras de saúde
              </Link>
            </div>
          </div>
          
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold mb-3 text-blue-700">Finanças</h3>
            <div className="flex flex-col space-y-2">
              <Link href="/categoria/finance" className="text-blue-600 hover:text-blue-800 hover:underline py-1">
                Ver calculadoras financeiras
              </Link>
            </div>
          </div>
          
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold mb-3 text-blue-700">Conversões</h3>
            <div className="flex flex-col space-y-2">
              <Link href="/categoria/conversion" className="text-blue-600 hover:text-blue-800 hover:underline py-1">
                Ver calculadoras de conversão
              </Link>
            </div>
          </div>
          
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold mb-3 text-blue-700">Veterinária</h3>
            <div className="flex flex-col space-y-2">
              <Link href="/categoria/veterinary" className="text-blue-600 hover:text-blue-800 hover:underline py-1">
                Ver calculadoras veterinárias
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 