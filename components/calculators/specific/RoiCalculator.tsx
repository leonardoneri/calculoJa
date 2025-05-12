"use client"

import { useState, useEffect } from "react"
import { z } from "zod"

interface RoiCalculatorProps {
  onInputChange: (name: string, value: any) => void
  onCalculate: (result: any) => void
  config: any
}

const roiSchema = z.object({
  investmentCost: z.number().positive("O custo do investimento deve ser maior que zero"),
  returnAmount: z.number().nonnegative("O retorno deve ser maior ou igual a zero"),
  timePeriod: z.number().optional(),
})

export default function RoiCalculator({
  onInputChange,
  onCalculate,
  config,
}: RoiCalculatorProps) {
  const [investmentCost, setInvestmentCost] = useState<string>("")
  const [returnAmount, setReturnAmount] = useState<string>("")
  const [timePeriod, setTimePeriod] = useState<string>("")
  const [periodUnit, setPeriodUnit] = useState<"months" | "years">("years")
  const [result, setResult] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [includeTime, setIncludeTime] = useState<boolean>(false)

  const validateInput = () => {
    try {
      const investmentCostNum = Number.parseFloat(investmentCost) || 0
      const returnAmountNum = Number.parseFloat(returnAmount) || 0
      const timePeriodNum = includeTime ? Number.parseFloat(timePeriod) || 0 : undefined

      roiSchema.parse({
        investmentCost: investmentCostNum,
        returnAmount: returnAmountNum,
        timePeriod: timePeriodNum,
      })

      setErrors({})
      return {
        investmentCostNum,
        returnAmountNum,
        timePeriodNum,
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

  const calculateRoi = () => {
    const validatedInput = validateInput()
    if (!validatedInput) return

    const { investmentCostNum, returnAmountNum, timePeriodNum } = validatedInput

    // Calcular o ganho líquido
    const netReturn = returnAmountNum - investmentCostNum

    // Calcular o ROI simples (percentual)
    const roi = (netReturn / investmentCostNum) * 100

    // Se o período for especificado, calcular o ROI anualizado
    let annualizedRoi = roi
    
    if (includeTime && timePeriodNum && timePeriodNum > 0) {
      // Converter para anos se necessário
      const timeInYears = periodUnit === "months" ? timePeriodNum / 12 : timePeriodNum
      
      // Fórmula para ROI anualizado: ((1 + ROI/100)^(1/timeInYears) - 1) * 100
      annualizedRoi = (Math.pow(1 + roi / 100, 1 / timeInYears) - 1) * 100
    }

    const calculationResult = {
      investmentCost: investmentCostNum,
      returnAmount: returnAmountNum,
      netReturn: Number.parseFloat(netReturn.toFixed(2)),
      roi: Number.parseFloat(roi.toFixed(2)),
      annualizedRoi: Number.parseFloat(annualizedRoi.toFixed(2)),
      includeTime,
      timePeriod: timePeriodNum,
      periodUnit,
    }

    setResult(calculationResult)

    // Call parent callbacks
    onInputChange("investmentCost", investmentCostNum)
    onInputChange("returnAmount", returnAmountNum)
    onInputChange("timePeriod", timePeriodNum)
    onInputChange("periodUnit", periodUnit)
    onCalculate(calculationResult)
  }

  // Calculate automatically when all inputs are valid
  useEffect(() => {
    if (investmentCost && returnAmount && (!includeTime || timePeriod)) {
      const investmentCostNum = Number.parseFloat(investmentCost)
      const returnAmountNum = Number.parseFloat(returnAmount)
      const timePeriodNum = includeTime ? Number.parseFloat(timePeriod) : undefined

      if (
        !isNaN(investmentCostNum) &&
        !isNaN(returnAmountNum) &&
        investmentCostNum > 0 &&
        returnAmountNum >= 0 &&
        (!includeTime || (timePeriodNum !== undefined && !isNaN(timePeriodNum) && timePeriodNum > 0))
      ) {
        calculateRoi()
      }
    }
  }, [investmentCost, returnAmount, timePeriod, periodUnit, includeTime])

  // Format currency
  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="investmentCost" className="block text-sm font-medium text-gray-700 mb-1">
            Custo do Investimento (R$)
          </label>
          <input
            id="investmentCost"
            type="number"
            value={investmentCost}
            onChange={(e) => setInvestmentCost(e.target.value)}
            placeholder="Ex: 10000"
            className="calculator-input"
            min="0.01"
            step="0.01"
          />
          {errors.investmentCost && <p className="text-red-500 text-sm mt-1">{errors.investmentCost}</p>}
        </div>

        <div>
          <label htmlFor="returnAmount" className="block text-sm font-medium text-gray-700 mb-1">
            Valor de Retorno (R$)
          </label>
          <input
            id="returnAmount"
            type="number"
            value={returnAmount}
            onChange={(e) => setReturnAmount(e.target.value)}
            placeholder="Ex: 15000"
            className="calculator-input"
            min="0"
            step="0.01"
          />
          {errors.returnAmount && <p className="text-red-500 text-sm mt-1">{errors.returnAmount}</p>}
        </div>

        <div className="md:col-span-2">
          <div className="flex items-center mb-4">
            <input
              id="includeTime"
              type="checkbox"
              checked={includeTime}
              onChange={(e) => setIncludeTime(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="includeTime" className="ml-2 block text-sm text-gray-700">
              Incluir período de tempo (para calcular ROI anualizado)
            </label>
          </div>
        </div>

        {includeTime && (
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="timePeriod" className="block text-sm font-medium text-gray-700 mb-1">
                Período
              </label>
              <div className="flex">
                <input
                  id="timePeriod"
                  type="number"
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value)}
                  placeholder="Ex: 2"
                  className="calculator-input rounded-r-none flex-grow"
                  min="0.1"
                  step="0.1"
                />
                <select
                  value={periodUnit}
                  onChange={(e) => setPeriodUnit(e.target.value as "months" | "years")}
                  className="border border-l-0 border-gray-300 rounded-r-md p-2 bg-gray-50"
                >
                  <option value="years">Anos</option>
                  <option value="months">Meses</option>
                </select>
              </div>
              {errors.timePeriod && <p className="text-red-500 text-sm mt-1">{errors.timePeriod}</p>}
            </div>
          </div>
        )}
      </div>

      <button onClick={calculateRoi} className="calculator-button">
        Calcular ROI
      </button>

      {result && (
        <div className="calculator-result">
          <h3 className="text-lg font-semibold mb-4">Resultado:</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-purple-50 p-4 rounded-md border border-purple-100">
              <p className="text-sm text-gray-600 mb-1">ROI</p>
              <p className="text-xl font-bold text-purple-700">{formatPercentage(result.roi)}</p>
              <p className="text-xs text-gray-500 mt-1">
                Retorno sobre Investimento
              </p>
            </div>

            {includeTime && (
              <div className="bg-indigo-50 p-4 rounded-md border border-indigo-100">
                <p className="text-sm text-gray-600 mb-1">ROI Anualizado</p>
                <p className="text-xl font-bold text-indigo-700">{formatPercentage(result.annualizedRoi)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Retorno Anual Equivalente
                </p>
              </div>
            )}

            <div className="bg-green-50 p-4 rounded-md border border-green-100">
              <p className="text-sm text-gray-600 mb-1">Retorno Líquido</p>
              <p className="text-xl font-bold text-green-700">{formatCurrency(result.netReturn)}</p>
              <p className="text-xs text-gray-500 mt-1">
                Lucro ou Prejuízo
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="font-medium mb-2">Detalhes do Cálculo:</h4>
            <ul className="text-sm space-y-1">
              <li>Investimento: {formatCurrency(result.investmentCost)}</li>
              <li>Valor de Retorno: {formatCurrency(result.returnAmount)}</li>
              <li>ROI: <span className={result.roi >= 0 ? "text-green-600" : "text-red-600"}>{formatPercentage(result.roi)}</span></li>
              {includeTime && (
                <>
                  <li>Período: {result.timePeriod} {result.periodUnit === "years" ? "anos" : "meses"}</li>
                  <li>ROI Anualizado: <span className={result.annualizedRoi >= 0 ? "text-green-600" : "text-red-600"}>{formatPercentage(result.annualizedRoi)}</span></li>
                </>
              )}
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="font-medium mb-2">Como Interpretar:</h4>
            <ul className="text-sm space-y-1">
              <li>
                <strong>ROI positivo ({result.roi >= 0 ? "seu caso" : "não é seu caso"}):</strong> Indica que o investimento gerou lucro.
              </li>
              <li>
                <strong>ROI igual a zero:</strong> Indica que você recuperou exatamente o valor investido, sem lucro ou perda.
              </li>
              <li>
                <strong>ROI negativo ({result.roi < 0 ? "seu caso" : "não é seu caso"}):</strong> Indica que o investimento gerou prejuízo.
              </li>
              {includeTime && (
                <li>
                  <strong>ROI anualizado:</strong> Permite comparar investimentos com diferentes durações.
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
