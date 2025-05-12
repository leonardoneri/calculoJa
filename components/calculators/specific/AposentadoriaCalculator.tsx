"use client"

import { useState, useEffect } from "react"
import { z } from "zod"

interface AposentadoriaCalculatorProps {
  onInputChange: (name: string, value: any) => void
  onCalculate: (result: any) => void
  config: any
}

const aposentadoriaSchema = z.object({
  currentAge: z
    .number()
    .int()
    .positive("A idade atual deve ser um número inteiro positivo")
    .max(100, "A idade atual deve ser menor que 100"),
  retirementAge: z
    .number()
    .int()
    .positive("A idade de aposentadoria deve ser um número inteiro positivo")
    .max(120, "A idade de aposentadoria deve ser menor que 120"),
  currentSavings: z.number().nonnegative("O valor atual de economias deve ser maior ou igual a zero"),
  monthlySavings: z.number().nonnegative("A contribuição mensal deve ser maior ou igual a zero"),
  annualReturn: z
    .number()
    .nonnegative("O retorno anual deve ser maior ou igual a zero")
    .max(30, "O retorno anual deve ser menor que 30%"),
  annualInflation: z
    .number()
    .nonnegative("A inflação anual deve ser maior ou igual a zero")
    .max(30, "A inflação anual deve ser menor que 30%"),
  desiredIncome: z.number().positive("A renda desejada deve ser maior que zero"),
  lifeExpectancy: z
    .number()
    .int()
    .positive("A expectativa de vida deve ser um número inteiro positivo")
    .max(120, "A expectativa de vida deve ser menor que 120"),
})

