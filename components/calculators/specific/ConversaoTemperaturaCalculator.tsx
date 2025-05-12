"use client"

import { useState, useEffect } from "react"
import { z } from "zod"

interface ConversaoTemperaturaCalculatorProps {
  onInputChange: (name: string, value: any) => void
  onCalculate: (result: any) => void
  config: any
}

const temperaturaSchema = z.object({
  temperature: z.number(),
  fromUnit: z.enum(["celsius", "fahrenheit", "kelvin", "rankine", "reaumur"]),
  toUnit: z.enum(["celsius", "fahrenheit", "kelvin", "rankine", "reaumur"]),
})

export default function ConversaoTemperaturaCalculator({
  onInputChange,
  onCalculate,
  config,
}: ConversaoTemperaturaCalculatorProps) {
  const [temperature, setTemperature] = useState<string>("")
  const [fromUnit, setFromUnit] = useState<string>("celsius")
  const [toUnit, setToUnit] = useState<string>("fahrenheit")
  const [result, setResult] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateInput = () => {
    try {
      const temperatureNum = Number.parseFloat(temperature)

      temperaturaSchema.parse({
        temperature: temperatureNum,
        fromUnit,
        toUnit,
      })

      setErrors({})
      return { temperatureNum }
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

  // Convert to Celsius first (as a common base)
  const convertToCelsius = (temp: number, unit: string): number => {
    switch (unit) {
      case "celsius":
        return temp
      case "fahrenheit":
        return (temp - 32) * (5 / 9)
      case "kelvin":
        return temp - 273.15
      case "rankine":
        return (temp - 491.67) * (5 / 9)
      case "reaumur":
        return temp * (5 / 4)
      default:
        return temp
    }
  }

  // Convert from Celsius to target unit
  const convertFromCelsius = (celsius: number, unit: string): number => {
    switch (unit) {
      case "celsius":
        return celsius
      case "fahrenheit":
        return celsius * (9 / 5) + 32
      case "kelvin":
        return celsius + 273.15
      case "rankine":
        return celsius * (9 / 5) + 491.67
      case "reaumur":
        return celsius * (4 / 5)
      default:
        return celsius
    }
  }

  const calculateConversion = () => {
    const validatedInput = validateInput()
    if (!validatedInput) return

    const { temperatureNum } = validatedInput

    // Convert to Celsius first, then to target unit
    const celsius = convertToCelsius(temperatureNum, fromUnit)
    const convertedTemp = convertFromCelsius(celsius, toUnit)

    // Format to specified decimal places
    const decimalPlaces = config?.decimalPlaces || 2
    const formattedResult = Number.parseFloat(convertedTemp.toFixed(decimalPlaces))

    const calculationResult = {
      originalTemperature: temperatureNum,
      originalUnit: fromUnit,
      convertedTemperature: formattedResult,
      convertedUnit: toUnit,
      celsius: Number.parseFloat(celsius.toFixed(decimalPlaces)),
    }

    setResult(calculationResult)

    // Call parent callbacks
    onInputChange("temperature", temperatureNum)
    onInputChange("fromUnit", fromUnit)
    onInputChange("toUnit", toUnit)
    onCalculate(calculationResult)
  }

  // Calculate automatically when inputs change
  useEffect(() => {
    if (temperature) {
      const temperatureNum = Number.parseFloat(temperature)

      if (!isNaN(temperatureNum)) {
        calculateConversion()
      }
    }
  }, [temperature, fromUnit, toUnit])

  // Get unit symbol
  const getUnitSymbol = (unit: string): string => {
    switch (unit) {
      case "celsius":
        return "°C"
      case "fahrenheit":
        return "°F"
      case "kelvin":
        return "K"
      case "rankine":
        return "°R"
      case "reaumur":
        return "°Ré"
      default:
        return ""
    }
  }

  // Get unit name
  const getUnitName = (unit: string): string => {
    switch (unit) {
      case "celsius":
        return "Celsius"
      case "fahrenheit":
        return "Fahrenheit"
      case "kelvin":
        return "Kelvin"
      case "rankine":
        return "Rankine"
      case "reaumur":
        return "Réaumur"
      default:
        return ""
    }
  }

  // Swap units
  const swapUnits = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-1">
            Temperatura
          </label>
          <input
            id="temperature"
            type="number"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            placeholder="Ex: 25"
            className="calculator-input"
            step="0.01"
          />
          {errors.temperature && <p className="text-red-500 text-sm mt-1">{errors.temperature}</p>}
        </div>

        <div>
          <label htmlFor="fromUnit" className="block text-sm font-medium text-gray-700 mb-1">
            De
          </label>
          <select
            id="fromUnit"
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="calculator-input"
          >
            <option value="celsius">Celsius (°C)</option>
            <option value="fahrenheit">Fahrenheit (°F)</option>
            <option value="kelvin">Kelvin (K)</option>
            <option value="rankine">Rankine (°R)</option>
            <option value="reaumur">Réaumur (°Ré)</option>
          </select>
        </div>

        <div className="flex justify-center items-center md:col-span-2">
          <button
            onClick={swapUnits}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            aria-label="Trocar unidades"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-600"
            >
              <path d="M7 10v12" />
              <path d="M15 10v12" />
              <path d="M11 14v8" />
              <path d="M11 2v8" />
              <path d="m3 6 4 4 4-4" />
              <path d="m17 6 4 4 4-4" />
              <path d="m3 18 4-4 4 4" />
              <path d="m17 18 4-4 4 4" />
            </svg>
          </button>
        </div>

        <div>
          <label htmlFor="toUnit" className="block text-sm font-medium text-gray-700 mb-1">
            Para
          </label>
          <select id="toUnit" value={toUnit} onChange={(e) => setToUnit(e.target.value)} className="calculator-input">
            <option value="celsius">Celsius (°C)</option>
            <option value="fahrenheit">Fahrenheit (°F)</option>
            <option value="kelvin">Kelvin (K)</option>
            <option value="rankine">Rankine (°R)</option>
            <option value="reaumur">Réaumur (°Ré)</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <button onClick={calculateConversion} className="calculator-button w-full">
            Converter Temperatura
          </button>
        </div>
      </div>

      {result && (
        <div className="calculator-result">
          <h3 className="text-lg font-semibold mb-4">Resultado:</h3>

          <div className="bg-blue-50 p-6 rounded-md border border-blue-100 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <p className="text-sm text-gray-600 mb-1">Temperatura Original</p>
                <p className="text-3xl font-bold text-blue-700">
                  {result.originalTemperature}
                  <span className="text-xl ml-1">{getUnitSymbol(result.originalUnit)}</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">{getUnitName(result.originalUnit)}</p>
              </div>

              <div className="text-2xl text-gray-400 transform rotate-90 md:rotate-0 my-2 md:my-0">→</div>

              <div className="text-center md:text-right">
                <p className="text-sm text-gray-600 mb-1">Temperatura Convertida</p>
                <p className="text-3xl font-bold text-green-700">
                  {result.convertedTemperature}
                  <span className="text-xl ml-1">{getUnitSymbol(result.convertedUnit)}</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">{getUnitName(result.convertedUnit)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-4">
            <h4 className="font-medium mb-2">Detalhes da Conversão:</h4>
            <ul className="text-sm space-y-1">
              <li>
                <span className="font-medium">Temperatura em Celsius:</span> {result.celsius} °C
              </li>
              <li>
                <span className="font-medium">Fórmula utilizada:</span>{" "}
                {fromUnit === toUnit
                  ? "Mesma unidade, nenhuma conversão necessária"
                  : `Primeiro convertido para Celsius, depois para ${getUnitName(toUnit)}`}
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100">
              <h4 className="font-medium mb-2">Pontos de Referência:</h4>
              <ul className="text-sm space-y-1">
                <li>Congelamento da água: 0°C / 32°F / 273,15K</li>
                <li>Temperatura ambiente: 20-25°C / 68-77°F</li>
                <li>Ebulição da água: 100°C / 212°F / 373,15K</li>
                <li>Temperatura corporal: ~37°C / ~98,6°F</li>
              </ul>
            </div>

            <div className="bg-purple-50 p-4 rounded-md border border-purple-100">
              <h4 className="font-medium mb-2">Curiosidades:</h4>
              <ul className="text-sm space-y-1">
                <li>-40°C é igual a -40°F (único ponto de coincidência)</li>
                <li>0K (-273,15°C) é o zero absoluto teórico</li>
                <li>A escala Kelvin não usa o símbolo de grau (°)</li>
                <li>A escala Réaumur é raramente usada hoje em dia</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
