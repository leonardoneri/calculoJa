'use client'

import Link from "next/link"

export default function CategoryNotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">Categoria não encontrada</h1>
      <p className="text-lg text-gray-600 mb-8">
        A categoria que você está procurando não existe ou foi movida.
      </p>
      
      <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
        <Link 
          href="/" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
        >
          Voltar para a página inicial
        </Link>
        
        <Link 
          href="/categoria/health" 
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg"
        >
          Ver calculadoras de saúde
        </Link>
      </div>
    </div>
  )
} 