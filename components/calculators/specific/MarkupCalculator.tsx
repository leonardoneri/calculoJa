"use client"

import { useState, useEffect } from "react"
import { z } from "zod"

interface MarkupCalculatorProps {
  onInputChange: (name: string, value: any) => void
  onCalculate: (result: any) => void
  config: any
}

const markupSchema = z.object({
  cost: z.number().positive("O custo deve ser maior que zero"),
  markup: z.number().nonnegative("O markup deve ser maior ou igual a zero"),
  taxRate: z
    .number()
    .min(0, "A taxa de imposto deve ser maior ou igual a zero")
    .max(100, "A taxa de imposto deve ser menor ou igual a 100"),
})

export default function MarkupCalculator({ onInputChange, onCalculate, config }: MarkupCalculatorProps) {
  const [cost, setCost] = useState<string>("")
  const [markup, setMarkup] = useState<string>("30") // Valor padrão de 30%
  const [taxRate, setTaxRate] = useState<string>("0") // Valor padrão de 0%
  const [includeTax, setIncludeTax] = useState<boolean>(true)
  const [result, setResult] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateInput = () => {
    try {
      const costNum = Number.parseFloat(cost)
      const markupNum = Number.parseFloat(markup)
      const taxRateNum = Number.parseFloat(taxRate)

      markupSchema.parse({
        cost: costNum,
        markup: markupNum,
        taxRate: taxRateNum,
      })

      setErrors({})
      return { costNum, markupNum, taxRateNum }
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

  const calculateMarkup = () => {
    const validatedInput = validateInput()
    if (!validatedInput) return

    const { costNum, markupNum, taxRateNum } = validatedInput

    // Calcular preço sem imposto
    const markupDecimal = markupNum / 100
    const priceBeforeTax = costNum * (1 + markupDecimal)

    // Calcular preço com imposto
    const taxDecimal = taxRateNum / 100
    const priceWithTax = priceBeforeTax * (1 + taxDecimal)

    // Calcular margem de lucro
    const profit = priceBeforeTax - costNum
    const profitMargin = (profit / priceBeforeTax) * 100

    // Calcular margem de lucro com imposto
    const taxAmount = priceBeforeTax * taxDecimal
    const profitAfterTax = priceWithTax - costNum - taxAmount
    const profitMarginAfterTax = (profitAfterTax / priceWithTax) * 100

    const calculationResult = {
      cost: costNum,
      markup: markupNum,
      taxRate: taxRateNum,
      priceBeforeTax: Number.parseFloat(priceBeforeTax.toFixed(2)),
      priceWithTax: Number.parseFloat(priceWithTax.toFixed(2)),
      profit: Number.parseFloat(profit.toFixed(2)),
      profitMargin: Number.parseFloat(profitMargin.toFixed(2)),
      profitAfterTax: Number.parseFloat(profitAfterTax.toFixed(2)),
      profitMarginAfterTax: Number.parseFloat(profitMarginAfterTax.toFixed(2)),
      includeTax,
    }

    setResult(calculationResult)

    // Call parent callbacks
    onInputChange("cost", costNum)
    onInputChange("markup", markupNum)
    onInputChange("taxRate", taxRateNum)
    onInputChange("includeTax", includeTax)
    onCalculate(calculationResult)
  }

  // Calculate automatically when inputs change
  useEffect(() => {
    if (cost && markup) {
      const costNum = Number.parseFloat(cost)
      const markupNum = Number.parseFloat(markup)
      const taxRateNum = Number.parseFloat(taxRate)

      if (
        !isNaN(costNum) &&
        !isNaN(markupNum) &&
        !isNaN(taxRateNum) &&
        costNum > 0 &&
        markupNum >= 0 &&
        taxRateNum >= 0 &&
        taxRateNum <= 100
      ) {
        calculateMarkup()
      }
    }
  }, [cost, markup, taxRate, includeTax])

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
          <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-1">
            Custo do Produto (R$)
          </label>
          <input
            id="cost"
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="Ex: 100"
            className="calculator-input"
            min="0.01"
            step="0.01"
          />
          {errors.cost && <p className="text-red-500 text-sm mt-1">{errors.cost}</p>}
        </div>

        <div>
          <label htmlFor="markup" className="block text-sm font-medium text-gray-700 mb-1">
            Markup (%)
          </label>
          <input
            id="markup"
            type="number"
            value={markup}
            onChange={(e) => setMarkup(e.target.value)}
            placeholder="Ex: 30"
            className="calculator-input"
            min="0"
            step="0.1"
          />
          {errors.markup && <p className="text-red-500 text-sm mt-1">{errors.markup}</p>}
        </div>

        <div>
          <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700 mb-1">
            Taxa de Imposto (%)
          </label>
          <input
            id="taxRate"
            type="number"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value)}
            placeholder="Ex: 10"
            className="calculator-input"
            min="0"
            max="100"
            step="0.1"
          />
          {errors.taxRate && <p className="text-red-500 text-sm mt-1">{errors.taxRate}</p>}
        </div>

        <div className="flex items-center">
          <input
            id="includeTax"
            type="checkbox"
            checked={includeTax}
            onChange={(e) => setIncludeTax(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="includeTax" className="ml-2 block text-sm text-gray-700">
            Incluir imposto no preço final
          </label>
        </div>
      </div>

      <button onClick={calculateMarkup} className="calculator-button">
        Calcular Markup
      </button>

      {result && (
        <div className="calculator-result">
          <h3 className="text-lg font-semibold mb-4">Resultado:</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
              <p className="text-sm text-gray-600 mb-1">Preço de Venda (sem imposto)</p>
              <p className="text-xl font-bold text-blue-700">{formatCurrency(result.priceBeforeTax)}</p>
            </div>

            <div className="bg-green-50 p-4 rounded-md border border-green-100">
              <p className="text-sm text-gray-600 mb-1">Preço de Venda (com imposto)</p>
              <p className="text-xl font-bold text-green-700">{formatCurrency(result.priceWithTax)}</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-md border border-purple-100">
              <p className="text-sm text-gray-600 mb-1">Lucro</p>
              <p className="text-xl font-bold text-purple-700">
                {formatCurrency(includeTax ? result.profitAfterTax : result.profit)}
              </p>
            </div>

            <div className="bg-amber-50 p-4 rounded-md border border-amber-100">
              <p className="text-sm text-gray-600 mb-1">Margem de Lucro</p>
              <p className="text-xl font-bold text-amber-700">
                {includeTax ? result.profitMarginAfterTax : result.profitMargin}%
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-4">
            <h4 className="font-medium mb-2">Detalhes do Cálculo:</h4>
            <ul className="text-sm space-y-1">
              <li>
                <span className="font-medium">Custo:</span> {formatCurrency(result.cost)}
              </li>
              <li>
                <span className="font-medium">Markup:</span> {result.markup}%
              </li>
              {result.taxRate > 0 && (
                <li>
                  <span className="font-medium">Taxa de Imposto:</span> {result.taxRate}%
                </li>
              )}
              <li>
                <span className="font-medium">Preço sem Imposto:</span> {formatCurrency(result.priceBeforeTax)}
              </li>
              {result.taxRate > 0 && (
                <li>
                  <span className="font-medium">Preço com Imposto:</span> {formatCurrency(result.priceWithTax)}
                </li>
              )}
              <li>
                <span className="font-medium">Lucro (sem imposto):</span> {formatCurrency(result.profit)}
              </li>
              <li>
                <span className="font-medium">Margem de Lucro (sem imposto):</span> {result.profitMargin}%
              </li>
              {result.taxRate > 0 && (
                <>
                  <li>
                    <span className="font-medium">Lucro (com imposto):</span> {formatCurrency(result.profitAfterTax)}
                  </li>
                  <li>
                    <span className="font-medium">Margem de Lucro (com imposto):</span> {result.profitMarginAfterTax}%
                  </li>
                </>
              )}
            </ul>
          </div>

          <div className="text-sm text-gray-600">
            <p className="mb-2">
              <span className="font-medium">Fórmula de Markup:</span> Preço de Venda = Custo × (1 + Markup%)
            </p>
            <p>
              <span className="font-medium">Fórmula de Margem:</span> Margem de Lucro = (Lucro ÷ Preço de Venda) × 100
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