export default function AposentadoriaCalculator({ onInputChange, onCalculate, config }: AposentadoriaCalculatorProps) {
  const [currentAge, setCurrentAge] = useState<string>("")
  const [retirementAge, setRetirementAge] = useState<string>("")
  const [currentSavings, setCurrentSavings] = useState<string>("")
  const [monthlySavings, setMonthlySavings] = useState<string>("")
  const [annualReturn, setAnnualReturn] = useState<string>("6")
  const [annualInflation, setAnnualInflation] = useState<string>("4")
  const [desiredIncome, setDesiredIncome] = useState<string>("")
  const [lifeExpectancy, setLifeExpectancy] = useState<string>("85")
  const [result, setResult] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateInput = () => {
    try {
      const currentAgeNum = Number.parseInt(currentAge)
      const retirementAgeNum = Number.parseInt(retirementAge)
      const currentSavingsNum = Number.parseFloat(currentSavings)
      const monthlySavingsNum = Number.parseFloat(monthlySavings)
      const annualReturnNum = Number.parseFloat(annualReturn)
      const annualInflationNum = Number.parseFloat(annualInflation)
      const desiredIncomeNum = Number.parseFloat(desiredIncome)
      const lifeExpectancyNum = Number.parseInt(lifeExpectancy)

      // Additional validation
      if (retirementAgeNum <= currentAgeNum) {
        setErrors({
          retirementAge: "A idade de aposentadoria deve ser maior que a idade atual",
        })
        return null
      }

      if (lifeExpectancyNum <= retirementAgeNum) {
        setErrors({
          lifeExpectancy: "A expectativa de vida deve ser maior que a idade de aposentadoria",
        })
        return null
      }

      aposentadoriaSchema.parse({
        currentAge: currentAgeNum,
        retirementAge: retirementAgeNum,
        currentSavings: currentSavingsNum,
        monthlySavings: monthlySavingsNum,
        annualReturn: annualReturnNum,
        annualInflation: annualInflationNum,
        desiredIncome: desiredIncomeNum,
        lifeExpectancy: lifeExpectancyNum,
      })

      setErrors({})
      return {
        currentAgeNum,
        retirementAgeNum,
        currentSavingsNum,
        monthlySavingsNum,
        annualReturnNum,
        annualInflationNum,
        desiredIncomeNum,
        lifeExpectancyNum,
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

  const calculateRetirement = () => {
    const validatedInput = validateInput()
    if (!validatedInput) return

    const {
      currentAgeNum,
      retirementAgeNum,
      currentSavingsNum,
      monthlySavingsNum,
      annualReturnNum,
      annualInflationNum,
      desiredIncomeNum,
      lifeExpectancyNum,
    } = validatedInput

    // Convert percentages to decimals
    const monthlyReturn = Math.pow(1 + annualReturnNum / 100, 1 / 12) - 1
    const monthlyInflation = Math.pow(1 + annualInflationNum / 100, 1 / 12) - 1
    const realMonthlyReturn = (1 + monthlyReturn) / (1 + monthlyInflation) - 1

    // Calculate years until retirement
    const yearsToRetirement = retirementAgeNum - currentAgeNum
    const monthsToRetirement = yearsToRetirement * 12

    // Calculate future value of current savings
    const futureValueCurrentSavings = currentSavingsNum * Math.pow(1 + monthlyReturn, monthsToRetirement)

    // Calculate future value of monthly contributions
    let futureValueContributions = 0
    for (let i = 0; i < monthsToRetirement; i++) {
      futureValueContributions += monthlySavingsNum * Math.pow(1 + monthlyReturn, i)
    }

    // Total retirement savings
    const totalRetirementSavings = futureValueCurrentSavings + futureValueContributions

    // Calculate retirement duration in months
    const retirementDuration = (lifeExpectancyNum - retirementAgeNum) * 12

    // Calculate inflation-adjusted desired monthly income at retirement
    const futureMonthlyIncome = desiredIncomeNum * Math.pow(1 + monthlyInflation, monthsToRetirement)

    // Calculate required savings for retirement using the 4% rule
    // The 4% rule suggests you can withdraw 4% of your savings in the first year of retirement,
    // and then adjust for inflation in subsequent years
    const requiredSavings = (futureMonthlyIncome * 12) / 0.04

    // Calculate monthly income from savings using the 4% rule
    const monthlyIncomeFromSavings = (totalRetirementSavings * 0.04) / 12

    // Calculate savings gap
    const savingsGap = requiredSavings - totalRetirementSavings
    const monthlySavingsNeeded =
      savingsGap > 0 ? (savingsGap * monthlyReturn) / (Math.pow(1 + monthlyReturn, monthsToRetirement) - 1) : 0

    // Calculate savings by year (for chart)
    const savingsByYear = []
    let currentSavings = currentSavingsNum

    for (let year = 1; year <= yearsToRetirement; year++) {
      // Add monthly contributions for the year
      for (let month = 1; month <= 12; month++) {
        currentSavings = currentSavings * (1 + monthlyReturn) + monthlySavingsNum
      }

      savingsByYear.push({
        year: currentAgeNum + year,
        savings: Math.round(currentSavings),
      })
    }

    const calculationResult = {
      currentAge: currentAgeNum,
      retirementAge: retirementAgeNum,
      currentSavings: currentSavingsNum,
      monthlySavings: monthlySavingsNum,
      annualReturn: annualReturnNum,
      annualInflation: annualInflationNum,
      desiredIncome: desiredIncomeNum,
      lifeExpectancy: lifeExpectancyNum,
      yearsToRetirement,
      totalRetirementSavings: Math.round(totalRetirementSavings),
      futureMonthlyIncome: Math.round(futureMonthlyIncome),
      requiredSavings: Math.round(requiredSavings),
      monthlyIncomeFromSavings: Math.round(monthlyIncomeFromSavings),
      savingsGap: Math.round(savingsGap),
      additionalMonthlySavingsNeeded: Math.round(monthlySavingsNeeded),
      savingsByYear,
      isOnTrack: totalRetirementSavings >= requiredSavings,
      retirementDuration,
    }

    setResult(calculationResult)

    // Call parent callbacks
    onInputChange("currentAge", currentAgeNum)
    onInputChange("retirementAge", retirementAgeNum)
    onInputChange("currentSavings", currentSavingsNum)
    onInputChange("monthlySavings", monthlySavingsNum)
    onInputChange("annualReturn", annualReturnNum)
    onInputChange("annualInflation", annualInflationNum)
    onInputChange("desiredIncome", desiredIncomeNum)
    onInputChange("lifeExpectancy", lifeExpectancyNum)
    onCalculate(calculationResult)
  }

  // Calculate automatically when inputs change
  useEffect(() => {
    if (
      currentAge &&
      retirementAge &&
      currentSavings !== undefined &&
      monthlySavings !== undefined &&
      annualReturn &&
      annualInflation &&
      desiredIncome &&
      lifeExpectancy
    ) {
      const currentAgeNum = Number.parseInt(currentAge)
      const retirementAgeNum = Number.parseInt(retirementAge)
      const currentSavingsNum = Number.parseFloat(currentSavings)
      const monthlySavingsNum = Number.parseFloat(monthlySavings)
      const annualReturnNum = Number.parseFloat(annualReturn)
      const annualInflationNum = Number.parseFloat(annualInflation)
      const desiredIncomeNum = Number.parseFloat(desiredIncome)
      const lifeExpectancyNum = Number.parseInt(lifeExpectancy)

      if (
        !isNaN(currentAgeNum) &&
        !isNaN(retirementAgeNum) &&
        !isNaN(currentSavingsNum) &&
        !isNaN(monthlySavingsNum) &&
        !isNaN(annualReturnNum) &&
        !isNaN(annualInflationNum) &&
        !isNaN(desiredIncomeNum) &&
        !isNaN(lifeExpectancyNum) &&
        currentAgeNum > 0 &&
        retirementAgeNum > currentAgeNum &&
        currentSavingsNum >= 0 &&
        monthlySavingsNum >= 0 &&
        annualReturnNum >= 0 &&
        annualReturnNum <= 30 &&
        annualInflationNum >= 0 &&
        annualInflationNum <= 30 &&
        desiredIncomeNum > 0 &&
        lifeExpectancyNum > retirementAgeNum
      ) {
        calculateRetirement()
      }
    }
  }, [
    currentAge,
    retirementAge,
    currentSavings,
    monthlySavings,
    annualReturn,
    annualInflation,
    desiredIncome,
    lifeExpectancy,
  ])

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
          <label htmlFor="currentAge" className="block text-sm font-medium text-gray-700 mb-1">
            Idade Atual
          </label>
          <input
            id="currentAge"
            type="number"
            value={currentAge}
            onChange={(e) => setCurrentAge(e.target.value)}
            placeholder="Ex: 30"
            className="calculator-input"
            min="18"
            max="100"
          />
          {errors.currentAge && <p className="text-red-500 text-sm mt-1">{errors.currentAge}</p>}
        </div>

        <div>
          <label htmlFor="retirementAge" className="block text-sm font-medium text-gray-700 mb-1">
            Idade de Aposentadoria
          </label>
          <input
            id="retirementAge"
            type="number"
            value={retirementAge}
            onChange={(e) => setRetirementAge(e.target.value)}
            placeholder="Ex: 65"
            className="calculator-input"
            min="30"
            max="120"
          />
          {errors.retirementAge && <p className="text-red-500 text-sm mt-1">{errors.retirementAge}</p>}
        </div>

        <div>
          <label htmlFor="currentSavings" className="block text-sm font-medium text-gray-700 mb-1">
            Economias Atuais (R$)
          </label>
          <input
            id="currentSavings"
            type="number"
            value={currentSavings}
            onChange={(e) => setCurrentSavings(e.target.value)}
            placeholder="Ex: 50000"
            className="calculator-input"
            min="0"
            step="1000"
          />
          {errors.currentSavings && <p className="text-red-500 text-sm mt-1">{errors.currentSavings}</p>}
        </div>

        <div>
          <label htmlFor="monthlySavings" className="block text-sm font-medium text-gray-700 mb-1">
            Contribuição Mensal (R$)
          </label>
          <input
            id="monthlySavings"
            type="number"
            value={monthlySavings}
            onChange={(e) => setMonthlySavings(e.target.value)}
            placeholder="Ex: 1000"
            className="calculator-input"
            min="0"
            step="100"
          />
          {errors.monthlySavings && <p className="text-red-500 text-sm mt-1">{errors.monthlySavings}</p>}
        </div>

        <div>
          <label htmlFor="annualReturn" className="block text-sm font-medium text-gray-700 mb-1">
            Retorno Anual Esperado (%)
          </label>
          <input
            id="annualReturn"
            type="number"
            value={annualReturn}
            onChange={(e) => setAnnualReturn(e.target.value)}
            placeholder="Ex: 6"
            className="calculator-input"
            min="0"
            max="30"
            step="0.1"
          />
          {errors.annualReturn && <p className="text-red-500 text-sm mt-1">{errors.annualReturn}</p>}
        </div>

        <div>
          <label htmlFor="annualInflation" className="block text-sm font-medium text-gray-700 mb-1">
            Inflação Anual Esperada (%)
          </label>
          <input
            id="annualInflation"
            type="number"
            value={annualInflation}
            onChange={(e) => setAnnualInflation(e.target.value)}
            placeholder="Ex: 4"
            className="calculator-input"
            min="0"
            max="30"
            step="0.1"
          />
          {errors.annualInflation && <p className="text-red-500 text-sm mt-1">{errors.annualInflation}</p>}
        </div>

        <div>
          <label htmlFor="desiredIncome" className="block text-sm font-medium text-gray-700 mb-1">
            Renda Mensal Desejada na Aposentadoria (R$)
          </label>
          <input
            id="desiredIncome"
            type="number"
            value={desiredIncome}
            onChange={(e) => setDesiredIncome(e.target.value)}
            placeholder="Ex: 5000"
            className="calculator-input"
            min="1"
            step="100"
          />
          {errors.desiredIncome && <p className="text-red-500 text-sm mt-1">{errors.desiredIncome}</p>}
        </div>

        <div>
          <label htmlFor="lifeExpectancy" className="block text-sm font-medium text-gray-700 mb-1">
            Expectativa de Vida
          </label>
          <input
            id="lifeExpectancy"
            type="number"
            value={lifeExpectancy}
            onChange={(e) => setLifeExpectancy(e.target.value)}
            placeholder="Ex: 85"
            className="calculator-input"
            min="50"
            max="120"
          />
          {errors.lifeExpectancy && <p className="text-red-500 text-sm mt-1">{errors.lifeExpectancy}</p>}
        </div>
      </div>

      <button onClick={calculateRetirement} className="calculator-button">
        Calcular Aposentadoria
      </button>

      {result && (
        <div className="calculator-result">
          <h3 className="text-lg font-semibold mb-4">Resultado:</h3>

          <div
            className={`p-6 rounded-md border mb-6 ${
              result.isOnTrack ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"
            }`}
          >
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <p className="text-sm text-gray-600 mb-1">Total Estimado na Aposentadoria</p>
                <p className={`text-3xl font-bold ${result.isOnTrack ? "text-green-700" : "text-red-700"}`}>
                  {formatCurrency(result.totalRetirementSavings)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Aos {result.retirementAge} anos ({result.yearsToRetirement} anos restantes)
                </p>
              </div>

              <div className="text-center mb-4 md:mb-0">
                <p className="text-sm text-gray-600 mb-1">Renda Mensal Estimada</p>
                <p
                  className={`text-3xl font-bold ${
                    result.monthlyIncomeFromSavings >= result.futureMonthlyIncome ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {formatCurrency(result.monthlyIncomeFromSavings)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {result.monthlyIncomeFromSavings >= result.futureMonthlyIncome ? "Acima" : "Abaixo"} do objetivo de{" "}
                  {formatCurrency(result.futureMonthlyIncome)}
                </p>
              </div>

              <div className="text-center md:text-right">
                <p className="text-sm text-gray-600 mb-1">Status do Planejamento</p>
                <p className={`text-xl font-bold ${result.isOnTrack ? "text-green-700" : "text-red-700"}`}>
                  {result.isOnTrack ? "No Caminho Certo" : "Ajustes Necessários"}
                </p>
                {!result.isOnTrack && (
                  <p className="text-sm text-red-600 mt-1">
                    Economize mais {formatCurrency(result.additionalMonthlySavingsNeeded)}/mês
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
              <h4 className="font-medium mb-2">Detalhes da Projeção:</h4>
              <ul className="text-sm space-y-1">
                <li>
                  <span className="font-medium">Anos até a aposentadoria:</span> {result.yearsToRetirement}
                </li>
                <li>
                  <span className="font-medium">Duração da aposentadoria:</span>{" "}
                  {result.lifeExpectancy - result.retirementAge} anos
                </li>
                <li>
                  <span className="font-medium">Economias necessárias:</span> {formatCurrency(result.requiredSavings)}
                </li>
                <li>
                  <span className="font-medium">Diferença de economias:</span>{" "}
                  {formatCurrency(Math.abs(result.savingsGap))} {result.savingsGap >= 0 ? "(déficit)" : "(superávit)"}
                </li>
              </ul>
            </div>

            <div className="bg-purple-50 p-4 rounded-md border border-purple-100">
              <h4 className="font-medium mb-2">Premissas Utilizadas:</h4>
              <ul className="text-sm space-y-1">
                <li>
                  <span className="font-medium">Retorno anual:</span> {result.annualReturn}%
                </li>
                <li>
                  <span className="font-medium">Inflação anual:</span> {result.annualInflation}%
                </li>
                <li>
                  <span className="font-medium">Taxa de retirada:</span> 4% ao ano (Regra dos 4%)
                </li>
                <li>
                  <span className="font-medium">Renda mensal desejada:</span> {formatCurrency(result.desiredIncome)}{" "}
                  (hoje) / {formatCurrency(result.futureMonthlyIncome)} (na aposentadoria)
                </li>
              </ul>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-medium mb-2">Projeção de Economias por Ano:</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border-b text-left">Idade</th>
                    <th className="py-2 px-4 border-b text-right">Economias Acumuladas</th>
                    <th className="py-2 px-4 border-b text-center">Progresso</th>
                  </tr>
                </thead>
                <tbody>
                  {result.savingsByYear.map((yearData: any, index: number) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{yearData.year} anos</td>
                      <td className="py-2 px-4 text-right">{formatCurrency(yearData.savings)}</td>
                      <td className="py-2 px-4">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{
                              width: `${Math.min(100, (yearData.savings / result.requiredSavings) * 100)}%`,
                            }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100 mb-4">
            <p className="text-sm font-medium text-yellow-800 mb-2">⚠️ Considerações Importantes</p>
            <ul className="text-sm text-yellow-700 list-disc pl-5 space-y-1">
              <li>
                Esta calculadora fornece apenas estimativas baseadas nas premissas informadas. Os resultados reais podem
                variar.
              </li>
              <li>
                A "Regra dos 4%" sugere que você pode retirar 4% do seu patrimônio no primeiro ano de aposentadoria e
                ajustar pela inflação nos anos seguintes, com baixo risco de esgotar seus recursos.
              </li>
              <li>
                Considere diversificar seus investimentos e revisar seu plano de aposentadoria periodicamente com um
                profissional financeiro.
              </li>
              <li>
                Fatores como mudanças na legislação previdenciária, impostos e emergências pessoais podem afetar seu
                planejamento.
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
            <p className="text-sm font-medium text-blue-800 mb-2">💡 Próximos Passos</p>
            {result.isOnTrack ? (
              <p className="text-sm text-blue-700">
                Parabéns! Você está no caminho certo para atingir seus objetivos de aposentadoria. Continue com seu
                plano atual de economias e considere aumentar suas contribuições sempre que possível para criar uma
                margem de segurança adicional.
              </p>
            ) : (
              <p className="text-sm text-blue-700">
                Para atingir seus objetivos de aposentadoria, considere: (1) Aumentar sua contribuição mensal para{" "}
                {formatCurrency(result.monthlySavings + result.additionalMonthlySavingsNeeded)}; (2) Adiar sua
                aposentadoria; (3) Reduzir sua renda desejada na aposentadoria; ou (4) Buscar investimentos com maior
                retorno potencial (considerando seu perfil de risco).
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
