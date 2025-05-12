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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface SonoIdealCalculatorProps {
  onInputChange?: (name: string, value: any) => void
  onCalculate?: (result: any) => void
  config?: {
    decimalPlaces: number
  }
}

interface FaixaEtaria {
  min: number;
  max: number;
  horasMinimas: number;
  horasMaximas: number;
  label: string;
}

interface ResultadoSono {
  horasRecomendadas: number;
  horasMinimas: number;
  horasMaximas: number;
  faixaEtariaLabel: string;
  ajusteEstiloVida: number;
  qualidadeSono: number;
  horarioDormir: string;
  horarioAcordar: string;
}

export default function SonoIdealCalculator({
  onInputChange,
  onCalculate,
  config = { decimalPlaces: 1 }
}: SonoIdealCalculatorProps) {
  // Estados para os campos de entrada
  const [idade, setIdade] = useState<number | "">("")
  const [estiloVida, setEstiloVida] = useState<string>("moderado")
  const [problemasSono, setProblemasSono] = useState<string>("nenhum")
  const [horarioPreferido, setHorarioPreferido] = useState<string>("equilibrado")
  
  // Estado para o resultado
  const [resultado, setResultado] = useState<ResultadoSono | null>(null)
  
  // Estado para verificar se o cálculo pode ser realizado
  const [podeCalcular, setPodeCalcular] = useState<boolean>(false)
  
  // Verificar se todos os campos obrigatórios foram preenchidos
  useEffect(() => {
    if (
      idade !== "" && 
      estiloVida !== "" &&
      problemasSono !== "" &&
      horarioPreferido !== ""
    ) {
      setPodeCalcular(true)
    } else {
      setPodeCalcular(false)
    }
  }, [idade, estiloVida, problemasSono, horarioPreferido])
  
  // Dados para as faixas etárias e horas de sono recomendadas
  const faixasEtarias: FaixaEtaria[] = [
    { min: 0, max: 3, horasMinimas: 14, horasMaximas: 17, label: "Recém-nascido (0-3 meses)" },
    { min: 4, max: 11, horasMinimas: 12, horasMaximas: 15, label: "Bebê (4-11 meses)" },
    { min: 1, max: 2, horasMinimas: 11, horasMaximas: 14, label: "Criança pequena (1-2 anos)" },
    { min: 3, max: 5, horasMinimas: 10, horasMaximas: 13, label: "Pré-escolar (3-5 anos)" },
    { min: 6, max: 13, horasMinimas: 9, horasMaximas: 11, label: "Idade escolar (6-13 anos)" },
    { min: 14, max: 17, horasMinimas: 8, horasMaximas: 10, label: "Adolescente (14-17 anos)" },
    { min: 18, max: 25, horasMinimas: 7, horasMaximas: 9, label: "Jovem adulto (18-25 anos)" },
    { min: 26, max: 64, horasMinimas: 7, horasMaximas: 9, label: "Adulto (26-64 anos)" },
    { min: 65, max: 120, horasMinimas: 7, horasMaximas: 8, label: "Idoso (65+ anos)" }
  ];

  // Componente de Select isolado para evitar sobreposições
  const EstiloVidaSelect = () => (
    <div className="space-y-2">
      <Label htmlFor="estiloVida">Estilo de Vida</Label>
      <Select
        value={estiloVida}
        onValueChange={(value) => {
          setEstiloVida(value)
          if (onInputChange) onInputChange("estiloVida", value)
        }}
      >
        <SelectTrigger id="estiloVida">
          <SelectValue placeholder="Selecione seu estilo de vida" />
        </SelectTrigger>
        <SelectContent sideOffset={5} className="bg-white shadow-lg rounded-md border border-gray-200">
          <SelectItem value="sedentario">Sedentário (pouca atividade física)</SelectItem>
          <SelectItem value="leve">Levemente ativo (exercícios leves 1-3× por semana)</SelectItem>
          <SelectItem value="moderado">Moderadamente ativo (exercícios moderados 3-5× por semana)</SelectItem>
          <SelectItem value="intenso">Muito ativo (exercícios intensos 6-7× por semana)</SelectItem>
          <SelectItem value="extremo">Extremamente ativo (atleta/trabalho físico intenso)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  const ProblemasSonoSelect = () => (
    <div className="space-y-2">
      <Label htmlFor="problemasSono">Problemas de Sono</Label>
      <Select
        value={problemasSono}
        onValueChange={(value) => {
          setProblemasSono(value)
          if (onInputChange) onInputChange("problemasSono", value)
        }}
      >
        <SelectTrigger id="problemasSono">
          <SelectValue placeholder="Selecione se você tem problemas de sono" />
        </SelectTrigger>
        <SelectContent sideOffset={5} className="bg-white shadow-lg rounded-md border border-gray-200">
          <SelectItem value="nenhum">Nenhum problema significativo</SelectItem>
          <SelectItem value="dificuldade_dormir">Dificuldade para adormecer</SelectItem>
          <SelectItem value="acordar_noite">Acordar durante a noite</SelectItem>
          <SelectItem value="insonia">Insônia crônica</SelectItem>
          <SelectItem value="apneia">Apneia do sono</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  // Função para calcular as horas ideais de sono
  const calcularSonoIdeal = () => {
    if (!podeCalcular) return;
    
    // Conversão explícita de tipos
    const idadeNum = typeof idade === "string" ? parseFloat(idade) : idade;
    
    // Encontrar a faixa etária correspondente
    const faixaEtaria = faixasEtarias.find(faixa => {
      // Caso especial para bebês e crianças pequenas (idade em meses ou anos)
      if (faixa.min < 1 && idadeNum < 1) {
        return idadeNum * 12 >= faixa.min && idadeNum * 12 <= faixa.max;
      }
      return idadeNum >= faixa.min && idadeNum <= faixa.max;
    });
    
    if (!faixaEtaria) {
      console.error("Faixa etária não encontrada");
      return;
    }

    // Horas base recomendadas (média da faixa)
    let horasBase = (faixaEtaria.horasMinimas + faixaEtaria.horasMaximas) / 2;
    
    // Ajustes baseados no estilo de vida
    let ajusteEstiloVida = 0;
    switch (estiloVida) {
      case "sedentario":
        ajusteEstiloVida = -0.5; // Pessoas sedentárias podem precisar de menos sono
        break;
      case "leve":
        ajusteEstiloVida = 0;
        break;
      case "moderado":
        ajusteEstiloVida = 0.3; // Atividade moderada aumenta necessidade de recuperação
        break;
      case "intenso":
        ajusteEstiloVida = 0.7; // Atividade intensa requer mais sono para recuperação
        break;
      case "extremo":
        ajusteEstiloVida = 1.0; // Atletas e trabalhadores físicos precisam de mais sono
        break;
    }
    
    // Ajustes baseados em problemas de sono
    let ajusteProblemas = 0;
    switch (problemasSono) {
      case "nenhum":
        ajusteProblemas = 0;
        break;
      case "dificuldade_dormir":
        ajusteProblemas = 0.5;
        break;
      case "acordar_noite":
        ajusteProblemas = 0.7;
        break;
      case "insonia":
        ajusteProblemas = 1.0;
        break;
      case "apneia":
        ajusteProblemas = 0.8;
        break;
    }
    
    // Ajuste para preferência de horário
    let ajusteHorario = 0;
    switch (horarioPreferido) {
      case "manha":
        ajusteHorario = -0.3; // Pessoas matutinas geralmente precisam de menos sono
        break;
      case "noite":
        ajusteHorario = 0.3;  // Pessoas noturnas podem precisar de mais sono
        break;
      case "equilibrado":
        ajusteHorario = 0;
        break;
    }
    
    // Cálculo final
    const horasRecomendadas = Math.min(
      faixaEtaria.horasMaximas,
      Math.max(
        faixaEtaria.horasMinimas,
        horasBase + ajusteEstiloVida + ajusteProblemas + ajusteHorario
      )
    );
    
    // Cálculo de qualidade potencial do sono (em porcentagem)
    let qualidadeSono = 100;
    if (problemasSono !== "nenhum") {
      qualidadeSono -= 10 * ajusteProblemas;
    }
    
    // Horários sugeridos
    let horaDormir = "";
    let horaAcordar = "";
    
    // Definir hora de acordar com base na preferência
    let acordarHora = 0;
    switch (horarioPreferido) {
      case "manha":
        acordarHora = 6;
        break;
      case "noite":
        acordarHora = 8;
        break;
      case "equilibrado":
        acordarHora = 7;
        break;
    }
    
    // Cálculo do horário para dormir
    const dormirHora = (24 + acordarHora - Math.floor(horasRecomendadas)) % 24;
    const dormirMinutos = Math.round((horasRecomendadas % 1) * 60);
    
    // Formatar horários
    horaDormir = `${dormirHora.toString().padStart(2, '0')}:${dormirMinutos.toString().padStart(2, '0')}`;
    horaAcordar = `${acordarHora.toString().padStart(2, '0')}:00`;
    
    const resultadoFinal: ResultadoSono = {
      horasRecomendadas: parseFloat(horasRecomendadas.toFixed(config.decimalPlaces)),
      horasMinimas: faixaEtaria.horasMinimas,
      horasMaximas: faixaEtaria.horasMaximas,
      faixaEtariaLabel: faixaEtaria.label,
      ajusteEstiloVida: ajusteEstiloVida,
      qualidadeSono: Math.round(qualidadeSono),
      horarioDormir: horaDormir,
      horarioAcordar: horaAcordar
    };
    
    setResultado(resultadoFinal);
    
    // Callback para o componente pai
    if (onCalculate) {
      onCalculate(resultadoFinal);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dados Pessoais</CardTitle>
            <CardDescription>
              Insira seus dados para calcular suas horas ideais de sono
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="idade">Idade (anos)</Label>
              <Input
                id="idade"
                type="number"
                placeholder="Ex: 30"
                value={idade}
                onChange={(e) => {
                  const value = e.target.value === "" ? "" : parseFloat(e.target.value);
                  setIdade(value);
                  if (onInputChange) onInputChange("idade", value);
                }}
              />
              <p className="text-xs text-gray-500">
                Para bebês menores de 1 ano, use decimais (ex: 0.5 para 6 meses)
              </p>
            </div>
            
            <EstiloVidaSelect />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Fatores de Sono</CardTitle>
            <CardDescription>
              Informações sobre seu padrão de sono
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ProblemasSonoSelect />
            
            <div className="space-y-3">
              <Label>Preferência de Horário</Label>
              <RadioGroup 
                value={horarioPreferido}
                onValueChange={(value) => {
                  setHorarioPreferido(value);
                  if (onInputChange) onInputChange("horarioPreferido", value);
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="manha" id="manha" />
                  <Label htmlFor="manha" className="cursor-pointer">Matutino (prefere acordar cedo)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="equilibrado" id="equilibrado" />
                  <Label htmlFor="equilibrado" className="cursor-pointer">Equilibrado</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="noite" id="noite" />
                  <Label htmlFor="noite" className="cursor-pointer">Noturno (prefere ficar acordado até tarde)</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-center">
        <Button 
          size="lg"
          onClick={calcularSonoIdeal}
          disabled={!podeCalcular}
        >
          Calcular Horas Ideais de Sono
        </Button>
      </div>
      
      {resultado && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Suas Horas Ideais de Sono</CardTitle>
            <CardDescription>
              Baseado nos seus dados e na ciência do sono
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center p-6 bg-indigo-50 rounded-lg">
              <h3 className="text-3xl font-bold text-indigo-700">{resultado.horasRecomendadas} horas</h3>
              <p className="text-gray-600 mt-2">Recomendação diária para sua faixa etária e estilo de vida</p>
              
              <div className="mt-4 w-full max-w-md grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-lg text-center shadow-sm">
                  <p className="text-sm text-gray-500">Horário para dormir</p>
                  <p className="text-xl font-semibold text-indigo-600">{resultado.horarioDormir}</p>
                </div>
                <div className="bg-white p-3 rounded-lg text-center shadow-sm">
                  <p className="text-sm text-gray-500">Horário para acordar</p>
                  <p className="text-xl font-semibold text-indigo-600">{resultado.horarioAcordar}</p>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-3">Detalhes da Recomendação:</h4>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Faixa Etária</TableCell>
                    <TableCell>{resultado.faixaEtariaLabel}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Faixa Recomendada</TableCell>
                    <TableCell>{resultado.horasMinimas} a {resultado.horasMaximas} horas</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Ajuste por Estilo de Vida</TableCell>
                    <TableCell>
                      {resultado.ajusteEstiloVida > 0 
                        ? `+${resultado.ajusteEstiloVida.toFixed(1)} horas` 
                        : resultado.ajusteEstiloVida < 0 
                          ? `${resultado.ajusteEstiloVida.toFixed(1)} horas`
                          : "Nenhum ajuste"}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            
            <Accordion type="single" collapsible>
              <AccordionItem value="ciclos">
                <AccordionTrigger>Sobre os Ciclos de Sono</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-gray-600 mb-2">
                    Um ciclo de sono completo dura aproximadamente 90 minutos. Durante a noite, passamos por 4-6 ciclos.
                  </p>
                  <p className="text-sm text-gray-600">
                    Cada ciclo inclui sono leve, sono profundo e sono REM. Acordar no final de um ciclo, em vez de no meio, 
                    pode ajudar a evitar a sensação de cansaço.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="qualidade">
                <AccordionTrigger>Melhorando a Qualidade do Sono</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                    <li>Mantenha um horário regular para dormir e acordar</li>
                    <li>Evite cafeína e álcool próximo da hora de dormir</li>
                    <li>Crie um ambiente escuro, silencioso e confortável</li>
                    <li>Limite o uso de telas pelo menos 1 hora antes de dormir</li>
                    <li>Pratique relaxamento antes de deitar (meditação, respiração profunda)</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-500">
              Nota: Esta é uma estimativa baseada em recomendações científicas gerais. Fatores individuais, 
              condições médicas e outros aspectos podem influenciar suas necessidades específicas de sono.
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  )
} 