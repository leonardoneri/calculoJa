"use client"

import { useState, useEffect } from "react"
import { z } from "zod"

interface PontoEquilibrioCalculatorProps {
  onInputChange: (name: string, value: any) => void
  onCalculate: (result: any) => void
  config: any
}

const breakEvenSchema = z.object({
  fixedCosts: z.number().min(0, "Os custos fixos não podem ser negativos"),
  variableCostPerUnit: z.number().min(0, "O custo variável por unidade não pode ser negativo"),
  pricePerUnit: z.number().min(0.01, "O preço por unidade deve ser maior que zero"),
  contributionMarginRatio: z.number().optional(),
})

export default function PontoEquilibrioCalculator({
  onInputChange,
  onCalculate,
  config,
}: PontoEquilibrioCalculatorProps) {
  const [fixedCosts, setFixedCosts] = useState<string>("")
  const [variableCostPerUnit, setVariableCostPerUnit] = useState<string>("")
  const [pricePerUnit, setPricePerUnit] = useState<string>("")
  const [unit, setUnit] = useState<string>("unidades")
  const [result, setResult] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateInput = () => {
    try {
      const fixedCostsNum = Number.parseFloat(fixedCosts)
      const variableCostPerUnitNum = Number.parseFloat(variableCostPerUnit)
      const pricePerUnitNum = Number.parseFloat(pricePerUnit)

      if (isNaN(fixedCostsNum)) {
        setErrors({ fixedCosts: "Os custos fixos devem ser um número válido" })
        return null
      }
      
      if (isNaN(variableCostPerUnitNum)) {
        setErrors({ variableCostPerUnit: "O custo variável por unidade deve ser um número válido" })
        return null
      }
      
      if (isNaN(pricePerUnitNum)) {
        setErrors({ pricePerUnit: "O preço por unidade deve ser um número válido" })
        return null
      }

      if (pricePerUnitNum <= variableCostPerUnitNum) {
        setErrors({ pricePerUnit: "O preço deve ser maior que o custo variável por unidade" })
        return null
      }

      // Calculate contribution margin ratio
      const contributionMarginRatio = (pricePerUnitNum - variableCostPerUnitNum) / pricePerUnitNum

      breakEvenSchema.parse({
        fixedCosts: fixedCostsNum,
        variableCostPerUnit: variableCostPerUnitNum,
        pricePerUnit: pricePerUnitNum,
        contributionMarginRatio,
      })

      setErrors({})
      return {
        fixedCostsNum,
        variableCostPerUnitNum,
        pricePerUnitNum,
        contributionMarginRatio,
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message
          }
        })
        setErrors(newErrors)
      }
      return null
    }
  }

  const calculateBreakEven = () => {
    const validatedInput = validateInput()
    if (!validatedInput) return

    const { fixedCostsNum, variableCostPerUnitNum, pricePerUnitNum, contributionMarginRatio } = validatedInput

    // Ponto de equilíbrio em quantidade (unidades)
    const breakEvenUnits = fixedCostsNum / (pricePerUnitNum - variableCostPerUnitNum)
    
    // Ponto de equilíbrio em valor (receita)
    const breakEvenRevenue = breakEvenUnits * pricePerUnitNum
    
    // Arredondar para o número inteiro superior (sempre uma unidade inteira a mais para garantir lucro)
    const breakEvenUnitsCeil = Math.ceil(breakEvenUnits)
    
    // Margem de contribuição por unidade
    const contributionMarginPerUnit = pricePerUnitNum - variableCostPerUnitNum
    
    // Margem de contribuição total no ponto de equilíbrio
    const totalContributionMargin = breakEvenUnits * contributionMarginPerUnit
    
    // Percentual da margem de contribuição
    const contributionMarginPercentage = contributionMarginRatio * 100

    // Arredondar para o número de casas decimais configurado
    const decimalPlaces = config?.decimalPlaces || 2
    
    // Cálculo para análise de sensibilidade
    const sensitivityAnalysis = calculateSensitivityAnalysis(
      fixedCostsNum,
      variableCostPerUnitNum,
      pricePerUnitNum,
      breakEvenUnits,
      decimalPlaces
    )

    const calculationResult = {
      fixedCosts: fixedCostsNum,
      variableCostPerUnit: variableCostPerUnitNum,
      pricePerUnit: pricePerUnitNum,
      unit,
      breakEvenUnits: Number(breakEvenUnits.toFixed(decimalPlaces)),
      breakEvenUnitsCeil: breakEvenUnitsCeil,
      breakEvenRevenue: Number(breakEvenRevenue.toFixed(decimalPlaces)),
      contributionMarginPerUnit: Number(contributionMarginPerUnit.toFixed(decimalPlaces)),
      contributionMarginPercentage: Number(contributionMarginPercentage.toFixed(decimalPlaces)),
      totalContributionMargin: Number(totalContributionMargin.toFixed(decimalPlaces)),
      sensitivityAnalysis,
      formula: {
        units: "CF ÷ (P - CVu)",
        revenue: "CF ÷ (1 - (CVu ÷ P))",
      },
    }

    setResult(calculationResult)

    // Call parent callbacks
    onInputChange("fixedCosts", fixedCostsNum)
    onInputChange("variableCostPerUnit", variableCostPerUnitNum)
    onInputChange("pricePerUnit", pricePerUnitNum)
    onInputChange("unit", unit)
    onCalculate(calculationResult)
  }

  // Cálculo para análise de sensibilidade
  const calculateSensitivityAnalysis = (
    fixedCosts: number,
    variableCostPerUnit: number,
    pricePerUnit: number,
    breakEvenUnits: number,
    decimalPlaces: number
  ) => {
    const analysis = []
    
    // Variação de ±15% para preço
    const priceSensitivityPlus = (fixedCosts / (pricePerUnit * 1.15 - variableCostPerUnit)).toFixed(decimalPlaces)
    const priceSensitivityMinus = (fixedCosts / (pricePerUnit * 0.85 - variableCostPerUnit)).toFixed(decimalPlaces)
    
    // Variação de ±15% para custo variável
    const variableCostSensitivityPlus = (fixedCosts / (pricePerUnit - variableCostPerUnit * 1.15)).toFixed(decimalPlaces)
    const variableCostSensitivityMinus = (fixedCosts / (pricePerUnit - variableCostPerUnit * 0.85)).toFixed(decimalPlaces)
    
    // Variação de ±15% para custo fixo
    const fixedCostSensitivityPlus = ((fixedCosts * 1.15) / (pricePerUnit - variableCostPerUnit)).toFixed(decimalPlaces)
    const fixedCostSensitivityMinus = ((fixedCosts * 0.85) / (pricePerUnit - variableCostPerUnit)).toFixed(decimalPlaces)
    
    analysis.push({
      label: "Se o preço aumentar 15%",
      units: Number(priceSensitivityPlus),
      change: Number((((Number(priceSensitivityPlus) - breakEvenUnits) / breakEvenUnits) * 100).toFixed(1)),
    })
    
    analysis.push({
      label: "Se o preço diminuir 15%",
      units: Number(priceSensitivityMinus),
      change: Number((((Number(priceSensitivityMinus) - breakEvenUnits) / breakEvenUnits) * 100).toFixed(1)),
    })
    
    analysis.push({
      label: "Se o custo variável aumentar 15%",
      units: Number(variableCostSensitivityPlus),
      change: Number((((Number(variableCostSensitivityPlus) - breakEvenUnits) / breakEvenUnits) * 100).toFixed(1)),
    })
    
    analysis.push({
      label: "Se o custo variável diminuir 15%",
      units: Number(variableCostSensitivityMinus),
      change: Number((((Number(variableCostSensitivityMinus) - breakEvenUnits) / breakEvenUnits) * 100).toFixed(1)),
    })
    
    analysis.push({
      label: "Se o custo fixo aumentar 15%",
      units: Number(fixedCostSensitivityPlus),
      change: Number((((Number(fixedCostSensitivityPlus) - breakEvenUnits) / breakEvenUnits) * 100).toFixed(1)),
    })
    
    analysis.push({
      label: "Se o custo fixo diminuir 15%",
      units: Number(fixedCostSensitivityMinus),
      change: Number((((Number(fixedCostSensitivityMinus) - breakEvenUnits) / breakEvenUnits) * 100).toFixed(1)),
    })
    
    return analysis
  }

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Calculate automatically when all inputs are valid
  useEffect(() => {
    if (fixedCosts && variableCostPerUnit && pricePerUnit) {
      const fixedCostsNum = Number.parseFloat(fixedCosts)
      const variableCostPerUnitNum = Number.parseFloat(variableCostPerUnit)
      const pricePerUnitNum = Number.parseFloat(pricePerUnit)

      if (!isNaN(fixedCostsNum) && !isNaN(variableCostPerUnitNum) && !isNaN(pricePerUnitNum) && 
          pricePerUnitNum > variableCostPerUnitNum) {
        calculateBreakEven()
      }
    }
  }, [fixedCosts, variableCostPerUnit, pricePerUnit, unit])

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="fixedCosts" className="block text-sm font-medium text-gray-700 mb-1">
            Custos Fixos (mensais)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">R$</span>
            </div>
            <input
              id="fixedCosts"
              type="number"
              value={fixedCosts}
              onChange={(e) => setFixedCosts(e.target.value)}
              placeholder="Ex: 5000"
              className="calculator-input pl-10"
              step="0.01"
              min="0"
            />
          </div>
          {errors.fixedCosts && <p className="text-red-500 text-sm mt-1">{errors.fixedCosts}</p>}
        </div>

        <div>
          <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
            Unidade de Medida
          </label>
          <input
            id="unit"
            type="text"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="Ex: unidades, peças, horas"
            className="calculator-input"
          />
        </div>

        <div>
          <label htmlFor="variableCostPerUnit" className="block text-sm font-medium text-gray-700 mb-1">
            Custo Variável por {unit}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">R$</span>
            </div>
            <input
              id="variableCostPerUnit"
              type="number"
              value={variableCostPerUnit}
              onChange={(e) => setVariableCostPerUnit(e.target.value)}
              placeholder="Ex: 10"
              className="calculator-input pl-10"
              step="0.01"
              min="0"
            />
          </div>
          {errors.variableCostPerUnit && <p className="text-red-500 text-sm mt-1">{errors.variableCostPerUnit}</p>}
        </div>

        <div>
          <label htmlFor="pricePerUnit" className="block text-sm font-medium text-gray-700 mb-1">
            Preço de Venda por {unit}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">R$</span>
            </div>
            <input
              id="pricePerUnit"
              type="number"
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(e.target.value)}
              placeholder="Ex: 25"
              className="calculator-input pl-10"
              step="0.01"
              min="0.01"
            />
          </div>
          {errors.pricePerUnit && <p className="text-red-500 text-sm mt-1">{errors.pricePerUnit}</p>}
        </div>
      </div>

      <button onClick={calculateBreakEven} className="calculator-button">
        Calcular Ponto de Equilíbrio
      </button>

      {result && (
        <div className="calculator-result">
          <h3 className="text-lg font-semibold mb-4">Resultado:</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-md border border-blue-100 flex flex-col items-center justify-center">
              <h4 className="text-lg font-semibold text-blue-800 mb-2">Ponto de Equilíbrio</h4>
              <div className="text-4xl font-bold text-blue-700 mb-2">
                {Math.ceil(result.breakEvenUnits)} <span className="text-lg">{result.unit}</span>
              </div>
              <p className="text-sm text-gray-600">
                Você precisa vender pelo menos {Math.ceil(result.breakEvenUnits)} {result.unit} por mês
              </p>
            </div>

            <div className="bg-green-50 p-6 rounded-md border border-green-100 flex flex-col items-center justify-center">
              <h4 className="text-lg font-semibold text-green-800 mb-2">Receita no Ponto de Equilíbrio</h4>
              <div className="text-4xl font-bold text-green-700 mb-2">
                {formatCurrency(result.breakEvenRevenue)}
              </div>
              <p className="text-sm text-gray-600">
                Faturamento mínimo mensal necessário
              </p>
            </div>
          </div>

          <div className="mb-8 bg-gray-50 p-4 rounded-md border border-gray-200">
            <h4 className="font-medium mb-3">Análise de Contribuição</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-100 rounded-md">
                <div className="text-sm text-gray-500 mb-1">Margem de Contribuição por {result.unit}</div>
                <div className="font-semibold text-xl">{formatCurrency(result.contributionMarginPerUnit)}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatCurrency(result.pricePerUnit)} - {formatCurrency(result.variableCostPerUnit)}
                </div>
              </div>
              
              <div className="p-3 bg-gray-100 rounded-md">
                <div className="text-sm text-gray-500 mb-1">Margem de Contribuição (%)</div>
                <div className="font-semibold text-xl">{result.contributionMarginPercentage}%</div>
                <div className="text-xs text-gray-500 mt-1">
                  ({formatCurrency(result.contributionMarginPerUnit)} ÷ {formatCurrency(result.pricePerUnit)}) × 100
                </div>
              </div>
              
              <div className="p-3 bg-gray-100 rounded-md">
                <div className="text-sm text-gray-500 mb-1">Contribuição Total no P.E.</div>
                <div className="font-semibold text-xl">{formatCurrency(result.totalContributionMargin)}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Igual aos custos fixos: {formatCurrency(result.fixedCosts)}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8 bg-blue-50 p-4 rounded-md border border-blue-100">
            <h4 className="font-medium mb-3 text-blue-800">Fórmulas Utilizadas</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
              <div>
                <p className="text-sm text-gray-600 mb-1">Quantidade de {result.unit}</p>
                <p className="font-mono bg-white p-2 rounded border border-blue-100">
                  P.E. = {formatCurrency(result.fixedCosts)} ÷ ({formatCurrency(result.pricePerUnit)} - {formatCurrency(result.variableCostPerUnit)})
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-1">Valor em R$</p>
                <p className="font-mono bg-white p-2 rounded border border-blue-100">
                  P.E. = {formatCurrency(result.fixedCosts)} ÷ {result.contributionMarginPercentage}%
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-medium mb-3">Análise de Sensibilidade</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-md">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-medium text-gray-700">Cenário</th>
                    <th className="py-2 px-4 border-b border-gray-200 text-right text-sm font-medium text-gray-700">P.E. ({result.unit})</th>
                    <th className="py-2 px-4 border-b border-gray-200 text-right text-sm font-medium text-gray-700">Variação</th>
                  </tr>
                </thead>
                <tbody>
                  {result.sensitivityAnalysis.map((item: any, index: number) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                      <td className="py-2 px-4 border-b border-gray-200 text-sm">{item.label}</td>
                      <td className="py-2 px-4 border-b border-gray-200 text-right text-sm font-medium">
                        {Math.ceil(item.units)} {result.unit}
                      </td>
                      <td className={`py-2 px-4 border-b border-gray-200 text-right text-sm font-medium ${
                        item.change > 0 ? "text-red-600" : "text-green-600"
                      }`}>
                        {item.change > 0 ? "+" : ""}{item.change}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-md border border-amber-100 text-sm">
            <h4 className="font-medium mb-2 text-amber-800">Observações Importantes:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>O ponto de equilíbrio representa o volume de vendas onde não há lucro nem prejuízo.</li>
              <li>Abaixo do ponto de equilíbrio, a empresa opera com prejuízo.</li>
              <li>Acima do ponto de equilíbrio, cada unidade adicional vendida contribui diretamente para o lucro.</li>
              <li>Esta análise considera um volume de produção e vendas constante ao longo do tempo.</li>
              <li>Diferentes produtos com diferentes margens requerem uma análise mais complexa.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
