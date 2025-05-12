"use client"

import { useState } from "react"
import { z } from "zod"

interface IRFonteCalculatorProps {
  onInputChange: (name: string, value: any) => void
  onCalculate: (result: any) => void
  config: any
}

const irFonteSchema = z.object({
  salarioBruto: z.number().positive("O salário deve ser maior que zero"),
  dependentes: z.number().min(0, "Não pode ser negativo"),
  outrasDeducoes: z.number().min(0, "Não pode ser negativo"),
  pensaoAlimenticia: z.number().min(0, "Não pode ser negativo"),
  tipoRendimento: z.enum(["normal", "ferias", "decimoTerceiro"]),
})

export default function IRFonteCalculator({ onInputChange, onCalculate, config }: IRFonteCalculatorProps) {
  const [salarioBruto, setSalarioBruto] = useState<string>("")
  const [dependentes, setDependentes] = useState<string>("0")
  const [outrasDeducoes, setOutrasDeducoes] = useState<string>("0")
  const [pensaoAlimenticia, setPensaoAlimenticia] = useState<string>("0")
  const [tipoRendimento, setTipoRendimento] = useState<"normal" | "ferias" | "decimoTerceiro">("normal")
  const [resultado, setResultado] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateInput = () => {
    try {
      const salarioNum = Number.parseFloat(salarioBruto)
      const dependentesNum = Number.parseInt(dependentes || "0")
      const outrasDeducoesNum = Number.parseFloat(outrasDeducoes || "0")
      const pensaoAlimenticiaNum = Number.parseFloat(pensaoAlimenticia || "0")

      irFonteSchema.parse({
        salarioBruto: salarioNum,
        dependentes: dependentesNum,
        outrasDeducoes: outrasDeducoesNum,
        pensaoAlimenticia: pensaoAlimenticiaNum,
        tipoRendimento,
      })

      setErrors({})
      return {
        salarioNum,
        dependentesNum,
        outrasDeducoesNum,
        pensaoAlimenticiaNum
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

  const calcularIRRF = (baseCalculo: number): { aliquota: number, valorIR: number } => {
    // Tabela IRRF 2023
    if (baseCalculo <= 2112) {
      return { aliquota: 0, valorIR: 0 }
    } else if (baseCalculo <= 2826.65) {
      return { aliquota: 7.5, valorIR: baseCalculo * 0.075 - 158.40 }
    } else if (baseCalculo <= 3751.05) {
      return { aliquota: 15, valorIR: baseCalculo * 0.15 - 370.40 }
    } else if (baseCalculo <= 4664.68) {
      return { aliquota: 22.5, valorIR: baseCalculo * 0.225 - 651.73 }
    } else {
      return { aliquota: 27.5, valorIR: baseCalculo * 0.275 - 884.96 }
    }
  }

  const calcularIRNaFonte = () => {
    const validatedInput = validateInput()
    if (!validatedInput) return

    const { salarioNum, dependentesNum, outrasDeducoesNum, pensaoAlimenticiaNum } = validatedInput

    // Valor da dedução por dependente (atualizado para 2023)
    const valorDeducaoDependente = 189.59
    const totalDeducaoDependentes = dependentesNum * valorDeducaoDependente
    
    // Cálculo do INSS
    const valorINSS = calcularINSS(salarioNum)
    
    // Base de cálculo do IR
    const baseCalculo = Math.max(0, salarioNum - valorINSS - totalDeducaoDependentes - outrasDeducoesNum - pensaoAlimenticiaNum)
    
    // Cálculo do IR
    const { aliquota, valorIR } = calcularIRRF(baseCalculo)
    
    // Alíquota efetiva
    const aliquotaEfetiva = salarioNum > 0 ? (valorIR / salarioNum) * 100 : 0
    
    // Líquido
    const salarioLiquido = salarioNum - valorINSS - valorIR - pensaoAlimenticiaNum

    const resultadoFinal = {
      salarioBruto: salarioNum.toFixed(2),
      valorINSS: valorINSS.toFixed(2),
      baseCalculo: baseCalculo.toFixed(2),
      deducaoDependentes: totalDeducaoDependentes.toFixed(2),
      outrasDeducoes: outrasDeducoesNum.toFixed(2),
      pensaoAlimenticia: pensaoAlimenticiaNum.toFixed(2),
      aliquotaIR: aliquota.toFixed(2),
      valorIR: valorIR.toFixed(2),
      aliquotaEfetiva: aliquotaEfetiva.toFixed(2),
      salarioLiquido: salarioLiquido.toFixed(2)
    }

    setResultado(resultadoFinal)

    // Call parent callbacks
    onInputChange("salarioBruto", salarioNum)
    onInputChange("dependentes", dependentesNum)
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
            placeholder="Ex: 3500"
            className="calculator-input"
            min="0"
            step="0.01"
          />
          {errors.salarioBruto && <p className="text-red-500 text-sm mt-1">{errors.salarioBruto}</p>}
        </div>

        <div>
          <label htmlFor="dependentes" className="block text-sm font-medium text-gray-700 mb-1">
            Número de Dependentes
          </label>
          <input
            id="dependentes"
            type="number"
            value={dependentes}
            onChange={(e) => setDependentes(e.target.value)}
            placeholder="Ex: 0"
            className="calculator-input"
            min="0"
          />
          {errors.dependentes && <p className="text-red-500 text-sm mt-1">{errors.dependentes}</p>}
        </div>

        <div>
          <label htmlFor="outrasDeducoes" className="block text-sm font-medium text-gray-700 mb-1">
            Outras Deduções (R$)
          </label>
          <input
            id="outrasDeducoes"
            type="number"
            value={outrasDeducoes}
            onChange={(e) => setOutrasDeducoes(e.target.value)}
            placeholder="Ex: 0"
            className="calculator-input"
            min="0"
            step="0.01"
          />
          {errors.outrasDeducoes && <p className="text-red-500 text-sm mt-1">{errors.outrasDeducoes}</p>}
          <p className="text-xs text-gray-500 mt-1">Previdência privada, plano de saúde, etc.</p>
        </div>

        <div>
          <label htmlFor="pensaoAlimenticia" className="block text-sm font-medium text-gray-700 mb-1">
            Pensão Alimentícia (R$)
          </label>
          <input
            id="pensaoAlimenticia"
            type="number"
            value={pensaoAlimenticia}
            onChange={(e) => setPensaoAlimenticia(e.target.value)}
            placeholder="Ex: 0"
            className="calculator-input"
            min="0"
            step="0.01"
          />
          {errors.pensaoAlimenticia && <p className="text-red-500 text-sm mt-1">{errors.pensaoAlimenticia}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Rendimento
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center">
              <input
                id="tipoNormal"
                type="radio"
                checked={tipoRendimento === "normal"}
                onChange={() => setTipoRendimento("normal")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="tipoNormal" className="ml-2 block text-sm text-gray-700">
                Salário normal
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="tipoFerias"
                type="radio"
                checked={tipoRendimento === "ferias"}
                onChange={() => setTipoRendimento("ferias")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="tipoFerias" className="ml-2 block text-sm text-gray-700">
                Férias
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="tipoDecimoTerceiro"
                type="radio"
                checked={tipoRendimento === "decimoTerceiro"}
                onChange={() => setTipoRendimento("decimoTerceiro")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="tipoDecimoTerceiro" className="ml-2 block text-sm text-gray-700">
                13º Salário
              </label>
            </div>
          </div>
        </div>
      </div>

      <button onClick={calcularIRNaFonte} className="calculator-button">
        Calcular IR na Fonte
      </button>

      {resultado && (
        <div className="calculator-result">
          <h3 className="text-lg font-semibold mb-4">Resultado do Cálculo de IR na Fonte:</h3>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-gray-600">Salário Bruto:</span>
              <span className="font-medium">R$ {resultado.salarioBruto}</span>
            </div>
            
            <div className="pt-2 border-t border-gray-200">
              <h4 className="font-medium text-gray-700 mb-2">Deduções:</h4>
              
              <div className="grid grid-cols-2 gap-2 ml-2">
                <span className="text-gray-600">INSS:</span>
                <span className="font-medium text-red-500">- R$ {resultado.valorINSS}</span>
              </div>
              
              {Number(resultado.deducaoDependentes) > 0 && (
                <div className="grid grid-cols-2 gap-2 ml-2">
                  <span className="text-gray-600">Dedução por dependentes:</span>
                  <span className="font-medium text-red-500">- R$ {resultado.deducaoDependentes}</span>
                </div>
              )}
              
              {Number(resultado.outrasDeducoes) > 0 && (
                <div className="grid grid-cols-2 gap-2 ml-2">
                  <span className="text-gray-600">Outras deduções:</span>
                  <span className="font-medium text-red-500">- R$ {resultado.outrasDeducoes}</span>
                </div>
              )}
              
              {Number(resultado.pensaoAlimenticia) > 0 && (
                <div className="grid grid-cols-2 gap-2 ml-2">
                  <span className="text-gray-600">Pensão alimentícia:</span>
                  <span className="font-medium text-red-500">- R$ {resultado.pensaoAlimenticia}</span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
              <span className="text-gray-700 font-medium">Base de cálculo do IR:</span>
              <span className="font-medium">R$ {resultado.baseCalculo}</span>
            </div>
            
            <div className="pt-2 border-t border-gray-200">
              <h4 className="font-medium text-gray-700 mb-2">Imposto de Renda:</h4>
              
              <div className="grid grid-cols-2 gap-2 ml-2">
                <span className="text-gray-600">Alíquota nominal:</span>
                <span className="font-medium">{resultado.aliquotaIR}%</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 ml-2">
                <span className="text-gray-600">Alíquota efetiva:</span>
                <span className="font-medium">{resultado.aliquotaEfetiva}%</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 ml-2">
                <span className="text-gray-600">Valor do IR:</span>
                <span className="font-medium text-red-500">- R$ {resultado.valorIR}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-200 mt-3">
              <span className="text-gray-800 font-semibold">Salário Líquido:</span>
              <span className="font-bold text-green-600">R$ {resultado.salarioLiquido}</span>
            </div>
          </div>
          
          <div className="mt-6 text-sm text-gray-500">
            <p className="font-medium mb-1">Observações importantes:</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>Os valores são calculados com base na tabela do IR 2023.</li>
              <li>A dedução por dependente é de R$ 189,59 por pessoa.</li>
              <li>Alíquota efetiva é o percentual real do imposto sobre o salário bruto.</li>
              <li>Este cálculo é uma estimativa e pode não refletir exatamente o valor retido na folha de pagamento.</li>
              <li>Consulte seu contador ou a Receita Federal para informações específicas sobre sua situação.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
} 