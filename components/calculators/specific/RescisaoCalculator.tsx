"use client"

import { useState, useEffect } from "react"
import { z } from "zod"

interface RescisaoCalculatorProps {
  onInputChange: (name: string, value: any) => void
  onCalculate: (result: any) => void
  config: any
}

const rescisaoSchema = z.object({
  ultimoSalario: z.number().positive("O salário deve ser maior que zero"),
  dataAdmissao: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Data de admissão inválida"
  }),
  dataDemissao: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Data de demissão inválida"
  }),
  motivoDemissao: z.enum(["sem-justa-causa", "pedido-demissao", "comum-acordo", "justa-causa"], {
    errorMap: () => ({ message: "Selecione um motivo de demissão válido" })
  }),
  avisoTrabalhado: z.boolean(),
  diasFeriasVencidas: z.number().min(0, "Não pode ser negativo").max(30, "Máximo de 30 dias"),
  diasFeriasProporcionais: z.number().min(0, "Não pode ser negativo").max(30, "Máximo de 30 dias"),
  mesesTrabalhados: z.number().min(0, "Não pode ser negativo"),
  anosTrabalhados: z.number().min(0, "Não pode ser negativo"),
})

export default function RescisaoCalculator({ onInputChange, onCalculate, config }: RescisaoCalculatorProps) {
  const [ultimoSalario, setUltimoSalario] = useState<string>("")
  const [dataAdmissao, setDataAdmissao] = useState<string>("")
  const [dataDemissao, setDataDemissao] = useState<string>("")
  const [motivoDemissao, setMotivoDemissao] = useState<string>("sem-justa-causa")
  const [avisoTrabalhado, setAvisoTrabalhado] = useState<boolean>(false)
  const [diasFeriasVencidas, setDiasFeriasVencidas] = useState<string>("0")
  const [diasFeriasProporcionais, setDiasFeriasProporcionais] = useState<string>("0")
  const [mesesTrabalhados, setMesesTrabalhados] = useState<string>("0")
  const [anosTrabalhados, setAnosTrabalhados] = useState<string>("0")
  const [resultado, setResultado] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (dataAdmissao && dataDemissao) {
      const admissao = new Date(dataAdmissao)
      const demissao = new Date(dataDemissao)
      
      if (!isNaN(admissao.getTime()) && !isNaN(demissao.getTime())) {
        // Calcula meses trabalhados
        let monthsDiff = (demissao.getFullYear() - admissao.getFullYear()) * 12 + 
                         (demissao.getMonth() - admissao.getMonth())
        
        // Ajusta para considerar o mês completo apenas se trabalhou 15 dias ou mais no mês final
        if (demissao.getDate() < admissao.getDate()) {
          monthsDiff--
        }
        
        // Calcula anos trabalhados para o aviso prévio proporcional
        const yearsDiff = Math.floor(monthsDiff / 12)
        
        setMesesTrabalhados(Math.max(0, monthsDiff).toString())
        setAnosTrabalhados(yearsDiff.toString())
      }
    }
  }, [dataAdmissao, dataDemissao])

  const validateInput = () => {
    try {
      const salarioNum = Number.parseFloat(ultimoSalario)
      const diasFeriasVencidasNum = Number.parseInt(diasFeriasVencidas || "0")
      const diasFeriasPropNum = Number.parseInt(diasFeriasProporcionais || "0")
      const mesesTrabalhadosNum = Number.parseInt(mesesTrabalhados || "0")
      const anosTrabalhadosNum = Number.parseInt(anosTrabalhados || "0")

      rescisaoSchema.parse({ 
        ultimoSalario: salarioNum, 
        dataAdmissao, 
        dataDemissao,
        motivoDemissao,
        avisoTrabalhado,
        diasFeriasVencidas: diasFeriasVencidasNum,
        diasFeriasProporcionais: diasFeriasPropNum,
        mesesTrabalhados: mesesTrabalhadosNum,
        anosTrabalhados: anosTrabalhadosNum
      })
      
      setErrors({})
      return { 
        salarioNum, 
        diasFeriasVencidasNum, 
        diasFeriasPropNum,
        mesesTrabalhadosNum,
        anosTrabalhadosNum 
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

  const calcularRescisao = () => {
    const validatedInput = validateInput()
    if (!validatedInput) return

    const { salarioNum, diasFeriasVencidasNum, diasFeriasPropNum, mesesTrabalhadosNum, anosTrabalhadosNum } = validatedInput
    
    // Valores base para cálculos
    const salarioDia = salarioNum / 30
    const salarioMes = salarioNum
    
    // Saldo de Salário - dias trabalhados no mês da demissão
    const demissaoDate = new Date(dataDemissao)
    const diasTrabalhados = demissaoDate.getDate()
    const saldoSalario = diasTrabalhados * salarioDia
    
    // Décimo Terceiro Proporcional - meses completos no ano (considerar o mês da demissão apenas se >= 15 dias)
    const mesAtual = demissaoDate.getMonth() + 1 // 1-12
    const diaAtual = demissaoDate.getDate()
    const mesesDecimoTerceiro = mesAtual - (diaAtual >= 15 ? 0 : 1)
    const decimoTerceiroProporcional = (mesesDecimoTerceiro / 12) * salarioMes
    
    // Férias vencidas e proporcionais - valor proporcional real, não assumindo exatamente 30 dias
    const feriasVencidas = (diasFeriasVencidasNum / 30) * salarioMes
    const tercoFeriasVencidas = feriasVencidas / 3
    
    // Férias proporcionais - meses completos desde o último período aquisitivo
    const mesesProporcionaisTrabalhados = Math.min(12, mesesTrabalhadosNum % 12)
    const feriasPropCalculadas = (mesesProporcionaisTrabalhados / 12) * salarioMes
    const feriasProporcionais = diasFeriasPropNum > 0 ? 
                               (diasFeriasPropNum / 30) * salarioMes : 
                               feriasPropCalculadas
    const tercoFeriasProporcionais = feriasProporcionais / 3
    
    // Valor do FGTS acumulado (8% do salário * meses trabalhados)
    const fgtsAcumulado = salarioMes * 0.08 * mesesTrabalhadosNum
    
    // Verbas específicas por tipo de rescisão
    let multaFGTS = 0
    let avisoPrevio = 0
    let aviso = "Não aplicável"
    let diasAviso = 30 // Padrão de 30 dias
    
    switch (motivoDemissao) {
      case "sem-justa-causa":
        // 40% do FGTS acumulado
        multaFGTS = fgtsAcumulado * 0.4
        
        // Aviso prévio proporcional (30 dias + 3 dias por ano trabalhado, máximo de 90 dias)
        diasAviso = Math.min(90, 30 + (3 * anosTrabalhadosNum))
        
        // Aviso prévio indenizado (se não foi trabalhado)
        if (!avisoTrabalhado) {
          avisoPrevio = (diasAviso / 30) * salarioMes
          aviso = `Aviso Prévio Indenizado (${diasAviso} dias)`
        } else {
          aviso = `Aviso Prévio Trabalhado (${diasAviso} dias)`
        }
        break
        
      case "comum-acordo":
        // 20% do FGTS acumulado
        multaFGTS = fgtsAcumulado * 0.2
        
        // Aviso prévio indenizado pela metade
        diasAviso = Math.min(90, 30 + (3 * anosTrabalhadosNum))
        if (!avisoTrabalhado) {
          avisoPrevio = ((diasAviso / 30) * salarioMes) / 2
          aviso = `Aviso Prévio Indenizado (50% de ${diasAviso} dias)`
        } else {
          aviso = `Aviso Prévio Trabalhado (${diasAviso} dias)`
        }
        break
        
      case "pedido-demissao":
      case "justa-causa":
        // Não tem multa FGTS nem aviso prévio indenizado
        multaFGTS = 0
        avisoPrevio = 0
        
        if (motivoDemissao === "pedido-demissao" && !avisoTrabalhado) {
          diasAviso = 30 // Sem proporcionalidade em caso de pedido de demissão
          aviso = "Desconto do Aviso Não Trabalhado"
          avisoPrevio = -salarioMes // Valor negativo pois será descontado
        } else {
          aviso = "Não Aplicável"
        }
        break
    }
    
    // Calcula o total
    const total = saldoSalario + 
                  decimoTerceiroProporcional + 
                  feriasVencidas + 
                  tercoFeriasVencidas + 
                  feriasProporcionais + 
                  tercoFeriasProporcionais + 
                  multaFGTS + 
                  avisoPrevio
    
    const resultadoFinal = {
      saldoSalario: saldoSalario.toFixed(2),
      decimoTerceiroProporcional: decimoTerceiroProporcional.toFixed(2),
      feriasVencidas: feriasVencidas.toFixed(2),
      tercoFeriasVencidas: tercoFeriasVencidas.toFixed(2),
      feriasProporcionais: feriasProporcionais.toFixed(2),
      tercoFeriasProporcionais: tercoFeriasProporcionais.toFixed(2),
      multaFGTS: multaFGTS.toFixed(2),
      fgtsAcumulado: fgtsAcumulado.toFixed(2),
      avisoPrevio: Math.abs(avisoPrevio).toFixed(2),
      diasAviso: diasAviso,
      tipoAviso: aviso,
      descontoAviso: avisoPrevio < 0,
      total: total.toFixed(2)
    }
    
    setResultado(resultadoFinal)
    
    // Call parent callbacks
    onInputChange("ultimoSalario", salarioNum)
    onInputChange("dataAdmissao", dataAdmissao)
    onInputChange("dataDemissao", dataDemissao)
    onInputChange("motivoDemissao", motivoDemissao)
    onCalculate(resultadoFinal)
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="ultimoSalario" className="block text-sm font-medium text-gray-700 mb-1">
            Último Salário Bruto (R$)
          </label>
          <input
            id="ultimoSalario"
            type="number"
            value={ultimoSalario}
            onChange={(e) => setUltimoSalario(e.target.value)}
            placeholder="Ex: 2500"
            className="calculator-input"
            min="0"
            step="0.01"
          />
          {errors.ultimoSalario && <p className="text-red-500 text-sm mt-1">{errors.ultimoSalario}</p>}
        </div>

        <div>
          <label htmlFor="dataAdmissao" className="block text-sm font-medium text-gray-700 mb-1">
            Data de Admissão
          </label>
          <input
            id="dataAdmissao"
            type="date"
            value={dataAdmissao}
            onChange={(e) => setDataAdmissao(e.target.value)}
            className="calculator-input"
          />
          {errors.dataAdmissao && <p className="text-red-500 text-sm mt-1">{errors.dataAdmissao}</p>}
        </div>

        <div>
          <label htmlFor="dataDemissao" className="block text-sm font-medium text-gray-700 mb-1">
            Data de Demissão
          </label>
          <input
            id="dataDemissao"
            type="date"
            value={dataDemissao}
            onChange={(e) => setDataDemissao(e.target.value)}
            className="calculator-input"
          />
          {errors.dataDemissao && <p className="text-red-500 text-sm mt-1">{errors.dataDemissao}</p>}
        </div>

        <div>
          <label htmlFor="motivoDemissao" className="block text-sm font-medium text-gray-700 mb-1">
            Motivo da Demissão
          </label>
          <select
            id="motivoDemissao"
            value={motivoDemissao}
            onChange={(e) => setMotivoDemissao(e.target.value)}
            className="calculator-input"
          >
            <option value="sem-justa-causa">Demissão sem Justa Causa</option>
            <option value="pedido-demissao">Pedido de Demissão</option>
            <option value="comum-acordo">Comum Acordo</option>
            <option value="justa-causa">Justa Causa</option>
          </select>
          {errors.motivoDemissao && <p className="text-red-500 text-sm mt-1">{errors.motivoDemissao}</p>}
        </div>

        <div>
          <label htmlFor="diasFeriasVencidas" className="block text-sm font-medium text-gray-700 mb-1">
            Dias de Férias Vencidas
          </label>
          <input
            id="diasFeriasVencidas"
            type="number"
            value={diasFeriasVencidas}
            onChange={(e) => setDiasFeriasVencidas(e.target.value)}
            placeholder="Ex: 30"
            className="calculator-input"
            min="0"
            max="30"
          />
          {errors.diasFeriasVencidas && <p className="text-red-500 text-sm mt-1">{errors.diasFeriasVencidas}</p>}
        </div>

        <div>
          <label htmlFor="diasFeriasProporcionais" className="block text-sm font-medium text-gray-700 mb-1">
            Dias de Férias Proporcionais
          </label>
          <input
            id="diasFeriasProporcionais"
            type="number"
            value={diasFeriasProporcionais}
            onChange={(e) => setDiasFeriasProporcionais(e.target.value)}
            placeholder="Ex: 20"
            className="calculator-input"
            min="0"
            max="30"
          />
          {errors.diasFeriasProporcionais && <p className="text-red-500 text-sm mt-1">{errors.diasFeriasProporcionais}</p>}
        </div>

        <div className="flex items-center">
          <input
            id="avisoTrabalhado"
            type="checkbox"
            checked={avisoTrabalhado}
            onChange={(e) => setAvisoTrabalhado(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="avisoTrabalhado" className="ml-2 block text-sm text-gray-700">
            Aviso Prévio Trabalhado
          </label>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm text-gray-500">
          Tempo de serviço estimado: <span className="font-medium">{mesesTrabalhados} meses</span> 
          (<span className="font-medium">{anosTrabalhados} anos</span> completos)
        </p>
      </div>

      <button onClick={calcularRescisao} className="calculator-button">
        Calcular Rescisão
      </button>

      {resultado && (
        <div className="calculator-result">
          <h3 className="text-lg font-semibold mb-4">Resultado da Rescisão:</h3>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-gray-600">Saldo de Salário:</span>
              <span className="font-medium">R$ {resultado.saldoSalario}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <span className="text-gray-600">13º Proporcional:</span>
              <span className="font-medium">R$ {resultado.decimoTerceiroProporcional}</span>
            </div>
            
            {Number(resultado.feriasVencidas) > 0 && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-600">Férias Vencidas:</span>
                  <span className="font-medium">R$ {resultado.feriasVencidas}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-600">1/3 Férias Vencidas:</span>
                  <span className="font-medium">R$ {resultado.tercoFeriasVencidas}</span>
                </div>
              </>
            )}
            
            {Number(resultado.feriasProporcionais) > 0 && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-600">Férias Proporcionais:</span>
                  <span className="font-medium">R$ {resultado.feriasProporcionais}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-600">1/3 Férias Proporcionais:</span>
                  <span className="font-medium">R$ {resultado.tercoFeriasProporcionais}</span>
                </div>
              </>
            )}
            
            {Number(resultado.multaFGTS) > 0 && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-600">FGTS acumulado (estimado):</span>
                  <span className="font-medium">R$ {resultado.fgtsAcumulado}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-600">Multa FGTS (40%):</span>
                  <span className="font-medium">R$ {resultado.multaFGTS}</span>
                </div>
              </>
            )}
            
            {resultado.tipoAviso !== "Não Aplicável" && (
              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-600">{resultado.tipoAviso}:</span>
                <span className={`font-medium ${resultado.descontoAviso ? 'text-red-500' : ''}`}>
                  {resultado.descontoAviso ? '-' : ''} R$ {resultado.avisoPrevio}
                </span>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-200">
              <span className="text-gray-800 font-semibold">Total da Rescisão:</span>
              <span className="font-bold text-green-600">R$ {resultado.total}</span>
            </div>
          </div>
          
          <div className="mt-6 text-sm text-gray-500">
            <p className="font-medium mb-1">Observações importantes:</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>Este cálculo é uma estimativa e pode não representar o valor exato da rescisão.</li>
              <li>Não estão inclusos descontos de INSS e IRRF sobre as verbas rescisórias.</li>
              <li>O saque do FGTS é um direito adicional em caso de demissão sem justa causa.</li>
              <li>Meses completos para férias e 13º são considerados apenas se houver 15 dias ou mais trabalhados.</li>
              <li>O aviso prévio proporcional aumenta 3 dias por ano de serviço, até o limite de 90 dias.</li>
              <li>Consulte um contador ou advogado para valores precisos e orientações específicas.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
} 