"use client"

import React, { useState, useEffect } from "react"
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip"
import { Info } from "lucide-react"

interface AbsenteismoCalculatorProps {
  onInputChange?: (name: string, value: any) => void
  onCalculate?: (result: any) => void
  config?: {
    decimalPlaces: number
  }
}

interface ResultadoAbsenteismo {
  taxaAbsenteismo: number
  horasPerdidas: number
  impactoFinanceiro?: number
  classificacao: string
  cor: string
  diaEquivalente?: number
}

export default function AbsenteismoCalculator({
  onInputChange,
  onCalculate,
  config = { decimalPlaces: 2 }
}: AbsenteismoCalculatorProps) {
  // Estados para os campos de entrada
  const [totalFuncionarios, setTotalFuncionarios] = useState<number | "">("")
  const [diasUteis, setDiasUteis] = useState<number | "">(22)
  const [horasDiarias, setHorasDiarias] = useState<number | "">(8)
  const [diasAusencia, setDiasAusencia] = useState<number | "">("")
  const [incluirAtrasos, setIncluirAtrasos] = useState<boolean>(false)
  const [totalHorasAtraso, setTotalHorasAtraso] = useState<number | "">("")
  const [calcularImpacto, setCalcularImpacto] = useState<boolean>(false)
  const [custoMedioHora, setCustoMedioHora] = useState<number | "">("")
  const [periodoAnalise, setPeriodoAnalise] = useState<string>("mensal")
  
  // Estado para o resultado
  const [resultado, setResultado] = useState<ResultadoAbsenteismo | null>(null)
  
  // Estado para verificar se o cálculo pode ser realizado
  const [podeCalcular, setPodeCalcular] = useState<boolean>(false)
  
  // Verificar se todos os campos obrigatórios foram preenchidos
  useEffect(() => {
    if (
      totalFuncionarios !== "" && 
      diasUteis !== "" &&
      horasDiarias !== "" &&
      diasAusencia !== "" &&
      (!incluirAtrasos || (incluirAtrasos && totalHorasAtraso !== "")) &&
      (!calcularImpacto || (calcularImpacto && custoMedioHora !== ""))
    ) {
      setPodeCalcular(true)
    } else {
      setPodeCalcular(false)
    }
  }, [
    totalFuncionarios, 
    diasUteis, 
    horasDiarias, 
    diasAusencia, 
    incluirAtrasos, 
    totalHorasAtraso,
    calcularImpacto,
    custoMedioHora
  ])
  
  // Função para calcular o absenteísmo
  const calcularAbsenteismo = () => {
    if (!podeCalcular) return;
    
    // Conversão de tipos
    const funcionarios = Number(totalFuncionarios)
    const dias = Number(diasUteis)
    const horas = Number(horasDiarias)
    const faltas = Number(diasAusencia)
    
    // Horas programadas (total de horas que deveriam ser trabalhadas no período)
    const horasProgramadas = funcionarios * dias * horas
    
    // Horas perdidas por faltas
    let horasPerdidas = faltas * horas
    
    // Adicionar horas de atraso se solicitado
    if (incluirAtrasos && totalHorasAtraso !== "") {
      horasPerdidas += Number(totalHorasAtraso)
    }
    
    // Cálculo da taxa de absenteísmo
    let taxaAbsenteismo = (horasPerdidas / horasProgramadas) * 100
    
    // Ajuste da taxa conforme o período, se necessário
    // Deixamos o valor como está, pois queremos a taxa referente ao período analisado
    
    // Cálculo do impacto financeiro se solicitado
    let impactoFinanceiro = undefined
    if (calcularImpacto && custoMedioHora !== "") {
      impactoFinanceiro = horasPerdidas * Number(custoMedioHora)
    }
    
    // Calcular dias equivalentes perdidos
    const diaEquivalente = horasPerdidas / horas
    
    // Classificação do absenteísmo
    let classificacao = ""
    let cor = ""
    
    if (taxaAbsenteismo < 2) {
      classificacao = "Baixo"
      cor = "text-green-600"
    } else if (taxaAbsenteismo < 4) {
      classificacao = "Aceitável"
      cor = "text-blue-600"
    } else if (taxaAbsenteismo < 6) {
      classificacao = "Elevado"
      cor = "text-yellow-600"
    } else {
      classificacao = "Crítico"
      cor = "text-red-600"
    }
    
    // Formata os resultados com a quantidade de casas decimais definidas
    const resultadoFinal: ResultadoAbsenteismo = {
      taxaAbsenteismo: parseFloat(taxaAbsenteismo.toFixed(config.decimalPlaces)),
      horasPerdidas: Math.round(horasPerdidas),
      impactoFinanceiro: impactoFinanceiro ? parseFloat(impactoFinanceiro.toFixed(2)) : undefined,
      classificacao,
      cor,
      diaEquivalente: parseFloat(diaEquivalente.toFixed(1))
    }
    
    setResultado(resultadoFinal)
    
    // Callback para o componente pai
    if (onCalculate) {
      onCalculate(resultadoFinal)
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dados da Organização</CardTitle>
            <CardDescription>
              Informe os dados do quadro de funcionários para o período analisado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="totalFuncionarios">
                Total de funcionários
              </Label>
              <Input
                id="totalFuncionarios"
                type="number"
                min="1"
                placeholder="Ex: 100"
                value={totalFuncionarios}
                onChange={(e) => {
                  const value = e.target.value === "" ? "" : Number(e.target.value);
                  setTotalFuncionarios(value);
                  if (onInputChange) onInputChange("totalFuncionarios", value);
                }}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="diasUteis">
                Dias úteis no período
              </Label>
              <Input
                id="diasUteis"
                type="number"
                min="1"
                placeholder="Ex: 22"
                value={diasUteis}
                onChange={(e) => {
                  const value = e.target.value === "" ? "" : Number(e.target.value);
                  setDiasUteis(value);
                  if (onInputChange) onInputChange("diasUteis", value);
                }}
              />
              <p className="text-xs text-gray-500">
                Em geral, um mês possui cerca de 22 dias úteis
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="horasDiarias">
                Horas diárias de trabalho
              </Label>
              <Input
                id="horasDiarias"
                type="number"
                min="1"
                placeholder="Ex: 8"
                value={horasDiarias}
                onChange={(e) => {
                  const value = e.target.value === "" ? "" : Number(e.target.value);
                  setHorasDiarias(value);
                  if (onInputChange) onInputChange("horasDiarias", value);
                }}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="periodoAnalise">Período de Análise</Label>
              <Select
                value={periodoAnalise}
                onValueChange={(value) => {
                  setPeriodoAnalise(value);
                  if (onInputChange) onInputChange("periodoAnalise", value);
                }}
              >
                <SelectTrigger id="periodoAnalise">
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent sideOffset={5} className="bg-white shadow-lg rounded-md border border-gray-200">
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="trimestral">Trimestral</SelectItem>
                  <SelectItem value="semestral">Semestral</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Dados de Ausências</CardTitle>
            <CardDescription>
              Informações sobre as ausências ocorridas no período
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="diasAusencia">Total de dias de ausência</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info size={16} className="text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Some todos os dias de ausência de todos os funcionários no período.
                        Ex: Se 3 funcionários faltaram 2 dias cada, informe 6 dias totais.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="diasAusencia"
                type="number"
                min="0"
                placeholder="Ex: 15"
                value={diasAusencia}
                onChange={(e) => {
                  const value = e.target.value === "" ? "" : Number(e.target.value);
                  setDiasAusencia(value);
                  if (onInputChange) onInputChange("diasAusencia", value);
                }}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="incluirAtrasos"
                checked={incluirAtrasos}
                onChange={(e) => {
                  setIncluirAtrasos(e.target.checked);
                  if (onInputChange) onInputChange("incluirAtrasos", e.target.checked);
                }}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="incluirAtrasos" className="cursor-pointer">
                Incluir atrasos no cálculo
              </Label>
            </div>
            
            {incluirAtrasos && (
              <div className="space-y-2">
                <Label htmlFor="totalHorasAtraso">
                  Total de horas de atraso
                </Label>
                <Input
                  id="totalHorasAtraso"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="Ex: 12.5"
                  value={totalHorasAtraso}
                  onChange={(e) => {
                    const value = e.target.value === "" ? "" : Number(e.target.value);
                    setTotalHorasAtraso(value);
                    if (onInputChange) onInputChange("totalHorasAtraso", value);
                  }}
                />
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="calcularImpacto"
                checked={calcularImpacto}
                onChange={(e) => {
                  setCalcularImpacto(e.target.checked);
                  if (onInputChange) onInputChange("calcularImpacto", e.target.checked);
                }}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="calcularImpacto" className="cursor-pointer">
                Calcular impacto financeiro
              </Label>
            </div>
            
            {calcularImpacto && (
              <div className="space-y-2">
                <Label htmlFor="custoMedioHora">
                  Custo médio por hora (R$)
                </Label>
                <Input
                  id="custoMedioHora"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ex: 25.50"
                  value={custoMedioHora}
                  onChange={(e) => {
                    const value = e.target.value === "" ? "" : Number(e.target.value);
                    setCustoMedioHora(value);
                    if (onInputChange) onInputChange("custoMedioHora", value);
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-center">
        <Button 
          size="lg"
          onClick={calcularAbsenteismo}
          disabled={!podeCalcular}
        >
          Calcular Taxa de Absenteísmo
        </Button>
      </div>
      
      {resultado && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Resultado da Análise de Absenteísmo</CardTitle>
            <CardDescription>
              Indicadores de ausência baseados nos dados informados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg">
              <h3 className="text-3xl font-bold text-gray-800">Taxa de Absenteísmo:</h3>
              <p className={`text-4xl font-bold mt-2 ${resultado.cor}`}>
                {resultado.taxaAbsenteismo}%
              </p>
              <p className={`text-lg mt-1 ${resultado.cor}`}>
                Classificação: {resultado.classificacao}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 border rounded-lg text-center">
                <h4 className="font-medium text-gray-700">Horas Perdidas</h4>
                <p className="text-2xl font-bold text-blue-600">{resultado.horasPerdidas} horas</p>
              </div>
              
              <div className="bg-white p-4 border rounded-lg text-center">
                <h4 className="font-medium text-gray-700">Equivalente em Dias</h4>
                <p className="text-2xl font-bold text-orange-600">
                  {resultado.diaEquivalente} dias
                </p>
              </div>
            </div>
            
            {resultado.impactoFinanceiro !== undefined && (
              <div className="bg-white p-5 border rounded-lg text-center">
                <h4 className="font-medium text-gray-700">Impacto Financeiro Estimado</h4>
                <p className="text-2xl font-bold text-red-600">
                  R$ {resultado.impactoFinanceiro.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </p>
              </div>
            )}
            
            <Separator />
            
            <Accordion type="single" collapsible>
              <AccordionItem value="interpretacao">
                <AccordionTrigger>Como interpretar estes resultados?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm text-gray-600">
                    <p>
                      <strong>Taxa de Absenteísmo:</strong> Representa a porcentagem de horas perdidas em relação ao total de horas
                      que deveriam ser trabalhadas. Taxas abaixo de 2% geralmente são consideradas baixas, entre 2-4% aceitáveis,
                      entre 4-6% elevadas e acima de 6% críticas.
                    </p>
                    
                    <p>
                      <strong>Horas Perdidas:</strong> Total de horas não trabalhadas devido às ausências e, se incluídos, atrasos.
                      Este número ajuda a dimensionar o volume total de tempo perdido no período.
                    </p>
                    
                    <p>
                      <strong>Equivalente em Dias:</strong> Representa quantos dias de trabalho completos foram perdidos,
                      considerando a jornada diária informada. Esta conversão facilita a visualização do impacto.
                    </p>
                    
                    {resultado.impactoFinanceiro !== undefined && (
                      <p>
                        <strong>Impacto Financeiro:</strong> Estimativa do custo das horas perdidas, considerando
                        o valor médio por hora informado. Este cálculo é simplificado e não considera custos indiretos.
                      </p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="acoes">
                <AccordionTrigger>Ações recomendadas</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    {resultado.taxaAbsenteismo < 2 ? (
                      <p>
                        Com um absenteísmo baixo, sua empresa demonstra boa gestão das ausências.
                        Continue com as práticas atuais e considere:
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          <li>Manter o monitoramento regular das ausências</li>
                          <li>Reconhecer os bons índices com a equipe</li>
                          <li>Documentar as boas práticas que contribuem para este resultado</li>
                        </ul>
                      </p>
                    ) : resultado.taxaAbsenteismo < 4 ? (
                      <p>
                        Seu absenteísmo está em níveis aceitáveis, mas considere:
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          <li>Analisar os padrões de ausência (dias da semana, períodos do ano)</li>
                          <li>Implementar entrevistas de retorno ao trabalho</li>
                          <li>Revisar políticas de saúde e bem-estar</li>
                        </ul>
                      </p>
                    ) : resultado.taxaAbsenteismo < 6 ? (
                      <p>
                        Com um absenteísmo elevado, recomenda-se:
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          <li>Identificar as causas mais comuns de ausências</li>
                          <li>Segmentar o absenteísmo por departamento para ações focadas</li>
                          <li>Revisar políticas de acompanhamento médico</li>
                          <li>Implementar programas de qualidade de vida</li>
                          <li>Analisar a carga e condições de trabalho</li>
                        </ul>
                      </p>
                    ) : (
                      <p>
                        Seu absenteísmo está em níveis críticos, exigindo ações imediatas:
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          <li>Realizar análise detalhada dos tipos de ausência (médicas, injustificadas, etc.)</li>
                          <li>Auditar processos de gestão de ausências</li>
                          <li>Implementar programas de saúde ocupacional intensivos</li>
                          <li>Revisar condições físicas e ergonômicas do ambiente de trabalho</li>
                          <li>Analisar fatores de clima organizacional e estresse</li>
                          <li>Considerar consultoria especializada em saúde ocupacional</li>
                        </ul>
                      </p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
          <CardFooter className="block space-y-2 text-sm text-gray-500">
            <p>
              <strong>Nota:</strong> A interpretação dos índices de absenteísmo pode variar conforme o setor,
              região geográfica e contexto específico da organização. Os benchmarks apresentados são 
              referências gerais.
            </p>
            <p>
              Para uma análise mais completa, recomenda-se segmentar o absenteísmo por causas
              (doenças, faltas injustificadas, licenças, etc.) e avaliar tendências ao longo do tempo.
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  )
} 