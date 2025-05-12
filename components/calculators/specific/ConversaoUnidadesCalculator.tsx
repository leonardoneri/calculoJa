"use client"

import { useState, useEffect } from "react"
import { z } from "zod"

interface ConversaoUnidadesCalculatorProps {
  onInputChange: (name: string, value: any) => void
  onCalculate: (result: any) => void
  config: any
}

const conversaoUnidadesSchema = z.object({
  value: z.number(),
  fromUnit: z.string().min(1, "Selecione a unidade de origem"),
  toUnit: z.string().min(1, "Selecione a unidade de destino"),
  category: z.string().min(1, "Selecione a categoria"),
})

// Conversion factors to base unit for each category
const conversionFactors: Record<string, Record<string, number>> = {
  length: {
    nanometer: 0.000000001,
    micrometer: 0.000001,
    millimeter: 0.001,
    centimeter: 0.01,
    inch: 0.0254,
    decimeter: 0.1,
    foot: 0.3048,
    yard: 0.9144,
    meter: 1,
    kilometer: 1000,
    mile: 1609.344,
    nautical_mile: 1852,
  },
  weight: {
    microgram: 0.000000001,
    milligram: 0.000001,
    centigram: 0.00001,
    decigram: 0.0001,
    gram: 0.001,
    ounce: 0.0283495,
    pound: 0.453592,
    kilogram: 1,
    stone: 6.35029,
    ton: 1000,
    us_ton: 907.185,
    imperial_ton: 1016.05,
  },
  area: {
    square_millimeter: 0.000001,
    square_centimeter: 0.0001,
    square_inch: 0.00064516,
    square_decimeter: 0.01,
    square_foot: 0.092903,
    square_yard: 0.836127,
    square_meter: 1,
    acre: 4046.86,
    hectare: 10000,
    square_kilometer: 1000000,
    square_mile: 2589988.11,
  },
  volume: {
    milliliter: 0.000001,
    cubic_centimeter: 0.000001,
    teaspoon: 0.000005,
    tablespoon: 0.000015,
    cubic_inch: 0.0000163871,
    fluid_ounce_us: 0.0000295735,
    fluid_ounce_uk: 0.0000284131,
    cup: 0.00025,
    pint_us: 0.000473176,
    pint_uk: 0.000568261,
    liter: 0.001,
    gallon_us: 0.00378541,
    gallon_uk: 0.00454609,
    cubic_foot: 0.0283168,
    cubic_meter: 1,
    cubic_yard: 0.764555,
  },
  time: {
    millisecond: 0.001,
    second: 1,
    minute: 60,
    hour: 3600,
    day: 86400,
    week: 604800,
    month: 2629800, // Average month (30.44 days)
    year: 31557600, // Average year (365.25 days)
    decade: 315576000,
    century: 3155760000,
  },
  speed: {
    centimeter_per_second: 0.01,
    meter_per_second: 1,
    kilometer_per_hour: 0.277778,
    foot_per_second: 0.3048,
    mile_per_hour: 0.44704,
    knot: 0.514444,
    mach: 340.29, // at sea level, 15°C
  },
  pressure: {
    pascal: 1,
    kilopascal: 1000,
    bar: 100000,
    psi: 6894.76,
    atmosphere: 101325,
    torr: 133.322,
    millimeter_mercury: 133.322,
    inch_mercury: 3386.39,
  },
  energy: {
    joule: 1,
    kilojoule: 1000,
    calorie: 4.184,
    kilocalorie: 4184,
    watt_hour: 3600,
    kilowatt_hour: 3600000,
    electron_volt: 1.602176634e-19,
    british_thermal_unit: 1055.06,
    us_therm: 105506000,
    foot_pound: 1.35582,
  },
}

