"use client"

import { useState } from "react"
import { z } from "zod"

interface EmprestimoConsignadoCalculatorProps {
  onInputChange: (name: string, value: any) => void
  onCalculate: (result: any) => void
  config: any
}

const emprestimoConsignadoSchema = z.object({
  valorEmprestimo: z.number().positive("O valor deve ser maior que zero"),
  taxaJuros: z.number().min(0, "A taxa não pode ser negativa"),
  prazo: z.number().int().min(1, "O prazo deve ser de pelo menos 1 mês"),
  salarioBruto: z.number().positive("O salário deve ser maior que zero"),
  compromentimentoMaximo: z.number().min(1, "Deve ser pelo menos 1%").max(40, "Não pode exceder 40%"),
  outrosDescontos: z.number().min(0, "Não pode ser negativo"),
})

export default function EmprestimoConsignadoCalculator({ onInputChange, onCalculate, config }: EmprestimoConsignadoCalculatorProps) {
  const [valorEmprestimo, setValorEmprestimo] = useState<string>("")
  const [taxaJuros, setTaxaJuros] = useState<string>("1.2")
  const [prazo, setPrazo] = useState<string>("36")
  const [salarioBruto, setSalarioBruto] = useState<string>("")
  const [compromentimentoMaximo, setCompromissomentoMaximo] = useState<string>("30")
  const [outrosDescontos, setOutrosDescontos] = useState<string>("0")
  const [resultado, setResultado] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateInput = () => {
    try {
      const valorEmprestimoNum = Number.parseFloat(valorEmprestimo)
      const taxaJurosNum = Number.parseFloat(taxaJuros)
      const prazoNum = Number.parseInt(prazo)
      const salarioBrutoNum = Number.parseFloat(salarioBruto)
      const compromentimentoMaximoNum = Number.parseFloat(compromentimentoMaximo)
      const outrosDescontosNum = Number.parseFloat(outrosDescontos || "0")

      emprestimoConsignadoSchema.parse({
        valorEmprestimo: valorEmprestimoNum,
        taxaJuros: taxaJurosNum,
        prazo: prazoNum,
        salarioBruto: salarioBrutoNum,
        compromentimentoMaximo: compromentimentoMaximoNum,
        outrosDescontos: outrosDescontosNum
      })

      setErrors({})
      return {
        valorEmprestimoNum,
        taxaJurosNum,
        prazoNum,
        salarioBrutoNum,
        compromentimentoMaximoNum,
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

  const calcularParcelaPMT = (valorPresente: number, taxaMensal: number, numParcelas: number): number => {
    // Usando a fórmula PMT da matemática financeira
    // PMT = PV * (i * (1 + i)^n) / ((1 + i)^n - 1)
    // Onde: PV = valor presente, i = taxa de juros mensal, n = número de parcelas
    const taxaDecimal = taxaMensal / 100
    return valorPresente * (taxaDecimal * Math.pow(1 + taxaDecimal, numParcelas)) / (Math.pow(1 + taxaDecimal, numParcelas) - 1)
  }

  const calcularEmprestimoConsignado = () => {
    const validatedInput = validateInput()
    if (!validatedInput) return

    const { valorEmprestimoNum, taxaJurosNum, prazoNum, salarioBrutoNum, compromentimentoMaximoNum, outrosDescontosNum } = validatedInput

    // Cálculo da parcela pelo método Price (juros compostos)
    const valorParcela = calcularParcelaPMT(valorEmprestimoNum, taxaJurosNum, prazoNum)
    
    // Valor total a ser pago
    const valorTotalPago = valorParcela * prazoNum
    
    // Juros totais pagos
    const jurosTotais = valorTotalPago - valorEmprestimoNum
    
    // Custo Efetivo Total (CET) estimado - aproximação simples
    // Valor real do CET incluiria outros custos como IOF, seguros, etc.
    const taxaEfetivaMensal = taxaJurosNum
    const taxaEfetivaAnual = Math.pow(1 + taxaJurosNum / 100, 12) * 100 - 100
    
    // Verificação da margem consignável
    const margemConsignavelMaxima = (salarioBrutoNum * compromentimentoMaximoNum) / 100
    const margemConsignavelDisponivel = margemConsignavelMaxima - outrosDescontosNum
    const parcelaExcedeMargem = valorParcela > margemConsignavelDisponivel
    
    // Valor máximo de parcela permitido
    const valorMaximoParcela = margemConsignavelDisponivel
    
    // Valor máximo de empréstimo possível com a margem disponível
    // Usando a fórmula inversa do PMT para encontrar o PV (valor presente)
    const taxaDecimal = taxaJurosNum / 100
    const fatorPV = (Math.pow(1 + taxaDecimal, prazoNum) - 1) / (taxaDecimal * Math.pow(1 + taxaDecimal, prazoNum))
    const valorMaximoEmprestimo = valorMaximoParcela * fatorPV

    const resultadoFinal = {
      valorParcela: valorParcela.toFixed(2),
      valorTotalPago: valorTotalPago.toFixed(2),
      jurosTotais: jurosTotais.toFixed(2),
      taxaEfetivaMensal: taxaEfetivaMensal.toFixed(2),
      taxaEfetivaAnual: taxaEfetivaAnual.toFixed(2),
      margemConsignavelMaxima: margemConsignavelMaxima.toFixed(2),
      margemConsignavelDisponivel: margemConsignavelDisponivel.toFixed(2),
      parcelaExcedeMargem,
      valorMaximoParcela: valorMaximoParcela.toFixed(2),
      valorMaximoEmprestimo: valorMaximoEmprestimo.toFixed(2)
    }

    setResultado(resultadoFinal)

    // Call parent callbacks
    onInputChange("valorEmprestimo", valorEmprestimoNum)
    onInputChange("taxaJuros", taxaJurosNum)
    onInputChange("prazo", prazoNum)
    onCalculate(resultadoFinal)
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="valorEmprestimo" className="block text-sm font-medium text-gray-700 mb-1">
            Valor do Empréstimo (R$)
          </label>
          <input
            id="valorEmprestimo"
            type="number"
            value={valorEmprestimo}
            onChange={(e) => setValorEmprestimo(e.target.value)}
            placeholder="Ex: 5000"
            className="calculator-input"
            min="0"
            step="100"
          />
          {errors.valorEmprestimo && <p className="text-red-500 text-sm mt-1">{errors.valorEmprestimo}</p>}
        </div>

        <div>
          <label htmlFor="taxaJuros" className="block text-sm font-medium text-gray-700 mb-1">
            Taxa de Juros Mensal (%)
          </label>
          <input
            id="taxaJuros"
            type="number"
            value={taxaJuros}
            onChange={(e) => setTaxaJuros(e.target.value)}
            placeholder="Ex: 1.2"
            className="calculator-input"
            min="0"
            step="0.01"
          />
          {errors.taxaJuros && <p className="text-red-500 text-sm mt-1">{errors.taxaJuros}</p>}
        </div>

        <div>
          <label htmlFor="prazo" className="block text-sm font-medium text-gray-700 mb-1">
            Prazo (meses)
          </label>
          <input
            id="prazo"
            type="number"
            value={prazo}
            onChange={(e) => setPrazo(e.target.value)}
            placeholder="Ex: 36"
            className="calculator-input"
            min="1"
            max="120"
          />
          {errors.prazo && <p className="text-red-500 text-sm mt-1">{errors.prazo}</p>}
        </div>

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
            step="100"
          />
          {errors.salarioBruto && <p className="text-red-500 text-sm mt-1">{errors.salarioBruto}</p>}
        </div>

        <div>
          <label htmlFor="compromentimentoMaximo" className="block text-sm font-medium text-gray-700 mb-1">
            Comprometimento Máximo (%)
          </label>
          <input
            id="compromentimentoMaximo"
            type="number"
            value={compromentimentoMaximo}
            onChange={(e) => setCompromissomentoMaximo(e.target.value)}
            placeholder="Ex: 30"
            className="calculator-input"
            min="1"
            max="40"
          />
          {errors.compromentimentoMaximo && <p className="text-red-500 text-sm mt-1">{errors.compromentimentoMaximo}</p>}
          <p className="text-xs text-gray-500 mt-1">Geralmente 30% para servidores públicos, 35% para aposentados/pensionistas, 40% para militares</p>
        </div>

        <div>
          <label htmlFor="outrosDescontos" className="block text-sm font-medium text-gray-700 mb-1">
            Outros Descontos Consignados (R$)
          </label>
          <input
            id="outrosDescontos"
            type="number"
            value={outrosDescontos}
            onChange={(e) => setOutrosDescontos(e.target.value)}
            placeholder="Ex: 0"
            className="calculator-input"
            min="0"
            step="1"
          />
          {errors.outrosDescontos && <p className="text-red-500 text-sm mt-1">{errors.outrosDescontos}</p>}
          <p className="text-xs text-gray-500 mt-1">Outros empréstimos ou financiamentos consignados</p>
        </div>
      </div>

      <button onClick={calcularEmprestimoConsignado} className="calculator-button">
        Calcular Empréstimo Consignado
      </button>

      {resultado && (
        <div className="calculator-result">
          <h3 className="text-lg font-semibold mb-4">Resultado da Simulação:</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Detalhes do Empréstimo:</h4>
              <div className="grid grid-cols-2 gap-2 ml-2">
                <span className="text-gray-600">Valor da Parcela:</span>
                <span className="font-medium">R$ {resultado.valorParcela}/mês</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 ml-2">
                <span className="text-gray-600">Valor Total a Pagar:</span>
                <span className="font-medium">R$ {resultado.valorTotalPago}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 ml-2">
                <span className="text-gray-600">Total de Juros:</span>
                <span className="font-medium text-red-600">R$ {resultado.jurosTotais}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 ml-2">
                <span className="text-gray-600">Taxa Efetiva Mensal:</span>
                <span className="font-medium">{resultado.taxaEfetivaMensal}%</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 ml-2">
                <span className="text-gray-600">Taxa Efetiva Anual:</span>
                <span className="font-medium">{resultado.taxaEfetivaAnual}%</span>
              </div>
            </div>
            
            <div className="pt-3 border-t border-gray-200">
              <h4 className="font-medium text-gray-700 mb-2">Análise da Margem Consignável:</h4>
              
              <div className="grid grid-cols-2 gap-2 ml-2">
                <span className="text-gray-600">Margem Consignável Máxima:</span>
                <span className="font-medium">R$ {resultado.margemConsignavelMaxima}/mês</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 ml-2">
                <span className="text-gray-600">Margem Consignável Disponível:</span>
                <span className="font-medium">R$ {resultado.margemConsignavelDisponivel}/mês</span>
              </div>
              
              {resultado.parcelaExcedeMargem ? (
                <div className="bg-red-50 p-3 rounded-md border border-red-200 mt-3">
                  <p className="text-red-800 font-medium mb-1">Atenção: Parcela excede a margem consignável disponível!</p>
                  <p className="text-sm text-red-700">
                    A parcela de R$ {resultado.valorParcela} excede sua margem consignável disponível de R$ {resultado.margemConsignavelDisponivel}.
                  </p>
                  <p className="text-sm text-red-700 mt-2">
                    Valor máximo de empréstimo possível: <span className="font-medium">R$ {resultado.valorMaximoEmprestimo}</span> com parcela de <span className="font-medium">R$ {resultado.valorMaximoParcela}/mês</span>
                  </p>
                </div>
              ) : (
                <div className="bg-green-50 p-3 rounded-md border border-green-200 mt-3">
                  <p className="text-green-800 font-medium">
                    A parcela está dentro da sua margem consignável disponível.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 text-sm text-gray-500">
            <p className="font-medium mb-1">Observações importantes:</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>O empréstimo consignado é descontado diretamente da folha de pagamento ou benefício.</li>
              <li>Geralmente possui taxas de juros menores que outras modalidades de crédito.</li>
              <li>A margem consignável máxima varia conforme a categoria do tomador.</li>
              <li>Esta simulação é uma estimativa. Valores reais podem incluir tarifas e seguros adicionais.</li>
              <li>Antes de contratar, compare ofertas de diferentes instituições financeiras.</li>
              <li>Este cálculo utiliza o sistema de amortização Price (parcelas fixas).</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
} 