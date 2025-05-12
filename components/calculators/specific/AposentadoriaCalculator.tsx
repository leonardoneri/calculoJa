"use client"

import { useState } from "react"
import { z } from "zod"

interface AposentadoriaCalculatorProps {
  onInputChange: (name: string, value: any) => void
  onCalculate: (result: any) => void
  config: any
}

const aposentadoriaSchema = z.object({
  idade: z.number().min(16, "Idade deve ser maior que 16 anos").max(100, "Idade deve ser menor que 100 anos"),
  sexo: z.enum(["M", "F"], {
    errorMap: () => ({ message: "Selecione o sexo" }),
  }),
  tempoContribuicao: z.number().min(0, "Não pode ser negativo"),
  salarioAtual: z.number().positive("O salário deve ser maior que zero"),
  expectativaAposentadoria: z.number().positive("O valor deve ser maior que zero"),
  contribuicaoMensal: z.number().min(0, "Não pode ser negativo"),
})

export default function AposentadoriaCalculator({ onInputChange, onCalculate, config }: AposentadoriaCalculatorProps) {
  const [idade, setIdade] = useState<string>("30")
  const [sexo, setSexo] = useState<"M" | "F">("M")
  const [tempoContribuicao, setTempoContribuicao] = useState<string>("0")
  const [salarioAtual, setSalarioAtual] = useState<string>("")
  const [expectativaAposentadoria, setExpectativaAposentadoria] = useState<string>("70")
  const [contribuicaoMensal, setContribuicaoMensal] = useState<string>("")
  const [resultado, setResultado] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateInput = () => {
    try {
      const idadeNum = Number.parseInt(idade)
      const tempoContribuicaoNum = Number.parseInt(tempoContribuicao)
      const salarioAtualNum = Number.parseFloat(salarioAtual)
      const expectativaAposentadoriaNum = Number.parseInt(expectativaAposentadoria)
      const contribuicaoMensalNum = Number.parseFloat(contribuicaoMensal || "0")

      aposentadoriaSchema.parse({
        idade: idadeNum,
        sexo,
        tempoContribuicao: tempoContribuicaoNum,
        salarioAtual: salarioAtualNum,
        expectativaAposentadoria: expectativaAposentadoriaNum,
        contribuicaoMensal: contribuicaoMensalNum
      })

      setErrors({})
      return {
        idadeNum,
        tempoContribuicaoNum,
        salarioAtualNum,
        expectativaAposentadoriaNum,
        contribuicaoMensalNum
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

  const calcularAposentadoria = () => {
    const validatedInput = validateInput()
    if (!validatedInput) return

    const { idadeNum, tempoContribuicaoNum, salarioAtualNum, expectativaAposentadoriaNum, contribuicaoMensalNum } = validatedInput

    // Regras para aposentadoria por idade conforme regras de transição 2023
    // Homens: 65 anos + 15 anos de contribuição
    // Mulheres: 62 anos + 15 anos de contribuição
    const idadeMinimaHomem = 65
    const idadeMinimaMulther = 62
    const tempoMinContribuicao = 15
    
    // Regras para aposentadoria por tempo de contribuição
    // Regra 85/95 progressiva (soma de idade + tempo de contribuição)
    const pontuacaoMinima = sexo === "M" ? 98 : 88 // Em 2023
    const pontuacaoAtual = idadeNum + tempoContribuicaoNum
    
    // Verificação de elegibilidade atual
    let elegivel = false
    let motivoElegibilidade = ""
    
    // Verificar elegibilidade por idade
    if (sexo === "M" && idadeNum >= idadeMinimaHomem && tempoContribuicaoNum >= tempoMinContribuicao) {
      elegivel = true
      motivoElegibilidade = "Aposentadoria por idade (homem)"
    } else if (sexo === "F" && idadeNum >= idadeMinimaMulther && tempoContribuicaoNum >= tempoMinContribuicao) {
      elegivel = true
      motivoElegibilidade = "Aposentadoria por idade (mulher)"
    }
    
    // Verificar elegibilidade por pontuação
    if (pontuacaoAtual >= pontuacaoMinima && tempoContribuicaoNum >= (sexo === "M" ? 35 : 30)) {
      elegivel = true
      motivoElegibilidade = "Aposentadoria por pontuação"
    }
    
    // Cálculo de tempo faltante para aposentadoria por idade
    const anosParaIdadeMin = sexo === "M" 
      ? Math.max(0, idadeMinimaHomem - idadeNum) 
      : Math.max(0, idadeMinimaMulther - idadeNum)
    
    const anosParaContribuicaoMin = Math.max(0, tempoMinContribuicao - tempoContribuicaoNum)
    
    // Tempo faltante (o maior entre idade e contribuição)
    const anosFaltantes = Math.max(anosParaIdadeMin, anosParaContribuicaoMin)
    
    // Cálculo de pontos faltantes
    const pontosFaltantes = Math.max(0, pontuacaoMinima - pontuacaoAtual)
    
    // Calcular idade de aposentadoria projetada
    const idadeAposentadoria = idadeNum + anosFaltantes
    
    // Calcular expectativa de vida após aposentadoria
    const anosAposAposentadoria = Math.max(0, expectativaAposentadoriaNum - idadeAposentadoria)
    
    // Calcular valor estimado da aposentadoria (80% da média dos salários de contribuição)
    // Simplificação: considerando apenas o salário atual para o cálculo
    const valorEstimadoAposentadoria = salarioAtualNum * 0.8
    
    // Calcular valor necessário para complementar a aposentadoria
    // Considerando renda desejada na aposentadoria igual ao salário atual
    const necessidadeComplemento = Math.max(0, salarioAtualNum - valorEstimadoAposentadoria)
    
    // Simulação simples de reserva financeira necessária para complementar aposentadoria
    // Considerando 0.5% de rendimento mensal real (descontada a inflação)
    const rendimentoMensalEstimado = 0.005 // 0.5% ao mês
    const reservaNecessaria = necessidadeComplemento / rendimentoMensalEstimado
    
    // Quanto economizar mensalmente para atingir a reserva necessária
    // Fórmula simplificada: PMT = FV / ((1+r)^n - 1) / r * (1+r)
    const meses = anosFaltantes * 12
    let valorMensalNecessario = 0
    
    if (meses > 0 && reservaNecessaria > 0) {
      const taxa = 0.005 // 0.5% ao mês
      valorMensalNecessario = reservaNecessaria / (((1 + taxa) ** meses - 1) / taxa * (1 + taxa))
    }
    
    // Déficit mensal entre o que está contribuindo e o que precisaria contribuir
    const deficitMensal = Math.max(0, valorMensalNecessario - contribuicaoMensalNum)

    const resultadoFinal = {
      elegivel,
      motivoElegibilidade,
      anosFaltantes,
      pontosFaltantes,
      idadeAposentadoria,
      anosAposAposentadoria,
      valorEstimadoAposentadoria: valorEstimadoAposentadoria.toFixed(2),
      necessidadeComplemento: necessidadeComplemento.toFixed(2),
      reservaNecessaria: reservaNecessaria.toFixed(2),
      valorMensalNecessario: valorMensalNecessario.toFixed(2),
      deficitMensal: deficitMensal.toFixed(2)
    }

    setResultado(resultadoFinal)

    // Call parent callbacks
    onInputChange("idade", idadeNum)
    onInputChange("sexo", sexo)
    onInputChange("salarioAtual", salarioAtualNum)
    onCalculate(resultadoFinal)
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="idade" className="block text-sm font-medium text-gray-700 mb-1">
            Idade Atual
          </label>
          <input
            id="idade"
            type="number"
            value={idade}
            onChange={(e) => setIdade(e.target.value)}
            placeholder="Ex: 30"
            className="calculator-input"
            min="16"
            max="100"
          />
          {errors.idade && <p className="text-red-500 text-sm mt-1">{errors.idade}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sexo
          </label>
          <div className="flex space-x-4 mt-2">
            <div className="flex items-center">
              <input
                id="sexoM"
                type="radio"
                checked={sexo === "M"}
                onChange={() => setSexo("M")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="sexoM" className="ml-2 block text-sm text-gray-700">
                Masculino
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="sexoF"
                type="radio"
                checked={sexo === "F"}
                onChange={() => setSexo("F")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="sexoF" className="ml-2 block text-sm text-gray-700">
                Feminino
              </label>
            </div>
          </div>
          {errors.sexo && <p className="text-red-500 text-sm mt-1">{errors.sexo}</p>}
        </div>

        <div>
          <label htmlFor="tempoContribuicao" className="block text-sm font-medium text-gray-700 mb-1">
            Tempo de Contribuição (anos)
          </label>
          <input
            id="tempoContribuicao"
            type="number"
            value={tempoContribuicao}
            onChange={(e) => setTempoContribuicao(e.target.value)}
            placeholder="Ex: 10"
            className="calculator-input"
            min="0"
            max="50"
          />
          {errors.tempoContribuicao && <p className="text-red-500 text-sm mt-1">{errors.tempoContribuicao}</p>}
        </div>

        <div>
          <label htmlFor="salarioAtual" className="block text-sm font-medium text-gray-700 mb-1">
            Salário Atual (R$)
          </label>
          <input
            id="salarioAtual"
            type="number"
            value={salarioAtual}
            onChange={(e) => setSalarioAtual(e.target.value)}
            placeholder="Ex: 3000"
            className="calculator-input"
            min="0"
            step="0.01"
          />
          {errors.salarioAtual && <p className="text-red-500 text-sm mt-1">{errors.salarioAtual}</p>}
        </div>

        <div>
          <label htmlFor="expectativaAposentadoria" className="block text-sm font-medium text-gray-700 mb-1">
            Expectativa de Vida (anos)
          </label>
          <input
            id="expectativaAposentadoria"
            type="number"
            value={expectativaAposentadoria}
            onChange={(e) => setExpectativaAposentadoria(e.target.value)}
            placeholder="Ex: 85"
            className="calculator-input"
            min="50"
            max="110"
          />
          {errors.expectativaAposentadoria && <p className="text-red-500 text-sm mt-1">{errors.expectativaAposentadoria}</p>}
        </div>

        <div>
          <label htmlFor="contribuicaoMensal" className="block text-sm font-medium text-gray-700 mb-1">
            Contribuição Mensal Atual (R$)
          </label>
          <input
            id="contribuicaoMensal"
            type="number"
            value={contribuicaoMensal}
            onChange={(e) => setContribuicaoMensal(e.target.value)}
            placeholder="Ex: 300"
            className="calculator-input"
            min="0"
            step="0.01"
          />
          {errors.contribuicaoMensal && <p className="text-red-500 text-sm mt-1">{errors.contribuicaoMensal}</p>}
        </div>
      </div>

      <button onClick={calcularAposentadoria} className="calculator-button">
        Calcular Aposentadoria
      </button>

      {resultado && (
        <div className="calculator-result">
          <h3 className="text-lg font-semibold mb-4">Resultado da Simulação:</h3>
          
          <div className="space-y-4">
            {resultado.elegivel ? (
              <div className="bg-green-50 border border-green-200 rounded p-3 text-green-700">
                <p className="font-medium">Você já tem direito à aposentadoria</p>
                <p className="text-sm mt-1">Motivo: {resultado.motivoElegibilidade}</p>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-600">Anos faltantes para aposentadoria:</span>
                  <span className="font-medium">{resultado.anosFaltantes}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-600">Pontos faltantes (idade + contribuição):</span>
                  <span className="font-medium">{resultado.pontosFaltantes}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-600">Idade projetada na aposentadoria:</span>
                  <span className="font-medium">{resultado.idadeAposentadoria} anos</span>
                </div>
              </div>
            )}
            
            <div className="pt-3 border-t border-gray-200">
              <h4 className="font-medium text-gray-700 mb-2">Projeção Financeira:</h4>
              
              <div className="grid grid-cols-2 gap-2 ml-2">
                <span className="text-gray-600">Valor estimado da aposentadoria:</span>
                <span className="font-medium">R$ {resultado.valorEstimadoAposentadoria}/mês</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 ml-2">
                <span className="text-gray-600">Complemento necessário:</span>
                <span className="font-medium">R$ {resultado.necessidadeComplemento}/mês</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 ml-2">
                <span className="text-gray-600">Reserva financeira necessária:</span>
                <span className="font-medium">R$ {resultado.reservaNecessaria}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 ml-2">
                <span className="text-gray-600">Contribuição mensal ideal:</span>
                <span className="font-medium">R$ {resultado.valorMensalNecessario}/mês</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 ml-2 pt-2 border-t border-gray-200 mt-2">
                <span className="text-gray-700 font-medium">Déficit mensal:</span>
                <span className="font-bold text-red-600">R$ {resultado.deficitMensal}/mês</span>
              </div>
            </div>
            
            <div className="pt-3 border-t border-gray-200">
              <h4 className="font-medium text-gray-700 mb-2">Expectativa:</h4>
              
              <div className="grid grid-cols-2 gap-2 ml-2">
                <span className="text-gray-600">Anos vivendo com aposentadoria:</span>
                <span className="font-medium">{resultado.anosAposAposentadoria} anos</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-sm text-gray-500">
            <p className="font-medium mb-1">Observações importantes:</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>Esta simulação é baseada nas regras de 2023 da Previdência Social.</li>
              <li>Para homens: idade mínima de 65 anos e 15 anos de contribuição.</li>
              <li>Para mulheres: idade mínima de 62 anos e 15 anos de contribuição.</li>
              <li>Regra de pontos: soma de idade + tempo de contribuição deve atingir 98 pontos (homens) ou 88 pontos (mulheres).</li>
              <li>O valor estimado da aposentadoria considera aproximadamente 80% da média dos salários de contribuição.</li>
              <li>A simulação da reserva financeira considera rendimento real de 0,5% ao mês após a aposentadoria.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
