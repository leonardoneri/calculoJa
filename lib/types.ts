export enum CalculatorCategory {
  HEALTH = "HEALTH",
  FINANCE = "FINANCE",
  CONVERSION = "CONVERSION",
  VETERINARY = "VETERINARY",
  BUSINESS = "BUSINESS",
  OTHER = "OTHER",
}

// Helper para converter string para enum CalculatorCategory
export function stringToCategory(category: string): CalculatorCategory | undefined {
  const normalizedCategory = category.toUpperCase();
  if (Object.values(CalculatorCategory).includes(normalizedCategory as CalculatorCategory)) {
    return normalizedCategory as CalculatorCategory;
  }
  
  // Mapeamento de URL para enum
  const urlToCategoryMap: Record<string, CalculatorCategory> = {
    'health': CalculatorCategory.HEALTH,
    'finance': CalculatorCategory.FINANCE,
    'conversion': CalculatorCategory.CONVERSION,
    'veterinary': CalculatorCategory.VETERINARY,
    'business': CalculatorCategory.BUSINESS,
    'other': CalculatorCategory.OTHER,
  };
  
  return urlToCategoryMap[category.toLowerCase()];
}

export interface Calculator {
  id: string
  slug: string
  title: string
  description: string
  category: CalculatorCategory
  type: string
  icon?: string
  keywords: string[]
  content: string // MDX content
  faq: string // MDX content for FAQ
  config: any // Configuration specific to this calculator
}

export interface CalculatorInput {
  name: string
  label: string
  type: "number" | "text" | "select" | "radio" | "checkbox"
  placeholder?: string
  defaultValue?: any
  options?: { value: string; label: string }[]
  validation?: {
    required?: boolean
    min?: number
    max?: number
    pattern?: string
  }
}

export interface CalculatorConfig {
  inputs: CalculatorInput[]
  formula: string
  resultLabels: Record<string, string>
}
