"use client"

import { useState, useEffect } from "react"
import { z } from "zod"

interface IdadeCaesCalculatorProps {
  onInputChange: (name: string, value: any) => void
  onCalculate: (result: any) => void
  config: any
}

const idadeCaesSchema = z.object({
  dogAge: z.number().positive("A idade deve ser maior que zero").max(30, "A idade deve ser menor que 30"),
  dogSize: z.enum(["small", "medium", "large", "giant"], {
    errorMap: () => ({ message: "Selecione o porte do cão" }),
  }),
})

export default function IdadeCaesCalculator({ onInputChange, onCalculate, config }: IdadeCaesCalculatorProps) {
  const [dogAge, setDogAge] = useState<string>("")
  const [dogSize, setDogSize] = useState<string>("medium")
  const [result, setResult] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateInput = () => {
    try {
      const dogAgeNum = Number.parseFloat(dogAge)

      idadeCaesSchema.parse({
        dogAge: dogAgeNum,
        dogSize,
      })

      setErrors({})
      return { dogAgeNum }
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

  const calculateDogAge = () => {
    const validatedInput = validateInput()
    if (!validatedInput) return

    const { dogAgeNum } = validatedInput

    // Modern formula based on DNA methylation studies
    // Base human age = 16 * ln(dog age) + 31
    let humanAge = 16 * Math.log(dogAgeNum) + 31

    // Adjust based on dog size
    if (dogAgeNum > 1) {
      switch (dogSize) {
        case "small": // Small dogs age slower after the first year
          humanAge = humanAge * 0.95
          break
        case "large": // Large dogs age faster after the first year
          humanAge = humanAge * 1.1
          break
        case "giant": // Giant dogs age even faster
          humanAge = humanAge * 1.15
          break
        default: // Medium dogs follow the standard formula
          break
      }
    }

    // Determine life stage
    let lifeStage = ""
    let description = ""

    if (dogAgeNum < 1) {
      lifeStage = "Filhote"
      description = "Fase de crescimento rápido e socialização"
    } else if (dogAgeNum < 3) {
      lifeStage = "Jovem adulto"
      description = "Cheio de energia, ainda em desenvolvimento mental"
    } else if (dogAgeNum < 6) {
      lifeStage = "Adulto"
      description = "Fase de maturidade física e mental completa"
    } else if (dogAgeNum < 10) {
      lifeStage = "Adulto maduro"
      description = "Início de alguns sinais de envelhecimento"
    } else {
      lifeStage = "Sênior"
      description = "Fase de envelhecimento, requer cuidados especiais"

      // Adjust for giant breeds that reach senior stage earlier
      if (dogSize === "giant" && dogAgeNum > 7) {
        lifeStage = "Geriátrico"
        description = "Fase avançada de envelhecimento, necessita atenção veterinária frequente"
      } else if (dogSize === "large" && dogAgeNum > 11) {
        lifeStage = "Geriátrico"
        description = "Fase avançada de envelhecimento, necessita atenção veterinária frequente"
      } else if (dogAgeNum > 14) {
        lifeStage = "Geriátrico"
        description = "Fase avançada de envelhecimento, necessita atenção veterinária frequente"
      }
    }

    // Get life expectancy based on size
    let lifeExpectancy = 0
    switch (dogSize) {
      case "small":
        lifeExpectancy = 15
        break
      case "medium":
        lifeExpectancy = 12
        break
      case "large":
        lifeExpectancy = 10
        break
      case "giant":
        lifeExpectancy = 8
        break
    }

    // Calculate percentage of life lived
    const percentageLived = (dogAgeNum / lifeExpectancy) * 100

    const calculationResult = {
      dogAge: dogAgeNum,
      dogSize,
      humanAge: Number.parseFloat(humanAge.toFixed(config?.decimalPlaces || 1)),
      lifeStage,
      description,
      lifeExpectancy,
      percentageLived: Number.parseFloat(percentageLived.toFixed(1)),
    }

    setResult(calculationResult)

    // Call parent callbacks
    onInputChange("dogAge", dogAgeNum)
    onInputChange("dogSize", dogSize)
    onCalculate(calculationResult)
  }

  // Calculate automatically when inputs change
  useEffect(() => {
    if (dogAge) {
      const dogAgeNum = Number.parseFloat(dogAge)

      if (!isNaN(dogAgeNum) && dogAgeNum > 0 && dogAgeNum <= 30) {
        calculateDogAge()
      }
    }
  }, [dogAge, dogSize])

  // Get dog size label
  const getDogSizeLabel = (size: string): string => {
    switch (size) {
      case "small":
        return "Pequeno (até 10kg)"
      case "medium":
        return "Médio (10-25kg)"
      case "large":
        return "Grande (25-45kg)"
      case "giant":
        return "Gigante (acima de 45kg)"
      default:
        return ""
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="dogAge" className="block text-sm font-medium text-gray-700 mb-1">
            Idade do Cão (anos)
          </label>
          <input
            id="dogAge"
            type="number"
            value={dogAge}
            onChange={(e) => setDogAge(e.target.value)}
            placeholder="Ex: 5"
            className="calculator-input"
            min="0.1"
            max="30"
            step="0.1"
          />
          {errors.dogAge && <p className="text-red-500 text-sm mt-1">{errors.dogAge}</p>}
        </div>

        <div>
          <label htmlFor="dogSize" className="block text-sm font-medium text-gray-700 mb-1">
            Porte do Cão
          </label>
          <select
            id="dogSize"
            value={dogSize}
            onChange={(e) => setDogSize(e.target.value)}
            className="calculator-input"
          >
            <option value="small">Pequeno (até 10kg)</option>
            <option value="medium">Médio (10-25kg)</option>
            <option value="large">Grande (25-45kg)</option>
            <option value="giant">Gigante (acima de 45kg)</option>
          </select>
          {errors.dogSize && <p className="text-red-500 text-sm mt-1">{errors.dogSize}</p>}
        </div>
      </div>

      <button onClick={calculateDogAge} className="calculator-button">
        Calcular Idade Equivalente
      </button>

      {result && (
        <div className="calculator-result">
          <h3 className="text-lg font-semibold mb-4">Resultado:</h3>

          <div className="bg-blue-50 p-6 rounded-md border border-blue-100 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <p className="text-sm text-gray-600 mb-1">Idade do Cão</p>
                <p className="text-3xl font-bold text-blue-700">
                  {result.dogAge} <span className="text-xl">anos</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">{getDogSizeLabel(result.dogSize)}</p>
              </div>

              <div className="text-2xl text-gray-400 transform rotate-90 md:rotate-0 my-2 md:my-0">≈</div>

              <div className="text-center md:text-right">
                <p className="text-sm text-gray-600 mb-1">Idade Humana Equivalente</p>
                <p className="text-3xl font-bold text-green-700">
                  {result.humanAge} <span className="text-xl">anos</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">Baseado em estudos modernos</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-purple-50 p-4 rounded-md border border-purple-100">
              <p className="text-sm text-gray-600 mb-1">Fase da Vida</p>
              <p className="text-xl font-bold text-purple-700">{result.lifeStage}</p>
              <p className="text-sm text-gray-600 mt-1">{result.description}</p>
            </div>

            <div className="bg-amber-50 p-4 rounded-md border border-amber-100">
              <p className="text-sm text-gray-600 mb-1">Expectativa de Vida</p>
              <div className="flex items-center">
                <div className="flex-grow">
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${Math.min(result.percentageLived, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <span className="ml-2 text-sm font-medium text-gray-600">{result.percentageLived}%</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Expectativa média para porte {getDogSizeLabel(result.dogSize).toLowerCase()}: {result.lifeExpectancy}{" "}
                anos
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-4">
            <h4 className="font-medium mb-2">Sobre o Cálculo:</h4>
            <p className="text-sm text-gray-600 mb-2">
              Esta calculadora usa uma fórmula moderna baseada em estudos de metilação do DNA canino, ajustada pelo
              porte do animal. A fórmula base é:
            </p>
            <p className="text-sm font-mono bg-gray-100 p-2 rounded mb-2">Idade humana = 16 × ln(idade do cão) + 31</p>
            <p className="text-sm text-gray-600">
              Onde "ln" é o logaritmo natural. Ajustes adicionais são feitos com base no porte do cão, já que cães
              menores tendem a viver mais e envelhecer mais lentamente que cães maiores.
            </p>
          </div>

          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100">
            <p className="text-sm font-medium text-yellow-800 mb-2">⚠️ Dicas de Cuidados</p>
            <ul className="text-sm text-yellow-700 list-disc pl-5 space-y-1">
              {result.lifeStage === "Filhote" && (
                <>
                  <li>Vacinação completa e vermifugação são essenciais</li>
                  <li>Socialização com outros cães e pessoas é crucial nesta fase</li>
                  <li>Alimentação específica para filhotes do porte do seu cão</li>
                </>
              )}
              {result.lifeStage === "Jovem adulto" && (
                <>
                  <li>Exercícios regulares para gastar energia</li>
                  <li>Treinamento de obediência básica</li>
                  <li>Verificar necessidade de castração/esterilização</li>
                </>
              )}
              {result.lifeStage === "Adulto" && (
                <>
                  <li>Check-up veterinário anual</li>
                  <li>Manter peso ideal e exercícios regulares</li>
                  <li>Cuidados dentários preventivos</li>
                </>
              )}
              {result.lifeStage === "Adulto maduro" && (
                <>
                  <li>Atenção a mudanças comportamentais</li>
                  <li>Ajustar alimentação para metabolismo mais lento</li>
                  <li>Check-ups veterinários a cada 6-12 meses</li>
                </>
              )}
              {(result.lifeStage === "Sênior" || result.lifeStage === "Geriátrico") && (
                <>
                  <li>Check-ups veterinários a cada 6 meses</li>
                  <li>Exames de sangue regulares para monitorar saúde</li>
                  <li>Adaptar exercícios para menor impacto nas articulações</li>
                  <li>Atenção especial à alimentação, hidratação e conforto</li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
