"use client"

import { useState, useEffect } from "react"
import { z } from "zod"

interface CaloriasDiariasCalculatorProps {
  onInputChange: (name: string, value: any) => void
  onCalculate: (result: any) => void
  config: any
}

const caloriasSchema = z.object({
  idade: z.number().min(15, "A idade deve ser de pelo menos 15 anos").max(100, "A idade máxima é 100 anos"),
  peso: z.number().min(30, "O peso mínimo é 30kg").max(300, "O peso máximo é 300kg"),
  altura: z.number().min(100, "A altura mínima é 100cm").max(250, "A altura máxima é 250cm"),
  genero: z.enum(["masculino", "feminino"]),
  nivelAtividade: z.enum(["sedentario", "leve", "moderado", "ativo", "muito_ativo"]),
  objetivo: z.enum(["perder", "manter", "ganhar"]),
})

export default function CaloriasDiariasCalculator({
  onInputChange,
  onCalculate,
  config,
}: CaloriasDiariasCalculatorProps) {
  const [idade, setIdade] = useState<string>("30")
  const [peso, setPeso] = useState<string>("70")
  const [altura, setAltura] = useState<string>("170")
  const [genero, setGenero] = useState<string>("masculino")
  const [nivelAtividade, setNivelAtividade] = useState<string>("moderado")
  const [objetivo, setObjetivo] = useState<string>("manter")
  const [resultado, setResultado] = useState<number | null>(null)
  const [distribuicao, setDistribuicao] = useState<{
    proteinas: number
    carboidratos: number
    gorduras: number
  } | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateInput = () => {
    try {
      const idadeNum = Number(idade)
      const pesoNum = Number(peso)
      const alturaNum = Number(altura)

      caloriasSchema.parse({
        idade: idadeNum,
        peso: pesoNum,
        altura: alturaNum,
        genero,
        nivelAtividade,
        objetivo,
      })

      setErrors({})
      return {
        idadeNum,
        pesoNum,
        alturaNum,
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

  const calcularCalorias = () => {
    const validInput = validateInput()
    if (!validInput) return

    const { idadeNum, pesoNum, alturaNum } = validInput
    let tmb = 0

    // Cálculo da Taxa Metabólica Basal (TMB) usando a fórmula de Mifflin-St Jeor
    if (genero === "masculino") {
      tmb = 10 * pesoNum + 6.25 * alturaNum - 5 * idadeNum + 5
    } else {
      tmb = 10 * pesoNum + 6.25 * alturaNum - 5 * idadeNum - 161
    }

    // Fator de atividade
    let fatorAtividade = 1.2 // Sedentário
    switch (nivelAtividade) {
      case "leve":
        fatorAtividade = 1.375
        break
      case "moderado":
        fatorAtividade = 1.55
        break
      case "ativo":
        fatorAtividade = 1.725
        break
      case "muito_ativo":
        fatorAtividade = 1.9
        break
    }

    // Calorias diárias necessárias
    let caloriasDiarias = tmb * fatorAtividade

    // Ajuste baseado no objetivo
    switch (objetivo) {
      case "perder":
        caloriasDiarias *= 0.85 // Déficit de 15%
        break
      case "ganhar":
        caloriasDiarias *= 1.15 // Superávit de 15%
        break
    }

    const caloriasFinal = Math.round(caloriasDiarias)
    setResultado(caloriasFinal)

    // Cálculo da distribuição de macronutrientes
    const proteinas = Math.round((caloriasDiarias * 0.3) / 4) // 4 calorias por grama
    const carboidratos = Math.round((caloriasDiarias * 0.4) / 4) // 4 calorias por grama
    const gorduras = Math.round((caloriasDiarias * 0.3) / 9) // 9 calorias por grama

    const macronutrientes = {
      proteinas,
      carboidratos,
      gorduras,
    }
    
    setDistribuicao(macronutrientes)

    // Chamar callbacks do componente pai
    onInputChange("idade", idadeNum)
    onInputChange("peso", pesoNum)
    onInputChange("altura", alturaNum)
    onInputChange("genero", genero)
    onInputChange("nivelAtividade", nivelAtividade)
    onInputChange("objetivo", objetivo)
    
    onCalculate({
      caloriasDiarias: caloriasFinal,
      macronutrientes,
    })
  }

  // Recalcular quando os inputs mudam
  useEffect(() => {
    if (idade && peso && altura) {
      const idadeNum = Number(idade)
      const pesoNum = Number(peso)
      const alturaNum = Number(altura)
      
      if (!isNaN(idadeNum) && !isNaN(pesoNum) && !isNaN(alturaNum) && 
          idadeNum > 0 && pesoNum > 0 && alturaNum > 0) {
        calcularCalorias()
      }
    }
  }, [idade, peso, altura, genero, nivelAtividade, objetivo])

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="idade" className="block text-sm font-medium text-gray-700 mb-1">
            Idade (anos)
          </label>
          <input
            id="idade"
            type="number"
            value={idade}
            onChange={(e) => setIdade(e.target.value)}
            placeholder="Ex: 30"
            className="calculator-input"
            min="15"
            max="100"
          />
          {errors.idade && <p className="text-red-500 text-sm mt-1">{errors.idade}</p>}
        </div>

        <div>
          <label htmlFor="peso" className="block text-sm font-medium text-gray-700 mb-1">
            Peso (kg)
          </label>
          <input
            id="peso"
            type="number"
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
            placeholder="Ex: 70"
            className="calculator-input"
            min="30"
            max="300"
            step="0.1"
          />
          {errors.peso && <p className="text-red-500 text-sm mt-1">{errors.peso}</p>}
        </div>

        <div>
          <label htmlFor="altura" className="block text-sm font-medium text-gray-700 mb-1">
            Altura (cm)
          </label>
          <input
            id="altura"
            type="number"
            value={altura}
            onChange={(e) => setAltura(e.target.value)}
            placeholder="Ex: 170"
            className="calculator-input"
            min="100"
            max="250"
          />
          {errors.altura && <p className="text-red-500 text-sm mt-1">{errors.altura}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gênero</label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="genero"
                value="masculino"
                checked={genero === "masculino"}
                onChange={(e) => setGenero(e.target.value)}
              />
              <span className="ml-2">Masculino</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="genero"
                value="feminino"
                checked={genero === "feminino"}
                onChange={(e) => setGenero(e.target.value)}
              />
              <span className="ml-2">Feminino</span>
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="nivelAtividade" className="block text-sm font-medium text-gray-700 mb-1">
            Nível de Atividade Física
          </label>
          <select
            id="nivelAtividade"
            value={nivelAtividade}
            onChange={(e) => setNivelAtividade(e.target.value)}
            className="calculator-input"
          >
            <option value="sedentario">Sedentário (pouco ou nenhum exercício)</option>
            <option value="leve">Levemente ativo (1-3 dias/semana)</option>
            <option value="moderado">Moderadamente ativo (3-5 dias/semana)</option>
            <option value="ativo">Muito ativo (6-7 dias/semana)</option>
            <option value="muito_ativo">Extremamente ativo (atletas, trabalho físico)</option>
          </select>
        </div>

        <div>
          <label htmlFor="objetivo" className="block text-sm font-medium text-gray-700 mb-1">
            Objetivo
          </label>
          <select
            id="objetivo"
            value={objetivo}
            onChange={(e) => setObjetivo(e.target.value)}
            className="calculator-input"
          >
            <option value="perder">Perder peso</option>
            <option value="manter">Manter peso</option>
            <option value="ganhar">Ganhar peso</option>
          </select>
        </div>
      </div>

      <button onClick={calcularCalorias} className="calculator-button">
        Calcular Calorias Diárias
      </button>

      {resultado !== null && distribuicao !== null && (
        <div className="calculator-result">
          <h3 className="text-lg font-semibold mb-4">Resultado:</h3>
          
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mb-4">
            <p className="text-sm text-gray-600 mb-1">Necessidade Calórica Diária</p>
            <p className="text-2xl font-bold text-blue-700">{resultado} calorias</p>
          </div>
          
          <h4 className="font-medium text-gray-700 mb-2">Distribuição de Macronutrientes:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-3 rounded-md border border-green-100">
              <p className="text-sm text-gray-600 mb-1">Proteínas (30%)</p>
              <p className="text-xl font-bold text-green-700">{distribuicao.proteinas}g</p>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
              <p className="text-sm text-gray-600 mb-1">Carboidratos (40%)</p>
              <p className="text-xl font-bold text-blue-700">{distribuicao.carboidratos}g</p>
            </div>
            
            <div className="bg-yellow-50 p-3 rounded-md border border-yellow-100">
              <p className="text-sm text-gray-600 mb-1">Gorduras (30%)</p>
              <p className="text-xl font-bold text-yellow-700">{distribuicao.gorduras}g</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
