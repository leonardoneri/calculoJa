"use client"

import { useState, useEffect } from "react"
import { z } from "zod"

interface IdadeCaesCalculatorProps {
  onInputChange: (name: string, value: any) => void
  onCalculate: (result: any) => void
  config: any
}

const dogAgeSchema = z.object({
  actualAge: z.number().min(0.1, "A idade deve ser maior que 0"),
  size: z.enum(["small", "medium", "large"]),
})

export default function IdadeCaesCalculator({
  onInputChange,
  onCalculate,
  config,
}: IdadeCaesCalculatorProps) {
  const [actualAge, setActualAge] = useState<string>("")
  const [size, setSize] = useState<"small" | "medium" | "large">("medium")
  const [result, setResult] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateInput = () => {
    try {
      const actualAgeNum = Number.parseFloat(actualAge)

      if (isNaN(actualAgeNum)) {
        setErrors({ actualAge: "A idade deve ser um número válido" })
        return null
      }

      dogAgeSchema.parse({
        actualAge: actualAgeNum,
        size,
      })

      setErrors({})
      return {
        actualAgeNum,
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

  const calculateDogAge = () => {
    const validatedInput = validateInput()
    if (!validatedInput) return

    const { actualAgeNum } = validatedInput

    // Cálculo da idade humana baseado no método moderno 
    // que considera desenvolvimento mais rápido nos primeiros anos e diferenças por porte
    let humanAge = 0
    
    // Método mais preciso que o antigo "1 ano = 7 anos humanos"
    if (actualAgeNum <= 1) {
      // O primeiro ano de um cão equivale a aproximadamente 15 anos humanos
      humanAge = 15 * actualAgeNum
    } else if (actualAgeNum <= 2) {
      // O segundo ano adiciona cerca de 9 anos humanos
      humanAge = 15 + (actualAgeNum - 1) * 9
    } else {
      // Cada ano adicional varia conforme o porte do cão
      const baseAge = 24; // 15 + 9 para os primeiros dois anos
      const additionalYears = actualAgeNum - 2;
      
      // Fatores de multiplicação por porte após os 2 anos
      const ageFactor = {
        small: 4, // cães pequenos envelhecem mais lentamente
        medium: 5, // porte médio é o padrão
        large: 6, // cães grandes envelhecem mais rapidamente
      };
      
      humanAge = baseAge + (additionalYears * ageFactor[size]);
    }

    // Arredondar para o número de casas decimais configurado (geralmente 0 para idades)
    const decimalPlaces = config?.decimalPlaces !== undefined ? config.decimalPlaces : 0
    humanAge = Number(humanAge.toFixed(decimalPlaces))

    // Definir estágio de vida do cão
    const lifeStage = getDogLifeStage(actualAgeNum, size)
    
    // Informações adicionais baseadas na idade
    const ageInfo = getDogAgeInfo(actualAgeNum, humanAge, size)

    const calculationResult = {
      dogAge: actualAgeNum,
      humanAge,
      size,
      lifeStage,
      ageInfo,
    }

    setResult(calculationResult)

    // Call parent callbacks
    onInputChange("actualAge", actualAgeNum)
    onInputChange("size", size)
    onCalculate(calculationResult)
  }

  // Determinar estágio de vida do cão
  const getDogLifeStage = (dogAge: number, dogSize: string) => {
    // Ajustes baseados no porte do cão
    const ageFactors = {
      small: { puppy: 1, adult: 7, senior: 12 },   // Cães pequenos vivem mais
      medium: { puppy: 1, adult: 6, senior: 10 },  // Porte médio é o padrão
      large: { puppy: 1, adult: 5, senior: 8 },    // Cães grandes têm vida útil menor
    };
    
    // Corrigindo a desestruturação que estava causando o erro
    const thresholds = ageFactors[dogSize as keyof typeof ageFactors];
    
    if (dogAge < thresholds.puppy) {
      return "Filhote"
    } else if (dogAge < thresholds.adult) {
      return "Adulto"
    } else if (dogAge < thresholds.senior) {
      return "Adulto Maduro"
    } else {
      return "Idoso"
    }
  }

  // Obter informações baseadas na idade do cão
  const getDogAgeInfo = (dogAge: number, humanAge: number, dogSize: string) => {
    // Expectativa de vida aproximada por porte
    const lifeExpectancy = {
      small: 15,  // Cães pequenos podem viver 14-17 anos
      medium: 13, // Cães médios vivem 12-14 anos em média
      large: 10,  // Cães grandes geralmente vivem 8-12 anos
    };
    
    // Percentual aproximado da vida percorrida
    const lifePercentage = Math.min(100, Math.round((dogAge / lifeExpectancy[dogSize as keyof typeof lifeExpectancy]) * 100));
    
    // Recomendações gerais baseadas na idade
    let healthTips = [];
    
    if (dogAge < 1) {
      healthTips = [
        "Vacinação completa é essencial",
        "Socialização nos primeiros meses",
        "Treinamento básico de obediência",
        "Alimentação específica para filhotes"
      ];
    } else if (dogAge < 3) {
      healthTips = [
        "Castração/esterilização recomendada",
        "Exercícios regulares para gastar energia",
        "Cuidados dentais preventivos",
        "Treinamento avançado de obediência"
      ];
    } else if (dogAge < 7) {
      healthTips = [
        "Check-up veterinário anual",
        "Monitorar peso e dieta balanceada",
        "Exercícios regulares para manter saúde",
        "Atenção a problemas dentários"
      ];
    } else if (dogAge < 10) {
      healthTips = [
        "Check-ups veterinários semestrais",
        "Ajuste da dieta para cães mais velhos",
        "Exercícios moderados e regulares",
        "Monitorar sinais de artrite e doenças relacionadas à idade"
      ];
    } else {
      healthTips = [
        "Check-ups veterinários a cada 3-4 meses",
        "Dieta especializada para cães seniores",
        "Exercícios leves e adaptados",
        "Cuidados paliativos e conforto especial",
        "Monitorar problemas de saúde relacionados à idade"
      ];
    }
    
    return {
      lifeExpectancy: lifeExpectancy[dogSize as keyof typeof lifeExpectancy],
      lifePercentage,
      healthTips,
    };
  }

  // Calculate automatically when all inputs are valid
  useEffect(() => {
    if (actualAge && size) {
      const actualAgeNum = Number.parseFloat(actualAge)
      if (!isNaN(actualAgeNum)) {
        calculateDogAge()
      }
    }
  }, [actualAge, size])

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="actualAge" className="block text-sm font-medium text-gray-700 mb-1">
            Idade do Cão (em anos)
          </label>
          <input
            id="actualAge"
            type="number"
            value={actualAge}
            onChange={(e) => setActualAge(e.target.value)}
            placeholder="Ex: 3.5"
            className="calculator-input"
            step="0.1"
            min="0.1"
          />
          {errors.actualAge && <p className="text-red-500 text-sm mt-1">{errors.actualAge}</p>}
        </div>

        <div>
          <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
            Porte do Cão
          </label>
          <select
            id="size"
            value={size}
            onChange={(e) => setSize(e.target.value as "small" | "medium" | "large")}
            className="calculator-input"
          >
            <option value="small">Pequeno (até 10kg)</option>
            <option value="medium">Médio (10-25kg)</option>
            <option value="large">Grande (acima de 25kg)</option>
          </select>
        </div>
      </div>

      <button onClick={calculateDogAge} className="calculator-button">
        Calcular Idade Equivalente
      </button>

      {result && (
        <div className="calculator-result">
          <h3 className="text-lg font-semibold mb-4">Resultado:</h3>

          <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-16 mb-8">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">Idade Canina</div>
              <div className="text-3xl font-bold">{result.dogAge} {result.dogAge === 1 ? "ano" : "anos"}</div>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                <span className="text-3xl">🐕</span>
              </div>
              <div className="text-sm bg-blue-50 text-blue-800 font-medium py-1 px-4 rounded-full">
                {result.lifeStage}
              </div>
            </div>

            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">Idade Humana Equivalente</div>
              <div className="text-4xl font-bold text-blue-600">{result.humanAge} {result.humanAge === 1 ? "ano" : "anos"}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
              <h4 className="font-medium mb-3 text-blue-800">Sobre a Idade Canina</h4>
              <p className="mb-2">Seu cão está na fase de <strong>{result.lifeStage}</strong>.</p>
              <p className="mb-2">
                Para cães de porte {result.size === 'small' ? 'pequeno' : result.size === 'medium' ? 'médio' : 'grande'}, 
                a expectativa de vida média é de aproximadamente <strong>{result.ageInfo.lifeExpectancy} anos</strong>.
              </p>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Vida percorrida:</span>
                  <span>{result.ageInfo.lifePercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${result.ageInfo.lifePercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <h4 className="font-medium mb-3">Recomendações de Saúde</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {result.ageInfo.healthTips.map((tip: string, index: number) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-md border border-amber-100 text-sm">
            <h4 className="font-medium mb-2 text-amber-800">Importante:</h4>
            <p>
              A conversão de idade de cães para idade humana é aproximada e varia conforme a raça e características individuais.
              O método utilizado é mais preciso que o tradicional "1 ano de cão = 7 anos humanos", considerando
              que cães amadurecem mais rapidamente nos primeiros anos e o envelhecimento varia conforme o porte.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
