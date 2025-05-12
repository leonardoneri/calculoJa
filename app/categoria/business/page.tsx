import type { Metadata } from "next"
import Link from "next/link"
import { getCalculatorsByCategory } from "@/lib/calculators"
import { CalculatorCategory } from "@/lib/types"

export const metadata: Metadata = {
  title: "Calculadoras de Negócios - Calculadoras Especializadas",
  description: "Ferramentas especializadas para análise e gestão de negócios, cálculos de margem, lucro e muito mais.",
}

export default async function BusinessCategoryPage() {
  let calculators = []
  let errorOccurred = false
  
  try {
    calculators = await getCalculatorsByCategory(CalculatorCategory.BUSINESS)
  } catch (error) {
    console.error("Erro ao buscar calculadoras de negócios:", error)
    errorOccurred = true
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Calculadoras de Negócios</h1>
        <p className="text-lg text-gray-600">
          Otimize sua gestão empresarial com ferramentas para análise de custos, preços e lucratividade.
        </p>
      </div>

      {errorOccurred ? (
        <div className="text-center py-8 bg-red-50 rounded-lg border border-red-100">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Ocorreu um erro</h2>
          <p className="text-gray-700 mb-4">
            Não foi possível carregar as calculadoras desta categoria no momento. Por favor, tente novamente mais tarde.
          </p>
          <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg">
            Voltar para a página inicial
          </Link>
        </div>
      ) : calculators.length === 0 ? (
        <div className="text-center py-8 bg-yellow-50 rounded-lg border border-yellow-100">
          <h2 className="text-xl font-semibold text-yellow-700 mb-2">Estamos trabalhando nisso!</h2>
          <p className="text-gray-700 mb-4">
            Ainda não temos calculadoras disponíveis nesta categoria, mas estamos desenvolvendo novas ferramentas para gestão de negócios para você!
          </p>
          <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg">
            Voltar para a página inicial
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {calculators.map((calculator) => (
            <Link
              key={calculator.slug}
              href={`/calculadora/${calculator.slug}`}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 group"
            >
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <span className="text-2xl">{calculator.icon || "🧮"}</span>
                </div>
                <h2 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                  {calculator.title}
                </h2>
                <p className="text-gray-600 mb-4 flex-grow">{calculator.description}</p>
                <div className="mt-auto">
                  <span className="text-blue-600 font-medium group-hover:underline">
                    Usar calculadora →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
} 