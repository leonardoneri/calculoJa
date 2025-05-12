import type { Metadata } from "next"
import { getAllCalculators } from "@/lib/calculators"
import CalculatorCard from "@/components/calculators/CalculatorCard"
import { CalculatorCategory } from "@/lib/types"

export const metadata: Metadata = {
  title: "Portal de Calculadoras Especializadas - Ferramentas de cálculo para todas as necessidades",
  description:
    "Acesse mais de 25 calculadoras especializadas gratuitas: IMC, juros compostos, conversão de moedas e muito mais. Resultados instantâneos e explicações detalhadas.",
}

export default async function Home() {
  const calculators = await getAllCalculators()
  const categories = Object.values(CalculatorCategory)

  return (
    <div className="space-y-12">
      <section className="text-center py-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Portal de Calculadoras Especializadas</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Mais de 25 calculadoras gratuitas para facilitar seus cálculos diários, com resultados instantâneos e
          explicações detalhadas.
        </p>
      </section>

      {categories.map((category) => {
        const categoryCalculators = calculators.filter((calc) => calc.category === category)
        if (categoryCalculators.length === 0) return null

        return (
          <section key={category} className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">{getCategoryTitle(category)}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryCalculators.map((calculator) => (
                <CalculatorCard key={calculator.slug} calculator={calculator} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function getCategoryTitle(category: CalculatorCategory): string {
  switch (category) {
    case CalculatorCategory.HEALTH:
      return "Saúde e Bem-estar"
    case CalculatorCategory.FINANCE:
      return "Finanças e Investimentos"
    case CalculatorCategory.CONVERSION:
      return "Conversões e Medidas"
    case CalculatorCategory.VETERINARY:
      return "Veterinária"
    case CalculatorCategory.BUSINESS:
      return "Negócios"
    default:
      return "Outras Calculadoras"
  }
}
