import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCalculatorBySlug, getAllCalculators } from "@/lib/calculators"
import CalculatorComponent from "@/components/calculators/CalculatorComponent"
import { MDXRemote } from "next-mdx-remote/rsc"
import RelatedCalculators from "@/components/calculators/RelatedCalculators"
import AdBanner from "@/components/ads/AdBanner"
import { Suspense } from "react"
import CalculatorSkeleton from "@/components/calculators/CalculatorSkeleton"
import AdBannerErrorBoundary from "@/components/ads/AdBannerErrorBoundary"

export const revalidate = 86400 // Revalidate once per day

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const calculator = await getCalculatorBySlug(params.slug)

  if (!calculator) {
    return {
      title: "Calculadora não encontrada",
    }
  }

  return {
    title: `${calculator.title} - Calculadora Online`,
    description: calculator.description,
    keywords: calculator.keywords,
    openGraph: {
      title: `${calculator.title} - Calculadora Online Gratuita`,
      description: calculator.description,
      type: "website",
    },
  }
}

export async function generateStaticParams() {
  const calculators = await getAllCalculators()

  return calculators.map((calculator) => ({
    slug: calculator.slug,
  }))
}

export default async function CalculatorPage({ params }: Props) {
  const calculator = await getCalculatorBySlug(params.slug)

  if (!calculator) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{calculator.title}</h1>

      <div className="prose max-w-none mb-8">
        <MDXRemote source={calculator.content} />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <Suspense fallback={<CalculatorSkeleton />}>
          <CalculatorComponent slug={calculator.slug} />
        </Suspense>
      </div>

      <AdBannerErrorBoundary>
        <AdBanner position="below-calculator" />
      </AdBannerErrorBoundary>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Perguntas Frequentes</h2>
        <div className="prose max-w-none mb-8">
          <MDXRemote source={calculator.faq} />
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Calculadoras Relacionadas</h2>
        <RelatedCalculators currentSlug={calculator.slug} category={calculator.category} />
      </div>
    </div>
  )
}
