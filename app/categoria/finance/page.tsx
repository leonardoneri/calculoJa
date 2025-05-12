import type { Metadata } from "next"
import Link from "next/link"
import { CalculatorCategory } from "@/lib/types"
import { getCalculatorsByCategory } from "@/lib/calculators"

export const metadata: Metadata = {
  title: "Calculadoras Financeiras - Ferramentas para planejamento financeiro",
  description: "Planeje suas finanças pessoais e investimentos com nossas calculadoras especializadas, como juros compostos, amortização e markup.",
  keywords: "finanças, calculadoras financeiras, juros compostos, amortização, markup, investimentos"
}

export default async function FinanceCategoryPage() {
  // Obtém todas as calculadoras da categoria FINANCE
  const financeCalculators = await getCalculatorsByCategory(CalculatorCategory.FINANCE)

  // Grupos para organizar as calculadoras por finalidade
  const groups = [
    {
      id: "investments",
      title: "Investimentos",
      description: "Planeje seus investimentos e calcule rendimentos ao longo do tempo",
      calculators: financeCalculators.filter(calc => 
        ["juros-compostos"].includes(calc.slug)
      )
    },
    {
      id: "business",
      title: "Negócios",
      description: "Ferramentas para cálculos empresariais e precificação",
      calculators: financeCalculators.filter(calc => 
        ["markup", "ponto-equilibrio"].includes(calc.slug)
      )
    },
    {
      id: "loans",
      title: "Empréstimos e Financiamentos",
      description: "Calcule prestações, juros e amortizações de empréstimos",
      calculators: financeCalculators.filter(calc => 
        ["amortizacao"].includes(calc.slug)
      )
    }
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Calculadoras Financeiras</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Ferramentas financeiras poderosas para ajudar você a tomar decisões 
          informadas sobre investimentos, empréstimos e planejamento financeiro pessoal.
        </p>
      </header>

      {/* Banner destaque */}
      <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-8 mb-12">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-2/3 mb-6 md:mb-0 md:pr-8">
            <h2 className="text-2xl font-bold mb-3">Planeje seu futuro financeiro</h2>
            <p className="text-gray-700">
              Nossas calculadoras financeiras são projetadas para ajudar você a 
              planejar investimentos, calcular juros, amortizações e tomar decisões 
              financeiras inteligentes.
            </p>
          </div>
          <div className="md:w-1/3 flex justify-center">
            <span className="text-6xl">💰</span>
          </div>
        </div>
      </div>

      {/* Calculadoras agrupadas por finalidade */}
      <div className="space-y-12">
        {groups.map(group => (
          <section key={group.id} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-3">{group.title}</h2>
            <p className="text-gray-600 mb-6">{group.description}</p>

            {group.calculators.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {group.calculators.map(calculator => (
                  <Link
                    key={calculator.slug}
                    href={`/calculadora/${calculator.slug}`}
                    className="bg-gray-50 border border-gray-200 rounded-lg hover:shadow-md transition-shadow p-4 group"
                  >
                    <div className="flex items-start">
                      <div className="mr-4 mt-1">
                        <span className="text-3xl">{calculator.icon || "🧮"}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                          {calculator.title}
                        </h3>
                        <p className="text-gray-600 mb-3">{calculator.description}</p>
                        <span className="text-blue-600 font-medium group-hover:underline">
                          Acessar calculadora →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <p className="text-gray-500">Nenhuma calculadora disponível neste grupo.</p>
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Informações gerais sobre finanças */}
      <section className="mt-16 bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Por que fazer planejamento financeiro?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-center mb-3">
              <span className="text-4xl">🛡️</span>
            </div>
            <h3 className="text-lg font-bold mb-2 text-center">Segurança</h3>
            <p className="text-gray-700">
              Um bom planejamento financeiro ajuda a criar reservas de emergência e 
              reduzir a vulnerabilidade a imprevistos.
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-center mb-3">
              <span className="text-4xl">🎯</span>
            </div>
            <h3 className="text-lg font-bold mb-2 text-center">Objetivos</h3>
            <p className="text-gray-700">
              Definir metas claras e calcular o quanto precisa poupar para alcançá-las 
              torna seus sonhos mais tangíveis.
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-center mb-3">
              <span className="text-4xl">🌱</span>
            </div>
            <h3 className="text-lg font-bold mb-2 text-center">Crescimento</h3>
            <p className="text-gray-700">
              Compreender juros compostos e retornos de investimentos permite fazer seu 
              dinheiro trabalhar para você.
            </p>
          </div>
        </div>
      </section>

      {/* CTA para explorar outras categorias */}
      <div className="mt-16 bg-gray-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Explore outras categorias de calculadoras</h2>
        <p className="text-gray-600 mb-6">
          Além das calculadoras financeiras, oferecemos ferramentas para saúde, conversões e muito mais.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/categoria/health" className="bg-white border border-gray-200 rounded-lg px-6 py-3 hover:bg-gray-100 transition">
            Saúde
          </Link>
          <Link href="/categoria/conversion" className="bg-white border border-gray-200 rounded-lg px-6 py-3 hover:bg-gray-100 transition">
            Conversões
          </Link>
          <Link href="/categoria/veterinary" className="bg-white border border-gray-200 rounded-lg px-6 py-3 hover:bg-gray-100 transition">
            Veterinária
          </Link>
        </div>
      </div>
    </div>
  )
} 