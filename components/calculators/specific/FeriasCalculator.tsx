"use client"

import { useState } from "react"
import { z } from "zod"

interface FeriasCalculatorProps {
  onInputChange: (name: string, value: any) => void
  onCalculate: (result: any) => void
  config: any
}

const feriasSchema = z.object({
  salarioBruto: z.number().positive("O salário deve ser maior que zero"),
  diasFerias: z.number().min(5, "Mínimo de 5 dias").max(30, "Máximo de 30 dias"),
  venderUmTerco: z.boolean(),
  adiantarDecimoTerceiro: z.boolean(),
  dependentes: z.number().min(0, "Não pode ser negativo"),
  outrosDescontos: z.number().min(0, "Não pode ser negativo"),
})

export default function FeriasCalculator({ onInputChange, onCalculate, config }: FeriasCalculatorProps) {
  const [salarioBruto, setSalarioBruto] = useState<string>("")
  const [diasFerias, setDiasFerias] = useState<string>("30")
  const [venderUmTerco, setVenderUmTerco] = useState<boolean>(false)
  const [adiantarDecimoTerceiro, setAdiantarDecimoTerceiro] = useState<boolean>(false)
  const [dependentes, setDependentes] = useState<string>("0")
  const [outrosDescontos, setOutrosDescontos] = useState<string>("0")
  const [resultado, setResultado] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateInput = () => {
    try {
      const salarioNum = Number.parseFloat(salarioBruto)
      const diasFeriasNum = Number.parseInt(diasFerias)
      const dependentesNum = Number.parseInt(dependentes || "0")
      const outrosDescontosNum = Number.parseFloat(outrosDescontos || "0")

      feriasSchema.parse({
        salarioBruto: salarioNum,
        diasFerias: diasFeriasNum,
        venderUmTerco,
        adiantarDecimoTerceiro,
        dependentes: dependentesNum,
        outrosDescontos: outrosDescontosNum
      })

      setErrors({})
      return {
        salarioNum,
        diasFeriasNum,
        dependentesNum,
        outrosDescontosNum
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

  const calcularIRRF = (valor: number, dependentes: number): number => {
    // Dedução por dependente
    const deducaoDependentes = dependentes * 189.59
    
    // Base de cálculo (valor - INSS - dedução por dependentes)
    const baseCalculo = valor - calcularINSS(valor) - deducaoDependentes
    
    if (baseCalculo <= 0) {
      return 0
    }
    
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

  const calcularFerias = () => {
    const validatedInput = validateInput()
    if (!validatedInput) return

    const { salarioNum, diasFeriasNum, dependentesNum, outrosDescontosNum } = validatedInput

    // Valor do salário por dia
    const valorDiaSalario = salarioNum / 30
    
    // Valor base das férias (proporcional aos dias)
    const valorBaseFerias = valorDiaSalario * diasFeriasNum
    
    // Adicional constitucional de férias (1/3)
    const adicionalTerco = valorBaseFerias / 3
    
    // Abono pecuniário (venda de 1/3 das férias)
    const abonoPecuniario = venderUmTerco ? (valorDiaSalario * 10) + ((valorDiaSalario * 10) / 3) : 0
    
    // Adiantamento de 13º salário
    const adiantamento13 = adiantarDecimoTerceiro ? salarioNum / 2 : 0
    
    // Total de proventos
    const totalProventos = valorBaseFerias + adicionalTerco + abonoPecuniario + adiantamento13
    
    // Descontos
    const descontoINSS = calcularINSS(valorBaseFerias + adicionalTerco)
    const descontoIR = calcularIRRF(valorBaseFerias + adicionalTerco, dependentesNum)
    
    // Total de descontos
    const totalDescontos = descontoINSS + descontoIR + outrosDescontosNum
    
    // Valor líquido
    const valorLiquido = totalProventos - totalDescontos

    const resultadoFinal = {
      valorBaseFerias: valorBaseFerias.toFixed(2),
      adicionalTerco: adicionalTerco.toFixed(2),
      abonoPecuniario: abonoPecuniario.toFixed(2),
      adiantamento13: adiantamento13.toFixed(2),
      totalProventos: totalProventos.toFixed(2),
      descontoINSS: descontoINSS.toFixed(2),
      descontoIR: descontoIR.toFixed(2),
      outrosDescontos: outrosDescontosNum.toFixed(2),
      totalDescontos: totalDescontos.toFixed(2),
      valorLiquido: valorLiquido.toFixed(2)
    }

    setResultado(resultadoFinal)

    // Call parent callbacks
    onInputChange("salarioBruto", salarioNum)
    onInputChange("diasFerias", diasFeriasNum)
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
          <label htmlFor="diasFerias" className="block text-sm font-medium text-gray-700 mb-1">
            Dias de Férias
          </label>
          <input
            id="diasFerias"
            type="number"
            value={diasFerias}
            onChange={(e) => setDiasFerias(e.target.value)}
            placeholder="Ex: 30"
            className="calculator-input"
            min="5"
            max="30"
          />
          {errors.diasFerias && <p className="text-red-500 text-sm mt-1">{errors.diasFerias}</p>}
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
          <label htmlFor="outrosDescontos" className="block text-sm font-medium text-gray-700 mb-1">
            Outros Descontos (R$)
          </label>
          <input
            id="outrosDescontos"
            type="number"
            value={outrosDescontos}
            onChange={(e) => setOutrosDescontos(e.target.value)}
            placeholder="Ex: 0"
            className="calculator-input"
            min="0"
            step="0.01"
          />
          {errors.outrosDescontos && <p className="text-red-500 text-sm mt-1">{errors.outrosDescontos}</p>}
        </div>

        <div className="flex items-center">
          <input
            id="venderUmTerco"
            type="checkbox"
            checked={venderUmTerco}
            onChange={(e) => setVenderUmTerco(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="venderUmTerco" className="ml-2 block text-sm text-gray-700">
            Vender 1/3 das férias (abono pecuniário)
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="adiantarDecimoTerceiro"
            type="checkbox"
            checked={adiantarDecimoTerceiro}
            onChange={(e) => setAdiantarDecimoTerceiro(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="adiantarDecimoTerceiro" className="ml-2 block text-sm text-gray-700">
            Adiantar 50% do 13º salário
          </label>
        </div>
      </div>

      <button onClick={calcularFerias} className="calculator-button">
        Calcular Férias
      </button>

      {resultado && (
        <div className="calculator-result">
          <h3 className="text-lg font-semibold mb-4">Resultado do Cálculo de Férias:</h3>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">Proventos:</h4>
            
            <div className="grid grid-cols-2 gap-2 ml-2">
              <span className="text-gray-600">Férias ({diasFerias} dias):</span>
              <span className="font-medium">R$ {resultado.valorBaseFerias}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 ml-2">
              <span className="text-gray-600">Adicional de 1/3:</span>
              <span className="font-medium">R$ {resultado.adicionalTerco}</span>
            </div>
            
            {venderUmTerco && (
              <div className="grid grid-cols-2 gap-2 ml-2">
                <span className="text-gray-600">Abono Pecuniário (1/3):</span>
                <span className="font-medium">R$ {resultado.abonoPecuniario}</span>
              </div>
            )}
            
            {adiantarDecimoTerceiro && (
              <div className="grid grid-cols-2 gap-2 ml-2">
                <span className="text-gray-600">Adiantamento de 13º:</span>
                <span className="font-medium">R$ {resultado.adiantamento13}</span>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2 ml-2 pt-2 border-t border-gray-200">
              <span className="text-gray-700 font-medium">Total de Proventos:</span>
              <span className="font-semibold text-green-600">R$ {resultado.totalProventos}</span>
            </div>
            
            <h4 className="font-medium text-gray-700 pt-3">Descontos:</h4>
            
            <div className="grid grid-cols-2 gap-2 ml-2">
              <span className="text-gray-600">INSS:</span>
              <span className="font-medium text-red-500">- R$ {resultado.descontoINSS}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 ml-2">
              <span className="text-gray-600">Imposto de Renda:</span>
              <span className="font-medium text-red-500">- R$ {resultado.descontoIR}</span>
            </div>
            
            {Number(resultado.outrosDescontos) > 0 && (
              <div className="grid grid-cols-2 gap-2 ml-2">
                <span className="text-gray-600">Outros Descontos:</span>
                <span className="font-medium text-red-500">- R$ {resultado.outrosDescontos}</span>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2 ml-2 pt-2 border-t border-gray-200">
              <span className="text-gray-700 font-medium">Total de Descontos:</span>
              <span className="font-semibold text-red-500">- R$ {resultado.totalDescontos}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-300 mt-3">
              <span className="text-gray-800 font-semibold">Valor Líquido das Férias:</span>
              <span className="font-bold text-green-600">R$ {resultado.valorLiquido}</span>
            </div>
          </div>
          
          <div className="mt-6 text-sm text-gray-500">
            <p className="font-medium mb-1">Observações importantes:</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>Este cálculo é uma estimativa e pode não representar o valor exato do pagamento de férias.</li>
              <li>O abono pecuniário (venda de 1/3) é opcional e deve ser solicitado com pelo menos 15 dias de antecedência do início das férias.</li>
              <li>O adiantamento de 13º salário é opcional e deve ser solicitado no mês de janeiro do ano correspondente.</li>
              <li>Se as férias forem fracionadas, o adicional de 1/3 é pago proporcionalmente a cada período.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
} 