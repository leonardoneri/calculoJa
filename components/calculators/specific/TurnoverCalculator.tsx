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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip"
import { Info } from "lucide-react"

interface TurnoverCalculatorProps {
  onInputChange?: (name: string, value: any) => void
  onCalculate?: (result: any) => void
  config?: {
    decimalPlaces: number
  }
}

interface ResultadoTurnover {
  taxaTurnoverGeral: number
  taxaTurnoverVoluntario?: number
  taxaTurnoverInvoluntario?: number
  tempoMedioPermanencia?: number
  indiceBenchmark: string
  classificacao: string
  cor: string
}

export default function TurnoverCalculator({
  onInputChange,
  onCalculate,
  config = { decimalPlaces: 2 }
}: TurnoverCalculatorProps) {
  // Estados para os campos de entrada
  const [totalFuncionariosInicio, setTotalFuncionariosInicio] = useState<number | "">("")
  const [totalFuncionariosFim, setTotalFuncionariosFim] = useState<number | "">("")
  const [totalDemissoes, setTotalDemissoes] = useState<number | "">("")
  const [separaPorTipo, setSeparaPorTipo] = useState<boolean>(false)
  const [demissoesVoluntarias, setDemissoesVoluntarias] = useState<number | "">("")
  const [demissoesInvoluntarias, setDemissoesInvoluntarias] = useState<number | "">("")
  const [calcularTempoMedio, setCalcularTempoMedio] = useState<boolean>(false)
  const [somaTempoPermanencia, setSomaTempoPermanencia] = useState<number | "">("")
  const [periodoAnalise, setPeriodoAnalise] = useState<string>("mensal")
  
  // Estado para o resultado
  const [resultado, setResultado] = useState<ResultadoTurnover | null>(null)
  
  // Estado para verificar se o cálculo pode ser realizado
  const [podeCalcular, setPodeCalcular] = useState<boolean>(false)
  
  // Verificar se todos os campos obrigatórios foram preenchidos
  useEffect(() => {
    if (
      totalFuncionariosInicio !== "" && 
      totalFuncionariosFim !== "" &&
      ((separaPorTipo && demissoesVoluntarias !== "" && demissoesInvoluntarias !== "") || 
       (!separaPorTipo && totalDemissoes !== "")) &&
      (!calcularTempoMedio || (calcularTempoMedio && somaTempoPermanencia !== ""))
    ) {
      setPodeCalcular(true)
    } else {
      setPodeCalcular(false)
    }
  }, [
    totalFuncionariosInicio, 
    totalFuncionariosFim, 
    totalDemissoes, 
    separaPorTipo, 
    demissoesVoluntarias, 
    demissoesInvoluntarias,
    calcularTempoMedio,
    somaTempoPermanencia
  ])

  // Efeito para atualizar totalDemissoes quando alterar os valores separados
  useEffect(() => {
    if (separaPorTipo && demissoesVoluntarias !== "" && demissoesInvoluntarias !== "") {
      const total = Number(demissoesVoluntarias) + Number(demissoesInvoluntarias)
      setTotalDemissoes(total)
    }
  }, [separaPorTipo, demissoesVoluntarias, demissoesInvoluntarias])
  
  // Função para calcular o turnover
  const calcularTurnover = () => {
    if (!podeCalcular) return;
    
    // Conversão para garantir tipos numéricos
    const funcionariosInicio = Number(totalFuncionariosInicio)
    const funcionariosFim = Number(totalFuncionariosFim)
    const demissoes = Number(totalDemissoes)
    
    // Cálculo da média de funcionários no período
    const mediaFuncionarios = (funcionariosInicio + funcionariosFim) / 2
    
    // Cálculo da taxa de turnover geral
    let taxaTurnoverGeral = (demissoes / mediaFuncionarios) * 100
    
    // Ajuste da taxa conforme o período de análise
    if (periodoAnalise === "anual") {
      // Se já é anual, mantém como está
    } else if (periodoAnalise === "mensal") {
      // Se for mensal, anualiza multiplicando por 12
      taxaTurnoverGeral = taxaTurnoverGeral
    } else if (periodoAnalise === "trimestral") {
      // Se for trimestral, anualiza multiplicando por 4
      taxaTurnoverGeral = taxaTurnoverGeral
    } else if (periodoAnalise === "semestral") {
      // Se for semestral, anualiza multiplicando por 2
      taxaTurnoverGeral = taxaTurnoverGeral
    }
    
    // Cálculos adicionais se houver separação por tipo
    let taxaTurnoverVoluntario = undefined
    let taxaTurnoverInvoluntario = undefined
    
    if (separaPorTipo) {
      const voluntarias = Number(demissoesVoluntarias)
      const involuntarias = Number(demissoesInvoluntarias)
      
      taxaTurnoverVoluntario = (voluntarias / mediaFuncionarios) * 100
      taxaTurnoverInvoluntario = (involuntarias / mediaFuncionarios) * 100
      
      // Ajuste conforme o período
      if (periodoAnalise === "anual") {
        // Se já é anual, mantém como está
      } else if (periodoAnalise === "mensal") {
        taxaTurnoverVoluntario = taxaTurnoverVoluntario
        taxaTurnoverInvoluntario = taxaTurnoverInvoluntario
      } else if (periodoAnalise === "trimestral") {
        taxaTurnoverVoluntario = taxaTurnoverVoluntario
        taxaTurnoverInvoluntario = taxaTurnoverInvoluntario
      } else if (periodoAnalise === "semestral") {
        taxaTurnoverVoluntario = taxaTurnoverVoluntario
        taxaTurnoverInvoluntario = taxaTurnoverInvoluntario
      }
    }
    
    // Cálculo do tempo médio de permanência se solicitado
    let tempoMedioPermanencia = undefined
    
    if (calcularTempoMedio && somaTempoPermanencia !== "") {
      const soma = Number(somaTempoPermanencia)
      tempoMedioPermanencia = demissoes > 0 ? soma / demissoes : 0
    }
    
    // Classificação do turnover
    let classificacao = ""
    let cor = ""
    
    if (taxaTurnoverGeral < 10) {
      classificacao = "Baixo"
      cor = "text-green-600"
    } else if (taxaTurnoverGeral < 20) {
      classificacao = "Aceitável"
      cor = "text-blue-600"
    } else if (taxaTurnoverGeral < 30) {
      classificacao = "Elevado"
      cor = "text-yellow-600"
    } else {
      classificacao = "Crítico"
      cor = "text-red-600"
    }

    // Indicador de benchmark por setor (simplificado)
    let indiceBenchmark = "18%"
    
    // Formata os resultados com a quantidade de casas decimais definidas
    const resultadoFinal: ResultadoTurnover = {
      taxaTurnoverGeral: parseFloat(taxaTurnoverGeral.toFixed(config.decimalPlaces)),
      taxaTurnoverVoluntario: taxaTurnoverVoluntario ? parseFloat(taxaTurnoverVoluntario.toFixed(config.decimalPlaces)) : undefined,
      taxaTurnoverInvoluntario: taxaTurnoverInvoluntario ? parseFloat(taxaTurnoverInvoluntario.toFixed(config.decimalPlaces)) : undefined,
      tempoMedioPermanencia: tempoMedioPermanencia ? parseFloat(tempoMedioPermanencia.toFixed(1)) : undefined,
      indiceBenchmark,
      classificacao,
      cor
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
              <Label htmlFor="totalFuncionariosInicio">
                Total de funcionários no início do período
              </Label>
              <Input
                id="totalFuncionariosInicio"
                type="number"
                min="0"
                placeholder="Ex: 100"
                value={totalFuncionariosInicio}
                onChange={(e) => {
                  const value = e.target.value === "" ? "" : Number(e.target.value);
                  setTotalFuncionariosInicio(value);
                  if (onInputChange) onInputChange("totalFuncionariosInicio", value);
                }}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="totalFuncionariosFim">
                Total de funcionários no fim do período
              </Label>
              <Input
                id="totalFuncionariosFim"
                type="number"
                min="0"
                placeholder="Ex: 105"
                value={totalFuncionariosFim}
                onChange={(e) => {
                  const value = e.target.value === "" ? "" : Number(e.target.value);
                  setTotalFuncionariosFim(value);
                  if (onInputChange) onInputChange("totalFuncionariosFim", value);
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
            <CardTitle>Dados de Rotatividade</CardTitle>
            <CardDescription>
              Informações sobre as demissões ocorridas no período
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!separaPorTipo && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="totalDemissoes">Total de demissões no período</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info size={16} className="text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Inclui todos os tipos de desligamentos: voluntários (pedidos de demissão) e involuntários (demissões pela empresa)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="totalDemissoes"
                  type="number"
                  min="0"
                  placeholder="Ex: 12"
                  value={totalDemissoes}
                  onChange={(e) => {
                    const value = e.target.value === "" ? "" : Number(e.target.value);
                    setTotalDemissoes(value);
                    if (onInputChange) onInputChange("totalDemissoes", value);
                  }}
                />
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="separaPorTipo"
                checked={separaPorTipo}
                onChange={(e) => {
                  setSeparaPorTipo(e.target.checked);
                  if (onInputChange) onInputChange("separaPorTipo", e.target.checked);
                }}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="separaPorTipo" className="cursor-pointer">
                Separar por tipo de demissão
              </Label>
            </div>
            
            {separaPorTipo && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="demissoesVoluntarias">
                    Demissões voluntárias (pedidos de demissão)
                  </Label>
                  <Input
                    id="demissoesVoluntarias"
                    type="number"
                    min="0"
                    placeholder="Ex: 8"
                    value={demissoesVoluntarias}
                    onChange={(e) => {
                      const value = e.target.value === "" ? "" : Number(e.target.value);
                      setDemissoesVoluntarias(value);
                      if (onInputChange) onInputChange("demissoesVoluntarias", value);
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="demissoesInvoluntarias">
                    Demissões involuntárias (pela empresa)
                  </Label>
                  <Input
                    id="demissoesInvoluntarias"
                    type="number"
                    min="0"
                    placeholder="Ex: 4"
                    value={demissoesInvoluntarias}
                    onChange={(e) => {
                      const value = e.target.value === "" ? "" : Number(e.target.value);
                      setDemissoesInvoluntarias(value);
                      if (onInputChange) onInputChange("demissoesInvoluntarias", value);
                    }}
                  />
                </div>
              </>
            )}
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="calcularTempoMedio"
                checked={calcularTempoMedio}
                onChange={(e) => {
                  setCalcularTempoMedio(e.target.checked);
                  if (onInputChange) onInputChange("calcularTempoMedio", e.target.checked);
                }}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="calcularTempoMedio" className="cursor-pointer">
                Calcular tempo médio de permanência
              </Label>
            </div>
            
            {calcularTempoMedio && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="somaTempoPermanencia">
                    Soma do tempo (em meses) de permanência dos funcionários desligados
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info size={16} className="text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Some o tempo em meses que cada funcionário desligado trabalhou na empresa antes de sair</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="somaTempoPermanencia"
                  type="number"
                  min="0"
                  placeholder="Ex: 180 (para 15 anos de experiência total)"
                  value={somaTempoPermanencia}
                  onChange={(e) => {
                    const value = e.target.value === "" ? "" : Number(e.target.value);
                    setSomaTempoPermanencia(value);
                    if (onInputChange) onInputChange("somaTempoPermanencia", value);
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
          onClick={calcularTurnover}
          disabled={!podeCalcular}
        >
          Calcular Taxa de Turnover
        </Button>
      </div>
      
      {resultado && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Resultado da Análise de Turnover</CardTitle>
            <CardDescription>
              Indicadores de rotatividade baseados nos dados informados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg">
              <h3 className="text-3xl font-bold text-gray-800">Taxa de Turnover:</h3>
              <p className={`text-4xl font-bold mt-2 ${resultado.cor}`}>
                {resultado.taxaTurnoverGeral}%
              </p>
              <p className={`text-lg mt-1 ${resultado.cor}`}>
                Classificação: {resultado.classificacao}
              </p>
              <p className="text-gray-600 mt-4">
                Benchmark médio do mercado: {resultado.indiceBenchmark}
              </p>
            </div>
            
            {(resultado.taxaTurnoverVoluntario !== undefined && resultado.taxaTurnoverInvoluntario !== undefined) && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 border rounded-lg text-center">
                  <h4 className="font-medium text-gray-700">Turnover Voluntário</h4>
                  <p className="text-2xl font-bold text-blue-600">{resultado.taxaTurnoverVoluntario}%</p>
                </div>
                <div className="bg-white p-4 border rounded-lg text-center">
                  <h4 className="font-medium text-gray-700">Turnover Involuntário</h4>
                  <p className="text-2xl font-bold text-orange-600">{resultado.taxaTurnoverInvoluntario}%</p>
                </div>
              </div>
            )}
            
            {resultado.tempoMedioPermanencia !== undefined && (
              <div className="bg-white p-4 border rounded-lg text-center">
                <h4 className="font-medium text-gray-700">Tempo Médio de Permanência</h4>
                <p className="text-2xl font-bold text-indigo-600">
                  {resultado.tempoMedioPermanencia} meses
                  <span className="text-base font-normal text-gray-500 ml-2">
                    ({(resultado.tempoMedioPermanencia / 12).toFixed(1)} anos)
                  </span>
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
                      <strong>Turnover Geral:</strong> Representa a porcentagem total de funcionários que deixaram a empresa no período.
                      Taxas abaixo de 10% geralmente são consideradas baixas, entre 10-20% aceitáveis,
                      entre 20-30% elevadas e acima de 30% críticas.
                    </p>
                    
                    {(resultado.taxaTurnoverVoluntario !== undefined) && (
                      <p>
                        <strong>Turnover Voluntário:</strong> Indica os funcionários que decidiram sair por conta própria.
                        Um alto índice pode sinalizar problemas de engajamento, cultura organizacional ou remuneração inadequada.
                      </p>
                    )}
                    
                    {(resultado.taxaTurnoverInvoluntario !== undefined) && (
                      <p>
                        <strong>Turnover Involuntário:</strong> Representa os funcionários desligados pela empresa.
                        Um alto índice pode indicar problemas nos processos de recrutamento e seleção ou necessidade
                        de ajustes no quadro devido a fatores externos.
                      </p>
                    )}
                    
                    {resultado.tempoMedioPermanencia !== undefined && (
                      <p>
                        <strong>Tempo Médio de Permanência:</strong> Mostra quanto tempo, em média, os funcionários
                        que saíram permaneceram na empresa. Um tempo baixo pode indicar problemas na retenção
                        de talentos ou no processo de integração de novos colaboradores.
                      </p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="acoes">
                <AccordionTrigger>Ações recomendadas</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    {resultado.taxaTurnoverGeral < 10 ? (
                      <p>
                        Com um turnover baixo, sua empresa demonstra boa capacidade de retenção.
                        Continue investindo nas práticas atuais de gestão de pessoas e monitore periodicamente
                        para manter estes bons resultados.
                      </p>
                    ) : resultado.taxaTurnoverGeral < 20 ? (
                      <p>
                        Seu turnover está em níveis aceitáveis, mas há espaço para melhorias.
                        Considere realizar pesquisas de clima organizacional e entrevistas de desligamento
                        para identificar oportunidades de aprimoramento na retenção de talentos.
                      </p>
                    ) : resultado.taxaTurnoverGeral < 30 ? (
                      <p>
                        Com um turnover elevado, recomenda-se atenção especial a:
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          <li>Realizar entrevistas de desligamento para entender as causas</li>
                          <li>Revisar práticas de recrutamento e seleção</li>
                          <li>Analisar políticas de remuneração e benefícios</li>
                          <li>Investir em programas de desenvolvimento e planos de carreira</li>
                        </ul>
                      </p>
                    ) : (
                      <p>
                        Seu turnover está em níveis críticos, exigindo ações imediatas:
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          <li>Realizar diagnóstico completo do clima organizacional</li>
                          <li>Revisar processos de gestão de pessoas e liderança</li>
                          <li>Implementar medidas emergenciais de retenção para posições-chave</li>
                          <li>Considerar auxílio de consultoria especializada em retenção de talentos</li>
                          <li>Desenvolver um plano de ação para redução do turnover a curto e médio prazo</li>
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
              <strong>Nota:</strong> A interpretação dos índices de turnover pode variar conforme o setor,
              tamanho da empresa e contexto econômico. Os benchmarks apresentados são referências gerais.
            </p>
            <p>
              Para uma análise mais precisa, recomenda-se comparar seus resultados com empresas do mesmo
              setor e porte, além de analisar a tendência histórica destes índices em sua organização.
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  )
} 