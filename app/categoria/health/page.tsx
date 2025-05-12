import type { Metadata } from "next"
import Link from "next/link"
import { CalculatorCategory } from "@/lib/types"
import { getCalculatorsByCategory } from "@/lib/calculators"

export const metadata: Metadata = {
  title: "Calculadoras de Saúde - Ferramentas para monitorar sua saúde e bem-estar",
  description: "Ferramentas essenciais para monitorar e melhorar sua saúde e bem-estar, como IMC, calorias diárias, percentual de gordura e frequência cardíaca.",
  keywords: "saúde, calculadoras de saúde, imc, percentual de gordura, calorias diárias, frequência cardíaca"
}

export default async function HealthCategoryPage() {
  // Obtém todas as calculadoras da categoria HEALTH
  const healthCalculators = await getCalculatorsByCategory(CalculatorCategory.HEALTH)

  // Grupos para organizar as calculadoras por finalidade
  const groups = [
    {
      id: "body-composition",
      title: "Composição Corporal",
      description: "Avalie sua composição corporal e saúde geral com estas calculadoras",
      calculators: healthCalculators.filter(calc => 
        ["imc", "percentual-gordura"].includes(calc.slug)
      )
    },
    {
      id: "fitness",
      title: "Fitness e Exercícios",
      description: "Monitore e planeje seus exercícios físicos para melhor desempenho",
      calculators: healthCalculators.filter(calc => 
        ["frequencia-cardiaca"].includes(calc.slug)
      )
    },
    {
      id: "nutrition",
      title: "Nutrição e Alimentação",
      description: "Calcule suas necessidades nutricionais e gasto calórico",
      calculators: healthCalculators.filter(calc => 
        ["calorias-diarias"].includes(calc.slug)
      )
    }
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Calculadoras de Saúde</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Use nossas calculadoras de saúde para monitorar seu progresso físico, 
          entender melhor sua condição física e tomar decisões informadas para melhorar 
          seu bem-estar geral.
        </p>
      </header>

      {/* Banner destaque */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 mb-12">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-2/3 mb-6 md:mb-0 md:pr-8">
            <h2 className="text-2xl font-bold mb-3">Controle sua saúde com facilidade</h2>
            <p className="text-gray-700">
              Nossas calculadoras de saúde são projetadas para ajudar você a monitorar 
              indicadores importantes de saúde, como IMC, percentual de gordura corporal, 
              gasto calórico e zonas de treinamento cardíaco.
            </p>
          </div>
          <div className="md:w-1/3 flex justify-center">
            <span className="text-6xl">💪</span>
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

      {/* Informações gerais sobre saúde */}
      <section className="mt-16 bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Por que monitorar sua saúde?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-center mb-3">
              <span className="text-4xl">🔍</span>
            </div>
            <h3 className="text-lg font-bold mb-2 text-center">Autoconhecimento</h3>
            <p className="text-gray-700">
              Entender os números relacionados à sua saúde permite conhecer melhor seu 
              corpo e identificar áreas para melhoria.
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-center mb-3">
              <span className="text-4xl">📈</span>
            </div>
            <h3 className="text-lg font-bold mb-2 text-center">Acompanhamento</h3>
            <p className="text-gray-700">
              Monitorar regularmente indicadores de saúde ajuda a verificar o progresso 
              e a eficácia das mudanças em seu estilo de vida.
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-center mb-3">
              <span className="text-4xl">🎯</span>
            </div>
            <h3 className="text-lg font-bold mb-2 text-center">Metas Realistas</h3>
            <p className="text-gray-700">
              Dados objetivos ajudam a estabelecer metas de saúde realistas e 
              mensuráveis, aumentando suas chances de sucesso.
            </p>
          </div>
        </div>
      </section>

      {/* CTA para explorar outras categorias */}
      <div className="mt-16 bg-gray-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Explore outras categorias de calculadoras</h2>
        <p className="text-gray-600 mb-6">
          Além das calculadoras de saúde, oferecemos ferramentas para finanças, conversões e muito mais.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/categoria/finance" className="bg-white border border-gray-200 rounded-lg px-6 py-3 hover:bg-gray-100 transition">
            Finanças
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