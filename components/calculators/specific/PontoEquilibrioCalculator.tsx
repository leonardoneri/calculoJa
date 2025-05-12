"use client"

import { useState, useEffect } from "react"
import { z } from "zod"

interface PontoEquilibrioCalculatorProps {
  onInputChange: (name: string, value: any) => void
  onCalculate: (result: any) => void
  config: any
}

const pontoEquilibrioSchema = z.object({
  fixedCosts: z.number().nonnegative("Os custos fixos devem ser maiores ou iguais a zero"),
  unitPrice: z.number().positive("O preço unitário deve ser maior que zero"),
  unitVariableCost: z
    .number()
    .nonnegative("O custo variável unitário deve ser maior ou igual a zero")
    .refine((val) => val >= 0, {
      message: "O custo variável unitário deve ser maior ou igual a zero",
    }),
})

export default function PontoEquilibrioCalculator({
  onInputChange,
  onCalculate,
  config,
}: PontoEquilibrioCalculatorProps) {
  const [fixedCosts, setFixedCosts] = useState<string>("")
  const [unitPrice, setUnitPrice] = useState<string>("")
  const [unitVariableCost, setUnitVariableCost] = useState<string>("")
  const [result, setResult] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateInput = () => {
    try {
      const fixedCostsNum = Number.parseFloat(fixedCosts)
      const unitPriceNum = Number.parseFloat(unitPrice)
      const unitVariableCostNum = Number.parseFloat(unitVariableCost)

      // Additional validation to ensure unitVariableCost < unitPrice
      if (unitVariableCostNum >= unitPriceNum) {
        setErrors({
          unitVariableCost: "O custo variável unitário deve ser menor que o preço de venda",
        })
        return null
      }

      pontoEquilibrioSchema.parse({
        fixedCosts: fixedCostsNum,
        unitPrice: unitPriceNum,
        unitVariableCost: unitVariableCostNum,
      })

      setErrors({})
      return { fixedCostsNum, unitPriceNum, unitVariableCostNum }
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

    const { fixedCostsNum, unitPriceNum, unitVariableCostNum } = validatedInput

    // Calculate unit contribution margin
    const unitContributionMargin = unitPriceNum - unitVariableCostNum

    // Calculate contribution margin ratio
    const contributionMarginRatio = unitContributionMargin / unitPriceNum

    // Calculate break-even point in units
    const breakEvenUnits = fixedCostsNum / unitContributionMargin

    // Calculate break-even point in revenue
    const breakEvenRevenue = breakEvenUnits * unitPriceNum

    // Calculate profit at different sales levels
    const salesLevels = [
      Math.round(breakEvenUnits * 0.5), // 50% of break-even
      Math.round(breakEvenUnits * 0.75), // 75% of break-even
      Math.round(breakEvenUnits), // At break-even
      Math.round(breakEvenUnits * 1.25), // 125% of break-even
      Math.round(breakEvenUnits * 1.5), // 150% of break-even
    ]

    const profitAnalysis = salesLevels.map((units) => {
      const revenue = units * unitPriceNum
      const variableCosts = units * unitVariableCostNum
      const totalCosts = fixedCostsNum + variableCosts
      const profit = revenue - totalCosts

      return {
        units,
        revenue: Number.parseFloat(revenue.toFixed(2)),
        variableCosts: Number.parseFloat(variableCosts.toFixed(2)),
        fixedCosts: fixedCostsNum,
        totalCosts: Number.parseFloat(totalCosts.toFixed(2)),
        profit: Number.parseFloat(profit.toFixed(2)),
      }
    })

    // Calculate safety margin
    const targetSales = breakEvenUnits * 1.2 // 20% above break-even as an example
    const safetyMargin = ((targetSales - breakEvenUnits) / targetSales) * 100

    const calculationResult = {
      fixedCosts: fixedCostsNum,
      unitPrice: unitPriceNum,
      unitVariableCost: unitVariableCostNum,
      unitContributionMargin: Number.parseFloat(unitContributionMargin.toFixed(2)),
      contributionMarginRatio: Number.parseFloat((contributionMarginRatio * 100).toFixed(2)),
      breakEvenUnits: Math.round(breakEvenUnits),
      breakEvenRevenue: Number.parseFloat(breakEvenRevenue.toFixed(2)),
      profitAnalysis,
      safetyMargin: Number.parseFloat(safetyMargin.toFixed(2)),
    }

    setResult(calculationResult)

    // Call parent callbacks
    onInputChange("fixedCosts", fixedCostsNum)
    onInputChange("unitPrice", unitPriceNum)
    onInputChange("unitVariableCost", unitVariableCostNum)
    onCalculate(calculationResult)
  }

  // Calculate automatically when inputs change
  useEffect(() => {
    if (fixedCosts && unitPrice && unitVariableCost) {
      const fixedCostsNum = Number.parseFloat(fixedCosts)
      const unitPriceNum = Number.parseFloat(unitPrice)
      const unitVariableCostNum = Number.parseFloat(unitVariableCost)

      if (
        !isNaN(fixedCostsNum) &&
        !isNaN(unitPriceNum) &&
        !isNaN(unitVariableCostNum) &&
        fixedCostsNum >= 0 &&
        unitPriceNum > 0 &&
        unitVariableCostNum >= 0 &&
        unitVariableCostNum < unitPriceNum
      ) {
        calculateBreakEven()
      }
    }
  }, [fixedCosts, unitPrice, unitVariableCost])

  // Format currency
  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <label htmlFor="fixedCosts" className="block text-sm font-medium text-gray-700 mb-1">
            Custos Fixos Totais (R$/mês)
          </label>
          <input
            id="fixedCosts"
            type="number"
            value={fixedCosts}
            onChange={(e) => setFixedCosts(e.target.value)}
            placeholder="Ex: 10000"
            className="calculator-input"
            min="0"
            step="0.01"
          />
          {errors.fixedCosts && <p className="text-red-500 text-sm mt-1">{errors.fixedCosts}</p>}
        </div>

        <div>
          <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700 mb-1">
            Preço de Venda Unitário (R$)
          </label>
          <input
            id="unitPrice"
            type="number"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
            placeholder="Ex: 50"
            className="calculator-input"
            min="0.01"
            step="0.01"
          />
          {errors.unitPrice && <p className="text-red-500 text-sm mt-1">{errors.unitPrice}</p>}
        </div>

        <div>
          <label htmlFor="unitVariableCost" className="block text-sm font-medium text-gray-700 mb-1">
            Custo Variável Unitário (R$)
          </label>
          <input
            id="unitVariableCost"
            type="number"
            value={unitVariableCost}
            onChange={(e) => setUnitVariableCost(e.target.value)}
            placeholder="Ex: 30"
            className="calculator-input"
            min="0"
            step="0.01"
          />
          {errors.unitVariableCost && <p className="text-red-500 text-sm mt-1">{errors.unitVariableCost}</p>}
        </div>
      </div>

      <button onClick={calculateBreakEven} className="calculator-button">
        Calcular Ponto de Equilíbrio
      </button>

      {result && (
        <div className="calculator-result">
          <h3 className="text-lg font-semibold mb-4">Resultado:</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
              <p className="text-sm text-gray-600 mb-1">Ponto de Equilíbrio (Unidades)</p>
              <p className="text-xl font-bold text-blue-700">{result.breakEvenUnits.toLocaleString()} unidades</p>
              <p className="text-xs text-gray-500 mt-1">Quantidade necessária para cobrir todos os custos</p>
            </div>

            <div className="bg-green-50 p-4 rounded-md border border-green-100">
              <p className="text-sm text-gray-600 mb-1">Ponto de Equilíbrio (Receita)</p>
              <p className="text-xl font-bold text-green-700">{formatCurrency(result.breakEvenRevenue)}</p>
              <p className="text-xs text-gray-500 mt-1">Faturamento necessário para cobrir todos os custos</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-md border border-purple-100">
              <p className="text-sm text-gray-600 mb-1">Margem de Contribuição Unitária</p>
              <p className="text-xl font-bold text-purple-700">{formatCurrency(result.unitContributionMargin)}</p>
              <p className="text-xs text-gray-500 mt-1">
                Quanto cada unidade contribui para cobrir custos fixos e gerar lucro
              </p>
            </div>

            <div className="bg-amber-50 p-4 rounded-md border border-amber-100">
              <p className="text-sm text-gray-600 mb-1">Índice de Margem de Contribuição</p>
              <p className="text-xl font-bold text-amber-700">{result.contributionMarginRatio}%</p>
              <p className="text-xs text-gray-500 mt-1">
                Percentual da receita que contribui para cobrir custos fixos e gerar lucro
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-medium mb-2">Análise de Lucro em Diferentes Níveis de Venda:</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border-b text-left">Unidades</th>
                    <th className="py-2 px-4 border-b text-right">Receita</th>
                    <th className="py-2 px-4 border-b text-right">Custos Variáveis</th>
                    <th className="py-2 px-4 border-b text-right">Custos Fixos</th>
                    <th className="py-2 px-4 border-b text-right">Custos Totais</th>
                    <th className="py-2 px-4 border-b text-right">Lucro/Prejuízo</th>
                  </tr>
                </thead>
                <tbody>
                  {result.profitAnalysis.map((analysis: any, index: number) => (
                    <tr
                      key={index}
                      className={`border-b hover:bg-gray-50 ${
                        analysis.profit < 0 ? "bg-red-50" : analysis.profit === 0 ? "bg-yellow-50" : "bg-green-50"
                      }`}
                    >
                      <td className="py-2 px-4">{analysis.units.toLocaleString()}</td>
                      <td className="py-2 px-4 text-right">{formatCurrency(analysis.revenue)}</td>
                      <td className="py-2 px-4 text-right">{formatCurrency(analysis.variableCosts)}</td>
                      <td className="py-2 px-4 text-right">{formatCurrency(analysis.fixedCosts)}</td>
                      <td className="py-2 px-4 text-right">{formatCurrency(analysis.totalCosts)}</td>
                      <td
                        className={`py-2 px-4 text-right font-medium ${
                          analysis.profit < 0
                            ? "text-red-600"
                            : analysis.profit > 0
                              ? "text-green-600"
                              : "text-yellow-600"
                        }`}
                      >
                        {formatCurrency(analysis.profit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <h4 className="font-medium mb-2">Fórmulas Utilizadas:</h4>
              <ul className="text-sm space-y-1">
                <li>
                  <span className="font-mono">Margem de Contribuição = Preço Unitário - Custo Variável Unitário</span>
                </li>
                <li>
                  <span className="font-mono">
                    Ponto de Equilíbrio (unidades) = Custos Fixos ÷ Margem de Contribuição
                  </span>
                </li>
                <li>
                  <span className="font-mono">
                    Ponto de Equilíbrio (R$) = Ponto de Equilíbrio (unidades) × Preço Unitário
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100">
              <h4 className="font-medium mb-2">Dicas para Reduzir o Ponto de Equilíbrio:</h4>
              <ul className="text-sm space-y-1">
                <li>• Reduzir custos fixos (renegociar aluguéis, otimizar processos, etc.)</li>
                <li>• Aumentar o preço de venda (se o mercado permitir)</li>
                <li>• Reduzir custos variáveis (negociar com fornecedores, otimizar produção)</li>
                <li>• Melhorar o mix de produtos, priorizando itens com maior margem</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
            <p className="text-sm font-medium text-blue-800 mb-2">💡 Interpretação do Resultado</p>
            <p className="text-sm text-blue-700 mb-2">
              Seu negócio precisa vender <strong>{result.breakEvenUnits.toLocaleString()} unidades</strong> ou faturar{" "}
              <strong>{formatCurrency(result.breakEvenRevenue)}</strong> para cobrir todos os custos e atingir o ponto
              de equilíbrio.
            </p>
            <p className="text-sm text-blue-700">
              Cada unidade vendida contribui com <strong>{formatCurrency(result.unitContributionMargin)}</strong> para
              cobrir os custos fixos. Após atingir o ponto de equilíbrio, cada unidade adicional vendida gera este mesmo
              valor em lucro.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
