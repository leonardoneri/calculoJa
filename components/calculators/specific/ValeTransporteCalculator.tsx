"use client"

import { useState } from "react"
import { z } from "zod"

interface ValeTransporteCalculatorProps {
  onInputChange: (name: string, value: any) => void
  onCalculate: (result: any) => void
  config: any
}

const valeTransporteSchema = z.object({
  salarioBruto: z.number().positive("O salário deve ser maior que zero"),
  diasTrabalhados: z.number().min(1, "Deve ser pelo menos 1 dia").max(31, "Não pode exceder 31 dias"),
  passagensDiarias: z.number().min(1, "Deve ser pelo menos 1 passagem"),
  valorPassagem: z.number().positive("Valor da passagem deve ser maior que zero"),
})

export default function ValeTransporteCalculator({ onInputChange, onCalculate, config }: ValeTransporteCalculatorProps) {
  const [salarioBruto, setSalarioBruto] = useState<string>("")
  const [diasTrabalhados, setDiasTrabalhados] = useState<string>("22")
  const [passagensDiarias, setPassagensDiarias] = useState<string>("2")
  const [valorPassagem, setValorPassagem] = useState<string>("4.40")
  const [resultado, setResultado] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateInput = () => {
    try {
      const salarioNum = Number.parseFloat(salarioBruto)
      const diasTrabalhadosNum = Number.parseInt(diasTrabalhados)
      const passagensDiariasNum = Number.parseInt(passagensDiarias)
      const valorPassagemNum = Number.parseFloat(valorPassagem)

      valeTransporteSchema.parse({
        salarioBruto: salarioNum,
        diasTrabalhados: diasTrabalhadosNum,
        passagensDiarias: passagensDiariasNum,
        valorPassagem: valorPassagemNum
      })

      setErrors({})
      return {
        salarioNum,
        diasTrabalhadosNum,
        passagensDiariasNum,
        valorPassagemNum
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

  const calcularValeTransporte = () => {
    const validatedInput = validateInput()
    if (!validatedInput) return

    const { salarioNum, diasTrabalhadosNum, passagensDiariasNum, valorPassagemNum } = validatedInput

    // Valor total gasto com passagens no mês
    const valorTotalPassagens = diasTrabalhadosNum * passagensDiariasNum * valorPassagemNum
    
    // Desconto máximo de 6% do salário
    const descontoMaximo = salarioNum * 0.06
    
    // Verifica se vale a pena receber o vale-transporte
    const valeAPena = valorTotalPassagens > descontoMaximo
    
    // Valor a descontar do colaborador
    const valorDesconto = valeAPena ? descontoMaximo : 0
    
    // Valor subsidiado pela empresa
    const valorSubsidio = valeAPena ? valorTotalPassagens - descontoMaximo : 0
    
    // Economia para o colaborador
    const economiaColaborador = valeAPena ? valorTotalPassagens - descontoMaximo : 0
    
    // Percentual do salário gasto com transporte
    const percentualSalario = (valorTotalPassagens / salarioNum) * 100

    const resultadoFinal = {
      valorTotalPassagens: valorTotalPassagens.toFixed(2),
      descontoMaximo: descontoMaximo.toFixed(2),
      valeAPena,
      valorDesconto: valorDesconto.toFixed(2),
      valorSubsidio: valorSubsidio.toFixed(2),
      economiaColaborador: economiaColaborador.toFixed(2),
      percentualSalario: percentualSalario.toFixed(2)
    }

    setResultado(resultadoFinal)

    // Call parent callbacks
    onInputChange("salarioBruto", salarioNum)
    onInputChange("diasTrabalhados", diasTrabalhadosNum)
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
            placeholder="Ex: 2000"
            className="calculator-input"
            min="0"
            step="0.01"
          />
          {errors.salarioBruto && <p className="text-red-500 text-sm mt-1">{errors.salarioBruto}</p>}
        </div>

        <div>
          <label htmlFor="diasTrabalhados" className="block text-sm font-medium text-gray-700 mb-1">
            Dias Trabalhados por Mês
          </label>
          <input
            id="diasTrabalhados"
            type="number"
            value={diasTrabalhados}
            onChange={(e) => setDiasTrabalhados(e.target.value)}
            placeholder="Ex: 22"
            className="calculator-input"
            min="1"
            max="31"
          />
          {errors.diasTrabalhados && <p className="text-red-500 text-sm mt-1">{errors.diasTrabalhados}</p>}
        </div>

        <div>
          <label htmlFor="passagensDiarias" className="block text-sm font-medium text-gray-700 mb-1">
            Passagens por Dia
          </label>
          <input
            id="passagensDiarias"
            type="number"
            value={passagensDiarias}
            onChange={(e) => setPassagensDiarias(e.target.value)}
            placeholder="Ex: 2"
            className="calculator-input"
            min="1"
          />
          {errors.passagensDiarias && <p className="text-red-500 text-sm mt-1">{errors.passagensDiarias}</p>}
          <p className="text-xs text-gray-500 mt-1">Normalmente são 2 (ida e volta)</p>
        </div>

        <div>
          <label htmlFor="valorPassagem" className="block text-sm font-medium text-gray-700 mb-1">
            Valor da Passagem (R$)
          </label>
          <input
            id="valorPassagem"
            type="number"
            value={valorPassagem}
            onChange={(e) => setValorPassagem(e.target.value)}
            placeholder="Ex: 4.40"
            className="calculator-input"
            min="0.01"
            step="0.01"
          />
          {errors.valorPassagem && <p className="text-red-500 text-sm mt-1">{errors.valorPassagem}</p>}
        </div>
      </div>

      <button onClick={calcularValeTransporte} className="calculator-button">
        Calcular Vale-Transporte
      </button>

      {resultado && (
        <div className="calculator-result">
          <h3 className="text-lg font-semibold mb-4">Resultado do Cálculo:</h3>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-gray-600">Gasto total com passagens:</span>
              <span className="font-medium">R$ {resultado.valorTotalPassagens}/mês</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <span className="text-gray-600">Desconto máximo (6% do salário):</span>
              <span className="font-medium">R$ {resultado.descontoMaximo}/mês</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <span className="text-gray-600">Percentual do salário gasto com transporte:</span>
              <span className="font-medium">{resultado.percentualSalario}%</span>
            </div>
            
            <div className="pt-3 border-t border-gray-200">
              <div className="mb-2">
                <span className="text-gray-800 font-medium">Vale a pena solicitar o vale-transporte?</span>
                <span className={`ml-2 font-semibold ${resultado.valeAPena ? "text-green-600" : "text-red-600"}`}>
                  {resultado.valeAPena ? "SIM" : "NÃO"}
                </span>
              </div>
              
              {resultado.valeAPena ? (
                <div className="bg-green-50 p-3 rounded-md border border-green-200">
                  <p className="text-green-800 text-sm mb-2">
                    Você economizará R$ {resultado.economiaColaborador} por mês solicitando o vale-transporte.
                  </p>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Você pagará: R$ {resultado.valorDesconto}/mês (6% do seu salário)</li>
                    <li>• A empresa subsidiará: R$ {resultado.valorSubsidio}/mês</li>
                  </ul>
                </div>
              ) : (
                <div className="bg-red-50 p-3 rounded-md border border-red-200">
                  <p className="text-red-800 text-sm mb-2">
                    O vale-transporte não é vantajoso para você, pois o gasto com transporte é menor que 6% do seu salário.
                  </p>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Sem vale-transporte: Você paga R$ {resultado.valorTotalPassagens}/mês</li>
                    <li>• Com vale-transporte: Você pagaria R$ {resultado.descontoMaximo}/mês (6% do salário)</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 text-sm text-gray-500">
            <p className="font-medium mb-1">Observações importantes:</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>O vale-transporte é um benefício opcional para o trabalhador.</li>
              <li>O empregador é obrigado a fornecer o vale-transporte caso o empregado o solicite.</li>
              <li>O desconto máximo permitido é de 6% do salário bruto.</li>
              <li>O empregador deve cobrir a diferença entre o valor total das passagens e o desconto do empregado.</li>
              <li>É recomendável solicitar o vale-transporte apenas quando o gasto com transporte for superior a 6% do salário.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
} 