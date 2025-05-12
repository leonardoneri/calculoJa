"use client"

import { useState } from "react"
import { z } from "zod"

interface ContribuicaoINSSCalculatorProps {
  onInputChange: (name: string, value: any) => void
  onCalculate: (result: any) => void
  config: any
}

const contribuicaoINSSSchema = z.object({
  salarioBruto: z.number().positive("O salário deve ser maior que zero"),
  tipo: z.enum(["clt", "autonomo", "domestico", "facultativo"], {
    errorMap: () => ({ message: "Selecione um tipo de contribuinte" }),
  }),
  planoFacultativo: z.enum(["simplificado", "normal"], {
    errorMap: () => ({ message: "Selecione o plano para facultativo" }),
  }).optional(),
  aliquotaAutonomo: z.enum(["11", "20"], {
    errorMap: () => ({ message: "Selecione a alíquota para autônomo" }),
  }).optional(),
})

export default function ContribuicaoINSSCalculator({ onInputChange, onCalculate, config }: ContribuicaoINSSCalculatorProps) {
  const [salarioBruto, setSalarioBruto] = useState<string>("")
  const [tipo, setTipo] = useState<string>("clt")
  const [planoFacultativo, setPlanoFacultativo] = useState<string>("simplificado")
  const [aliquotaAutonomo, setAliquotaAutonomo] = useState<string>("20")
  const [resultado, setResultado] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Tabela INSS 2024 para empregados CLT
  const faixasINSS2024 = [
    { ate: 1412.00, aliquota: 7.5, deducao: 0 },
    { ate: 2666.68, aliquota: 9, deducao: 21.18 },
    { ate: 4000.03, aliquota: 12, deducao: 101.18 },
    { ate: 7786.02, aliquota: 14, deducao: 181.18 }
  ]

  // Valores do teto e salário mínimo 2024
  const tetoINSS = 7786.02
  const salarioMinimo = 1412.00

  const validateInput = () => {
    try {
      const salarioBrutoNum = Number.parseFloat(salarioBruto)
      
      contribuicaoINSSSchema.parse({
        salarioBruto: salarioBrutoNum,
        tipo,
        planoFacultativo: tipo === "facultativo" ? planoFacultativo : undefined,
        aliquotaAutonomo: tipo === "autonomo" ? aliquotaAutonomo : undefined
      })

      setErrors({})
      return {
        salarioBrutoNum
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

  const calcularContribuicaoINSS = () => {
    const validatedInput = validateInput()
    if (!validatedInput) return

    const { salarioBrutoNum } = validatedInput
    
    let valorContribuicao = 0
    let aliquotaEfetiva = 0
    let aliquotaNominal = 0
    let detalheCalculo = []
    
    // Limita o salário ao teto do INSS
    const salarioCalculo = Math.min(salarioBrutoNum, tetoINSS)
    
    // Cálculo para empregados CLT (tabela progressiva) e Domésticos
    if (tipo === "clt" || tipo === "domestico") {
      let contribuicao = 0
      let faixas = []
      
      // Percorre cada faixa da tabela progressiva
      for (let i = 0; i < faixasINSS2024.length; i++) {
        const faixa = faixasINSS2024[i]
        const faixaAnterior = i > 0 ? faixasINSS2024[i-1].ate : 0
        
        if (salarioCalculo > faixaAnterior) {
          // Define o valor dessa faixa
          const valorNaFaixa = Math.min(salarioCalculo, faixa.ate) - faixaAnterior
          
          // Calcula contribuição nessa faixa
          const contribuicaoFaixa = valorNaFaixa * (faixa.aliquota / 100)
          
          faixas.push({
            faixa: i + 1,
            de: faixaAnterior,
            ate: faixa.ate,
            aliquota: faixa.aliquota,
            valorNaFaixa: valorNaFaixa.toFixed(2),
            contribuicaoFaixa: contribuicaoFaixa.toFixed(2)
          })
          
          contribuicao += contribuicaoFaixa
        }
      }
      
      // Cálculo alternativo pela alíquota efetiva (salário x alíquota - dedução)
      let aliquota = 0
      let deducao = 0
      
      for (let i = 0; i < faixasINSS2024.length; i++) {
        if (salarioCalculo <= faixasINSS2024[i].ate) {
          aliquota = faixasINSS2024[i].aliquota
          deducao = faixasINSS2024[i].deducao
          break
        }
      }
      
      valorContribuicao = (salarioCalculo * aliquota / 100) - deducao
      aliquotaEfetiva = (valorContribuicao / salarioCalculo) * 100
      aliquotaNominal = aliquota
      detalheCalculo = faixas
      
    } 
    // Cálculo para Autônomos (Contribuintes Individuais)
    else if (tipo === "autonomo") {
      const aliquota = Number(aliquotaAutonomo)
      
      if (aliquota === 11) {
        // 11% do salário mínimo (plano simplificado, não dá direito a aposentadoria por tempo de contribuição)
        valorContribuicao = salarioMinimo * 0.11
        aliquotaEfetiva = (valorContribuicao / salarioCalculo) * 100
        aliquotaNominal = 11
      } else {
        // 20% do salário declarado, até o teto
        valorContribuicao = salarioCalculo * 0.20
        aliquotaEfetiva = 20
        aliquotaNominal = 20
      }
    } 
    // Cálculo para segurados facultativos
    else if (tipo === "facultativo") {
      if (planoFacultativo === "simplificado") {
        // 5% do salário mínimo (plano simplicado de baixa renda)
        valorContribuicao = salarioMinimo * 0.05
        aliquotaEfetiva = (valorContribuicao / salarioCalculo) * 100
        aliquotaNominal = 5
      } else {
        // 20% do salário declarado, até o teto
        valorContribuicao = salarioCalculo * 0.20
        aliquotaEfetiva = 20
        aliquotaNominal = 20
      }
    }
    
    const tipoContribuinte = {
      clt: "Empregado CLT",
      autonomo: "Autônomo (Contribuinte Individual)",
      domestico: "Empregado Doméstico",
      facultativo: "Segurado Facultativo"
    }
    
    const planos = {
      simplificado: "Plano Simplificado (5% - não dá direito a aposentadoria por tempo de contribuição)",
      normal: "Plano Completo (20%)"
    }
    
    const aliquotas = {
      "11": "11% sobre o salário mínimo (não dá direito a aposentadoria por tempo de contribuição)",
      "20": "20% sobre o salário declarado (até o teto)"
    }

    const resultadoFinal = {
      valorContribuicao: valorContribuicao.toFixed(2),
      aliquotaEfetiva: aliquotaEfetiva.toFixed(2),
      aliquotaNominal: aliquotaNominal.toFixed(2),
      salarioCalculo: salarioCalculo.toFixed(2),
      tipoContribuinte: tipoContribuinte[tipo],
      planoDescricao: tipo === "facultativo" ? planos[planoFacultativo] : "",
      aliquotaDescricao: tipo === "autonomo" ? aliquotas[aliquotaAutonomo] : "",
      detalheCalculo: detalheCalculo
    }

    setResultado(resultadoFinal)

    // Call parent callbacks
    onInputChange("salarioBruto", salarioBrutoNum)
    onInputChange("tipo", tipo)
    onCalculate(resultadoFinal)
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Contribuinte
          </label>
          <select
            id="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="calculator-input"
          >
            <option value="clt">Empregado CLT</option>
            <option value="autonomo">Autônomo (Contribuinte Individual)</option>
            <option value="domestico">Empregado Doméstico</option>
            <option value="facultativo">Segurado Facultativo</option>
          </select>
          {errors.tipo && <p className="text-red-500 text-sm mt-1">{errors.tipo}</p>}
        </div>

        <div>
          <label htmlFor="salarioBruto" className="block text-sm font-medium text-gray-700 mb-1">
            {tipo === "clt" || tipo === "domestico" ? "Salário Bruto (R$)" : "Valor de Contribuição (R$)"}
          </label>
          <input
            id="salarioBruto"
            type="number"
            value={salarioBruto}
            onChange={(e) => setSalarioBruto(e.target.value)}
            placeholder="Ex: 2500"
            className="calculator-input"
            min="0"
            step="0.01"
          />
          {errors.salarioBruto && <p className="text-red-500 text-sm mt-1">{errors.salarioBruto}</p>}
          {tipo === "autonomo" && (
            <p className="text-xs text-gray-500 mt-1">Base de cálculo limitada ao teto do INSS (R$ 7.786,02)</p>
          )}
          {tipo === "facultativo" && (
            <p className="text-xs text-gray-500 mt-1">Para segurado facultativo, é o valor sobre o qual deseja contribuir</p>
          )}
        </div>

        {tipo === "autonomo" && (
          <div>
            <label htmlFor="aliquotaAutonomo" className="block text-sm font-medium text-gray-700 mb-1">
              Alíquota de Contribuição
            </label>
            <select
              id="aliquotaAutonomo"
              value={aliquotaAutonomo}
              onChange={(e) => setAliquotaAutonomo(e.target.value)}
              className="calculator-input"
            >
              <option value="20">20% (plano completo)</option>
              <option value="11">11% (plano simplificado)</option>
            </select>
            {errors.aliquotaAutonomo && <p className="text-red-500 text-sm mt-1">{errors.aliquotaAutonomo}</p>}
            <p className="text-xs text-gray-500 mt-1">
              {aliquotaAutonomo === "11" 
                ? "11% dá direito apenas à aposentadoria por idade" 
                : "20% dá direito a todos os benefícios previdenciários"}
            </p>
          </div>
        )}

        {tipo === "facultativo" && (
          <div>
            <label htmlFor="planoFacultativo" className="block text-sm font-medium text-gray-700 mb-1">
              Plano de Contribuição
            </label>
            <select
              id="planoFacultativo"
              value={planoFacultativo}
              onChange={(e) => setPlanoFacultativo(e.target.value)}
              className="calculator-input"
            >
              <option value="normal">Plano Normal (20%)</option>
              <option value="simplificado">Plano Simplificado (5%)</option>
            </select>
            {errors.planoFacultativo && <p className="text-red-500 text-sm mt-1">{errors.planoFacultativo}</p>}
            <p className="text-xs text-gray-500 mt-1">
              {planoFacultativo === "simplificado" 
                ? "5% do salário mínimo (apenas para baixa renda, dá direito apenas à aposentadoria por idade)" 
                : "20% dá direito a todos os benefícios previdenciários"}
            </p>
          </div>
        )}
      </div>

      <button onClick={calcularContribuicaoINSS} className="calculator-button">
        Calcular Contribuição INSS
      </button>

      {resultado && (
        <div className="calculator-result">
          <h3 className="text-lg font-semibold mb-4">Resultado do Cálculo:</h3>
          
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mb-4">
              <p className="text-blue-800 font-medium">
                Contribuição mensal ao INSS:
              </p>
              <p className="text-blue-700 text-2xl font-bold mt-2">
                R$ {resultado.valorContribuicao}
              </p>
              <p className="text-blue-600 text-sm mt-1">
                {tipo === "clt" || tipo === "domestico" ? 
                  `Alíquota efetiva: ${resultado.aliquotaEfetiva}% (alíquota nominal: ${resultado.aliquotaNominal}%)` : 
                  `Alíquota: ${resultado.aliquotaNominal}%`}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Detalhes da contribuição:</h4>
              <div className="grid grid-cols-2 gap-2 ml-2">
                <span className="text-gray-600">Tipo de contribuinte:</span>
                <span className="font-medium">{resultado.tipoContribuinte}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 ml-2">
                <span className="text-gray-600">{tipo === "clt" || tipo === "domestico" ? "Salário bruto:" : "Valor base de cálculo:"}</span>
                <span className="font-medium">R$ {resultado.salarioCalculo}</span>
              </div>
              
              {tipo === "facultativo" && (
                <div className="grid grid-cols-2 gap-2 ml-2">
                  <span className="text-gray-600">Plano escolhido:</span>
                  <span className="font-medium">{resultado.planoDescricao}</span>
                </div>
              )}
              
              {tipo === "autonomo" && (
                <div className="grid grid-cols-2 gap-2 ml-2">
                  <span className="text-gray-600">Alíquota escolhida:</span>
                  <span className="font-medium">{resultado.aliquotaDescricao}</span>
                </div>
              )}
            </div>
            
            {(tipo === "clt" || tipo === "domestico") && resultado.detalheCalculo.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-2">Detalhamento por faixa de contribuição:</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-3 py-2 text-left">Faixa</th>
                        <th className="px-3 py-2 text-left">Limite</th>
                        <th className="px-3 py-2 text-left">Alíquota</th>
                        <th className="px-3 py-2 text-left">Valor na faixa</th>
                        <th className="px-3 py-2 text-left">Contribuição</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultado.detalheCalculo.map((faixa, index) => (
                        <tr key={index} className="border-b border-gray-200">
                          <td className="px-3 py-2">{faixa.faixa}ª</td>
                          <td className="px-3 py-2">Até R$ {faixa.ate.toFixed(2)}</td>
                          <td className="px-3 py-2">{faixa.aliquota}%</td>
                          <td className="px-3 py-2">R$ {faixa.valorNaFaixa}</td>
                          <td className="px-3 py-2">R$ {faixa.contribuicaoFaixa}</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-medium">
                        <td colSpan={4} className="px-3 py-2 text-right">Total:</td>
                        <td className="px-3 py-2">R$ {resultado.valorContribuicao}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-6 text-sm text-gray-500">
            <p className="font-medium mb-1">Observações importantes:</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>Os valores são baseados na tabela do INSS de 2024.</li>
              <li>O teto máximo de contribuição para o INSS é R$ 7.786,02.</li>
              <li>Empregados CLT e domésticos contribuem com base na tabela progressiva.</li>
              <li>Autônomos podem escolher entre 11% do salário mínimo (plano simplificado) ou 20% sobre o valor declarado.</li>
              <li>Segurados facultativos podem optar pelo plano de baixa renda (5% do salário mínimo) ou plano normal (20%).</li>
              <li>Planos simplificados não dão direito à aposentadoria por tempo de contribuição.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
} 