"use client"

import { useState, useEffect } from "react"
import { z } from "zod"

interface ConversaoMoedasCalculatorProps {
  onInputChange: (name: string, value: any) => void
  onCalculate: (result: any) => void
  config: any
}

const conversaoSchema = z.object({
  amount: z.number().positive("O valor deve ser maior que zero"),
  fromCurrency: z.string().min(1, "Selecione a moeda de origem"),
  toCurrency: z.string().min(1, "Selecione a moeda de destino"),
})

export default function ConversaoMoedasCalculator({
  onInputChange,
  onCalculate,
  config,
}: ConversaoMoedasCalculatorProps) {
  const [amount, setAmount] = useState<string>("")
  const [fromCurrency, setFromCurrency] = useState<string>("BRL")
  const [toCurrency, setToCurrency] = useState<string>("USD")
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({})
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Taxas de câmbio de fallback (baseadas no USD)
  const fallbackRates = {
    USD: 1,
    BRL: 5.5,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 153.7,
    ARS: 878.32,
    CLP: 937.53,
    CAD: 1.38,
    AUD: 1.52,
    CNY: 7.23,
  }

  // Fetch exchange rates
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/exchange-rates")

        if (!response.ok) {
          throw new Error("Falha ao obter taxas de câmbio")
        }

        const data = await response.json()
        setExchangeRates(data.rates)
        setLastUpdated(new Date(data.lastUpdated).toLocaleString("pt-BR"))
        setError(null)
      } catch (err) {
        console.error("Erro ao buscar taxas de câmbio:", err)
        // Usar taxas de fallback
        setExchangeRates(fallbackRates)
        setLastUpdated("Dados offline (aproximados)")
        setError("Usando taxas aproximadas. Conexão com serviço de câmbio indisponível.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchExchangeRates()
  }, [])

  const validateInput = () => {
    try {
      const amountNum = Number.parseFloat(amount)

      conversaoSchema.parse({
        amount: amountNum,
        fromCurrency,
        toCurrency,
      })

      setErrors({})
      return { amountNum }
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

  const calculateConversion = () => {
    const validatedInput = validateInput()
    if (!validatedInput || isLoading || error) return

    const { amountNum } = validatedInput

    // Get exchange rates for both currencies (relative to base currency)
    const fromRate = exchangeRates[fromCurrency]
    const toRate = exchangeRates[toCurrency]

    if (!fromRate || !toRate) {
      setError("Taxa de câmbio não disponível para uma das moedas selecionadas")
      return
    }

    // Calculate conversion
    // First convert to base currency, then to target currency
    const convertedAmount = (amountNum / fromRate) * toRate

    const calculationResult = {
      originalAmount: amountNum,
      convertedAmount: Number.parseFloat(convertedAmount.toFixed(2)),
      fromCurrency,
      toCurrency,
      exchangeRate: Number.parseFloat((toRate / fromRate).toFixed(6)),
      lastUpdated,
    }

    setResult(calculationResult)

    // Call parent callbacks
    onInputChange("amount", amountNum)
    onInputChange("fromCurrency", fromCurrency)
    onInputChange("toCurrency", toCurrency)
    onCalculate(calculationResult)
  }

  // Calculate automatically when inputs change and rates are loaded
  useEffect(() => {
    if (amount && fromCurrency && toCurrency && !isLoading && !error && Object.keys(exchangeRates).length > 0) {
      const amountNum = Number.parseFloat(amount)

      if (!isNaN(amountNum) && amountNum > 0) {
        calculateConversion()
      }
    }
  }, [amount, fromCurrency, toCurrency, exchangeRates, isLoading, error])

  // Format currency
  const formatCurrency = (value: number, currency: string) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: currency,
    })
  }

  // Common currencies
  const commonCurrencies = [
    { code: "BRL", name: "Real Brasileiro" },
    { code: "USD", name: "Dólar Americano" },
    { code: "EUR", name: "Euro" },
    { code: "GBP", name: "Libra Esterlina" },
    { code: "JPY", name: "Iene Japonês" },
    { code: "ARS", name: "Peso Argentino" },
    { code: "CLP", name: "Peso Chileno" },
    { code: "CAD", name: "Dólar Canadense" },
    { code: "AUD", name: "Dólar Australiano" },
    { code: "CNY", name: "Yuan Chinês" },
  ]

  return (
    <div>
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Valor
              </label>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ex: 100"
                className="calculator-input"
                min="0.01"
                step="0.01"
              />
              {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="fromCurrency" className="block text-sm font-medium text-gray-700 mb-1">
                  De
                </label>
                <select
                  id="fromCurrency"
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="calculator-input"
                >
                  {commonCurrencies.map((currency) => (
                    <option key={`from-${currency.code}`} value={currency.code}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
                {errors.fromCurrency && <p className="text-red-500 text-sm mt-1">{errors.fromCurrency}</p>}
              </div>

              <div>
                <label htmlFor="toCurrency" className="block text-sm font-medium text-gray-700 mb-1">
                  Para
                </label>
                <select
                  id="toCurrency"
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="calculator-input"
                >
                  {commonCurrencies.map((currency) => (
                    <option key={`to-${currency.code}`} value={currency.code}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
                {errors.toCurrency && <p className="text-red-500 text-sm mt-1">{errors.toCurrency}</p>}
              </div>
            </div>
          </div>

          <button onClick={calculateConversion} className="calculator-button">
            Converter
          </button>

          {result && (
            <div className="calculator-result">
              <h3 className="text-lg font-semibold mb-4">Resultado:</h3>

              <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Valor Original</p>
                    <p className="text-xl font-bold text-blue-700">
                      {formatCurrency(result.originalAmount, result.fromCurrency)}
                    </p>
                  </div>
                  <div className="text-2xl text-gray-400">→</div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Valor Convertido</p>
                    <p className="text-xl font-bold text-blue-700">
                      {formatCurrency(result.convertedAmount, result.toCurrency)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p className="mb-2">
                  <span className="font-medium">Taxa de Câmbio:</span> 1 {result.fromCurrency} = {result.exchangeRate}{" "}
                  {result.toCurrency}
                </p>
                <p className="text-xs text-gray-500">Última atualização: {result.lastUpdated}</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
