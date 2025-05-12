"use client"

import { useState, useEffect } from "react"
import { z } from "zod"

interface ValorFuturoCalculatorProps {
  onInputChange: (name: string, value: any) => void
  onCalculate: (result: any) => void
  config: any
}

const valorFuturoSchema = z.object({
  initialValue: z.number().nonnegative("O valor inicial deve ser maior ou igual a zero"),
  monthlyContribution: z.number().nonnegative("A contribuição mensal deve ser maior ou igual a zero"),
  interestRate: z.number().nonnegative("A taxa de juros deve ser maior ou igual a zero"),
  period: z.number().positive("O período deve ser maior que zero"),
  inflationRate: z.number().nonnegative("A taxa de inflação deve ser maior ou igual a zero").optional(),
})

export default function ValorFuturoCalculator({
  onInputChange,
  onCalculate,
  config,
}: ValorFuturoCalculatorProps) {
  const [initialValue, setInitialValue] = useState<string>("")
  const [monthlyContribution, setMonthlyContribution] = useState<string>("")
  const [interestRate, setInterestRate] = useState<string>("")
  const [period, setPeriod] = useState<string>("")
  const [periodType, setPeriodType] = useState<"months" | "years">("years")
  const [inflationRate, setInflationRate] = useState<string>("4.5")
  const [considerInflation, setConsiderInflation] = useState<boolean>(true)
  const [result, setResult] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateInput = () => {
    try {
      const initialValueNum = Number.parseFloat(initialValue) || 0
      const monthlyContributionNum = Number.parseFloat(monthlyContribution) || 0
      const interestRateNum = Number.parseFloat(interestRate) || 0
      const periodNum = Number.parseInt(period) || 0
      const inflationRateNum = considerInflation ? Number.parseFloat(inflationRate) || 0 : 0

      valorFuturoSchema.parse({
        initialValue: initialValueNum,
        monthlyContribution: monthlyContributionNum,
        interestRate: interestRateNum,
        period: periodNum,
        inflationRate: inflationRateNum,
      })

      setErrors({})
      return {
        initialValueNum,
        monthlyContributionNum,
        interestRateNum,
        periodNum,
        inflationRateNum,
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

  const calculateFutureValue = () => {
    const validatedInput = validateInput()
    if (!validatedInput) return

    const { initialValueNum, monthlyContributionNum, interestRateNum, periodNum, inflationRateNum } = validatedInput

    // Convert annual rate to monthly
    const monthlyRate = interestRateNum / 100 / 12

    // Convert period to months if it's in years
    const totalMonths = periodType === "years" ? periodNum * 12 : periodNum

    // Calculate future value without inflation adjustment
    let futureValue = initialValueNum
    let totalContributions = initialValueNum
    
    // Month by month calculation
    for (let i = 0; i < totalMonths; i++) {
      // Add interest
      futureValue = futureValue * (1 + monthlyRate)
      
      // Add monthly contribution
      futureValue += monthlyContributionNum
      
      // Track total contributions
      if (i > 0) {
        totalContributions += monthlyContributionNum
      }
    }

    // Calculate real future value (adjusted for inflation)
    let realFutureValue = futureValue
    
    if (considerInflation && inflationRateNum > 0) {
      // Convert annual inflation to monthly
      const monthlyInflationRate = inflationRateNum / 100 / 12
      
      // Calculate inflation factor
      const inflationFactor = Math.pow(1 + monthlyInflationRate, totalMonths)
      
      // Adjust future value for inflation
      realFutureValue = futureValue / inflationFactor
    }

    // Calculate interest earned
    const nominalInterestEarned = futureValue - totalContributions
    const realInterestEarned = realFutureValue - totalContributions

    // Prepare yearly breakdown
    const yearlyBreakdown = []
    let tempFutureValue = initialValueNum
    let yearlyContributions = initialValueNum
    
    // If period type is years, show yearly breakdown
    const yearsToShow = periodType === "years" ? periodNum : Math.ceil(totalMonths / 12)
    
    for (let year = 1; year <= yearsToShow; year++) {
      // Calculate months for this year
      const monthsThisYear = periodType === "years" ? 12 : (year * 12 <= totalMonths ? 12 : totalMonths % 12)
      
      // Calculate value at end of this year
      let yearEndValue = tempFutureValue
      let yearlyContribution = 0
      
      for (let month = 0; month < monthsThisYear; month++) {
        yearEndValue = yearEndValue * (1 + monthlyRate)
        yearEndValue += monthlyContributionNum
        yearlyContribution += monthlyContributionNum
      }
      
      // Calculate real value adjusted for inflation if needed
      let realYearEndValue = yearEndValue
      if (considerInflation && inflationRateNum > 0) {
        const yearlyInflationFactor = Math.pow(1 + (inflationRateNum / 100), year)
        realYearEndValue = yearEndValue / yearlyInflationFactor
      }
      
      yearlyBreakdown.push({
        year,
        nominalValue: yearEndValue,
        realValue: realYearEndValue,
        contribution: yearlyContribution,
      })
      
      // Update for next year
      tempFutureValue = yearEndValue
      yearlyContributions += yearlyContribution
    }

    const calculationResult = {
      futureValue: Number.parseFloat(futureValue.toFixed(2)),
      realFutureValue: Number.parseFloat(realFutureValue.toFixed(2)),
      totalContributions: Number.parseFloat(totalContributions.toFixed(2)),
      nominalInterestEarned: Number.parseFloat(nominalInterestEarned.toFixed(2)),
      realInterestEarned: Number.parseFloat(realInterestEarned.toFixed(2)),
      inflationImpact: Number.parseFloat((futureValue - realFutureValue).toFixed(2)),
      initialValue: initialValueNum,
      monthlyContribution: monthlyContributionNum,
      interestRate: interestRateNum,
      period: periodNum,
      periodType,
      inflationRate: inflationRateNum,
      considerInflation,
      yearlyBreakdown: yearlyBreakdown.map(breakdown => ({
        year: breakdown.year,
        nominalValue: Number.parseFloat(breakdown.nominalValue.toFixed(2)),
        realValue: Number.parseFloat(breakdown.realValue.toFixed(2)),
        contribution: Number.parseFloat(breakdown.contribution.toFixed(2)),
      })),
    }

    setResult(calculationResult)

    // Call parent callbacks
    onInputChange("initialValue", initialValueNum)
    onInputChange("monthlyContribution", monthlyContributionNum)
    onInputChange("interestRate", interestRateNum)
    onInputChange("period", periodNum)
    onInputChange("periodType", periodType)
    onInputChange("inflationRate", inflationRateNum)
    onInputChange("considerInflation", considerInflation)
    onCalculate(calculationResult)
  }

  // Calculate automatically when all inputs are valid
  useEffect(() => {
    if (initialValue && interestRate && period) {
      const initialValueNum = Number.parseFloat(initialValue)
      const interestRateNum = Number.parseFloat(interestRate)
      const periodNum = Number.parseInt(period)
      const inflationRateNum = considerInflation ? Number.parseFloat(inflationRate) : 0

      if (
        !isNaN(initialValueNum) &&
        !isNaN(interestRateNum) &&
        !isNaN(periodNum) &&
        (!considerInflation || !isNaN(inflationRateNum)) &&
        initialValueNum >= 0 &&
        interestRateNum >= 0 &&
        periodNum > 0 &&
        (!considerInflation || inflationRateNum >= 0)
      ) {
        calculateFutureValue()
      }
    }
  }, [initialValue, monthlyContribution, interestRate, period, periodType, inflationRate, considerInflation])

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

        <div className="md:col-span-2">
          <div className="flex items-center mb-4">
            <input
              id="considerInflation"
              type="checkbox"
              checked={considerInflation}
              onChange={(e) => setConsiderInflation(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="considerInflation" className="ml-2 block text-sm text-gray-700">
              Considerar inflação no cálculo
            </label>
          </div>
        </div>

        {considerInflation && (
          <div className="md:col-span-2">
            <label htmlFor="inflationRate" className="block text-sm font-medium text-gray-700 mb-1">
              Taxa de Inflação Anual (%)
            </label>
            <input
              id="inflationRate"
              type="number"
              value={inflationRate}
              onChange={(e) => setInflationRate(e.target.value)}
              placeholder="Ex: 4.5"
              className="calculator-input"
              min="0"
              max="30"
              step="0.1"
            />
            {errors.inflationRate && <p className="text-red-500 text-sm mt-1">{errors.inflationRate}</p>}
          </div>
        )}
      </div>

      <button onClick={calculateFutureValue} className="calculator-button">
        Calcular Valor Futuro
      </button>

      {result && (
        <div className="calculator-result">
          <h3 className="text-lg font-semibold mb-4">Resultado:</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
              <p className="text-sm text-gray-600 mb-1">Valor Futuro Nominal</p>
              <p className="text-xl font-bold text-blue-700">{formatCurrency(result.futureValue)}</p>
              <p className="text-xs text-gray-500 mt-1">Valor sem ajuste pela inflação</p>
            </div>

            {considerInflation && (
              <div className="bg-green-50 p-4 rounded-md border border-green-100">
                <p className="text-sm text-gray-600 mb-1">Valor Futuro Real</p>
                <p className="text-xl font-bold text-green-700">{formatCurrency(result.realFutureValue)}</p>
                <p className="text-xs text-gray-500 mt-1">Valor ajustado pela inflação</p>
              </div>
            )}

            <div className="bg-purple-50 p-4 rounded-md border border-purple-100">
              <p className="text-sm text-gray-600 mb-1">Total Investido</p>
              <p className="text-xl font-bold text-purple-700">{formatCurrency(result.totalContributions)}</p>
              <p className="text-xs text-gray-500 mt-1">Valor inicial + aportes mensais</p>
            </div>

            <div className="bg-amber-50 p-4 rounded-md border border-amber-100">
              <p className="text-sm text-gray-600 mb-1">
                Juros Ganhos {considerInflation ? "Reais" : ""}
              </p>
              <p className="text-xl font-bold text-amber-700">
                {formatCurrency(considerInflation ? result.realInterestEarned : result.nominalInterestEarned)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Rendimento {considerInflation ? "ajustado pela inflação" : ""}
              </p>
            </div>

            {considerInflation && (
              <div className="bg-red-50 p-4 rounded-md border border-red-100 md:col-span-2">
                <p className="text-sm text-gray-600 mb-1">Impacto da Inflação</p>
                <p className="text-xl font-bold text-red-700">{formatCurrency(result.inflationImpact)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Valor "perdido" devido à inflação de {result.inflationRate}% ao ano
                </p>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h4 className="font-medium mb-2">Projeção Anual:</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border-b text-left">Ano</th>
                    <th className="py-2 px-4 border-b text-right">Aporte no Ano</th>
                    <th className="py-2 px-4 border-b text-right">Valor Nominal</th>
                    {considerInflation && (
                      <th className="py-2 px-4 border-b text-right">Valor Real</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {result.yearlyBreakdown.map((yearData: any) => (
                    <tr key={yearData.year} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{yearData.year}</td>
                      <td className="py-2 px-4 text-right">{formatCurrency(yearData.contribution)}</td>
                      <td className="py-2 px-4 text-right">{formatCurrency(yearData.nominalValue)}</td>
                      {considerInflation && (
                        <td className="py-2 px-4 text-right">{formatCurrency(yearData.realValue)}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="font-medium mb-2">Detalhes do Cálculo:</h4>
            <ul className="text-sm space-y-1">
              <li>Investimento inicial: {formatCurrency(result.initialValue)}</li>
              <li>Aporte mensal: {formatCurrency(result.monthlyContribution)}</li>
              <li>Taxa de juros: {result.interestRate}% ao ano</li>
              <li>Período: {result.period} {result.periodType === "years" ? "anos" : "meses"}</li>
              {considerInflation && <li>Taxa de inflação: {result.inflationRate}% ao ano</li>}
              <li>Valor futuro nominal: {formatCurrency(result.futureValue)}</li>
              {considerInflation && <li>Valor futuro real: {formatCurrency(result.realFutureValue)}</li>}
              <li>Total investido: {formatCurrency(result.totalContributions)}</li>
              <li>
                Rendimento{considerInflation ? " nominal" : ""}: {formatCurrency(result.nominalInterestEarned)} (
                {((result.nominalInterestEarned / result.totalContributions) * 100).toFixed(2)}%)
              </li>
              {considerInflation && (
                <li>
                  Rendimento real: {formatCurrency(result.realInterestEarned)} (
                  {((result.realInterestEarned / result.totalContributions) * 100).toFixed(2)}%)
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
} 