import dynamic from "next/dynamic"
import type { CalculatorCategory } from "./types"

// Importação dinâmica dos componentes de calculadora
export const calculatorComponents = {
  // HEALTH
  imc: dynamic(() => import("@/components/calculators/specific/ImcCalculator")),
  "calorias-diarias": dynamic(() => import("@/components/calculators/specific/CaloriasDiariasCalculator")),
  "percentual-gordura": dynamic(() => import("@/components/calculators/specific/PercentualGorduraCalculator")),
  "frequencia-cardiaca": dynamic(() => import("@/components/calculators/specific/FrequenciaCardiacaCalculator")),

  // FINANCE
  "juros-compostos": dynamic(() => import("@/components/calculators/specific/JurosCompostosCalculator")),
  amortizacao: dynamic(() => import("@/components/calculators/specific/AmortizacaoCalculator")),
  aposentadoria: dynamic(() => import("@/components/calculators/specific/AposentadoriaCalculator")),

  // CONVERSION
  "conversao-moedas": dynamic(() => import("@/components/calculators/specific/ConversaoMoedasCalculator")),
  "conversao-temperatura": dynamic(() => import("@/components/calculators/specific/ConversaoTemperaturaCalculator")),
  "conversao-unidades": dynamic(() => import("@/components/calculators/specific/ConversaoUnidadesCalculator")),

  // VETERINARY
  "dosagem-veterinaria": dynamic(() => import("@/components/calculators/specific/DosagemVeterinariaCalculator")),
  "idade-caes": dynamic(() => import("@/components/calculators/specific/IdadeCaesCalculator")),
  "alimentacao-pet": dynamic(() => import("@/components/calculators/specific/AlimentacaoPetCalculator")),

  // BUSINESS
  markup: dynamic(() => import("@/components/calculators/specific/MarkupCalculator")),
  "ponto-equilibrio": dynamic(() => import("@/components/calculators/specific/PontoEquilibrioCalculator")),
  roi: dynamic(() => import("@/components/calculators/specific/RoiCalculator")),
}

// Função para verificar se uma calculadora existe
export const calculatorExists = (slug: string): boolean => {
  return Object.keys(calculatorComponents).includes(slug)
}

// Função para obter o componente de calculadora por slug
export const getCalculatorComponent = (slug: string) => {
  if (calculatorExists(slug)) {
    return calculatorComponents[slug as keyof typeof calculatorComponents]
  }
  return null
}

// Função para obter calculadoras por categoria
export const getCalculatorsByCategory = (category: CalculatorCategory): string[] => {
  const calculators = Object.keys(calculatorComponents)

  // Filtrar calculadoras por categoria usando o arquivo de configuração
  // Esta é uma implementação simplificada, você precisará adaptar conforme sua estrutura
  return calculators
}
