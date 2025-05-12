import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { CalculatorCategory, stringToCategory } from "@/lib/types"
import { getCalculatorsByCategory } from "@/lib/calculators"

type Props = {
  params: { category: string }
}

const categoryMap: Record<string, { title: string, description: string }> = {
  "health": {
    title: "Calculadoras de Saúde",
    description: "Ferramentas essenciais para monitorar e melhorar sua saúde e bem-estar.",
  },
  "finance": {
    title: "Calculadoras Financeiras",
    description: "Planeje suas finanças pessoais e investimentos com nossas calculadoras especializadas.",
  },
  "conversion": {
    title: "Calculadoras de Conversão",
    description: "Converta facilmente entre diferentes unidades e moedas.",
  },
  "veterinary": {
    title: "Calculadoras Veterinárias",
    description: "Ferramentas especializadas para cuidados com animais de estimação.",
  },
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = params
  const categoryInfo = categoryMap[category]

  if (!categoryInfo) {
    return {
      title: "Categoria não encontrada",
    }
  }

  return {
    title: `${categoryInfo.title} - Calculadoras Especializadas`,
    description: categoryInfo.description,
  }
}

export default async function CategoryPage({ params }: Props) {
  const { category } = params
  const categoryInfo = categoryMap[category]

  if (!categoryInfo) {
    notFound()
  }

  // Usa a função helper para converter a string da URL para o enum
  const categoryEnum = stringToCategory(category)
  
  if (!categoryEnum) {
    notFound()
  }

  const calculators = await getCalculatorsByCategory(categoryEnum)

  // Log para debug
  console.log(`Categoria URL: ${category}, Enum: ${categoryEnum}, Calculadoras: ${calculators.length}`)

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{categoryInfo.title}</h1>
        <p className="text-lg text-gray-600">{categoryInfo.description}</p>
      </div>

      {calculators.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Nenhuma calculadora disponível nesta categoria no momento.</p>
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