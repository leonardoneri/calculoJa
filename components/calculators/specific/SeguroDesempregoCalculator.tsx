"use client"

import { useState } from "react"
import { z } from "zod"

interface SeguroDesempregoCalculatorProps {
  onInputChange: (name: string, value: any) => void
  onCalculate: (result: any) => void
  config: any
}

const seguroDesempregoSchema = z.object({
  salarios: z.array(z.number().min(0, "Os salários não podem ser negativos")),
  mesesTrabalhados: z.number().min(0, "Não pode ser negativo"),
  primeiroAcesso: z.boolean(),
  segAcesso: z.boolean(),
  terceiroAcesso: z.boolean(),
})

export default function SeguroDesempregoCalculator({ onInputChange, onCalculate, config }: SeguroDesempregoCalculatorProps) {
  const [salario1, setSalario1] = useState<string>("")
  const [salario2, setSalario2] = useState<string>("")
  const [salario3, setSalario3] = useState<string>("")
  const [mesesTrabalhados, setMesesTrabalhados] = useState<string>("")
  const [primeiroAcesso, setPrimeiroAcesso] = useState<boolean>(true)
  const [segAcesso, setSegAcesso] = useState<boolean>(false)
  const [terceiroAcesso, setTerceiroAcesso] = useState<boolean>(false)
  const [resultado, setResultado] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleAcessoChange = (tipo: 'primeiro' | 'segundo' | 'terceiro') => {
    if (tipo === 'primeiro') {
      setPrimeiroAcesso(true)
      setSegAcesso(false)
      setTerceiroAcesso(false)
    } else if (tipo === 'segundo') {
      setPrimeiroAcesso(false)
      setSegAcesso(true)
      setTerceiroAcesso(false)
    } else {
      setPrimeiroAcesso(false)
      setSegAcesso(false)
      setTerceiroAcesso(true)
    }
  }

  const validateInput = () => {
    try {
      const salario1Num = Number.parseFloat(salario1 || "0")
      const salario2Num = Number.parseFloat(salario2 || "0")
      const salario3Num = Number.parseFloat(salario3 || "0")
      const mesesTrabalhadosNum = Number.parseInt(mesesTrabalhados || "0")

      seguroDesempregoSchema.parse({
        salarios: [salario1Num, salario2Num, salario3Num],
        mesesTrabalhados: mesesTrabalhadosNum,
        primeiroAcesso,
        segAcesso,
        terceiroAcesso
      })

      setErrors({})
      return {
        salario1Num,
        salario2Num,
        salario3Num,
        mesesTrabalhadosNum
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

  const calcularSeguroDesemprego = () => {
    const validatedInput = validateInput()
    if (!validatedInput) return

    const { salario1Num, salario2Num, salario3Num, mesesTrabalhadosNum } = validatedInput

    // Verifica elegibilidade
    let eligivel = false
    let motivo = ""
    let numeroParcelas = 0

    if (primeiroAcesso && mesesTrabalhadosNum >= 12) {
      eligivel = true
      // 1ª Solicitação: trabalhado pelo menos 12 meses nos últimos 18 meses
      if (mesesTrabalhadosNum >= 12 && mesesTrabalhadosNum < 24) {
        numeroParcelas = 4
      } else {
        numeroParcelas = 5
      }
    } else if (segAcesso && mesesTrabalhadosNum >= 9) {
      eligivel = true
      // 2ª Solicitação: trabalhado pelo menos 9 meses nos últimos 12 meses
      if (mesesTrabalhadosNum >= 9 && mesesTrabalhadosNum < 12) {
        numeroParcelas = 3
      } else if (mesesTrabalhadosNum >= 12 && mesesTrabalhadosNum < 24) {
        numeroParcelas = 4
      } else {
        numeroParcelas = 5
      }
    } else if (terceiroAcesso && mesesTrabalhadosNum >= 6) {
      eligivel = true
      // 3ª Solicitação: trabalhado pelo menos 6 meses
      if (mesesTrabalhadosNum >= 6 && mesesTrabalhadosNum < 12) {
        numeroParcelas = 3
      } else if (mesesTrabalhadosNum >= 12 && mesesTrabalhadosNum < 24) {
        numeroParcelas = 4
      } else {
        numeroParcelas = 5
      }
    } else {
      motivo = "Tempo de trabalho insuficiente para a solicitação selecionada."
    }

    // Calcula média salarial
    let salarios = [salario1Num, salario2Num, salario3Num].filter(s => s > 0)
    const mediaSalarial = salarios.length > 0 
      ? salarios.reduce((soma, salario) => soma + salario, 0) / salarios.length 
      : 0

    // Calcula valor das parcelas
    let valorParcela = 0

    if (mediaSalarial <= 1968.36) {
      // Até R$ 1.968,36: multiplica-se o salário médio por 0,8
      valorParcela = mediaSalarial * 0.8
    } else if (mediaSalarial <= 3280.93) {
      // De R$ 1.968,37 até R$ 3.280,93: o que exceder a R$ 1.968,36 multiplica-se por 0,5 e soma-se a R$ 1.574,69
      valorParcela = 1968.36 * 0.8 + (mediaSalarial - 1968.36) * 0.5
    } else {
      // Acima de R$ 3.280,93: o valor da parcela será de R$ 2.230,97
      valorParcela = 2230.97
    }

    // Não pode ser inferior ao salário mínimo
    valorParcela = Math.max(valorParcela, 1320)

    const resultadoFinal = {
      eligivel,
      motivo,
      mediaSalarial: mediaSalarial.toFixed(2),
      valorParcela: valorParcela.toFixed(2),
      numeroParcelas,
      totalBeneficio: (valorParcela * numeroParcelas).toFixed(2)
    }

    setResultado(resultadoFinal)

    // Call parent callbacks
    onInputChange("mediaSalarial", mediaSalarial)
    onInputChange("mesesTrabalhados", mesesTrabalhadosNum)
    onCalculate(resultadoFinal)
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="salario1" className="block text-sm font-medium text-gray-700 mb-1">
            Últimos 3 salários - Mês 1 (R$)
          </label>
          <input
            id="salario1"
            type="number"
            value={salario1}
            onChange={(e) => setSalario1(e.target.value)}
            placeholder="Ex: 2500"
            className="calculator-input"
            min="0"
            step="0.01"
          />
          {errors.salarios && <p className="text-red-500 text-sm mt-1">{errors.salarios}</p>}
        </div>

        <div>
          <label htmlFor="salario2" className="block text-sm font-medium text-gray-700 mb-1">
            Últimos 3 salários - Mês 2 (R$)
          </label>
          <input
            id="salario2"
            type="number"
            value={salario2}
            onChange={(e) => setSalario2(e.target.value)}
            placeholder="Ex: 2500"
            className="calculator-input"
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label htmlFor="salario3" className="block text-sm font-medium text-gray-700 mb-1">
            Últimos 3 salários - Mês 3 (R$)
          </label>
          <input
            id="salario3"
            type="number"
            value={salario3}
            onChange={(e) => setSalario3(e.target.value)}
            placeholder="Ex: 2500"
            className="calculator-input"
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label htmlFor="mesesTrabalhados" className="block text-sm font-medium text-gray-700 mb-1">
            Meses trabalhados nos últimos 36 meses
          </label>
          <input
            id="mesesTrabalhados"
            type="number"
            value={mesesTrabalhados}
            onChange={(e) => setMesesTrabalhados(e.target.value)}
            placeholder="Ex: 24"
            className="calculator-input"
            min="0"
            max="36"
          />
          {errors.mesesTrabalhados && <p className="text-red-500 text-sm mt-1">{errors.mesesTrabalhados}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Solicitação do Seguro Desemprego
          </label>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                id="primeiroAcesso"
                type="radio"
                checked={primeiroAcesso}
                onChange={() => handleAcessoChange('primeiro')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="primeiroAcesso" className="ml-2 block text-sm text-gray-700">
                Primeira solicitação
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="segundoAcesso"
                type="radio"
                checked={segAcesso}
                onChange={() => handleAcessoChange('segundo')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="segundoAcesso" className="ml-2 block text-sm text-gray-700">
                Segunda solicitação
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="terceiroAcesso"
                type="radio"
                checked={terceiroAcesso}
                onChange={() => handleAcessoChange('terceiro')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="terceiroAcesso" className="ml-2 block text-sm text-gray-700">
                Terceira solicitação ou mais
              </label>
            </div>
          </div>
        </div>
      </div>

      <button onClick={calcularSeguroDesemprego} className="calculator-button">
        Calcular Seguro-Desemprego
      </button>

      {resultado && (
        <div className="calculator-result">
          <h3 className="text-lg font-semibold mb-4">Resultado da Simulação:</h3>
          
          {resultado.eligivel ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded p-3 text-green-700">
                <p className="font-medium">Você tem direito ao Seguro-Desemprego</p>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-600">Média salarial:</span>
                  <span className="font-medium">R$ {resultado.mediaSalarial}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-600">Valor da parcela:</span>
                  <span className="font-medium">R$ {resultado.valorParcela}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-600">Número de parcelas:</span>
                  <span className="font-medium">{resultado.numeroParcelas}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-200">
                  <span className="text-gray-800 font-semibold">Valor total do benefício:</span>
                  <span className="font-bold text-green-600">R$ {resultado.totalBeneficio}</span>
                </div>
              </div>
              
              <div className="text-sm text-gray-500 mt-4">
                <p className="font-medium mb-1">Prazos para solicitação:</p>
                <p>O Seguro-Desemprego deve ser solicitado entre o 7º e o 120º dia após a data da demissão.</p>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700">
              <p className="font-medium">Você não tem direito ao Seguro-Desemprego</p>
              <p className="text-sm mt-1">{resultado.motivo}</p>
            </div>
          )}
          
          <div className="mt-6 text-sm text-gray-500">
            <p className="font-medium mb-1">Observações importantes:</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>Para primeira solicitação: é necessário ter trabalhado pelo menos 12 meses nos últimos 18 meses.</li>
              <li>Para segunda solicitação: é necessário ter trabalhado pelo menos 9 meses nos últimos 12 meses.</li>
              <li>Para terceira solicitação ou mais: é necessário ter trabalhado pelo menos 6 meses.</li>
              <li>O Seguro-Desemprego não é concedido em casos de pedido de demissão ou demissão por justa causa.</li>
              <li>Os valores usados no cálculo são baseados nas regras vigentes de 2023.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
} 