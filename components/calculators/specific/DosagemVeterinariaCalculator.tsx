"use client"

import { useState, useEffect } from "react"
import { z } from "zod"

interface DosagemVeterinariaCalculatorProps {
  onInputChange: (name: string, value: any) => void
  onCalculate: (result: any) => void
  config: any
}

const dosagemSchema = z.object({
  animalWeight: z.number().positive("O peso do animal deve ser maior que zero"),
  medicationDose: z.number().positive("A dose do medicamento deve ser maior que zero"),
  concentration: z.number().positive("A concentração deve ser maior que zero"),
})

// Fatores de conversão para unidades
const unitConversions = {
  mg: 1,
  mcg: 0.001, // 1 mcg = 0.001 mg
  ml: 1,
  "%": 10, // 1% = 10 mg/ml
}

export default function DosagemVeterinariaCalculator({
  onInputChange,
  onCalculate,
  config,
}: DosagemVeterinariaCalculatorProps) {
  const [animalWeight, setAnimalWeight] = useState<string>("")
  const [medicationDose, setMedicationDose] = useState<string>("")
  const [concentration, setConcentration] = useState<string>("")
  const [doseUnit, setDoseUnit] = useState<string>("mg/kg")
  const [concentrationUnit, setConcentrationUnit] = useState<string>("mg/ml")
  const [animalType, setAnimalType] = useState<string>("dog")
  const [dropsPerMl, setDropsPerMl] = useState<string>("20")
  const [result, setResult] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateInput = () => {
    try {
      const animalWeightNum = Number.parseFloat(animalWeight)
      const medicationDoseNum = Number.parseFloat(medicationDose)
      const concentrationNum = Number.parseFloat(concentration)

      dosagemSchema.parse({
        animalWeight: animalWeightNum,
        medicationDose: medicationDoseNum,
        concentration: concentrationNum,
      })

      setErrors({})
      return { animalWeightNum, medicationDoseNum, concentrationNum }
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

  const calculateDosage = () => {
    const validatedInput = validateInput()
    if (!validatedInput) return

    const { animalWeightNum, medicationDoseNum, concentrationNum } = validatedInput

    // Extrair unidades de base (mg, mcg, etc)
    const doseBaseUnit = doseUnit.split("/")[0]
    const concentrationBaseUnit = concentrationUnit.split("/")[0]
    
    // Aplicar fatores de conversão
    const doseFactor = unitConversions[doseBaseUnit] || 1
    const concentrationFactor = unitConversions[concentrationBaseUnit] || 1
    
    // Normalizar para mg para cálculos internos
    const normalizedDose = medicationDoseNum * doseFactor
    const normalizedConcentration = concentrationNum * concentrationFactor

    // Calculate total dose needed (em mg)
    const totalDoseNeeded = animalWeightNum * normalizedDose

    // Calculate volume needed (ml)
    const volumeNeeded = totalDoseNeeded / normalizedConcentration

    // Calculate drops
    const dropsPerMlNum = Number.parseFloat(dropsPerMl) || 20
    const drops = volumeNeeded * dropsPerMlNum

    const calculationResult = {
      totalDoseNeeded: Number.parseFloat(totalDoseNeeded.toFixed(2)),
      volumeNeeded: Number.parseFloat(volumeNeeded.toFixed(2)),
      drops: Math.round(drops),
      animalWeight: animalWeightNum,
      medicationDose: medicationDoseNum,
      concentration: concentrationNum,
      doseUnit,
      concentrationUnit,
      animalType,
      dropsPerMl: dropsPerMlNum,
    }

    setResult(calculationResult)

    // Call parent callbacks
    onInputChange("animalWeight", animalWeightNum)
    onInputChange("medicationDose", medicationDoseNum)
    onInputChange("concentration", concentrationNum)
    onInputChange("doseUnit", doseUnit)
    onInputChange("concentrationUnit", concentrationUnit)
    onInputChange("animalType", animalType)
    onInputChange("dropsPerMl", dropsPerMlNum)
    onCalculate(calculationResult)
  }

  // Calculate automatically when inputs change
  useEffect(() => {
    if (animalWeight && medicationDose && concentration) {
      const animalWeightNum = Number.parseFloat(animalWeight)
      const medicationDoseNum = Number.parseFloat(medicationDose)
      const concentrationNum = Number.parseFloat(concentration)

      if (
        !isNaN(animalWeightNum) &&
        !isNaN(medicationDoseNum) &&
        !isNaN(concentrationNum) &&
        animalWeightNum > 0 &&
        medicationDoseNum > 0 &&
        concentrationNum > 0
      ) {
        calculateDosage()
      }
    }
  }, [animalWeight, medicationDose, concentration, doseUnit, concentrationUnit, animalType, dropsPerMl])

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="animalType" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Animal
          </label>
          <select
            id="animalType"
            value={animalType}
            onChange={(e) => setAnimalType(e.target.value)}
            className="calculator-input"
          >
            <option value="dog">Cachorro</option>
            <option value="cat">Gato</option>
            <option value="bird">Ave</option>
            <option value="rodent">Roedor</option>
            <option value="other">Outro</option>
          </select>
        </div>

        <div>
          <label htmlFor="animalWeight" className="block text-sm font-medium text-gray-700 mb-1">
            Peso do Animal (kg)
          </label>
          <input
            id="animalWeight"
            type="number"
            value={animalWeight}
            onChange={(e) => setAnimalWeight(e.target.value)}
            placeholder="Ex: 10"
            className="calculator-input"
            min="0.1"
            step="0.1"
          />
          {errors.animalWeight && <p className="text-red-500 text-sm mt-1">{errors.animalWeight}</p>}
        </div>

        <div>
          <label htmlFor="medicationDose" className="block text-sm font-medium text-gray-700 mb-1">
            Dose do Medicamento
          </label>
          <div className="flex">
            <input
              id="medicationDose"
              type="number"
              value={medicationDose}
              onChange={(e) => setMedicationDose(e.target.value)}
              placeholder="Ex: 5"
              className="calculator-input rounded-r-none flex-grow"
              min="0.1"
              step="0.1"
            />
            <select
              value={doseUnit}
              onChange={(e) => setDoseUnit(e.target.value)}
              className="border border-l-0 border-gray-300 rounded-r-md p-2 bg-gray-50"
            >
              <option value="mg/kg">mg/kg</option>
              <option value="mcg/kg">mcg/kg</option>
              <option value="ml/kg">ml/kg</option>
            </select>
          </div>
          {errors.medicationDose && <p className="text-red-500 text-sm mt-1">{errors.medicationDose}</p>}
        </div>

        <div>
          <label htmlFor="concentration" className="block text-sm font-medium text-gray-700 mb-1">
            Concentração do Medicamento
          </label>
          <div className="flex">
            <input
              id="concentration"
              type="number"
              value={concentration}
              onChange={(e) => setConcentration(e.target.value)}
              placeholder="Ex: 50"
              className="calculator-input rounded-r-none flex-grow"
              min="0.1"
              step="0.1"
            />
            <select
              value={concentrationUnit}
              onChange={(e) => setConcentrationUnit(e.target.value)}
              className="border border-l-0 border-gray-300 rounded-r-md p-2 bg-gray-50"
            >
              <option value="mg/ml">mg/ml</option>
              <option value="mcg/ml">mcg/ml</option>
              <option value="%">%</option>
            </select>
          </div>
          {errors.concentration && <p className="text-red-500 text-sm mt-1">{errors.concentration}</p>}
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="dropsPerMl" className="block text-sm font-medium text-gray-700 mb-1">
          Número de gotas por ml (varia conforme o gotejador)
        </label>
        <input
          id="dropsPerMl"
          type="number"
          value={dropsPerMl}
          onChange={(e) => setDropsPerMl(e.target.value)}
          placeholder="Ex: 20"
          className="calculator-input w-32"
          min="1"
          step="1"
        />
        <p className="text-sm text-gray-500 mt-1">
          Padrão: 20 gotas/ml. Pode variar de 15 a 25 gotas dependendo do medicamento e gotejador.
        </p>
      </div>

      <button onClick={calculateDosage} className="calculator-button">
        Calcular Dosagem
      </button>

      {result && (
        <div className="calculator-result">
          <h3 className="text-lg font-semibold mb-4">Resultado:</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
              <p className="text-sm text-gray-600 mb-1">Dose Total Necessária</p>
              <p className="text-xl font-bold text-blue-700">
                {result.totalDoseNeeded} {doseUnit.split("/")[0]}
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-md border border-green-100">
              <p className="text-sm text-gray-600 mb-1">Volume a Administrar</p>
              <p className="text-xl font-bold text-green-700">{result.volumeNeeded} ml</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-md border border-purple-100">
              <p className="text-sm text-gray-600 mb-1">Aproximadamente em Gotas</p>
              <p className="text-xl font-bold text-purple-700">{result.drops} gotas</p>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100 mb-4">
            <p className="text-sm font-medium text-yellow-800 mb-2">⚠️ Aviso Importante</p>
            <p className="text-sm text-yellow-700">
              Esta calculadora é apenas uma ferramenta de referência. Sempre consulte um médico veterinário para a
              dosagem correta de medicamentos para seu animal.
            </p>
          </div>

          <div className="text-sm text-gray-600">
            <p className="mb-1">
              <span className="font-medium">Cálculo:</span> {result.animalWeight} kg × {result.medicationDose}{" "}
              {result.doseUnit} = {result.totalDoseNeeded} {doseUnit.split("/")[0]}
            </p>
            <p>
              <span className="font-medium">Volume:</span> {result.totalDoseNeeded} {doseUnit.split("/")[0]} ÷{" "}
              {result.concentration} {result.concentrationUnit} = {result.volumeNeeded} ml
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
