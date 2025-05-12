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
  loanTerm: z.number().int().positive("O prazo deve ser um número inteiro positivo"),
  amortizationType: z.enum(["price", "sac"], {
    errorMap: () => ({ message: "Selecione o sistema de amortização" }),
  }),
})

export default function AmortizacaoCalculator({ onInputChange, onCalculate, config }: AmortizacaoCalculatorProps) {
  const [loanAmount, setLoanAmount] = useState<string>("")
  const [interestRate, setInterestRate] = useState<string>("")
  const [loanTerm, setLoanTerm] = useState<string>("")
  const [termType, setTermType] = useState<"months" | "years">("months")
  const [amortizationType, setAmortizationType] = useState<"price" | "sac">("price")
  const [result, setResult] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showFullTable, setShowFullTable] = useState<boolean>(false)

  const validateInput = () => {
    try {
      const loanAmountNum = Number.parseFloat(loanAmount)
      const interestRateNum = Number.parseFloat(interestRate)
      let loanTermNum = Number.parseInt(loanTerm)

      // Convert years to months if necessary
      if (termType === "years") {
        loanTermNum = loanTermNum * 12
      }

      amortizacaoSchema.parse({
        loanAmount: loanAmountNum,
        interestRate: interestRateNum,
        loanTerm: loanTermNum,
        amortizationType,
      })

      setErrors({})
      return { loanAmountNum, interestRateNum, loanTermNum }
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

    // Convert annual interest rate to monthly
    const monthlyInterestRate = interestRateNum / 100 / 12

    let monthlyPayment = 0
    let totalInterest = 0
    let totalPayment = 0
    const amortizationTable = []

    if (amortizationType === "price") {
      // Price Table (constant payment)
      monthlyPayment = (loanAmountNum * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -loanTermNum))

      let remainingBalance = loanAmountNum
      for (let i = 1; i <= loanTermNum; i++) {
        const interestPayment = remainingBalance * monthlyInterestRate
        const principalPayment = monthlyPayment - interestPayment
        remainingBalance -= principalPayment

        totalInterest += interestPayment

        amortizationTable.push({
          period: i,
          payment: monthlyPayment,
          principalPayment,
          interestPayment,
          remainingBalance: Math.max(0, remainingBalance), // Avoid negative values due to rounding
        })
      }
    } else {
      // SAC (constant amortization)
      const principalPayment = loanAmountNum / loanTermNum

      let remainingBalance = loanAmountNum
      for (let i = 1; i <= loanTermNum; i++) {
        const interestPayment = remainingBalance * monthlyInterestRate
        const payment = principalPayment + interestPayment
        remainingBalance -= principalPayment

        totalInterest += interestPayment
        totalPayment += payment

        amortizationTable.push({
          period: i,
          payment,
          principalPayment,
          interestPayment,
          remainingBalance: Math.max(0, remainingBalance), // Avoid negative values due to rounding
        })
      }

      // For SAC, monthly payment is the first payment (highest)
      monthlyPayment = amortizationTable[0].payment
    }

    if (amortizationType === "price") {
      totalPayment = monthlyPayment * loanTermNum
    }

    const calculationResult = {
      loanAmount: loanAmountNum,
      interestRate: interestRateNum,
      loanTerm: loanTermNum,
      monthlyPayment: Number.parseFloat(monthlyPayment.toFixed(2)),
      totalInterest: Number.parseFloat(totalInterest.toFixed(2)),
      totalPayment: Number.parseFloat(totalPayment.toFixed(2)),
      amortizationType,
      amortizationTable: amortizationTable.map((item) => ({
        period: item.period,
        payment: Number.parseFloat(item.payment.toFixed(2)),
        principalPayment: Number.parseFloat(item.principalPayment.toFixed(2)),
        interestPayment: Number.parseFloat(item.interestPayment.toFixed(2)),
        remainingBalance: Number.parseFloat(item.remainingBalance.toFixed(2)),
      })),
    }

    setResult(calculationResult)

    // Call parent callbacks
    onInputChange("loanAmount", loanAmountNum)
    onInputChange("interestRate", interestRateNum)
    onInputChange("loanTerm", loanTermNum)
    onInputChange("amortizationType", amortizationType)
    onCalculate(calculationResult)
  }

  // Calculate automatically when inputs change
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
  }, [loanAmount, interestRate, loanTerm, termType, amortizationType])

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
            placeholder="Ex: 50000"
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
            placeholder="Ex: 10"
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
              placeholder="Ex: 36"
              className="calculator-input rounded-r-none flex-grow"
              min="1"
              step="1"
            />
            <select
              value={termType}
              onChange={(e) => setTermType(e.target.value as "months" | "years")}
              className="border border-l-0 border-gray-300 rounded-r-md p-2 bg-gray-50"
            >
              <option value="months">Meses</option>
              <option value="years">Anos</option>
            </select>
          </div>
          {errors.loanTerm && <p className="text-red-500 text-sm mt-1">{errors.loanTerm}</p>}
        </div>

        <div>
          <label htmlFor="amortizationType" className="block text-sm font-medium text-gray-700 mb-1">
            Sistema de Amortização
          </label>
          <select
            id="amortizationType"
            value={amortizationType}
            onChange={(e) => setAmortizationType(e.target.value as "price" | "sac")}
            className="calculator-input"
          >
            <option value="price">Tabela Price (parcelas fixas)</option>
            <option value="sac">SAC (amortização constante)</option>
          </select>
          {errors.amortizationType && <p className="text-red-500 text-sm mt-1">{errors.amortizationType}</p>}
        </div>
      </div>

      <button onClick={calculateAmortization} className="calculator-button">
        Calcular Amortização
      </button>

      {result && (
        <div className="calculator-result">
          <h3 className="text-lg font-semibold mb-4">Resultado:</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
              <p className="text-sm text-gray-600 mb-1">
                {amortizationType === "price" ? "Valor da Parcela" : "Primeira Parcela"}
              </p>
              <p className="text-xl font-bold text-blue-700">{formatCurrency(result.monthlyPayment)}</p>
              <p className="text-xs text-gray-500 mt-1">
                {amortizationType === "sac" && "As parcelas diminuem ao longo do tempo"}
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-md border border-green-100">
              <p className="text-sm text-gray-600 mb-1">Total de Juros</p>
              <p className="text-xl font-bold text-green-700">{formatCurrency(result.totalInterest)}</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-md border border-purple-100">
              <p className="text-sm text-gray-600 mb-1">Custo Total</p>
              <p className="text-xl font-bold text-purple-700">{formatCurrency(result.totalPayment)}</p>
              <p className="text-xs text-gray-500 mt-1">Principal + Juros</p>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-medium mb-2">Tabela de Amortização:</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border-b text-left">Parcela</th>
                    <th className="py-2 px-4 border-b text-right">Valor da Parcela</th>
                    <th className="py-2 px-4 border-b text-right">Amortização</th>
                    <th className="py-2 px-4 border-b text-right">Juros</th>
                    <th className="py-2 px-4 border-b text-right">Saldo Devedor</th>
                  </tr>
                </thead>
                <tbody>
                  {(showFullTable ? result.amortizationTable : result.amortizationTable.slice(0, 12)).map(
                    (row: any) => (
                      <tr key={row.period} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4">{row.period}</td>
                        <td className="py-2 px-4 text-right">{formatCurrency(row.payment)}</td>
                        <td className="py-2 px-4 text-right">{formatCurrency(row.principalPayment)}</td>
                        <td className="py-2 px-4 text-right">{formatCurrency(row.interestPayment)}</td>
                        <td className="py-2 px-4 text-right">{formatCurrency(row.remainingBalance)}</td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
            {result.amortizationTable.length > 12 && !showFullTable && (
              <button
                onClick={() => setShowFullTable(true)}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Mostrar tabela completa ({result.amortizationTable.length} parcelas)
              </button>
            )}
            {showFullTable && (
              <button
                onClick={() => setShowFullTable(false)}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Mostrar menos
              </button>
            )}
          </div>

          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100">
            <p className="text-sm font-medium text-yellow-800 mb-2">⚠️ Aviso Importante</p>
            <p className="text-sm text-yellow-700">
              Esta calculadora fornece apenas uma estimativa. As condições reais de empréstimos podem variar de acordo
              com a instituição financeira, seu perfil de crédito e outros fatores. Consulte um profissional financeiro
              antes de tomar decisões.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
