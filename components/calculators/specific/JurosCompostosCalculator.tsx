"use client"

import { useState, useEffect } from "react"
import { z } from "zod"

interface JurosCompostosCalculatorProps {
  onInputChange: (name: string, value: any) => void
  onCalculate: (result: any) => void
  config: any
}

const jurosSchema = z.object({
  initialValue: z.number().nonnegative("O valor inicial deve ser maior ou igual a zero"),
  monthlyContribution: z.number().nonnegative("A contribuição mensal deve ser maior ou igual a zero"),
  interestRate: z.number().nonnegative("A taxa de juros deve ser maior ou igual a zero"),
  period: z.number().positive("O período deve ser maior que zero"),
})

export default function JurosCompostosCalculator({
  onInputChange,
  onCalculate,
  config,
}: JurosCompostosCalculatorProps) {
  const [initialValue, setInitialValue] = useState<string>("")
  const [monthlyContribution, setMonthlyContribution] = useState<string>("")
  const [interestRate, setInterestRate] = useState<string>("")
  const [period, setPeriod] = useState<string>("")
  const [periodType, setPeriodType] = useState<"months" | "years">("years")
  const [result, setResult] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateInput = () => {
    try {
      const initialValueNum = Number.parseFloat(initialValue) || 0
      const monthlyContributionNum = Number.parseFloat(monthlyContribution) || 0
      const interestRateNum = Number.parseFloat(interestRate) || 0
      const periodNum = Number.parseInt(period) || 0

      jurosSchema.parse({
        initialValue: initialValueNum,
        monthlyContribution: monthlyContributionNum,
        interestRate: interestRateNum,
        period: periodNum,
      })

      setErrors({})
      return {
        initialValueNum,
        monthlyContributionNum,
        interestRateNum,
        periodNum,
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

  const calculateCompoundInterest = () => {
    const validatedInput = validateInput()
    if (!validatedInput) return

    const { initialValueNum, monthlyContributionNum, interestRateNum, periodNum } = validatedInput

    // Convert annual rate to monthly if period is in months
    const monthlyRate = interestRateNum / 100 / 12

    // Convert period to months if it's in years
    const totalMonths = periodType === "years" ? periodNum * 12 : periodNum

    let futureValue = initialValueNum
    let totalContributions = initialValueNum
    let interestEarned = 0

    // Calculate month by month
    for (let i = 0; i < totalMonths; i++) {
      futureValue = futureValue * (1 + monthlyRate) + monthlyContributionNum
      if (i > 0) {
        totalContributions += monthlyContributionNum
      }
    }

    interestEarned = futureValue - totalContributions

    const calculationResult = {
      futureValue: Number.parseFloat(futureValue.toFixed(2)),
      totalContributions: Number.parseFloat(totalContributions.toFixed(2)),
      interestEarned: Number.parseFloat(interestEarned.toFixed(2)),
      monthlyRate: monthlyRate,
      totalMonths: totalMonths,
    }

    setResult(calculationResult)

    // Call parent callbacks
    onInputChange("initialValue", initialValueNum)
    onInputChange("monthlyContribution", monthlyContributionNum)
    onInputChange("interestRate", interestRateNum)
    onInputChange("period", periodNum)
    onInputChange("periodType", periodType)
    onCalculate(calculationResult)
  }

  // Calculate automatically when all inputs are valid
  useEffect(() => {
    if (initialValue && interestRate && period) {
      const initialValueNum = Number.parseFloat(initialValue)
      const interestRateNum = Number.parseFloat(interestRate)
      const periodNum = Number.parseInt(period)

      if (
        !isNaN(initialValueNum) &&
        !isNaN(interestRateNum) &&
        !isNaN(periodNum) &&
        initialValueNum >= 0 &&
        interestRateNum >= 0 &&
        periodNum > 0
      ) {
        calculateCompoundInterest()
      }
    }
  }, [initialValue, monthlyContribution, interestRate, period, periodType])

  // Format currency
  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="initialValue" className="block text-sm font-medium text-gray-700 mb-1">
            Valor Inicial (R$)
          </label>
          <input
            id="initialValue"
            type="number"
            value={initialValue}
            onChange={(e) => setInitialValue(e.target.value)}
            placeholder="Ex: 1000"
            className="calculator-input"
            min="0"
            step="0.01"
          />
          {errors.initialValue && <p className="text-red-500 text-sm mt-1">{errors.initialValue}</p>}
        </div>

        <div>
          <label htmlFor="monthlyContribution" className="block text-sm font-medium text-gray-700 mb-1">
            Aporte Mensal (R$)
          </label>
          <input
            id="monthlyContribution"
            type="number"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(e.target.value)}
            placeholder="Ex: 100"
            className="calculator-input"
            min="0"
            step="0.01"
          />
          {errors.monthlyContribution && <p className="text-red-500 text-sm mt-1">{errors.monthlyContribution}</p>}
        </div>

        <div>
          <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700 mb-1">
            Taxa de Juros (% ao ano)
          </label>
          <input
            id="interestRate"
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            placeholder="Ex: 10"
            className="calculator-input"
            min="0"
            step="0.01"
          />
          {errors.interestRate && <p className="text-red-500 text-sm mt-1">{errors.interestRate}</p>}
        </div>

        <div>
          <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-1">
            Período
          </label>
          <div className="flex">
            <input
              id="period"
              type="number"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="Ex: 5"
              className="calculator-input rounded-r-none flex-grow"
              min="1"
              step="1"
            />
            <select
              value={periodType}
              onChange={(e) => setPeriodType(e.target.value as "months" | "years")}
              className="border border-l-0 border-gray-300 rounded-r-md p-2 bg-gray-50"
            >
              <option value="years">Anos</option>
              <option value="months">Meses</option>
            </select>
          </div>
          {errors.period && <p className="text-red-500 text-sm mt-1">{errors.period}</p>}
        </div>
      </div>

      <button onClick={calculateCompoundInterest} className="calculator-button">
        Calcular Juros Compostos
      </button>

      {result && (
        <div className="calculator-result">
          <h3 className="text-lg font-semibold mb-4">Resultado:</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
              <p className="text-sm text-gray-600 mb-1">Valor Final</p>
              <p className="text-xl font-bold text-blue-700">{formatCurrency(result.futureValue)}</p>
            </div>

            <div className="bg-green-50 p-4 rounded-md border border-green-100">
              <p className="text-sm text-gray-600 mb-1">Total Investido</p>
              <p className="text-xl font-bold text-green-700">{formatCurrency(result.totalContributions)}</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-md border border-purple-100">
              <p className="text-sm text-gray-600 mb-1">Juros Ganhos</p>
              <p className="text-xl font-bold text-purple-700">{formatCurrency(result.interestEarned)}</p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="font-medium mb-2">Detalhes do Cálculo:</h4>
            <ul className="text-sm space-y-1">
              <li>Taxa de juros mensal: {(result.monthlyRate * 100).toFixed(4)}%</li>
              <li>Período total em meses: {result.totalMonths}</li>
              <li>Rendimento total: {((result.interestEarned / result.totalContributions) * 100).toFixed(2)}%</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
