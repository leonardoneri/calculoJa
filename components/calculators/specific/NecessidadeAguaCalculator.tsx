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
import { Slider } from "@/components/ui/slider"

interface NecessidadeAguaCalculatorProps {
  onInputChange?: (name: string, value: any) => void
  onCalculate?: (result: any) => void
  config?: {
    decimalPlaces: number
  }
}

export default function NecessidadeAguaCalculator({
  onInputChange,
  onCalculate,
  config = { decimalPlaces: 2 }
}: NecessidadeAguaCalculatorProps) {
  // Estados para os campos de entrada
  const [peso, setPeso] = useState<number | "">("")
  const [idade, setIdade] = useState<number | "">("")
  const [genero, setGenero] = useState<string>("masculino")
  const [nivelAtividade, setNivelAtividade] = useState<string>("moderado")
  const [clima, setClima] = useState<string>("temperado")
  
  // Estado para o resultado
  const [resultado, setResultado] = useState<{
    totalMl: number;
    totalLitros: number;
    copos: number;
    ajustePorAtividade: number;
    ajustePorClima: number;
  } | null>(null)
  
  // Estado para verificar se o cálculo pode ser realizado
  const [podeCalcular, setPodeCalcular] = useState<boolean>(false)
  
  // Verificar se todos os campos obrigatórios foram preenchidos
  useEffect(() => {
    if (
      peso !== "" && 
      idade !== "" && 
      genero !== "" &&
      nivelAtividade !== "" &&
      clima !== ""
    ) {
      setPodeCalcular(true)
    } else {
      setPodeCalcular(false)
    }
  }, [peso, idade, genero, nivelAtividade, clima])
  
  // Função para calcular a necessidade diária de água
  const calcularNecessidadeAgua = () => {
    if (!podeCalcular) return
    
    // Conversão explícita de tipos
    const pesoNum = typeof peso === "string" ? parseFloat(peso) : peso
    const idadeNum = typeof idade === "string" ? parseFloat(idade) : idade
    
    // Cálculo base: 35ml por kg de peso corporal para adultos jovens
    // Ajustes são feitos com base em idade, gênero, nível de atividade e clima
    let necessidadeBase = pesoNum * 35
    
    // Ajuste por idade
    let fatorIdade = 1.0
    if (idadeNum < 18) {
      fatorIdade = 1.1 // Crianças e adolescentes precisam de mais água por kg
    } else if (idadeNum > 55) {
      fatorIdade = 0.9 // Idosos podem precisar de menos devido a diferenças metabólicas
    }
    
    // Ajuste por gênero
    let fatorGenero = genero === "masculino" ? 1.0 : 0.9
    
    // Ajuste por nível de atividade
    let fatorAtividade = 1.0
    switch (nivelAtividade) {
      case "sedentario":
        fatorAtividade = 0.85
        break
      case "leve":
        fatorAtividade = 1.0
        break
      case "moderado":
        fatorAtividade = 1.2
        break
      case "intenso":
        fatorAtividade = 1.5
        break
      default:
        fatorAtividade = 1.0
    }
    
    // Ajuste por clima
    let fatorClima = 1.0
    switch (clima) {
      case "frio":
        fatorClima = 0.9
        break
      case "temperado":
        fatorClima = 1.0
        break
      case "quente":
        fatorClima = 1.2
        break
      case "muitoquente":
        fatorClima = 1.4
        break
      default:
        fatorClima = 1.0
    }
    
    // Cálculo final
    const totalMl = Math.round(necessidadeBase * fatorIdade * fatorGenero * fatorAtividade * fatorClima)
    const totalLitros = totalMl / 1000
    const copos = Math.ceil(totalMl / 250) // Considerando copos de 250ml
    
    const resultadoFinal = {
      totalMl,
      totalLitros: parseFloat(totalLitros.toFixed(config.decimalPlaces)),
      copos,
      ajustePorAtividade: fatorAtividade,
      ajustePorClima: fatorClima
    }
    
    setResultado(resultadoFinal)
    
    // Callback para o componente pai
    if (onCalculate) {
      onCalculate(resultadoFinal)
    }
  }

  // Componente de Select isolado para evitar sobreposições
  const GeneroSelect = () => (
    <div className="space-y-2">
      <Label htmlFor="genero">Gênero</Label>
      <Select
        value={genero}
        onValueChange={(value) => {
          setGenero(value)
          if (onInputChange) onInputChange("genero", value)
        }}
      >
        <SelectTrigger id="genero">
          <SelectValue placeholder="Selecione seu gênero" />
        </SelectTrigger>
        <SelectContent sideOffset={5} className="bg-white shadow-lg rounded-md border border-gray-200">
          <SelectItem value="masculino">Masculino</SelectItem>
          <SelectItem value="feminino">Feminino</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  const AtividadeSelect = () => (
    <div className="space-y-2">
      <Label htmlFor="nivelAtividade">Nível de Atividade Física</Label>
      <Select
        value={nivelAtividade}
        onValueChange={(value) => {
          setNivelAtividade(value)
          if (onInputChange) onInputChange("nivelAtividade", value)
        }}
      >
        <SelectTrigger id="nivelAtividade">
          <SelectValue placeholder="Selecione seu nível de atividade" />
        </SelectTrigger>
        <SelectContent sideOffset={5} className="bg-white shadow-lg rounded-md border border-gray-200">
          <SelectItem value="sedentario">Sedentário</SelectItem>
          <SelectItem value="leve">Leve (1-2 dias por semana)</SelectItem>
          <SelectItem value="moderado">Moderado (3-5 dias por semana)</SelectItem>
          <SelectItem value="intenso">Intenso (6-7 dias por semana)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  const ClimaSelect = () => (
    <div className="space-y-2">
      <Label htmlFor="clima">Clima da Região</Label>
      <Select
        value={clima}
        onValueChange={(value) => {
          setClima(value)
          if (onInputChange) onInputChange("clima", value)
        }}
      >
        <SelectTrigger id="clima">
          <SelectValue placeholder="Selecione o clima da sua região" />
        </SelectTrigger>
        <SelectContent sideOffset={5} className="bg-white shadow-lg rounded-md border border-gray-200">
          <SelectItem value="frio">Frio (abaixo de 15°C)</SelectItem>
          <SelectItem value="temperado">Temperado (15-25°C)</SelectItem>
          <SelectItem value="quente">Quente (25-32°C)</SelectItem>
          <SelectItem value="muitoquente">Muito Quente (acima de 32°C)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
  
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>
              Insira seus dados para calcular sua necessidade diária de água
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="peso">Peso (kg)</Label>
              <Input
                id="peso"
                type="number"
                placeholder="Ex: 70"
                value={peso}
                onChange={(e) => {
                  const value = e.target.value === "" ? "" : parseFloat(e.target.value)
                  setPeso(value)
                  if (onInputChange) onInputChange("peso", value)
                }}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="idade">Idade (anos)</Label>
              <Input
                id="idade"
                type="number"
                placeholder="Ex: 35"
                value={idade}
                onChange={(e) => {
                  const value = e.target.value === "" ? "" : parseInt(e.target.value)
                  setIdade(value)
                  if (onInputChange) onInputChange("idade", value)
                }}
              />
            </div>
            
            <GeneroSelect />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Fatores Adicionais</CardTitle>
            <CardDescription>
              Estes fatores podem influenciar sua necessidade de água
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <AtividadeSelect />
            
            <ClimaSelect />
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-center">
        <Button 
          size="lg"
          onClick={calcularNecessidadeAgua}
          disabled={!podeCalcular}
        >
          Calcular Necessidade de Água
        </Button>
      </div>
      
      {resultado && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Sua Necessidade Diária de Água</CardTitle>
            <CardDescription>
              Baseado nos dados informados, esta é a quantidade recomendada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg">
              <h3 className="text-3xl font-bold text-blue-600">{resultado.totalLitros} litros</h3>
              <p className="text-gray-600">aproximadamente {resultado.copos} copos de água (250ml) por dia</p>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <h4 className="font-medium">Detalhes do Cálculo:</h4>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Volume em Mililitros</TableCell>
                    <TableCell>{resultado.totalMl} ml</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Ajuste por Atividade Física</TableCell>
                    <TableCell>{`${Math.round(resultado.ajustePorAtividade * 100)}%`}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Ajuste por Clima</TableCell>
                    <TableCell>{`${Math.round(resultado.ajustePorClima * 100)}%`}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-500">
              Nota: Esta é uma estimativa geral. Fatores individuais como condições médicas ou medicamentos podem 
              alterar suas necessidades. Consulte um profissional de saúde para recomendações personalizadas.
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  )
} 