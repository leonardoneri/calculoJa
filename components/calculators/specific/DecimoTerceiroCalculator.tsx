"use client"

import { useState, useEffect } from "react"
import { z } from "zod"

interface DecimoTerceiroCalculatorProps {
  onInputChange: (name: string, value: any) => void
  onCalculate: (result: any) => void
  config: any
}

const decimoTerceiroSchema = z.object({
  salarioBruto: z.number().positive("O salário deve ser maior que zero"),
  mesesTrabalhados: z.number().min(0, "Não pode ser negativo").max(12, "Máximo de 12 meses"),
  considerarINSS: z.boolean(),
  considerarIRRF: z.boolean(),
})

export default function DecimoTerceiroCalculator({ onInputChange, onCalculate, config }: DecimoTerceiroCalculatorProps) {
  const [salarioBruto, setSalarioBruto] = useState<string>("")
  const [mesesTrabalhados, setMesesTrabalhados] = useState<string>("12")
  const [considerarINSS, setConsiderarINSS] = useState<boolean>(true)
  const [considerarIRRF, setConsiderarIRRF] = useState<boolean>(true)
  const [resultado, setResultado] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const validateInput = () => {
    try {
      const salarioNum = Number.parseFloat(salarioBruto)
      const mesesTrabalhadosNum = Number.parseInt(mesesTrabalhados || "0")

      decimoTerceiroSchema.parse({ 
        salarioBruto: salarioNum, 
        mesesTrabalhados: mesesTrabalhadosNum,
        considerarINSS,
        considerarIRRF
      })
      
      setErrors({})
      return { 
        salarioNum, 
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
  
  const calcularINSS = (valor: number): number => {
    if (!considerarINSS) return 0
    
    // Tabela INSS 2023
    if (valor <= 1320) {
      return valor * 0.075
    } else if (valor <= 2571.29) {
      return 1320 * 0.075 + (valor - 1320) * 0.09
    } else if (valor <= 3856.94) {
      return 1320 * 0.075 + (2571.29 - 1320) * 0.09 + (valor - 2571.29) * 0.12
    } else if (valor <= 7507.49) {
      return 1320 * 0.075 + (2571.29 - 1320) * 0.09 + (3856.94 - 2571.29) * 0.12 + (valor - 3856.94) * 0.14
    } else {
      // Teto do INSS
      return 1320 * 0.075 + (2571.29 - 1320) * 0.09 + (3856.94 - 2571.29) * 0.12 + (7507.49 - 3856.94) * 0.14
    }
  }
  
  const calcularIRRF = (valor: number): number => {
    if (!considerarIRRF) return 0
    
    // Base de cálculo (valor - INSS)
    const baseCalculo = valor - calcularINSS(valor)
    
    // Tabela IRRF 2023
    if (baseCalculo <= 2112) {
      return 0
    } else if (baseCalculo <= 2826.65) {
      return baseCalculo * 0.075 - 158.40
    } else if (baseCalculo <= 3751.05) {
      return baseCalculo * 0.15 - 370.40
    } else if (baseCalculo <= 4664.68) {
      return baseCalculo * 0.225 - 651.73
    } else {
      return baseCalculo * 0.275 - 884.96
    }
  }

  const calcularDecimoTerceiro = () => {
    const validatedInput = validateInput()
    if (!validatedInput) return

    const { salarioNum, mesesTrabalhadosNum } = validatedInput
    
    // Valor proporcional ao número de meses trabalhados
    const valorProporcional = (salarioNum / 12) * mesesTrabalhadosNum
    
    // Primeira parcela (sem descontos)
    const primeiraParcela = valorProporcional / 2
    
    // Descontos da segunda parcela
    const inss = calcularINSS(valorProporcional)
    const irrf = calcularIRRF(valorProporcional)
    
    // Segunda parcela
    const segundaParcela = valorProporcional / 2 - inss - irrf
    
    // Valor líquido total
    const valorLiquido = primeiraParcela + segundaParcela
    
    const resultadoFinal = {
      valorProporcional: valorProporcional.toFixed(2),
      primeiraParcela: primeiraParcela.toFixed(2),
      inss: inss.toFixed(2),
      irrf: irrf.toFixed(2),
      segundaParcela: segundaParcela.toFixed(2),
      valorLiquido: valorLiquido.toFixed(2)
    }
    
    setResultado(resultadoFinal)
    
    // Call parent callbacks
    onInputChange("salarioBruto", salarioNum)
    onInputChange("mesesTrabalhados", mesesTrabalhadosNum)
    onCalculate(resultadoFinal)
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="salarioBruto" className="block text-sm font-medium text-gray-700 mb-1">
            Salário Bruto (R$)
          </label>
          <input
            id="salarioBruto"
            type="number"
            value={salarioBruto}
            onChange={(e) => setSalarioBruto(e.target.value)}
            placeholder="Ex: 3000"
            className="calculator-input"
            min="0"
            step="0.01"
          />
          {errors.salarioBruto && <p className="text-red-500 text-sm mt-1">{errors.salarioBruto}</p>}
        </div>

        <div>
          <label htmlFor="mesesTrabalhados" className="block text-sm font-medium text-gray-700 mb-1">
            Meses Trabalhados no Ano
          </label>
          <input
            id="mesesTrabalhados"
            type="number"
            value={mesesTrabalhados}
            onChange={(e) => setMesesTrabalhados(e.target.value)}
            placeholder="Ex: 12"
            className="calculator-input"
            min="0"
            max="12"
            step="1"
          />
          {errors.mesesTrabalhados && <p className="text-red-500 text-sm mt-1">{errors.mesesTrabalhados}</p>}
          <p className="text-xs text-gray-500 mt-1">Apenas meses completos ou com mais de 15 dias trabalhados</p>
        </div>

        <div className="flex items-center">
          <input
            id="considerarINSS"
            type="checkbox"
            checked={considerarINSS}
            onChange={(e) => setConsiderarINSS(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="considerarINSS" className="ml-2 block text-sm text-gray-700">
            Considerar desconto de INSS
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="considerarIRRF"
            type="checkbox"
            checked={considerarIRRF}
            onChange={(e) => setConsiderarIRRF(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="considerarIRRF" className="ml-2 block text-sm text-gray-700">
            Considerar desconto de Imposto de Renda
          </label>
        </div>
      </div>

      <button onClick={calcularDecimoTerceiro} className="calculator-button">
        Calcular 13º Salário
      </button>

      {resultado && (
        <div className="calculator-result">
          <h3 className="text-lg font-semibold mb-4">Resultado do 13º Salário:</h3>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-gray-600">Valor Bruto Proporcional:</span>
              <span className="font-medium">R$ {resultado.valorProporcional}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <span className="text-gray-600">Primeira Parcela (até 30/11):</span>
              <span className="font-medium">R$ {resultado.primeiraParcela}</span>
            </div>
            
            {considerarINSS && (
              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-600">Desconto de INSS:</span>
                <span className="font-medium text-red-500">- R$ {resultado.inss}</span>
              </div>
            )}
            
            {considerarIRRF && (
              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-600">Desconto de IR:</span>
                <span className="font-medium text-red-500">- R$ {resultado.irrf}</span>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2">
              <span className="text-gray-600">Segunda Parcela (até 20/12):</span>
              <span className="font-medium">R$ {resultado.segundaParcela}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-200">
              <span className="text-gray-800 font-semibold">Valor Líquido Total:</span>
              <span className="font-bold text-green-600">R$ {resultado.valorLiquido}</span>
            </div>
          </div>
          
          <div className="mt-6 text-sm text-gray-500">
            <p className="font-medium mb-1">Observações importantes:</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>O 13º salário é pago em duas parcelas: até 30/11 (primeira) e até 20/12 (segunda).</li>
              <li>A primeira parcela pode ser antecipada com as férias, se solicitado pelo empregado.</li>
              <li>A primeira parcela não tem descontos, apenas a segunda.</li>
              <li>Todo empregado tem direito a 1/12 avos do salário por mês trabalhado.</li>
              <li>Considere-se como mês completo a fração igual ou superior a 15 dias de trabalho.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
} 