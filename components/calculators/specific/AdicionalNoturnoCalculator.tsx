"use client"

import { useState } from "react"
import { z } from "zod"

interface AdicionalNoturnoCalculatorProps {
  onInputChange: (name: string, value: any) => void
  onCalculate: (result: any) => void
  config: any
}

const adicionalNoturnoSchema = z.object({
  salarioBruto: z.number().positive("O salário deve ser maior que zero"),
  jornadaMensal: z.number().positive("A jornada deve ser maior que zero"),
  horasNoturnas: z.number().min(0, "Não pode ser negativo"),
  percentualAdicional: z.number().min(0, "Não pode ser negativo"),
  horaNoturnaReduzida: z.boolean(),
  dsr: z.boolean(),
})

export default function AdicionalNoturnoCalculator({ onInputChange, onCalculate, config }: AdicionalNoturnoCalculatorProps) {
  const [salarioBruto, setSalarioBruto] = useState<string>("")
  const [jornadaMensal, setJornadaMensal] = useState<string>("220")
  const [horasNoturnas, setHorasNoturnas] = useState<string>("0")
  const [percentualAdicional, setPercentualAdicional] = useState<string>("20")
  const [horaNoturnaReduzida, setHoraNoturnaReduzida] = useState<boolean>(true)
  const [dsr, setDsr] = useState<boolean>(true)
  const [resultado, setResultado] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateInput = () => {
    try {
      const salarioNum = Number.parseFloat(salarioBruto)
      const jornadaMensalNum = Number.parseFloat(jornadaMensal)
      const horasNoturnasNum = Number.parseFloat(horasNoturnas)
      const percentualAdicionalNum = Number.parseFloat(percentualAdicional)

      adicionalNoturnoSchema.parse({
        salarioBruto: salarioNum,
        jornadaMensal: jornadaMensalNum,
        horasNoturnas: horasNoturnasNum,
        percentualAdicional: percentualAdicionalNum,
        horaNoturnaReduzida,
        dsr
      })

      setErrors({})
      return {
        salarioNum,
        jornadaMensalNum,
        horasNoturnasNum,
        percentualAdicionalNum
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

  const calcularAdicionalNoturno = () => {
    const validatedInput = validateInput()
    if (!validatedInput) return

    const { salarioNum, jornadaMensalNum, horasNoturnasNum, percentualAdicionalNum } = validatedInput

    // Valor da hora normal
    const valorHora = salarioNum / jornadaMensalNum
    
    // Fator de redução da hora noturna
    // Hora noturna = 52 minutos e 30 segundos = 52.5 minutos = 52.5/60 = 0.875 hora
    const fatorReducao = horaNoturnaReduzida ? 0.875 : 1
    
    // Quantidade de horas noturnas considerando a redução
    const horasNoturnasAjustadas = horasNoturnaReduzida ? horasNoturnasNum / fatorReducao : horasNoturnasNum
    
    // Valor do adicional noturno (percentual sobre as horas noturnas)
    const valorHoraNoturna = valorHora * (1 + percentualAdicionalNum / 100)
    
    // Valor adicional puro (diferença entre hora noturna e hora normal)
    const valorAdicionalPuro = (valorHoraNoturna - valorHora) * horasNoturnasAjustadas
    
    // Valor da redução da hora noturna (hora normal * horas ajustadas - horas trabalhadas)
    const valorReducao = horaNoturnaReduzida ? valorHora * (horasNoturnasAjustadas - horasNoturnasNum) : 0
    
    // Total de adicional noturno
    const totalAdicionalNoturno = valorAdicionalPuro + valorReducao
    
    // Calcula DSR (Descanso Semanal Remunerado) sobre adicional noturno
    // Considera 30 dias no mês, sendo aproximadamente 26 dias úteis e 4 domingos
    const dsrAdicionalNoturno = dsr ? (totalAdicionalNoturno / 26) * 4 : 0
    
    // Total geral
    const total = totalAdicionalNoturno + dsrAdicionalNoturno

    const resultadoFinal = {
      valorHora: valorHora.toFixed(2),
      valorHoraNoturna: valorHoraNoturna.toFixed(2),
      horasNoturnasAjustadas: horasNoturnasAjustadas.toFixed(2),
      valorAdicionalPuro: valorAdicionalPuro.toFixed(2),
      valorReducao: valorReducao.toFixed(2),
      totalAdicionalNoturno: totalAdicionalNoturno.toFixed(2),
      dsrAdicionalNoturno: dsrAdicionalNoturno.toFixed(2),
      total: total.toFixed(2)
    }

    setResultado(resultadoFinal)

    // Call parent callbacks
    onInputChange("salarioBruto", salarioNum)
    onInputChange("jornadaMensal", jornadaMensalNum)
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
            placeholder="Ex: 2500"
            className="calculator-input"
            min="0"
            step="0.01"
          />
          {errors.salarioBruto && <p className="text-red-500 text-sm mt-1">{errors.salarioBruto}</p>}
        </div>

        <div>
          <label htmlFor="jornadaMensal" className="block text-sm font-medium text-gray-700 mb-1">
            Jornada Mensal (horas)
          </label>
          <input
            id="jornadaMensal"
            type="number"
            value={jornadaMensal}
            onChange={(e) => setJornadaMensal(e.target.value)}
            placeholder="Ex: 220"
            className="calculator-input"
            min="1"
            step="0.5"
          />
          {errors.jornadaMensal && <p className="text-red-500 text-sm mt-1">{errors.jornadaMensal}</p>}
          <p className="text-xs text-gray-500 mt-1">220h para jornada de 44h semanais, 200h para 40h semanais, 180h para 36h semanais</p>
        </div>

        <div>
          <label htmlFor="horasNoturnas" className="block text-sm font-medium text-gray-700 mb-1">
            Horas Noturnas Trabalhadas (horas)
          </label>
          <input
            id="horasNoturnas"
            type="number"
            value={horasNoturnas}
            onChange={(e) => setHorasNoturnas(e.target.value)}
            placeholder="Ex: 40"
            className="calculator-input"
            min="0"
            step="0.5"
          />
          {errors.horasNoturnas && <p className="text-red-500 text-sm mt-1">{errors.horasNoturnas}</p>}
          <p className="text-xs text-gray-500 mt-1">Trabalho entre 22h e 5h</p>
        </div>

        <div>
          <label htmlFor="percentualAdicional" className="block text-sm font-medium text-gray-700 mb-1">
            Percentual do Adicional (%)
          </label>
          <input
            id="percentualAdicional"
            type="number"
            value={percentualAdicional}
            onChange={(e) => setPercentualAdicional(e.target.value)}
            placeholder="Ex: 20"
            className="calculator-input"
            min="0"
            step="1"
          />
          {errors.percentualAdicional && <p className="text-red-500 text-sm mt-1">{errors.percentualAdicional}</p>}
          <p className="text-xs text-gray-500 mt-1">Padrão: 20% (urbano), 25% (rural)</p>
        </div>

        <div className="flex items-center">
          <input
            id="horaNoturnaReduzida"
            type="checkbox"
            checked={horaNoturnaReduzida}
            onChange={(e) => setHoraNoturnaReduzida(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="horaNoturnaReduzida" className="ml-2 block text-sm text-gray-700">
            Aplicar hora noturna reduzida (52min30s)
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="dsr"
            type="checkbox"
            checked={dsr}
            onChange={(e) => setDsr(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="dsr" className="ml-2 block text-sm text-gray-700">
            Incluir DSR (Descanso Semanal Remunerado)
          </label>
        </div>
      </div>

      <button onClick={calcularAdicionalNoturno} className="calculator-button">
        Calcular Adicional Noturno
      </button>

      {resultado && (
        <div className="calculator-result">
          <h3 className="text-lg font-semibold mb-4">Resultado do Cálculo:</h3>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-gray-600">Valor da Hora Normal:</span>
              <span className="font-medium">R$ {resultado.valorHora}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <span className="text-gray-600">Valor da Hora Noturna:</span>
              <span className="font-medium">R$ {resultado.valorHoraNoturna}</span>
            </div>
            
            {horaNoturnaReduzida && (
              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-600">Horas Noturnas Ajustadas:</span>
                <span className="font-medium">{resultado.horasNoturnasAjustadas}h</span>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2">
              <span className="text-gray-600">Valor do Adicional ({percentualAdicional}%):</span>
              <span className="font-medium">R$ {resultado.valorAdicionalPuro}</span>
            </div>
            
            {horaNoturnaReduzida && (
              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-600">Valor da Hora Reduzida:</span>
                <span className="font-medium">R$ {resultado.valorReducao}</span>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2">
              <span className="text-gray-600">Total do Adicional Noturno:</span>
              <span className="font-medium">R$ {resultado.totalAdicionalNoturno}</span>
            </div>
            
            {dsr && (
              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-600">DSR sobre Adicional Noturno:</span>
                <span className="font-medium">R$ {resultado.dsrAdicionalNoturno}</span>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-200">
              <span className="text-gray-800 font-semibold">Total Geral:</span>
              <span className="font-bold text-green-600">R$ {resultado.total}</span>
            </div>
          </div>
          
          <div className="mt-6 text-sm text-gray-500">
            <p className="font-medium mb-1">Observações importantes:</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>O adicional noturno é de, no mínimo, 20% sobre o valor da hora normal para trabalho urbano e 25% para rural.</li>
              <li>Considera-se trabalho noturno aquele realizado entre 22h e 5h para atividades urbanas, e entre 21h e 5h para atividades rurais.</li>
              <li>A hora noturna reduzida corresponde a 52 minutos e 30 segundos, ou seja, 7 horas noturnas equivalem a 8 horas diurnas.</li>
              <li>O DSR (Descanso Semanal Remunerado) é calculado proporcionalmente aos dias úteis do mês.</li>
              <li>Algumas categorias profissionais possuem percentuais diferentes, conforme convenção coletiva.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
} 