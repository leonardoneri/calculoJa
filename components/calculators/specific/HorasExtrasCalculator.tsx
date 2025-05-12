"use client"

import { useState } from "react"
import { z } from "zod"

interface HorasExtrasCalculatorProps {
  onInputChange: (name: string, value: any) => void
  onCalculate: (result: any) => void
  config: any
}

const horasExtrasSchema = z.object({
  salarioBruto: z.number().positive("O salário deve ser maior que zero"),
  jornadaMensal: z.number().positive("A jornada deve ser maior que zero"),
  horasExtras50: z.number().min(0, "Não pode ser negativo"),
  horasExtras100: z.number().min(0, "Não pode ser negativo"),
  adicionalNoturno: z.number().min(0, "Não pode ser negativo"),
  dsr: z.boolean(),
})

export default function HorasExtrasCalculator({ onInputChange, onCalculate, config }: HorasExtrasCalculatorProps) {
  const [salarioBruto, setSalarioBruto] = useState<string>("")
  const [jornadaMensal, setJornadaMensal] = useState<string>("220")
  const [horasExtras50, setHorasExtras50] = useState<string>("0")
  const [horasExtras100, setHorasExtras100] = useState<string>("0")
  const [adicionalNoturno, setAdicionalNoturno] = useState<string>("0")
  const [dsr, setDsr] = useState<boolean>(true)
  const [resultado, setResultado] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateInput = () => {
    try {
      const salarioNum = Number.parseFloat(salarioBruto)
      const jornadaMensalNum = Number.parseFloat(jornadaMensal)
      const horasExtras50Num = Number.parseFloat(horasExtras50 || "0")
      const horasExtras100Num = Number.parseFloat(horasExtras100 || "0")
      const adicionalNoturnoNum = Number.parseFloat(adicionalNoturno || "0")

      horasExtrasSchema.parse({
        salarioBruto: salarioNum,
        jornadaMensal: jornadaMensalNum,
        horasExtras50: horasExtras50Num,
        horasExtras100: horasExtras100Num,
        adicionalNoturno: adicionalNoturnoNum,
        dsr
      })

      setErrors({})
      return {
        salarioNum,
        jornadaMensalNum,
        horasExtras50Num,
        horasExtras100Num,
        adicionalNoturnoNum
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

  const calcularHorasExtras = () => {
    const validatedInput = validateInput()
    if (!validatedInput) return

    const { salarioNum, jornadaMensalNum, horasExtras50Num, horasExtras100Num, adicionalNoturnoNum } = validatedInput

    // Valor da hora normal
    const valorHora = salarioNum / jornadaMensalNum
    
    // Valor das horas extras com 50% de acréscimo
    const valorHorasExtras50 = valorHora * 1.5 * horasExtras50Num
    
    // Valor das horas extras com 100% de acréscimo (domingos e feriados)
    const valorHorasExtras100 = valorHora * 2 * horasExtras100Num
    
    // Valor do adicional noturno (20% sobre as horas noturnas)
    const valorAdicionalNoturno = valorHora * 0.2 * adicionalNoturnoNum
    
    // Total de horas extras
    const totalHorasExtras = valorHorasExtras50 + valorHorasExtras100
    
    // Calcula DSR (Descanso Semanal Remunerado) sobre horas extras e adicional noturno
    // Considera 30 dias no mês, sendo aproximadamente 26 dias úteis e 4 domingos
    const dsrHorasExtras = dsr ? (totalHorasExtras / 26) * 4 : 0
    const dsrAdicionalNoturno = dsr ? (valorAdicionalNoturno / 26) * 4 : 0
    
    // Total geral
    const total = totalHorasExtras + valorAdicionalNoturno + dsrHorasExtras + dsrAdicionalNoturno

    const resultadoFinal = {
      valorHora: valorHora.toFixed(2),
      valorHorasExtras50: valorHorasExtras50.toFixed(2),
      valorHorasExtras100: valorHorasExtras100.toFixed(2),
      totalHorasExtras: totalHorasExtras.toFixed(2),
      valorAdicionalNoturno: valorAdicionalNoturno.toFixed(2),
      dsrHorasExtras: dsrHorasExtras.toFixed(2),
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
          <label htmlFor="horasExtras50" className="block text-sm font-medium text-gray-700 mb-1">
            Horas Extras 50% (horas)
          </label>
          <input
            id="horasExtras50"
            type="number"
            value={horasExtras50}
            onChange={(e) => setHorasExtras50(e.target.value)}
            placeholder="Ex: 10"
            className="calculator-input"
            min="0"
            step="0.5"
          />
          {errors.horasExtras50 && <p className="text-red-500 text-sm mt-1">{errors.horasExtras50}</p>}
          <p className="text-xs text-gray-500 mt-1">Horas extras em dias úteis</p>
        </div>

        <div>
          <label htmlFor="horasExtras100" className="block text-sm font-medium text-gray-700 mb-1">
            Horas Extras 100% (horas)
          </label>
          <input
            id="horasExtras100"
            type="number"
            value={horasExtras100}
            onChange={(e) => setHorasExtras100(e.target.value)}
            placeholder="Ex: 5"
            className="calculator-input"
            min="0"
            step="0.5"
          />
          {errors.horasExtras100 && <p className="text-red-500 text-sm mt-1">{errors.horasExtras100}</p>}
          <p className="text-xs text-gray-500 mt-1">Horas extras em domingos e feriados</p>
        </div>

        <div>
          <label htmlFor="adicionalNoturno" className="block text-sm font-medium text-gray-700 mb-1">
            Horas com Adicional Noturno (horas)
          </label>
          <input
            id="adicionalNoturno"
            type="number"
            value={adicionalNoturno}
            onChange={(e) => setAdicionalNoturno(e.target.value)}
            placeholder="Ex: 0"
            className="calculator-input"
            min="0"
            step="0.5"
          />
          {errors.adicionalNoturno && <p className="text-red-500 text-sm mt-1">{errors.adicionalNoturno}</p>}
          <p className="text-xs text-gray-500 mt-1">Trabalho entre 22h e 5h (adicional de 20%)</p>
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

      <button onClick={calcularHorasExtras} className="calculator-button">
        Calcular Horas Extras
      </button>

      {resultado && (
        <div className="calculator-result">
          <h3 className="text-lg font-semibold mb-4">Resultado do Cálculo:</h3>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-gray-600">Valor da Hora Normal:</span>
              <span className="font-medium">R$ {resultado.valorHora}</span>
            </div>
            
            {Number(horasExtras50) > 0 && (
              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-600">Horas Extras 50% ({horasExtras50}h):</span>
                <span className="font-medium">R$ {resultado.valorHorasExtras50}</span>
              </div>
            )}
            
            {Number(horasExtras100) > 0 && (
              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-600">Horas Extras 100% ({horasExtras100}h):</span>
                <span className="font-medium">R$ {resultado.valorHorasExtras100}</span>
              </div>
            )}
            
            {(Number(horasExtras50) > 0 || Number(horasExtras100) > 0) && (
              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-600">Total Horas Extras:</span>
                <span className="font-medium">R$ {resultado.totalHorasExtras}</span>
              </div>
            )}
            
            {Number(adicionalNoturno) > 0 && (
              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-600">Adicional Noturno ({adicionalNoturno}h):</span>
                <span className="font-medium">R$ {resultado.valorAdicionalNoturno}</span>
              </div>
            )}
            
            {dsr && (Number(horasExtras50) > 0 || Number(horasExtras100) > 0) && (
              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-600">DSR sobre Horas Extras:</span>
                <span className="font-medium">R$ {resultado.dsrHorasExtras}</span>
              </div>
            )}
            
            {dsr && Number(adicionalNoturno) > 0 && (
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
              <li>As horas extras em dias úteis têm acréscimo mínimo de 50% sobre o valor da hora normal.</li>
              <li>As horas extras em domingos e feriados têm acréscimo mínimo de 100% sobre o valor da hora normal.</li>
              <li>O adicional noturno é de 20% sobre o valor da hora normal para trabalho entre 22h e 5h.</li>
              <li>O DSR (Descanso Semanal Remunerado) é calculado proporcionalmente aos dias úteis do mês.</li>
              <li>Algumas categorias profissionais possuem percentuais diferentes, conforme convenção coletiva.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
} 