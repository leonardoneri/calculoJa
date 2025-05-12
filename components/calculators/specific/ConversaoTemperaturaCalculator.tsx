"use client"

import { useState, useEffect } from "react"
import { z } from "zod"

interface ConversaoTemperaturaCalculatorProps {
  onInputChange: (name: string, value: any) => void
  onCalculate: (result: any) => void
  config: any
}

const temperatureSchema = z.object({
  temperature: z.number(),
  fromUnit: z.enum(["celsius", "fahrenheit", "kelvin"]),
  toUnit: z.enum(["celsius", "fahrenheit", "kelvin"]),
})

export default function ConversaoTemperaturaCalculator({
  onInputChange,
  onCalculate,
  config,
}: ConversaoTemperaturaCalculatorProps) {
  const [temperature, setTemperature] = useState<string>("")
  const [fromUnit, setFromUnit] = useState<"celsius" | "fahrenheit" | "kelvin">("celsius")
  const [toUnit, setToUnit] = useState<"celsius" | "fahrenheit" | "kelvin">("fahrenheit")
  const [result, setResult] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateInput = () => {
    try {
      const temperatureNum = Number.parseFloat(temperature)

      if (isNaN(temperatureNum)) {
        setErrors({ temperature: "A temperatura deve ser um número válido" })
        return null
      }

      if (fromUnit === toUnit) {
        setErrors({ toUnit: "As unidades de origem e destino devem ser diferentes" })
        return null
      }

      temperatureSchema.parse({
        temperature: temperatureNum,
        fromUnit,
        toUnit,
      })

      setErrors({})
      return {
        temperatureNum,
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

  const convertTemperature = () => {
    const validatedInput = validateInput()
    if (!validatedInput) return

    const { temperatureNum } = validatedInput

    // Converter para Kelvin (temperatura base para conversões)
    let kelvinTemp = 0
    switch (fromUnit) {
      case "celsius":
        kelvinTemp = temperatureNum + 273.15
        break
      case "fahrenheit":
        kelvinTemp = ((temperatureNum - 32) * 5) / 9 + 273.15
        break
      case "kelvin":
        kelvinTemp = temperatureNum
        break
    }

    // Converter de Kelvin para a unidade alvo
    let convertedTemp = 0
    switch (toUnit) {
      case "celsius":
        convertedTemp = kelvinTemp - 273.15
        break
      case "fahrenheit":
        convertedTemp = ((kelvinTemp - 273.15) * 9) / 5 + 32
        break
      case "kelvin":
        convertedTemp = kelvinTemp
        break
    }

    // Criar dados adicionais para a temperatura
    const temperatureInfo = getTemperatureInfo(convertedTemp, toUnit)

    // Arredondar para o número de casas decimais configurado
    const decimalPlaces = config?.decimalPlaces || 2
    convertedTemp = Number(convertedTemp.toFixed(decimalPlaces))

    const calculationResult = {
      originalTemperature: temperatureNum,
      convertedTemperature: convertedTemp,
      fromUnit,
      toUnit,
      kelvinValue: kelvinTemp,
      temperatureInfo,
      formula: getConversionFormula(fromUnit, toUnit),
    }

    setResult(calculationResult)

    // Call parent callbacks
    onInputChange("temperature", temperatureNum)
    onInputChange("fromUnit", fromUnit)
    onInputChange("toUnit", toUnit)
    onCalculate(calculationResult)
  }

  // Dados informativos sobre a temperatura
  const getTemperatureInfo = (temp: number, unit: string) => {
    // Converter para celsius para comparação
    let celsiusTemp = temp
    if (unit === "fahrenheit") {
      celsiusTemp = ((temp - 32) * 5) / 9
    } else if (unit === "kelvin") {
      celsiusTemp = temp - 273.15
    }

    let waterState = ""
    if (celsiusTemp <= 0) {
      waterState = "Congelado (abaixo de 0°C)"
    } else if (celsiusTemp < 100) {
      waterState = "Líquido (entre 0°C e 100°C)"
    } else {
      waterState = "Gasoso (acima de 100°C)"
    }

    let feeling = ""
    if (celsiusTemp < 0) {
      feeling = "Extremamente frio"
    } else if (celsiusTemp < 10) {
      feeling = "Muito frio"
    } else if (celsiusTemp < 20) {
      feeling = "Frio"
    } else if (celsiusTemp < 25) {
      feeling = "Agradável"
    } else if (celsiusTemp < 30) {
      feeling = "Quente"
    } else if (celsiusTemp < 35) {
      feeling = "Muito quente"
    } else {
      feeling = "Extremamente quente"
    }

    let examples = []
    if (celsiusTemp <= -89.2) {
      examples.push("Mais frio que o recorde de temperatura mais baixa na Terra (-89.2°C, Antártida)")
    } else if (celsiusTemp <= -40) {
      examples.push("Temperaturas extremas polares")
    } else if (celsiusTemp <= -18) {
      examples.push("Temperatura típica de freezers (-18°C)")
    } else if (celsiusTemp <= 0) {
      examples.push("Ponto de congelamento da água (0°C)")
    } else if (celsiusTemp <= 10) {
      examples.push("Temperatura de geladeira (2-8°C)")
    } else if (celsiusTemp <= 20) {
      examples.push("Temperatura ambiente fresca")
    } else if (celsiusTemp <= 25) {
      examples.push("Temperatura ambiente confortável")
    } else if (celsiusTemp <= 30) {
      examples.push("Dia quente de verão")
    } else if (celsiusTemp <= 40) {
      examples.push("Temperatura do deserto")
    } else if (celsiusTemp <= 100) {
      examples.push("Ponto de ebulição da água (100°C)")
    } else if (celsiusTemp <= 200) {
      examples.push("Temperatura típica de forno")
    } else if (celsiusTemp <= 1000) {
      examples.push("Temperaturas de fundição de metais")
    } else {
      examples.push("Temperaturas extremamente altas")
    }

    return {
      waterState,
      feeling,
      examples,
    }
  }

  // Obter fórmula de conversão para mostrar ao usuário
  const getConversionFormula = (from: string, to: string) => {
    const formulas: Record<string, Record<string, string>> = {
      celsius: {
        fahrenheit: "°F = °C × (9/5) + 32",
        kelvin: "K = °C + 273.15",
      },
      fahrenheit: {
        celsius: "°C = (°F - 32) × (5/9)",
        kelvin: "K = (°F - 32) × (5/9) + 273.15",
      },
      kelvin: {
        celsius: "°C = K - 273.15",
        fahrenheit: "°F = (K - 273.15) × (9/5) + 32",
      },
    }

    return formulas[from]?.[to] || ""
  }

  // Calculate automatically when all inputs are valid
  useEffect(() => {
    if (temperature && fromUnit && toUnit && fromUnit !== toUnit) {
      const temperatureNum = Number.parseFloat(temperature)

      if (!isNaN(temperatureNum)) {
        convertTemperature()
      }
    }
  }, [temperature, fromUnit, toUnit])

  // Formatação de temperatura com unidade
  const formatTemperature = (value: number, unit: string) => {
    const unitSymbols: Record<string, string> = {
      celsius: "°C",
      fahrenheit: "°F",
      kelvin: "K",
    }

    return `${value.toFixed(config?.decimalPlaces || 2)}${unitSymbols[unit] || ""}`
  }

  // Nomes completos das unidades para exibição
  const getUnitFullName = (unit: string) => {
    const unitNames: Record<string, string> = {
      celsius: "Celsius (°C)",
      fahrenheit: "Fahrenheit (°F)",
      kelvin: "Kelvin (K)",
    }

    return unitNames[unit] || unit
  }

  // Trocar unidades de origem e destino
  const swapUnits = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="md:col-span-2">
          <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-1">
            Temperatura
          </label>
          <div className="flex">
            <input
              id="temperature"
              type="number"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              placeholder="Ex: 25"
              className="calculator-input rounded-r-none flex-grow"
              step="0.01"
            />
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value as "celsius" | "fahrenheit" | "kelvin")}
              className="border border-l-0 border-gray-300 rounded-r-md p-2 bg-gray-50"
            >
              <option value="celsius">°C</option>
              <option value="fahrenheit">°F</option>
              <option value="kelvin">K</option>
            </select>
          </div>
          {errors.temperature && <p className="text-red-500 text-sm mt-1">{errors.temperature}</p>}
        </div>

        <div className="md:col-span-2 flex justify-center items-center">
          <button
            onClick={swapUnits}
            className="rounded-full p-3 bg-gray-100 hover:bg-gray-200 transition-colors"
            title="Trocar unidades"
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
          </button>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="toUnit" className="block text-sm font-medium text-gray-700 mb-1">
            Converter para
          </label>
          <select
            id="toUnit"
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value as "celsius" | "fahrenheit" | "kelvin")}
            className="calculator-input"
          >
            <option value="celsius">Celsius (°C)</option>
            <option value="fahrenheit">Fahrenheit (°F)</option>
            <option value="kelvin">Kelvin (K)</option>
          </select>
          {errors.toUnit && <p className="text-red-500 text-sm mt-1">{errors.toUnit}</p>}
        </div>
      </div>

      <button onClick={convertTemperature} className="calculator-button">
        Converter Temperatura
      </button>

      {result && (
        <div className="calculator-result">
          <h3 className="text-lg font-semibold mb-4">Resultado:</h3>

          <div className="flex flex-col items-center md:flex-row justify-center gap-8 mb-6">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">{getUnitFullName(result.fromUnit)}</div>
              <div className="text-3xl font-bold">{formatTemperature(result.originalTemperature, result.fromUnit)}</div>
            </div>

            <div className="text-3xl font-bold text-gray-400">=</div>

            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">{getUnitFullName(result.toUnit)}</div>
              <div className="text-4xl font-bold text-blue-600">
                {formatTemperature(result.convertedTemperature, result.toUnit)}
              </div>
            </div>
          </div>

          <div className="mb-6 bg-blue-50 p-4 rounded-md border border-blue-100">
            <h4 className="font-medium mb-2 text-blue-800">Fórmula de Conversão:</h4>
            <p className="text-center text-lg font-mono">{result.formula}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-purple-50 p-4 rounded-md border border-purple-100">
              <h4 className="font-medium mb-2 text-purple-800">Estado da Água:</h4>
              <p>{result.temperatureInfo.waterState}</p>
            </div>

            <div className="bg-indigo-50 p-4 rounded-md border border-indigo-100">
              <h4 className="font-medium mb-2 text-indigo-800">Sensação Térmica:</h4>
              <p>{result.temperatureInfo.feeling}</p>
            </div>

            <div className="bg-green-50 p-4 rounded-md border border-green-100">
              <h4 className="font-medium mb-2 text-green-800">Referência:</h4>
              <p>{result.temperatureInfo.examples[0]}</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h4 className="font-medium mb-2">Valores em todas as unidades:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <span className="font-medium">Celsius: </span>
                {formatTemperature(result.kelvinValue - 273.15, "celsius")}
              </div>
              <div>
                <span className="font-medium">Fahrenheit: </span>
                {formatTemperature(((result.kelvinValue - 273.15) * 9) / 5 + 32, "fahrenheit")}
              </div>
              <div>
                <span className="font-medium">Kelvin: </span>
                {formatTemperature(result.kelvinValue, "kelvin")}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