// Unit labels for display
const unitLabels: Record<string, Record<string, string>> = {
  length: {
    nanometer: "Nanômetro (nm)",
    micrometer: "Micrômetro (µm)",
    millimeter: "Milímetro (mm)",
    centimeter: "Centímetro (cm)",
    inch: "Polegada (in)",
    decimeter: "Decímetro (dm)",
    foot: "Pé (ft)",
    yard: "Jarda (yd)",
    meter: "Metro (m)",
    kilometer: "Quilômetro (km)",
    mile: "Milha (mi)",
    nautical_mile: "Milha Náutica (nmi)",
  },
  weight: {
    microgram: "Micrograma (µg)",
    milligram: "Miligrama (mg)",
    centigram: "Centigrama (cg)",
    decigram: "Decigrama (dg)",
    gram: "Grama (g)",
    ounce: "Onça (oz)",
    pound: "Libra (lb)",
    kilogram: "Quilograma (kg)",
    stone: "Stone (st)",
    ton: "Tonelada (t)",
    us_ton: "Tonelada Americana (ton)",
    imperial_ton: "Tonelada Imperial (long ton)",
  },
  area: {
    square_millimeter: "Milímetro Quadrado (mm²)",
    square_centimeter: "Centímetro Quadrado (cm²)",
    square_inch: "Polegada Quadrada (in²)",
    square_decimeter: "Decímetro Quadrado (dm²)",
    square_foot: "Pé Quadrado (ft²)",
    square_yard: "Jarda Quadrada (yd²)",
    square_meter: "Metro Quadrado (m²)",
    acre: "Acre (ac)",
    hectare: "Hectare (ha)",
    square_kilometer: "Quilômetro Quadrado (km²)",
    square_mile: "Milha Quadrada (mi²)",
  },
  volume: {
    milliliter: "Mililitro (ml)",
    cubic_centimeter: "Centímetro Cúbico (cm³)",
    teaspoon: "Colher de Chá (tsp)",
    tablespoon: "Colher de Sopa (tbsp)",
    cubic_inch: "Polegada Cúbica (in³)",
    fluid_ounce_us: "Onça Fluida EUA (fl oz)",
    fluid_ounce_uk: "Onça Fluida UK (fl oz)",
    cup: "Xícara (cup)",
    pint_us: "Pint EUA (pt)",
    pint_uk: "Pint UK (pt)",
    liter: "Litro (l)",
    gallon_us: "Galão EUA (gal)",
    gallon_uk: "Galão UK (gal)",
    cubic_foot: "Pé Cúbico (ft³)",
    cubic_meter: "Metro Cúbico (m³)",
    cubic_yard: "Jarda Cúbica (yd³)",
  },
  time: {
    millisecond: "Milissegundo (ms)",
    second: "Segundo (s)",
    minute: "Minuto (min)",
    hour: "Hora (h)",
    day: "Dia (d)",
    week: "Semana (sem)",
    month: "Mês (mês)",
    year: "Ano (ano)",
    decade: "Década",
    century: "Século",
  },
  speed: {
    centimeter_per_second: "Centímetro por Segundo (cm/s)",
    meter_per_second: "Metro por Segundo (m/s)",
    kilometer_per_hour: "Quilômetro por Hora (km/h)",
    foot_per_second: "Pé por Segundo (ft/s)",
    mile_per_hour: "Milha por Hora (mph)",
    knot: "Nó (kn)",
    mach: "Mach",
  },
  pressure: {
    pascal: "Pascal (Pa)",
    kilopascal: "Kilopascal (kPa)",
    bar: "Bar",
    psi: "Libra por Polegada Quadrada (psi)",
    atmosphere: "Atmosfera (atm)",
    torr: "Torr",
    millimeter_mercury: "Milímetro de Mercúrio (mmHg)",
    inch_mercury: "Polegada de Mercúrio (inHg)",
  },
  energy: {
    joule: "Joule (J)",
    kilojoule: "Kilojoule (kJ)",
    calorie: "Caloria (cal)",
    kilocalorie: "Kilocaloria (kcal)",
    watt_hour: "Watt-hora (Wh)",
    kilowatt_hour: "Kilowatt-hora (kWh)",
    electron_volt: "Elétron-volt (eV)",
    british_thermal_unit: "Unidade Térmica Britânica (BTU)",
    us_therm: "Therm EUA",
    foot_pound: "Pé-libra (ft⋅lb)",
  },
}

// Category labels for display
const categoryLabels: Record<string, string> = {
  length: "Comprimento",
  weight: "Peso/Massa",
  area: "Área",
  volume: "Volume",
  time: "Tempo",
  speed: "Velocidade",
  pressure: "Pressão",
  energy: "Energia",
}

