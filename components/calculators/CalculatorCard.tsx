import Link from "next/link"
import Image from "next/image"
import type { Calculator } from "@/lib/types"
import { ArrowRight } from "lucide-react"

interface CalculatorCardProps {
  calculator: Calculator
}

export default function CalculatorCard({ calculator }: CalculatorCardProps) {
  // Determina a imagem baseada na categoria (ideal seria ter uma imagem específica para cada calculadora)
  const getImagePath = (category: string) => {
    switch (category) {
      case "HEALTH":
        return "/icons/health-calculator.svg"
      case "FINANCE":
        return "/icons/finance-calculator.svg"
      case "CONVERSION":
        return "/icons/conversion-calculator.svg"
      case "VETERINARY":
        return "/icons/veterinary-calculator.svg"
      case "BUSINESS":
        return "/icons/business-calculator.svg"
      default:
        return "/placeholder.svg"
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-blue-100 p-3 rounded-full">
            {calculator.icon ? (
              <span className="text-blue-600 text-xl">{calculator.icon}</span>
            ) : (
              <Image
                src={getImagePath(calculator.category)}
                alt={`Ícone de ${calculator.title}`}
                width={24}
                height={24}
                className="h-6 w-6"
                loading="lazy"
              />
            )}
          </div>
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {getCategoryLabel(calculator.category)}
          </span>
        </div>

        <h3 className="text-xl font-bold mb-2">{calculator.title}</h3>

        <p className="text-gray-600 mb-4 line-clamp-2">{calculator.description}</p>

        <Link
          href={`/calculadora/${calculator.slug}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          aria-label={`Usar a calculadora de ${calculator.title}`}
        >
          Usar calculadora <ArrowRight size={16} className="ml-1" />
        </Link>
      </div>
    </div>
  )
}

function getCategoryLabel(category: string): string {
  switch (category) {
    case "HEALTH":
      return "Saúde"
    case "FINANCE":
      return "Finanças"
    case "CONVERSION":
      return "Conversão"
    case "VETERINARY":
      return "Veterinária"
    case "BUSINESS":
      return "Negócios"
    default:
      return "Geral"
  }
}
