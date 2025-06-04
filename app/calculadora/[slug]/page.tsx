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
import { SchemaOrg, generateSchemaOrg } from "@/components/SchemaOrg"

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

  const formattedTitle = `${calculator.title} - Calculadora Online Gratuita | CálculoJá`

  return {
    title: formattedTitle,
    description: calculator.description,
    keywords: calculator.keywords ? calculator.keywords.join(", ") : undefined,
    alternates: {
      canonical: `https://www.calculoja.com/calculadora/${calculator.slug}`,
    },
    openGraph: {
      title: formattedTitle,
      description: calculator.description,
      type: "website",
      url: `https://www.calculoja.com/calculadora/${calculator.slug}`,
      images: [
        {
          url: '/calculoja-og.png',
          width: 1200,
          height: 630,
          alt: `${calculator.title} - CálculoJá`,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: formattedTitle,
      description: calculator.description,
    },
  }
}

export async function generateStaticParams() {
  const calculators = await getAllCalculators()

  return calculators.map((calculator) => ({
    slug: calculator.slug,
  }))
}

// Componente para extrair FAQ do conteúdo MDX para uso no Schema.org
function extractFaqItems(faqContent: string): Array<{question: string, answer: string}> {
  if (!faqContent) return [];
  
  // Versão modificada sem o flag 's' (dotAll) incompatível
  const faqs: Array<{question: string, answer: string}> = [];
  const sections = faqContent.split(/\n## /);
  
  // Pula o primeiro item se não começar com ##
  const startIndex = sections[0].startsWith('## ') ? 0 : 1;
  
  for (let i = startIndex; i < sections.length; i++) {
    let section = sections[i];
    if (i === 0 && !section.startsWith('## ')) {
      section = '## ' + section;
    }
    
    const questionMatch = section.match(/^(?:## )?(.+?)(?:\n|$)/);
    if (!questionMatch) continue;
    
    const question = questionMatch[1].trim();
    
    // Pega o conteúdo após a primeira quebra de linha até a próxima questão
    const contentAfterTitle = section.substring(questionMatch[0].length).trim();
    
    faqs.push({
      question,
      answer: contentAfterTitle
    });
  }
  
  return faqs;
}

export default async function CalculatorPage({ params }: Props) {
  const calculator = await getCalculatorBySlug(params.slug)

  if (!calculator) {
    notFound()
  }
  
  // Gera os schemas para a página da calculadora
  const faqItems = extractFaqItems(calculator.faq || '');
  
  const schemas = await generateSchemaOrg({
    type: 'calculator',
    data: {
      ...calculator,
      faqItems
    }
  });

  return (
    <>
      {/* Adiciona Schema.org específico para esta página */}
      <SchemaOrg schemas={schemas} />
      
      <div className="max-w-4xl mx-auto">
        <article>
          <header>
            <h1 className="text-3xl font-bold mb-4">{calculator.title}</h1>
          </header>

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

          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-4" id="faq">Perguntas Frequentes</h2>
            <div className="prose max-w-none mb-8">
              <MDXRemote source={calculator.faq} />
            </div>
          </section>
        </article>

        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Calculadoras Relacionadas</h2>
          <RelatedCalculators currentSlug={calculator.slug} category={calculator.category} />
        </section>
      </div>
    </>
  )
}
