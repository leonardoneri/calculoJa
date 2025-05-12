"use client"

import React, { useState } from "react"
import ImcCalculator from "./specific/ImcCalculator"
import JurosCompostosCalculator from "./specific/JurosCompostosCalculator"
import ConversaoMoedasCalculator from "./specific/ConversaoMoedasCalculator"
import DosagemVeterinariaCalculator from "./specific/DosagemVeterinariaCalculator"
import MarkupCalculator from "./specific/MarkupCalculator"
import CaloriasDiariasCalculator from "./specific/CaloriasDiariasCalculator"
import FrequenciaCardiacaCalculator from "./specific/FrequenciaCardiacaCalculator"
import PercentualGorduraCalculator from "./specific/PercentualGorduraCalculator"
import AmortizacaoCalculator from "./specific/AmortizacaoCalculator"
import RoiCalculator from "./specific/RoiCalculator"
import ValorFuturoCalculator from "./specific/ValorFuturoCalculator"
import ConversaoTemperaturaCalculator from "./specific/ConversaoTemperaturaCalculator"
import IdadeCaesCalculator from "./specific/IdadeCaesCalculator"
import PontoEquilibrioCalculator from "./specific/PontoEquilibrioCalculator"
import RescisaoCalculator from "./specific/RescisaoCalculator"
import DecimoTerceiroCalculator from "./specific/DecimoTerceiroCalculator"
import CalculatorSkeleton from "./CalculatorSkeleton"

interface CalculatorComponentProps {
  slug: string
}

export default function CalculatorComponent({ slug }: CalculatorComponentProps) {
  const [inputValues, setInputValues] = useState<Record<string, any>>({})
  const [calculationResult, setCalculationResult] = useState<any>(null)

  const handleInputChange = (name: string, value: any) => {
    setInputValues((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCalculate = (result: any) => {
    setCalculationResult(result)
  }

  // Configuração padrão que será sobrescrita pela configuração específica da calculadora se houver
  const defaultConfig = {
    decimalPlaces: 2,
  }

  // Mapa simples de slug para componente
  const calculatorMap: Record<string, React.ComponentType<any>> = {
    'imc': ImcCalculator,
    'juros-compostos': JurosCompostosCalculator,
    'conversao-moedas': ConversaoMoedasCalculator,
    'dosagem-veterinaria': DosagemVeterinariaCalculator,
    'markup': MarkupCalculator,
    'calorias-diarias': CaloriasDiariasCalculator,
    'frequencia-cardiaca': FrequenciaCardiacaCalculator,
    'percentual-gordura': PercentualGorduraCalculator,
    'amortizacao': AmortizacaoCalculator,
    'roi': RoiCalculator,
    'valor-futuro': ValorFuturoCalculator,
    'conversao-temperatura': ConversaoTemperaturaCalculator,
    'idade-caes': IdadeCaesCalculator,
    'ponto-equilibrio': PontoEquilibrioCalculator,
    'rescisao': RescisaoCalculator,
    'decimo-terceiro': DecimoTerceiroCalculator,
  }

  const Component = calculatorMap[slug]

  if (!Component) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md text-red-800">
        <h3 className="font-semibold mb-2">Erro</h3>
        <p>Calculadora "{slug}" não encontrada</p>
        <p className="text-sm mt-2">Calculadoras disponíveis: {Object.keys(calculatorMap).join(', ')}</p>
      </div>
    )
  }

  return (
    <Component 
      onInputChange={handleInputChange} 
      onCalculate={handleCalculate} 
      config={defaultConfig}
    />
  )
}
