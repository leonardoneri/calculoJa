import { getRelatedCalculators } from "@/lib/calculators"
import CalculatorCard from "./CalculatorCard"

interface RelatedCalculatorsProps {
  currentSlug: string
  category: string
}

export default async function RelatedCalculators({ currentSlug, category }: RelatedCalculatorsProps) {
  const relatedCalculators = await getRelatedCalculators(currentSlug, category)

  if (relatedCalculators.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {relatedCalculators.map((calculator) => (
        <CalculatorCard key={calculator.slug} calculator={calculator} />
      ))}
    </div>
  )
}
