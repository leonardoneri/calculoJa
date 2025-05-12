import type { Calculator } from "@/lib/types"
import Script from "next/script"

interface SchemaOrgCalculationProps {
  calculator: Calculator
  inputs: Record<string, any>
  result: any
}

export function SchemaOrgCalculation({ calculator, inputs, result }: SchemaOrgCalculationProps) {
  // Create schema.org JSON-LD for Calculation
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Calculation",
    name: calculator.title,
    description: calculator.description,
    url: `https://calculadoras-especializadas.vercel.app/calculadora/${calculator.slug}`,
    calculationInputs: Object.entries(inputs).map(([key, value]) => ({
      "@type": "PropertyValue",
      name: key,
      value: value,
    })),
    calculationResults: Object.entries(result).map(([key, value]) => ({
      "@type": "PropertyValue",
      name: key,
      value: value,
    })),
  }

  return (
    <Script
      id={`schema-${calculator.slug}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  )
}
