"use client"

import { useState, useEffect } from "react"
import { z } from "zod"

interface AmortizacaoCalculatorProps {
  onInputChange: (name: string, value: any) => void
  onCalculate: (result: any) => void
  config: any
}

const amortizacaoSchema = z.object({
  loanAmount: z.number().positive("O valor do empréstimo deve ser maior que zero"),
  interestRate: z.number().nonnegative("A taxa de juros deve ser maior ou igual a zero"),
  loanTerm: z.number().positive("O prazo deve ser maior que zero"),
  method: z.enum(["price", "sac"], {
    invalid_type_error: "Método de amortização inválido",
  }),
})

export default function AmortizacaoCalculator({
  onInputChange,
  onCalculate,
  config,
}: AmortizacaoCalculatorProps) {
  const [loanAmount, setLoanAmount] = useState<string>("")
  const [interestRate, setInterestRate] = useState<string>("")
  const [loanTerm, setLoanTerm] = useState<string>("")
  const [termType, setTermType] = useState<"months" | "years">("years")
  const [method, setMethod] = useState<"price" | "sac">("price")
  const [result, setResult] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showAmortizationTable, setShowAmortizationTable] = useState<boolean>(false)

  const validateInput = () => {
    try {
      const loanAmountNum = Number.parseFloat(loanAmount) || 0
      const interestRateNum = Number.parseFloat(interestRate) || 0
      const loanTermNum = Number.parseInt(loanTerm) || 0

      amortizacaoSchema.parse({
        loanAmount: loanAmountNum,
        interestRate: interestRateNum,
        loanTerm: loanTermNum,
        method,
      })

      setErrors({})
      return {
        loanAmountNum,
        interestRateNum,
        loanTermNum,
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

  const calculateAmortization = () => {
    const validatedInput = validateInput()
    if (!validatedInput) return

    const { loanAmountNum, interestRateNum, loanTermNum } = validatedInput

    // Convert annual rate to monthly if period is in months
    const monthlyRate = interestRateNum / 100 / 12

    // Convert period to months if it's in years
    const totalMonths = termType === "years" ? loanTermNum * 12 : loanTermNum

    let totalPayment = 0
    let totalInterest = 0
    const amortizationSchedule = []

    if (method === "price") {
      // Sistema Price (parcelas iguais)
      const monthlyPayment = (loanAmountNum * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalMonths))
      
      let remainingBalance = loanAmountNum
      for (let month = 1; month <= totalMonths; month++) {
        const interestPayment = remainingBalance * monthlyRate
        const principalPayment = monthlyPayment - interestPayment
        remainingBalance -= principalPayment

        totalPayment += monthlyPayment
        totalInterest += interestPayment

        amortizationSchedule.push({
          month,
          payment: monthlyPayment,
          principal: principalPayment,
          interest: interestPayment,
          balance: Math.max(0, remainingBalance), // Evita saldo negativo em caso de arredondamento
        })
      }

      const calculationResult = {
        monthlyPayment: Number.parseFloat(monthlyPayment.toFixed(2)),
        totalPayment: Number.parseFloat(totalPayment.toFixed(2)),
        totalInterest: Number.parseFloat(totalInterest.toFixed(2)),
        amortizationSchedule,
        method: "price",
      }

      setResult(calculationResult)
      onCalculate(calculationResult)
    } else if (method === "sac") {
      // Sistema SAC (amortização constante)
      const principalPayment = loanAmountNum / totalMonths
      
      let remainingBalance = loanAmountNum
      for (let month = 1; month <= totalMonths; month++) {
        const interestPayment = remainingBalance * monthlyRate
        const monthlyPayment = principalPayment + interestPayment
        remainingBalance -= principalPayment

        totalPayment += monthlyPayment
        totalInterest += interestPayment

        amortizationSchedule.push({
          month,
          payment: monthlyPayment,
          principal: principalPayment,
          interest: interestPayment,
          balance: Math.max(0, remainingBalance), // Evita saldo negativo em caso de arredondamento
        })
      }

      const calculationResult = {
        principalPayment: Number.parseFloat(principalPayment.toFixed(2)),
        initialPayment: Number.parseFloat(amortizationSchedule[0].payment.toFixed(2)),
        finalPayment: Number.parseFloat(amortizationSchedule[amortizationSchedule.length - 1].payment.toFixed(2)),
        totalPayment: Number.parseFloat(totalPayment.toFixed(2)),
        totalInterest: Number.parseFloat(totalInterest.toFixed(2)),
        amortizationSchedule,
        method: "sac",
      }

      setResult(calculationResult)
      onCalculate(calculationResult)
    }

    // Call parent callbacks
    onInputChange("loanAmount", loanAmountNum)
    onInputChange("interestRate", interestRateNum)
    onInputChange("loanTerm", loanTermNum)
    onInputChange("termType", termType)
    onInputChange("method", method)
  }

  // Calculate automatically when all inputs are valid
  useEffect(() => {
    if (loanAmount && interestRate && loanTerm) {
      const loanAmountNum = Number.parseFloat(loanAmount)
      const interestRateNum = Number.parseFloat(interestRate)
      const loanTermNum = Number.parseInt(loanTerm)

      if (
        !isNaN(loanAmountNum) &&
        !isNaN(interestRateNum) &&
        !isNaN(loanTermNum) &&
        loanAmountNum > 0 &&
        interestRateNum >= 0 &&
        loanTermNum > 0
      ) {
        calculateAmortization()
      }
    }
  }, [loanAmount, interestRate, loanTerm, termType, method])

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
          <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700 mb-1">
            Valor do Empréstimo (R$)
          </label>
          <input
            id="loanAmount"
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            placeholder="Ex: 100000"
            className="calculator-input"
            min="1"
            step="0.01"
          />
          {errors.loanAmount && <p className="text-red-500 text-sm mt-1">{errors.loanAmount}</p>}
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
            placeholder="Ex: 12"
            className="calculator-input"
            min="0"
            step="0.01"
          />
          {errors.interestRate && <p className="text-red-500 text-sm mt-1">{errors.interestRate}</p>}
        </div>

        <div>
          <label htmlFor="loanTerm" className="block text-sm font-medium text-gray-700 mb-1">
            Prazo
          </label>
          <div className="flex">
            <input
              id="loanTerm"
              type="number"
              value={loanTerm}
              onChange={(e) => setLoanTerm(e.target.value)}
              placeholder="Ex: 5"
              className="calculator-input rounded-r-none flex-grow"
              min="1"
              step="1"
            />
            <select
              value={termType}
              onChange={(e) => setTermType(e.target.value as "months" | "years")}
              className="border border-l-0 border-gray-300 rounded-r-md p-2 bg-gray-50"
            >
              <option value="years">Anos</option>
              <option value="months">Meses</option>
            </select>
          </div>
          {errors.loanTerm && <p className="text-red-500 text-sm mt-1">{errors.loanTerm}</p>}
        </div>

        <div>
          <label htmlFor="method" className="block text-sm font-medium text-gray-700 mb-1">
            Sistema de Amortização
          </label>
          <select
            id="method"
            value={method}
            onChange={(e) => setMethod(e.target.value as "price" | "sac")}
            className="calculator-input"
          >
            <option value="price">Price (Parcelas Fixas)</option>
            <option value="sac">SAC (Amortização Constante)</option>
          </select>
          {errors.method && <p className="text-red-500 text-sm mt-1">{errors.method}</p>}
        </div>
      </div>

      <button onClick={calculateAmortization} className="calculator-button">
        Calcular Amortização
      </button>

      {result && (
        <div className="calculator-result">
          <h3 className="text-lg font-semibold mb-4">Resultado:</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {method === "price" ? (
              <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                <p className="text-sm text-gray-600 mb-1">Valor da Parcela</p>
                <p className="text-xl font-bold text-blue-700">{formatCurrency(result.monthlyPayment)}</p>
              </div>
            ) : (
              <>
                <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                  <p className="text-sm text-gray-600 mb-1">Primeira Parcela</p>
                  <p className="text-xl font-bold text-blue-700">{formatCurrency(result.initialPayment)}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                  <p className="text-sm text-gray-600 mb-1">Última Parcela</p>
                  <p className="text-xl font-bold text-blue-700">{formatCurrency(result.finalPayment)}</p>
                </div>
              </>
            )}

            <div className="bg-green-50 p-4 rounded-md border border-green-100">
              <p className="text-sm text-gray-600 mb-1">Total Pago</p>
              <p className="text-xl font-bold text-green-700">{formatCurrency(result.totalPayment)}</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-md border border-purple-100">
              <p className="text-sm text-gray-600 mb-1">Total em Juros</p>
              <p className="text-xl font-bold text-purple-700">{formatCurrency(result.totalInterest)}</p>
            </div>
          </div>

          <div className="mt-6">
            <button 
              onClick={() => setShowAmortizationTable(!showAmortizationTable)} 
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              {showAmortizationTable ? "Ocultar Tabela de Amortização" : "Exibir Tabela de Amortização"}
              <svg 
                className={`ml-1 h-5 w-5 transition-transform ${showAmortizationTable ? "rotate-180" : ""}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {showAmortizationTable && (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parcela
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor da Parcela
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amortização
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Juros
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Saldo Devedor
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {result.amortizationSchedule.slice(0, 24).map((row: any) => (
                    <tr key={row.month}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.month}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(row.payment)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(row.principal)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(row.interest)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(row.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {result.amortizationSchedule.length > 24 && (
                <p className="text-sm text-gray-500 mt-4">
                  Mostrando as primeiras 24 parcelas de um total de {result.amortizationSchedule.length}.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
