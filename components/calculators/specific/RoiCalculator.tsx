"use client"

import { useState, useEffect } from "react"
import { z } from "zod"

interface RoiCalculatorProps {
  onInputChange: (name: string, value: any) => void
  onCalculate: (result: any) => void
  config: any
}

const roiSchema = z.object({
  initialInvestment: z.number().nonnegative("O investimento inicial deve ser maior ou igual a zero"),
  annualRevenue: z.number().nonnegative("A receita anual deve ser maior ou igual a zero"),
  annualCosts: z.number().nonnegative("Os custos anuais devem ser maiores ou iguais a zero"),
  projectDuration: z
    .number()
    .int()
    .positive("A duração do projeto deve ser um número inteiro positivo")
    .max(50, "A duração do projeto deve ser menor ou igual a 50 anos"),
  discountRate: z
    .number()
    .nonnegative("A taxa de desconto deve ser maior ou igual a zero")
    .max(100, "A taxa de desconto deve ser menor ou igual a 100%"),
})

export default function RoiCalculator({ onInputChange, onCalculate, config }: RoiCalculatorProps) {
  const [initialInvestment, setInitialInvestment] = useState<string>("")
  const [annualRevenue, setAnnualRevenue] = useState<string>("")
  const [annualCosts, setAnnualCosts] = useState<string>("")
  const [projectDuration, setProjectDuration] = useState<string>("5")
  const [discountRate, setDiscountRate] = useState<string>("10")
  const [result, setResult] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateInput = () => {
    try {
      const initialInvestmentNum = Number.parseFloat(initialInvestment)
      const annualRevenueNum = Number.parseFloat(annualRevenue)
      const annualCostsNum = Number.parseFloat(annualCosts)
      const projectDurationNum = Number.parseInt(projectDuration)
      const discountRateNum = Number.parseFloat(discountRate)

      roiSchema.parse({
        initialInvestment: initialInvestmentNum,
        annualRevenue: annualRevenueNum,
        annualCosts: annualCostsNum,
        projectDuration: projectDurationNum,
        discountRate: discountRateNum,
      })

      setErrors({})
      return {
        initialInvestmentNum,
        annualRevenueNum,
        annualCostsNum,
        projectDurationNum,
        discountRateNum,
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

  const calculateROI = () => {
    const validatedInput = validateInput()
    if (!validatedInput) return

    const { initialInvestmentNum, annualRevenueNum, annualCostsNum, projectDurationNum, discountRateNum } =
      validatedInput

    // Calculate annual profit
    const annualProfit = annualRevenueNum - annualCostsNum

    // Calculate simple ROI
    const totalProfit = annualProfit * projectDurationNum
    const simpleROI = (totalProfit / initialInvestmentNum) * 100

    // Calculate payback period
    const paybackPeriod = initialInvestmentNum / annualProfit

    // Calculate NPV and IRR
    const discountRateDecimal = discountRateNum / 100
    let npv = -initialInvestmentNum

    // Cash flows for IRR calculation
    const cashFlows = [-initialInvestmentNum]

    // Calculate NPV and prepare cash flows for IRR
    for (let year = 1; year <= projectDurationNum; year++) {
      const discountFactor = 1 / Math.pow(1 + discountRateDecimal, year)
      npv += annualProfit * discountFactor
      cashFlows.push(annualProfit)
    }

    // Calculate IRR using Newton-Raphson method
    const irr = calculateIRR(cashFlows)

    // Calculate ROI with discount rate
    const discountedROI = (npv / initialInvestmentNum) * 100

    // Calculate profitability index
    const presentValueOfCashFlows = npv + initialInvestmentNum
    const profitabilityIndex = presentValueOfCashFlows / initialInvestmentNum

    // Calculate yearly breakdown
    const yearlyBreakdown = []
    let cumulativeProfit = -initialInvestmentNum
    let breakEvenYear = null

    for (let year = 1; year <= projectDurationNum; year++) {
      const discountFactor = 1 / Math.pow(1 + discountRateDecimal, year)
      const discountedProfit = annualProfit * discountFactor
      cumulativeProfit += discountedProfit

      yearlyBreakdown.push({
        year,
        annualProfit,
        discountedProfit: Number.parseFloat(discountedProfit.toFixed(2)),
        cumulativeProfit: Number.parseFloat(cumulativeProfit.toFixed(2)),
      })

      // Determine break-even year
      if (breakEvenYear === null && cumulativeProfit >= 0) {
        breakEvenYear = year
      }
    }

    const calculationResult = {
      initialInvestment: initialInvestmentNum,
      annualRevenue: annualRevenueNum,
      annualCosts: annualCostsNum,
      annualProfit,
      projectDuration: projectDurationNum,
      discountRate: discountRateNum,
      simpleROI: Number.parseFloat(simpleROI.toFixed(2)),
      paybackPeriod: Number.parseFloat(paybackPeriod.toFixed(2)),
      npv: Number.parseFloat(npv.toFixed(2)),
      irr: irr ? Number.parseFloat((irr * 100).toFixed(2)) : null,
      discountedROI: Number.parseFloat(discountedROI.toFixed(2)),
      profitabilityIndex: Number.parseFloat(profitabilityIndex.toFixed(2)),
      yearlyBreakdown,
      breakEvenYear,
      isPositiveNPV: npv > 0,
    }

    setResult(calculationResult)

    // Call parent callbacks
    onInputChange("initialInvestment", initialInvestmentNum)
    onInputChange("annualRevenue", annualRevenueNum)
    onInputChange("annualCosts", annualCostsNum)
    onInputChange("projectDuration", projectDurationNum)
    onInputChange("discountRate", discountRateNum)
    onCalculate(calculationResult)
  }

  // Calculate IRR using Newton-Raphson method
  const calculateIRR = (cashFlows: number[]): number | null => {
    // Function to calculate NPV given a rate
    const calculateNPV = (rate: number): number => {
      let npv = cashFlows[0]
      for (let i = 1; i < cashFlows.length; i++) {
        npv += cashFlows[i] / Math.pow(1 + rate, i)
      }
      return npv
    }

    // Function to calculate the derivative of NPV
    const calculateNPVDerivative = (rate: number): number => {
      let derivative = 0
      for (let i = 1; i < cashFlows.length; i++) {
        derivative -= (i * cashFlows[i]) / Math.pow(1 + rate, i + 1)
      }
      return derivative
    }

    // Check if IRR calculation is possible
    let negativeFound = false
    let positiveFound = false
    for (const flow of cashFlows) {
      if (flow < 0) negativeFound = true
      if (flow > 0) positiveFound = true
    }
    if (!negativeFound || !positiveFound) return null

    // Newton-Raphson method
    let rate = 0.1 // Initial guess
    const maxIterations = 100
    const tolerance = 0.0000001

    for (let i = 0; i < maxIterations; i++) {
      const npv = calculateNPV(rate)
      if (Math.abs(npv) < tolerance) {
        return rate
      }

      const derivative = calculateNPVDerivative(rate)
      if (derivative === 0) break

      const newRate = rate - npv / derivative
      if (Math.abs(newRate - rate) < tolerance) {
        return newRate
      }

      rate = newRate
    }

    // If no convergence or IRR is outside reasonable bounds
    if (rate < -1 || rate > 1) return null
    return rate
  }

  // Calculate automatically when inputs change
  useEffect(() => {
    if (initialInvestment && annualRevenue && annualCosts && projectDuration && discountRate) {
      const initialInvestmentNum = Number.parseFloat(initialInvestment)
      const annualRevenueNum = Number.parseFloat(annualRevenue)
      const annualCostsNum = Number.parseFloat(annualCosts)
      const projectDurationNum = Number.parseInt(projectDuration)
      const discountRateNum = Number.parseFloat(discountRate)

      if (
        !isNaN(initialInvestmentNum) &&
        !isNaN(annualRevenueNum) &&
        !isNaN(annualCostsNum) &&
        !isNaN(projectDurationNum) &&
        !isNaN(discountRateNum) &&
        initialInvestmentNum >= 0 &&
        annualRevenueNum >= 0 &&
        annualCostsNum >= 0 &&
        projectDurationNum > 0 &&
        projectDurationNum <= 50 &&
        discountRateNum >= 0 &&
        discountRateNum <= 100
      ) {
        calculateROI()
      }
    }
  }, [initialInvestment, annualRevenue, annualCosts, projectDuration, discountRate])

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
          <label htmlFor="initialInvestment" className="block text-sm font-medium text-gray-700 mb-1">
            Investimento Inicial (R$)
          </label>
          <input
            id="initialInvestment"
            type="number"
            value={initialInvestment}
            onChange={(e) => setInitialInvestment(e.target.value)}
            placeholder="Ex: 100000"
            className="calculator-input"
            min="0"
            step="1000"
          />
          {errors.initialInvestment && <p className="text-red-500 text-sm mt-1">{errors.initialInvestment}</p>}
        </div>

        <div>
          <label htmlFor="projectDuration" className="block text-sm font-medium text-gray-700 mb-1">
            Duração do Projeto (anos)
          </label>
          <input
            id="projectDuration"
            type="number"
            value={projectDuration}
            onChange={(e) => setProjectDuration(e.target.value)}
            placeholder="Ex: 5"
            className="calculator-input"
            min="1"
            max="50"
          />
          {errors.projectDuration && <p className="text-red-500 text-sm mt-1">{errors.projectDuration}</p>}
        </div>

        <div>
          <label htmlFor="annualRevenue" className="block text-sm font-medium text-gray-700 mb-1">
            Receita Anual (R$)
          </label>
          <input
            id="annualRevenue"
            type="number"
            value={annualRevenue}
            onChange={(e) => setAnnualRevenue(e.target.value)}
            placeholder="Ex: 50000"
            className="calculator-input"
            min="0"
            step="1000"
          />
          {errors.annualRevenue && <p className="text-red-500 text-sm mt-1">{errors.annualRevenue}</p>}
        </div>

        <div>
          <label htmlFor="annualCosts" className="block text-sm font-medium text-gray-700 mb-1">
            Custos Anuais (R$)
          </label>
          <input
            id="annualCosts"
            type="number"
            value={annualCosts}
            onChange={(e) => setAnnualCosts(e.target.value)}
            placeholder="Ex: 30000"
            className="calculator-input"
            min="0"
            step="1000"
          />
          {errors.annualCosts && <p className="text-red-500 text-sm mt-1">{errors.annualCosts}</p>}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="discountRate" className="block text-sm font-medium text-gray-700 mb-1">
            Taxa de Desconto (%)
          </label>
          <input
            id="discountRate"
            type="number"
            value={discountRate}
            onChange={(e) => setDiscountRate(e.target.value)}
            placeholder="Ex: 10"
            className="calculator-input"
            min="0"
            max="100"
            step="0.1"
          />
          {errors.discountRate && <p className="text-red-500 text-sm mt-1">{errors.discountRate}</p>}
        </div>
      </div>

      <button onClick={calculateROI} className="calculator-button">
        Calcular ROI
      </button>

      {result && (
        <div className="calculator-result">
          <h3 className="text-lg font-semibold mb-4">Resultado:</h3>

          <div
            className={`p-6 rounded-md border mb-6 ${
              result.isPositiveNPV ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">ROI Simples</p>
                <p className={`text-3xl font-bold ${result.simpleROI >= 0 ? "text-green-700" : "text-red-700"}`}>
                  {result.simpleROI}%
                </p>
                <p className="text-sm text-gray-500 mt-1">Sem considerar o valor do dinheiro no tempo</p>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Valor Presente Líquido (VPL)</p>
                <p className={`text-3xl font-bold ${result.npv >= 0 ? "text-green-700" : "text-red-700"}`}>
                  {formatCurrency(result.npv)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {result.npv >= 0 ? "Projeto economicamente viável" : "Projeto economicamente inviável"}
                </p>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Taxa Interna de Retorno (TIR)</p>
                <p className="text-3xl font-bold text-blue-700">{result.irr !== null ? `${result.irr}%` : "N/A"}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {result.irr !== null && result.irr > result.discountRate
                    ? "Superior à taxa de desconto"
                    : "Inferior à taxa de desconto"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
              <h4 className="font-medium mb-2">Métricas Adicionais:</h4>
              <ul className="text-sm space-y-2">
                <li className="flex justify-between">
                  <span className="font-medium">Período de Payback:</span>
                  <span>{result.paybackPeriod.toFixed(1)} anos</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-medium">ROI Descontado:</span>
                  <span>{result.discountedROI}%</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-medium">Índice de Lucratividade:</span>
                  <span>{result.profitabilityIndex}</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-medium">Lucro Anual:</span>
                  <span>{formatCurrency(result.annualProfit)}</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-medium">Ano de Break-even:</span>
                  <span>{result.breakEvenYear !== null ? `Ano ${result.breakEvenYear}` : "Não atingido"}</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <h4 className="font-medium mb-2">Resumo do Projeto:</h4>
              <ul className="text-sm space-y-2">
                <li className="flex justify-between">
                  <span className="font-medium">Investimento Inicial:</span>
                  <span>{formatCurrency(result.initialInvestment)}</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-medium">Receita Anual:</span>
                  <span>{formatCurrency(result.annualRevenue)}</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-medium">Custos Anuais:</span>
                  <span>{formatCurrency(result.annualCosts)}</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-medium">Duração do Projeto:</span>
                  <span>{result.projectDuration} anos</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-medium">Taxa de Desconto:</span>
                  <span>{result.discountRate}%</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-medium mb-2">Fluxo de Caixa Anual:</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border-b text-left">Ano</th>
                    <th className="py-2 px-4 border-b text-right">Lucro Anual</th>
                    <th className="py-2 px-4 border-b text-right">Lucro Descontado</th>
                    <th className="py-2 px-4 border-b text-right">Lucro Acumulado</th>
                    <th className="py-2 px-4 border-b text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-4">0</td>
                    <td className="py-2 px-4 text-right text-red-600">-{formatCurrency(result.initialInvestment)}</td>
                    <td className="py-2 px-4 text-right text-red-600">-{formatCurrency(result.initialInvestment)}</td>
                    <td className="py-2 px-4 text-right text-red-600">-{formatCurrency(result.initialInvestment)}</td>
                    <td className="py-2 px-4 text-center">Investimento</td>
                  </tr>
                  {result.yearlyBreakdown.map((yearData: any, index: number) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{yearData.year}</td>
                      <td className="py-2 px-4 text-right">{formatCurrency(yearData.annualProfit)}</td>
                      <td className="py-2 px-4 text-right">{formatCurrency(yearData.discountedProfit)}</td>
                      <td
                        className={`py-2 px-4 text-right ${
                          yearData.cumulativeProfit >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {formatCurrency(yearData.cumulativeProfit)}
                      </td>
                      <td className="py-2 px-4 text-center">
                        {yearData.year === result.breakEvenYear ? (
                          <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                            Break-even
                          </span>
                        ) : yearData.cumulativeProfit >= 0 ? (
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                            Lucro
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                            Recuperação
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100 mb-4">
            <p className="text-sm font-medium text-yellow-800 mb-2">⚠️ Interpretação dos Resultados</p>
            <ul className="text-sm text-yellow-700 list-disc pl-5 space-y-1">
              <li>
                <strong>VPL (Valor Presente Líquido):</strong> {result.npv >= 0 ? "Positivo" : "Negativo"} (
                {formatCurrency(result.npv)}).{" "}
                {result.npv >= 0 ? "O projeto é economicamente viável." : "O projeto não é economicamente viável."}
              </li>
              <li>
                <strong>TIR (Taxa Interna de Retorno):</strong>{" "}
                {result.irr !== null
                  ? `${result.irr}% - ${
                      result.irr > result.discountRate
                        ? "Superior à taxa de desconto, indicando viabilidade."
                        : "Inferior à taxa de desconto, indicando inviabilidade."
                    }`
                  : "Não foi possível calcular."}
              </li>
              <li>
                <strong>Payback:</strong> {result.paybackPeriod.toFixed(1)} anos.{" "}
                {result.paybackPeriod <= result.projectDuration
                  ? `O investimento é recuperado dentro do período do projeto.`
                  : `O investimento não é recuperado dentro do período do projeto.`}
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
            <p className="text-sm font-medium text-blue-800 mb-2">💡 Conclusão</p>
            <p className="text-sm text-blue-700">
              {result.isPositiveNPV
                ? `Este projeto apresenta um VPL positivo de ${formatCurrency(
                    result.npv,
                  )} e uma TIR de ${result.irr}%, que é ${
                    result.irr > result.discountRate ? "superior" : "inferior"
                  } à taxa de desconto de ${
                    result.discountRate
                  }%. O período de payback é de ${result.paybackPeriod.toFixed(1)} anos. Com base nestes indicadores, o projeto ${
                    result.irr > result.discountRate && result.npv > 0
                      ? "é economicamente viável e recomendado para investimento."
                      : "apresenta riscos e deve ser reavaliado antes do investimento."
                  }`
                : `Este projeto apresenta um VPL negativo de ${formatCurrency(
                    result.npv,
                  )} e uma TIR de ${result.irr}%, que é inferior à taxa de desconto de ${
                    result.discountRate
                  }%. O período de payback é de ${result.paybackPeriod.toFixed(1)} anos, o que ${
                    result.paybackPeriod > result.projectDuration
                      ? "excede a duração do projeto."
                      : "está dentro da duração do projeto, mas o retorno financeiro ainda é insuficiente."
                  } Com base nestes indicadores, o projeto não é economicamente viável e não é recomendado para investimento.`}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
