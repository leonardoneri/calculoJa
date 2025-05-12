"use client"

import { useState, useEffect } from "react"
import { z } from "zod"

interface FrequenciaCardiacaCalculatorProps {
  onInputChange: (name: string, value: any) => void
  onCalculate: (result: any) => void
  config: any
}

const frequenciaCardiacaSchema = z.object({
  age: z
    .number()
    .int()
    .positive("A idade deve ser um número inteiro positivo")
    .max(120, "A idade deve ser menor que 120"),
  gender: z.enum(["male", "female"], {
    errorMap: () => ({ message: "Selecione o sexo" }),
  }),
  restingHeartRate: z
    .number()
    .int()
    .positive("A frequência cardíaca de repouso deve ser um número inteiro positivo")
    .max(120, "A frequência cardíaca de repouso deve ser menor que 120")
    .optional(),
  formula: z.enum(["traditional", "tanaka", "gellish", "nes"], {
    errorMap: () => ({ message: "Selecione a fórmula de cálculo" }),
  }),
})

export default function FrequenciaCardiacaCalculator({
  onInputChange,
  onCalculate,
  config,
}: FrequenciaCardiacaCalculatorProps) {
  const [age, setAge] = useState<string>("")
  const [gender, setGender] = useState<string>("male")
  const [restingHeartRate, setRestingHeartRate] = useState<string>("")
  const [formula, setFormula] = useState<string>("tanaka")
  const [result, setResult] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateInput = () => {
    try {
      const ageNum = Number.parseInt(age)
      const restingHeartRateNum = restingHeartRate ? Number.parseInt(restingHeartRate) : undefined

      frequenciaCardiacaSchema.parse({
        age: ageNum,
        gender,
        restingHeartRate: restingHeartRateNum,
        formula,
      })

      setErrors({})
      return { ageNum, restingHeartRateNum }
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

  const calculateHeartRate = () => {
    const validatedInput = validateInput()
    if (!validatedInput) return

    const { ageNum, restingHeartRateNum } = validatedInput

    // Calculate maximum heart rate based on selected formula
    let maxHeartRate = 0
    let formulaDescription = ""

    switch (formula) {
      case "traditional":
        maxHeartRate = 220 - ageNum
        formulaDescription = "Fórmula Tradicional (Fox): 220 - idade"
        break
      case "tanaka":
        maxHeartRate = 208 - 0.7 * ageNum
        formulaDescription = "Fórmula de Tanaka: 208 - (0,7 × idade)"
        break
      case "gellish":
        maxHeartRate = 207 - 0.7 * ageNum
        formulaDescription = "Fórmula de Gellish: 207 - (0,7 × idade)"
        break
      case "nes":
        if (gender === "male") {
          maxHeartRate = 214 - 0.8 * ageNum
          formulaDescription = "Fórmula de Nes (Homens): 214 - (0,8 × idade)"
        } else {
          maxHeartRate = 209 - 0.7 * ageNum
          formulaDescription = "Fórmula de Nes (Mulheres): 209 - (0,7 × idade)"
        }
        break
    }

    // Round to nearest integer
    maxHeartRate = Math.round(maxHeartRate)

    // Calculate heart rate zones
    const zones = [
      {
        name: "Zona 1: Recuperação Ativa",
        min: Math.round(maxHeartRate * 0.5),
        max: Math.round(maxHeartRate * 0.6),
        description: "Intensidade muito leve, ideal para recuperação e aquecimento",
        percentage: "50-60%",
      },
      {
        name: "Zona 2: Resistência Aeróbica Básica",
        min: Math.round(maxHeartRate * 0.6),
        max: Math.round(maxHeartRate * 0.7),
        description: "Intensidade leve a moderada, boa para queima de gordura e resistência básica",
        percentage: "60-70%",
      },
      {
        name: "Zona 3: Condicionamento Aeróbico",
        min: Math.round(maxHeartRate * 0.7),
        max: Math.round(maxHeartRate * 0.8),
        description: "Intensidade moderada a intensa, melhora a capacidade cardiovascular",
        percentage: "70-80%",
      },
      {
        name: "Zona 4: Limiar Anaeróbico",
        min: Math.round(maxHeartRate * 0.8),
        max: Math.round(maxHeartRate * 0.9),
        description: "Intensidade intensa, aumenta a tolerância ao lactato e performance",
        percentage: "80-90%",
      },
      {
        name: "Zona 5: Esforço Máximo",
        min: Math.round(maxHeartRate * 0.9),
        max: maxHeartRate,
        description: "Intensidade muito intensa, desenvolve potência e velocidade máxima",
        percentage: "90-100%",
      },
    ]

    // Calculate Karvonen zones if resting heart rate is provided
    let karvonenZones = null
    if (restingHeartRateNum) {
      karvonenZones = zones.map((zone) => {
        const minKarvonen = Math.round(
          restingHeartRateNum +
            (Number.parseInt(zone.percentage.split("-")[0]) / 100) * (maxHeartRate - restingHeartRateNum),
        )
        const maxKarvonen = Math.round(
          restingHeartRateNum +
            (Number.parseInt(zone.percentage.split("-")[1]) / 100) * (maxHeartRate - restingHeartRateNum),
        )
        return {
          ...zone,
          minKarvonen,
          maxKarvonen,
        }
      })
    }

    const calculationResult = {
      age: ageNum,
      gender,
      formula,
      formulaDescription,
      maxHeartRate,
      restingHeartRate: restingHeartRateNum,
      zones,
      karvonenZones,
    }

    setResult(calculationResult)

    // Call parent callbacks
    onInputChange("age", ageNum)
    onInputChange("gender", gender)
    onInputChange("formula", formula)
    onInputChange("restingHeartRate", restingHeartRateNum)
    onCalculate(calculationResult)
  }

  // Calculate automatically when inputs change
  useEffect(() => {
    if (age) {
      const ageNum = Number.parseInt(age)

      if (!isNaN(ageNum) && ageNum > 0 && ageNum <= 120) {
        calculateHeartRate()
      }
    }
  }, [age, gender, formula, restingHeartRate])

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
            Idade (anos)
          </label>
          <input
            id="age"
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Ex: 30"
            className="calculator-input"
            min="1"
            max="120"
          />
          {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
        </div>

        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
            Sexo
          </label>
          <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)} className="calculator-input">
            <option value="male">Masculino</option>
            <option value="female">Feminino</option>
          </select>
          {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
        </div>

        <div>
          <label htmlFor="formula" className="block text-sm font-medium text-gray-700 mb-1">
            Fórmula de Cálculo
          </label>
          <select
            id="formula"
            value={formula}
            onChange={(e) => setFormula(e.target.value)}
            className="calculator-input"
          >
            <option value="traditional">Tradicional (Fox)</option>
            <option value="tanaka">Tanaka</option>
            <option value="gellish">Gellish</option>
            <option value="nes">Nes (Específica por Sexo)</option>
          </select>
          {errors.formula && <p className="text-red-500 text-sm mt-1">{errors.formula}</p>}
        </div>

        <div>
          <label htmlFor="restingHeartRate" className="block text-sm font-medium text-gray-700 mb-1">
            Frequência Cardíaca de Repouso (bpm) <span className="text-gray-500 text-xs">(opcional)</span>
          </label>
          <input
            id="restingHeartRate"
            type="number"
            value={restingHeartRate}
            onChange={(e) => setRestingHeartRate(e.target.value)}
            placeholder="Ex: 60"
            className="calculator-input"
            min="40"
            max="120"
          />
          {errors.restingHeartRate && <p className="text-red-500 text-sm mt-1">{errors.restingHeartRate}</p>}
        </div>
      </div>

      <button onClick={calculateHeartRate} className="calculator-button">
        Calcular Frequência Cardíaca
      </button>

      {result && (
        <div className="calculator-result">
          <h3 className="text-lg font-semibold mb-4">Resultado:</h3>

          <div className="bg-blue-50 p-6 rounded-md border border-blue-100 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <p className="text-sm text-gray-600 mb-1">Frequência Cardíaca Máxima</p>
                <p className="text-3xl font-bold text-blue-700">
                  {result.maxHeartRate} <span className="text-xl">bpm</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">{result.formulaDescription}</p>
              </div>

              <div className="flex items-center justify-center">
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <path
                    d="M10,50 L25,50 L30,30 L40,70 L50,10 L60,90 L70,30 L80,50 L90,50"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {result.restingHeartRate && (
                <div className="text-center md:text-right mt-4 md:mt-0">
                  <p className="text-sm text-gray-600 mb-1">Frequência Cardíaca de Repouso</p>
                  <p className="text-3xl font-bold text-green-700">
                    {result.restingHeartRate} <span className="text-xl">bpm</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Método de Karvonen disponível</p>
                </div>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-medium mb-2">Zonas de Treinamento:</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border-b text-left">Zona</th>
                    <th className="py-2 px-4 border-b text-center">% da FCM</th>
                    <th className="py-2 px-4 border-b text-center">Faixa (bpm)</th>
                    {result.restingHeartRate && <th className="py-2 px-4 border-b text-center">Karvonen (bpm)</th>}
                    <th className="py-2 px-4 border-b text-left">Benefícios</th>
                  </tr>
                </thead>
                <tbody>
                  {result.zones.map((zone, index) => (
                    <tr
                      key={index}
                      className={`border-b hover:bg-gray-50 ${
                        index === 0
                          ? "bg-blue-50"
                          : index === 1
                            ? "bg-green-50"
                            : index === 2
                              ? "bg-yellow-50"
                              : index === 3
                                ? "bg-orange-50"
                                : "bg-red-50"
                      }`}
                    >
                      <td className="py-2 px-4 font-medium">{zone.name}</td>
                      <td className="py-2 px-4 text-center">{zone.percentage}</td>
                      <td className="py-2 px-4 text-center">
                        {zone.min} - {zone.max}
                      </td>
                      {result.restingHeartRate && (
                        <td className="py-2 px-4 text-center">
                          {result.karvonenZones[index].minKarvonen} - {result.karvonenZones[index].maxKarvonen}
                        </td>
                      )}
                      <td className="py-2 px-4 text-sm">{zone.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <h4 className="font-medium mb-2">Sobre as Zonas de Treinamento:</h4>
              <ul className="text-sm space-y-1">
                <li>
                  <span className="font-medium">Zona 1 (50-60%):</span> Ideal para recuperação ativa, aquecimento e
                  iniciantes.
                </li>
                <li>
                  <span className="font-medium">Zona 2 (60-70%):</span> Melhora a resistência aeróbica básica e queima
                  de gordura.
                </li>
                <li>
                  <span className="font-medium">Zona 3 (70-80%):</span> Aumenta a capacidade cardiovascular e
                  respiratória.
                </li>
                <li>
                  <span className="font-medium">Zona 4 (80-90%):</span> Melhora o limiar anaeróbico e a tolerância ao
                  lactato.
                </li>
                <li>
                  <span className="font-medium">Zona 5 (90-100%):</span> Desenvolve potência anaeróbica e velocidade
                  máxima.
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100">
              <h4 className="font-medium mb-2">Dicas para Treinamento:</h4>
              <ul className="text-sm space-y-1">
                <li>• Iniciantes devem focar nas zonas 1-2 para construir base aeróbica</li>
                <li>• Alterne entre diferentes zonas para um treinamento completo</li>
                <li>• Limite o treinamento nas zonas 4-5 a 1-2 sessões por semana</li>
                <li>• Use a zona 1 para dias de recuperação entre treinos intensos</li>
                <li>• Monitore sua frequência cardíaca durante o exercício com monitor cardíaco ou app</li>
              </ul>
            </div>
          </div>

          {result.restingHeartRate && (
            <div className="bg-green-50 p-4 rounded-md border border-green-100 mb-4">
              <h4 className="font-medium mb-2">Método de Karvonen:</h4>
              <p className="text-sm text-gray-600 mb-2">
                O método de Karvonen leva em consideração sua frequência cardíaca de repouso para calcular zonas de
                treinamento mais personalizadas. A fórmula é:
              </p>
              <p className="text-sm font-mono bg-white p-2 rounded mb-2">
                FC alvo = FC repouso + (% intensidade × (FC máxima - FC repouso))
              </p>
              <p className="text-sm text-gray-600">
                Este método é mais preciso que o cálculo baseado apenas na porcentagem da FC máxima, especialmente para
                pessoas com frequência cardíaca de repouso muito baixa (atletas) ou muito alta.
              </p>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
            <p className="text-sm font-medium text-blue-800 mb-2">💡 Interpretação do Resultado</p>
            <p className="text-sm text-blue-700 mb-2">
              Sua frequência cardíaca máxima estimada é de <strong>{result.maxHeartRate} bpm</strong>, calculada usando{" "}
              {result.formulaDescription.split(":")[0]}.
            </p>
            <p className="text-sm text-blue-700">
              Para melhorar sua saúde cardiovascular, tente treinar regularmente nas zonas 2 e 3. Para aumentar
              performance, inclua sessões ocasionais nas zonas 4 e 5. Lembre-se que estas são estimativas - ouça seu
              corpo e ajuste a intensidade conforme necessário.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
