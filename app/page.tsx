import type { Metadata } from "next"
import { getAllCalculators } from "@/lib/calculators"
import CalculatorCard from "@/components/calculators/CalculatorCard"
import { CalculatorCategory } from "@/lib/types"
import Image from "next/image"
import Link from "next/link"

export const metadata: Metadata = {
  title: "CálculoJá - Ferramentas de cálculo para todas as necessidades",
  description:
    "CálculoJá oferece mais de 25 calculadoras especializadas gratuitas: IMC, juros compostos, conversão de moedas e muito mais. Resultados instantâneos e explicações detalhadas.",
}

// Componente FAQ estruturado
function HomeFAQ() {
  const faqItems = [
    {
      question: "As calculadoras do CálculoJá são gratuitas?",
      answer: "Sim, todas as calculadoras disponíveis no CálculoJá são completamente gratuitas e podem ser utilizadas sem limitações."
    },
    {
      question: "Como posso salvar os resultados dos meus cálculos?",
      answer: "Atualmente você pode copiar os resultados ou imprimir a página. Estamos trabalhando em uma funcionalidade para salvar os resultados em sua conta."
    },
    {
      question: "As calculadoras funcionam em dispositivos móveis?",
      answer: "Sim! Todas as nossas calculadoras são responsivas e funcionam perfeitamente em smartphones e tablets."
    },
    {
      question: "Os cálculos são precisos?",
      answer: "Sim, nossas calculadoras seguem rigorosamente as fórmulas e regulamentações brasileiras vigentes para cada tipo de cálculo. Mantemos nossos algoritmos atualizados com as mais recentes diretrizes e legislações."
    }
  ];

  return (
    <section className="my-12 bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Perguntas Frequentes</h2>
      <div className="space-y-4">
        {faqItems.map((item, index) => (
          <div key={index} className="border-b pb-4 last:border-0">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">{item.question}</h3>
            <p className="text-gray-600">{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function Home() {
  const calculators = await getAllCalculators()
  
  // Lista de slugs específicos para cada categoria temática
  const hrSlugs = ["rescisao", "decimo-terceiro", "ferias", "horas-extras", "seguro-desemprego", 
                  "aposentadoria", "ir-fonte", "adicional-noturno", "vale-transporte", "pis-pasep", 
                  "contribuicao-inss", "turnover", "absenteismo"];
                  
  const loanSlugs = ["emprestimo-consignado", "amortizacao", "juros-compostos", "valor-futuro"];
  
  const businessSlugs = ["markup", "ponto-equilibrio", "roi"];
  
  // Grupos temáticos de calculadoras (além das categorias padrão)
  const groups = [
    {
      id: "health",
      title: "Saúde e Bem-estar",
      filter: (calc: any) => calc.category === CalculatorCategory.HEALTH
    },
    {
      id: "finance",
      title: "Finanças e Investimentos",
      filter: (calc: any) => 
        calc.category === CalculatorCategory.FINANCE && 
        !loanSlugs.includes(calc.slug) // Exclui os que estão em empréstimos
    },
    {
      id: "hr",
      title: "Recursos Humanos",
      filter: (calc: any) => 
        calc.category === CalculatorCategory.BUSINESS && 
        hrSlugs.includes(calc.slug)
    },
    {
      id: "loans",
      title: "Empréstimos e Financiamentos",
      filter: (calc: any) => 
        ((calc.category === CalculatorCategory.FINANCE || calc.category === CalculatorCategory.BUSINESS) && 
        loanSlugs.includes(calc.slug))
    },
    {
      id: "conversion",
      title: "Conversões e Medidas",
      filter: (calc: any) => calc.category === CalculatorCategory.CONVERSION
    },
    {
      id: "business",
      title: "Gestão de Negócios",
      filter: (calc: any) => 
        calc.category === CalculatorCategory.BUSINESS && 
        businessSlugs.includes(calc.slug) && 
        !hrSlugs.includes(calc.slug) // Exclui os que estão em recursos humanos
    },
    {
      id: "veterinary",
      title: "Veterinária",
      filter: (calc: any) => calc.category === CalculatorCategory.VETERINARY
    }
  ];

  return (
    <div className="space-y-12">
      {/* Link invisível para o Google */}
      <a href="/googleindex.html" className="hidden">Índice de Calculadoras</a>
      
      <section className="text-center py-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
        <div className="flex justify-center mb-6">
          <Image 
            src="/calculoja-logo.svg" 
            alt="CálculoJá - Calculadoras online especializadas" 
            width={280} 
            height={80} 
            className="h-16 w-auto" 
            priority
          />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Calculadoras Online Gratuitas
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Mais de 25 calculadoras gratuitas para facilitar seus cálculos diários, com resultados instantâneos e
          explicações detalhadas.
        </p>
      </section>

      {groups.map((group) => {
        const groupCalculators = calculators.filter(group.filter)
        if (groupCalculators.length === 0) return null

        return (
          <section key={group.id} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">{group.title}</h2>
              {group.id === "health" && (
                <Link href="/categoria/health" className="text-blue-600 hover:underline">
                  Ver todas
                </Link>
              )}
              {group.id === "finance" && (
                <Link href="/categoria/finance" className="text-blue-600 hover:underline">
                  Ver todas
                </Link>
              )}
              {group.id === "hr" && (
                <Link href="/recursos-humanos" className="text-blue-600 hover:underline">
                  Ver todas
                </Link>
              )}
              {group.id === "loans" && (
                <Link href="/emprestimos-financiamentos" className="text-blue-600 hover:underline">
                  Ver todas
                </Link>
              )}
              {group.id === "conversion" && (
                <Link href="/categoria/conversion" className="text-blue-600 hover:underline">
                  Ver todas
                </Link>
              )}
              {group.id === "business" && (
                <Link href="/categoria/business" className="text-blue-600 hover:underline">
                  Ver todas
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupCalculators.map((calculator) => (
                <CalculatorCard key={calculator.slug} calculator={calculator} />
              ))}
            </div>
          </section>
        )
      })}

      {/* FAQ estruturado */}
      <HomeFAQ />
    </div>
  )
}