export default function ConversaoUnidadesCalculator({
  onInputChange,
  onCalculate,
  config,
}: ConversaoUnidadesCalculatorProps) {
  const [value, setValue] = useState<string>("")
  const [category, setCategory] = useState<string>("length")
  const [fromUnit, setFromUnit] = useState<string>("meter")
  const [toUnit, setToUnit] = useState<string>("kilometer")
  const [result, setResult] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateInput = () => {
    try {
      const valueNum = Number.parseFloat(value)

      conversaoUnidadesSchema.parse({
        value: valueNum,
        fromUnit,
        toUnit,
        category,
      })

      setErrors({})
      return { valueNum }
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
    if (!validatedInput) return

    const { valueNum } = validatedInput

    // Convert to base unit first, then to target unit
    const baseValue = valueNum * conversionFactors[category][fromUnit]
    const convertedValue = baseValue / conversionFactors[category][toUnit]

    // Format the result based on the magnitude
    const formattedResult = convertedValue
    let scientificNotation = false

    // Use scientific notation for very large or very small numbers
    if (convertedValue < 0.000001 || convertedValue > 1000000) {
      scientificNotation = true
    }

    const calculationResult = {
      originalValue: valueNum,
      originalUnit: fromUnit,
      originalUnitLabel: unitLabels[category][fromUnit],
      convertedValue: convertedValue,
      convertedUnit: toUnit,
      convertedUnitLabel: unitLabels[category][toUnit],
      category,
      categoryLabel: categoryLabels[category],
      scientificNotation,
      conversionFactor: conversionFactors[category][toUnit] / conversionFactors[category][fromUnit],
    }

    setResult(calculationResult)

    // Call parent callbacks
    onInputChange("value", valueNum)
    onInputChange("fromUnit", fromUnit)
    onInputChange("toUnit", toUnit)
    onInputChange("category", category)
    onCalculate(calculationResult)
  }

  // Calculate automatically when inputs change
  useEffect(() => {
    if (value) {
      const valueNum = Number.parseFloat(value)

      if (!isNaN(valueNum)) {
        calculateConversion()
      }
    }
  }, [value, fromUnit, toUnit, category])

  // Update units when category changes
  useEffect(() => {
    // Set default units for the selected category
    const units = Object.keys(conversionFactors[category])
    setFromUnit(units[0])
    setToUnit(units[1])
  }, [category])

  // Swap units
  const swapUnits = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
  }

  // Format the result value
  const formatValue = (value: number, scientific: boolean) => {
    if (scientific) {
      return value.toExponential(6)
    }

    // Use appropriate precision based on the magnitude
    if (value >= 1000000) {
      return value.toLocaleString("pt-BR", { maximumFractionDigits: 2 })
    } else if (value >= 1000) {
      return value.toLocaleString("pt-BR", { maximumFractionDigits: 3 })
    } else if (value >= 1) {
      return value.toLocaleString("pt-BR", { maximumFractionDigits: 6 })
    } else if (value >= 0.001) {
      return value.toLocaleString("pt-BR", { maximumFractionDigits: 8 })
    } else {
      return value.toLocaleString("pt-BR", { maximumFractionDigits: 10 })
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="md:col-span-2">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Categoria
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="calculator-input"
          >
            {Object.entries(categoryLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
        </div>

        <div>
          <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1">
            Valor
          </label>
          <input
            id="value"
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ex: 10"
            className="calculator-input"
            step="any"
          />
          {errors.value && <p className="text-red-500 text-sm mt-1">{errors.value}</p>}
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
            {Object.entries(unitLabels[category]).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          {errors.fromUnit && <p className="text-red-500 text-sm mt-1">{errors.fromUnit}</p>}
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
            {Object.entries(unitLabels[category]).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          {errors.toUnit && <p className="text-red-500 text-sm mt-1">{errors.toUnit}</p>}
        </div>

        <div className="md:col-span-2">
          <button onClick={calculateConversion} className="calculator-button w-full">
            Converter
          </button>
        </div>
      </div>

      {result && (
        <div className="calculator-result">
          <h3 className="text-lg font-semibold mb-4">Resultado:</h3>

          <div className="bg-blue-50 p-6 rounded-md border border-blue-100 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <p className="text-sm text-gray-600 mb-1">Valor Original</p>
                <p className="text-3xl font-bold text-blue-700">
                  {formatValue(result.originalValue, false)}
                  <span className="text-xl ml-2">{result.originalUnitLabel.split(" ")[0]}</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">{result.originalUnitLabel}</p>
              </div>

              <div className="text-2xl text-gray-400 transform rotate-90 md:rotate-0 my-2 md:my-0">→</div>

              <div className="text-center md:text-right">
                <p className="text-sm text-gray-600 mb-1">Valor Convertido</p>
                <p className="text-3xl font-bold text-green-700">
                  {formatValue(result.convertedValue, result.scientificNotation)}
                  <span className="text-xl ml-2">{result.convertedUnitLabel.split(" ")[0]}</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">{result.convertedUnitLabel}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <h4 className="font-medium mb-2">Detalhes da Conversão:</h4>
              <ul className="text-sm space-y-1">
                <li>
                  <span className="font-medium">Categoria:</span> {result.categoryLabel}
                </li>
                <li>
                  <span className="font-medium">Fator de conversão:</span> {result.conversionFactor.toExponential(6)}
                </li>
                <li>
                  <span className="font-medium">Fórmula:</span> {result.originalValue}{" "}
                  {result.originalUnitLabel.split(" ")[0]} × {result.conversionFactor.toExponential(6)} ={" "}
                  {formatValue(result.convertedValue, result.scientificNotation)}{" "}
                  {result.convertedUnitLabel.split(" ")[0]}
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100">
              <h4 className="font-medium mb-2">Equivalências Comuns:</h4>
              <ul className="text-sm space-y-1">
                {category === "length" && (
                  <>
                    <li>1 metro = 100 centímetros</li>
                    <li>1 quilômetro = 0,621371 milhas</li>
                    <li>1 polegada = 2,54 centímetros</li>
                    <li>1 pé = 30,48 centímetros</li>
                  </>
                )}
                {category === "weight" && (
                  <>
                    <li>1 quilograma = 1000 gramas</li>
                    <li>1 quilograma = 2,20462 libras</li>
                    <li>1 onça = 28,3495 gramas</li>
                    <li>1 tonelada = 1000 quilogramas</li>
                  </>
                )}
                {category === "area" && (
                  <>
                    <li>1 metro quadrado = 10,7639 pés quadrados</li>
                    <li>1 hectare = 10.000 metros quadrados</li>
                    <li>1 acre = 4.046,86 metros quadrados</li>
                    <li>1 quilômetro quadrado = 0,386102 milhas quadradas</li>
                  </>
                )}
                {category === "volume" && (
                  <>
                    <li>1 litro = 1000 mililitros</li>
                    <li>1 galão (EUA) = 3,78541 litros</li>
                    <li>1 metro cúbico = 1000 litros</li>
                    <li>1 xícara = 250 mililitros</li>
                  </>
                )}
                {category === "time" && (
                  <>
                    <li>1 minuto = 60 segundos</li>
                    <li>1 hora = 60 minutos</li>
                    <li>1 dia = 24 horas</li>
                    <li>1 ano = 365,25 dias (média)</li>
                  </>
                )}
                {category === "speed" && (
                  <>
                    <li>1 m/s = 3,6 km/h</li>
                    <li>1 milha/h = 1,60934 km/h</li>
                    <li>1 nó = 1,852 km/h</li>
                    <li>Mach 1 = 340,29 m/s (ao nível do mar)</li>
                  </>
                )}
                {category === "pressure" && (
                  <>
                    <li>1 bar = 100.000 pascals</li>
                    <li>1 atmosfera = 101.325 pascals</li>
                    <li>1 psi = 6.894,76 pascals</li>
                    <li>1 mmHg = 133,322 pascals</li>
                  </>
                )}
                {category === "energy" && (
                  <>
                    <li>1 quilojoule = 1000 joules</li>
                    <li>1 quilocaloria = 4184 joules</li>
                    <li>1 quilowatt-hora = 3.600.000 joules</li>
                    <li>1 BTU = 1.055,06 joules</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
            <p className="text-sm font-medium text-blue-800 mb-2">💡 Dica</p>
            <p className="text-sm text-blue-700">
              Para converter entre outras unidades da mesma categoria, selecione as unidades desejadas nos menus
              suspensos. Você também pode clicar no botão de troca para inverter as unidades de origem e destino.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
