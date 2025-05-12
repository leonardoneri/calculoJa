"use client"

import { useState, useEffect } from "react"
import { z } from "zod"

interface ImcCalculatorProps {
  onInputChange: (name: string, value: any) => void
  onCalculate: (result: any) => void
  config: any
}

const imcSchema = z.object({
  weight: z.number().positive("O peso deve ser maior que zero"),
  height: z.number().positive("A altura deve ser maior que zero"),
})

export default function ImcCalculator({ onInputChange, onCalculate, config }: ImcCalculatorProps) {
  const [weight, setWeight] = useState<string>("")
  const [height, setHeight] = useState<string>("")
  const [imc, setImc] = useState<number | null>(null)
  const [classification, setClassification] = useState<string>("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateInput = () => {
    try {
      const weightNum = Number.parseFloat(weight)
      const heightNum = Number.parseFloat(height) / 100 // Convert cm to m

      imcSchema.parse({ weight: weightNum, height: heightNum })
      setErrors({})
      return { weightNum, heightNum }
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

  const calculateIMC = () => {
    const validatedInput = validateInput()
    if (!validatedInput) return

    const { weightNum, heightNum } = validatedInput
    const imcValue = weightNum / (heightNum * heightNum)
    setImc(Number.parseFloat(imcValue.toFixed(2)))

    // Determine classification
    let imcClassification = ""
    if (imcValue < 18.5) {
      imcClassification = "Abaixo do peso"
    } else if (imcValue < 25) {
      imcClassification = "Peso normal"
    } else if (imcValue < 30) {
      imcClassification = "Sobrepeso"
    } else if (imcValue < 35) {
      imcClassification = "Obesidade Grau I"
    } else if (imcValue < 40) {
      imcClassification = "Obesidade Grau II"
    } else {
      imcClassification = "Obesidade Grau III"
    }

    setClassification(imcClassification)

    // Call parent callbacks
    onInputChange("weight", weightNum)
    onInputChange("height", heightNum)
    onCalculate({
      imc: imcValue,
      classification: imcClassification,
    })
  }

  // Calculate IMC automatically when both inputs are valid
  useEffect(() => {
    if (weight && height) {
      const weightNum = Number.parseFloat(weight)
      const heightNum = Number.parseFloat(height)

      if (!isNaN(weightNum) && !isNaN(heightNum) && weightNum > 0 && heightNum > 0) {
        calculateIMC()
      }
    }
  }, [weight, height])

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
            Peso (kg)
          </label>
          <input
            id="weight"
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Ex: 70"
            className="calculator-input"
            min="1"
            step="0.1"
          />
          {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight}</p>}
        </div>

        <div>
          <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
            Altura (cm)
          </label>
          <input
            id="height"
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="Ex: 170"
            className="calculator-input"
            min="1"
            step="1"
          />
          {errors.height && <p className="text-red-500 text-sm mt-1">{errors.height}</p>}
        </div>
      </div>

      <button onClick={calculateIMC} className="calculator-button">
        Calcular IMC
      </button>

      {imc !== null && (
        <div className="calculator-result">
          <h3 className="text-lg font-semibold mb-2">Resultado:</h3>
          <p className="mb-2">
            <span className="font-medium">Seu IMC:</span> {imc}
          </p>
          <p className="mb-2">
            <span className="font-medium">Classificação:</span> {classification}
          </p>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-medium mb-2">Tabela de Referência:</h4>
            <ul className="text-sm space-y-1">
              <li>Abaixo do peso: IMC menor que 18,5</li>
              <li>Peso normal: IMC entre 18,5 e 24,9</li>
              <li>Sobrepeso: IMC entre 25 e 29,9</li>
              <li>Obesidade Grau I: IMC entre 30 e 34,9</li>
              <li>Obesidade Grau II: IMC entre 35 e 39,9</li>
              <li>Obesidade Grau III: IMC maior ou igual a 40</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
