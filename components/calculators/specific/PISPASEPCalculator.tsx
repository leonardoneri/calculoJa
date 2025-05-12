"use client"

import { useState } from "react"
import { z } from "zod"

interface PISPASEPCalculatorProps {
  onInputChange: (name: string, value: any) => void
  onCalculate: (result: any) => void
  config: any
}

const pisPasepSchema = z.object({
  salarioMedioMensal: z.number().min(0, "Não pode ser negativo"),
  mesesTrabalhados: z.number().int().min(1, "Deve ter trabalhado pelo menos 1 mês").max(12, "Não pode exceder 12 meses"),
  anosInscricao: z.number().int().min(0, "Não pode ser negativo"),
  salarioMinimo: z.number().positive("O salário mínimo deve ser maior que zero"),
})

export default function PISPASEPCalculator({ onInputChange, onCalculate, config }: PISPASEPCalculatorProps) {
  const [salarioMedioMensal, setSalarioMedioMensal] = useState<string>("")
  const [mesesTrabalhados, setMesesTrabalhados] = useState<string>("12")
  const [anosInscricao, setAnosInscricao] = useState<string>("0")
  const [salarioMinimo, setSalarioMinimo] = useState<string>("1412")
  const [resultado, setResultado] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateInput = () => {
    try {
      const salarioMedioMensalNum = Number.parseFloat(salarioMedioMensal || "0")
      const mesesTrabalhadosNum = Number.parseInt(mesesTrabalhados)
      const anosInscricaoNum = Number.parseInt(anosInscricao)
      const salarioMinimoNum = Number.parseFloat(salarioMinimo)

      pisPasepSchema.parse({
        salarioMedioMensal: salarioMedioMensalNum,
        mesesTrabalhados: mesesTrabalhadosNum,
        anosInscricao: anosInscricaoNum,
        salarioMinimo: salarioMinimoNum
      })

      setErrors({})
      return {
        salarioMedioMensalNum,
        mesesTrabalhadosNum,
        anosInscricaoNum,
        salarioMinimoNum
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

  const calcularPISPASEP = () => {
    const validatedInput = validateInput()
    if (!validatedInput) return

    const { salarioMedioMensalNum, mesesTrabalhadosNum, anosInscricaoNum, salarioMinimoNum } = validatedInput

    // Verifica se tem direito ao benefício
    const temDireito = mesesTrabalhadosNum >= 1 && salarioMedioMensalNum <= (salarioMinimoNum * 2)
    
    if (!temDireito) {
      const resultadoFinal = {
        temDireito,
        motivoNegativa: mesesTrabalhadosNum < 1 
          ? "É necessário ter trabalhado pelo menos 1 mês no ano-base."
          : "O salário médio mensal não pode ser superior a 2 salários mínimos.",
        valor: 0
      }
      
      setResultado(resultadoFinal)
      onCalculate(resultadoFinal)
      return
    }
    
    // Cálculo do valor do benefício PIS/PASEP
    // Fórmula: (Salário Mínimo * Meses Trabalhados) / 12

    const valorMaximo = salarioMinimoNum
    const valorProporcional = (salarioMinimoNum * mesesTrabalhadosNum) / 12
    
    // Arredonda para o múltiplo de R$ 1,00 imediatamente superior
    const valorFinal = Math.ceil(valorProporcional)
    
    // Verifica anos de inscrição - exige mínimo de 5 anos (regra atual)
    const temTempoInscricao = anosInscricaoNum >= 5
    
    const resultadoFinal = {
      temDireito: temDireito && temTempoInscricao,
      motivoNegativa: !temTempoInscricao ? "É necessário estar inscrito no PIS/PASEP há pelo menos 5 anos." : "",
      valor: temTempoInscricao ? valorFinal : 0,
      valorProporcional: valorProporcional.toFixed(2),
      valorMaximo: valorMaximo.toFixed(2),
      mesesConsiderados: mesesTrabalhadosNum,
      percentualBeneficio: ((mesesTrabalhadosNum / 12) * 100).toFixed(2),
    }

    setResultado(resultadoFinal)

    // Call parent callbacks
    onInputChange("salarioMedioMensal", salarioMedioMensalNum)
    onInputChange("mesesTrabalhados", mesesTrabalhadosNum)
    onCalculate(resultadoFinal)
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="salarioMedioMensal" className="block text-sm font-medium text-gray-700 mb-1">
            Salário Médio Mensal (R$)
          </label>
          <input
            id="salarioMedioMensal"
            type="number"
            value={salarioMedioMensal}
            onChange={(e) => setSalarioMedioMensal(e.target.value)}
            placeholder="Ex: 1500"
            className="calculator-input"
            min="0"
            step="1"
          />
          {errors.salarioMedioMensal && <p className="text-red-500 text-sm mt-1">{errors.salarioMedioMensal}</p>}
          <p className="text-xs text-gray-500 mt-1">Média mensal dos salários recebidos no ano-base</p>
        </div>

        <div>
          <label htmlFor="mesesTrabalhados" className="block text-sm font-medium text-gray-700 mb-1">
            Meses Trabalhados no Ano-Base
          </label>
          <input
            id="mesesTrabalhados"
            type="number"
            value={mesesTrabalhados}
            onChange={(e) => setMesesTrabalhados(e.target.value)}
            placeholder="Ex: 12"
            className="calculator-input"
            min="1"
            max="12"
          />
          {errors.mesesTrabalhados && <p className="text-red-500 text-sm mt-1">{errors.mesesTrabalhados}</p>}
        </div>

        <div>
          <label htmlFor="anosInscricao" className="block text-sm font-medium text-gray-700 mb-1">
            Anos de Inscrição no PIS/PASEP
          </label>
          <input
            id="anosInscricao"
            type="number"
            value={anosInscricao}
            onChange={(e) => setAnosInscricao(e.target.value)}
            placeholder="Ex: 5"
            className="calculator-input"
            min="0"
          />
          {errors.anosInscricao && <p className="text-red-500 text-sm mt-1">{errors.anosInscricao}</p>}
          <p className="text-xs text-gray-500 mt-1">Tempo de cadastro no programa (mínimo de 5 anos para receber)</p>
        </div>

        <div>
          <label htmlFor="salarioMinimo" className="block text-sm font-medium text-gray-700 mb-1">
            Valor do Salário Mínimo (R$)
          </label>
          <input
            id="salarioMinimo"
            type="number"
            value={salarioMinimo}
            onChange={(e) => setSalarioMinimo(e.target.value)}
            placeholder="Ex: 1412"
            className="calculator-input"
            min="1"
            step="1"
          />
          {errors.salarioMinimo && <p className="text-red-500 text-sm mt-1">{errors.salarioMinimo}</p>}
          <p className="text-xs text-gray-500 mt-1">Salário mínimo nacional vigente no ano do pagamento</p>
        </div>
      </div>

      <button onClick={calcularPISPASEP} className="calculator-button">
        Calcular Benefício PIS/PASEP
      </button>

      {resultado && (
        <div className="calculator-result">
          <h3 className="text-lg font-semibold mb-4">Resultado do Cálculo:</h3>
          
          {resultado.temDireito ? (
            <div className="space-y-3">
              <div className="bg-green-50 p-4 rounded-md border border-green-200 mb-4">
                <p className="text-green-800 font-medium">
                  Você tem direito ao Abono Salarial PIS/PASEP.
                </p>
                <p className="text-green-700 text-2xl font-bold mt-2">
                  Valor a receber: R$ {resultado.valor.toFixed(2)}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-600">Valor proporcional calculado:</span>
                <span className="font-medium">R$ {resultado.valorProporcional}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-600">Valor máximo possível:</span>
                <span className="font-medium">R$ {resultado.valorMaximo}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-600">Meses considerados:</span>
                <span className="font-medium">{resultado.mesesConsiderados} meses ({resultado.percentualBeneficio}% do benefício)</span>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 p-4 rounded-md border border-red-200">
              <p className="text-red-800 font-medium">
                Você não tem direito ao Abono Salarial PIS/PASEP.
              </p>
              <p className="text-red-700 mt-2">
                Motivo: {resultado.motivoNegativa}
              </p>
            </div>
          )}
          
          <div className="mt-6 text-sm text-gray-500">
            <p className="font-medium mb-1">Requisitos para receber o benefício:</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>Estar cadastrado no PIS/PASEP há pelo menos 5 anos</li>
              <li>Ter recebido remuneração média mensal de até 2 salários mínimos no ano-base</li>
              <li>Ter trabalhado com carteira assinada por pelo menos 30 dias no ano-base</li>
              <li>Ter seus dados informados corretamente pelo empregador na Relação Anual de Informações Sociais (RAIS)</li>
            </ul>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            <p className="font-medium mb-1">Observações importantes:</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>O valor do abono varia conforme o número de meses trabalhados no ano-base</li>
              <li>Quem trabalhou os 12 meses no ano-base recebe o valor integral do salário mínimo</li>
              <li>Os pagamentos geralmente são feitos conforme o mês de nascimento do trabalhador</li>
              <li>O calendário de pagamentos é divulgado anualmente pelo governo federal</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
} 