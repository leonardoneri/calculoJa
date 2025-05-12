import type { Calculator, CalculatorCategory } from "./types"
import fs from "fs/promises"
import path from "path"
import matter from "gray-matter"

// Path to calculators content
const calculatorsDirectory = path.join(process.cwd(), "content/calculators")

// Get all calculators
export async function getAllCalculators(): Promise<Calculator[]> {
  try {
    const fileNames = await fs.readdir(calculatorsDirectory)

    const calculators = await Promise.all(
      fileNames.map(async (fileName) => {
        const slug = fileName.replace(/\.mdx$/, "")
        return getCalculatorBySlug(slug)
      }),
    )

    // Filter out any undefined calculators and sort by title
    return calculators
      .filter((calculator): calculator is Calculator => calculator !== undefined)
      .sort((a, b) => a.title.localeCompare(b.title))
  } catch (error) {
    console.error("Error getting calculators:", error)
    return []
  }
}

// Get calculator by slug
export async function getCalculatorBySlug(slug: string): Promise<Calculator | undefined> {
  try {
    const fullPath = path.join(calculatorsDirectory, `${slug}.mdx`)
    const fileContents = await fs.readFile(fullPath, "utf8")

    // Use gray-matter to parse the calculator metadata section
    const { data, content } = matter(fileContents)

    // Split content and FAQ
    const contentParts = content.split("---FAQ---")
    const mainContent = contentParts[0]
    const faqContent = contentParts[1] || ""

    return {
      id: data.id || slug,
      slug,
      title: data.title,
      description: data.description,
      category: data.category as CalculatorCategory,
      type: data.type,
      icon: data.icon,
      keywords: data.keywords || [],
      content: mainContent,
      faq: faqContent,
      config: data.config || {},
    }
  } catch (error) {
    console.error(`Error getting calculator ${slug}:`, error)
    return undefined
  }
}

// Get related calculators
export async function getRelatedCalculators(currentSlug: string, category: string, limit = 3): Promise<Calculator[]> {
  const allCalculators = await getAllCalculators()

  // Filter calculators by category and exclude current calculator
  return allCalculators
    .filter((calculator) => calculator.slug !== currentSlug && calculator.category === category)
    .slice(0, limit)
}

// Get calculators by category
export async function getCalculatorsByCategory(category: CalculatorCategory): Promise<Calculator[]> {
  const allCalculators = await getAllCalculators()

  return allCalculators.filter((calculator) => calculator.category === category)
}

// Search calculators
export async function searchCalculators(query: string): Promise<Calculator[]> {
  const allCalculators = await getAllCalculators()

  if (!query) {
    return allCalculators
  }

  const searchTerms = query.toLowerCase().split(" ")

  return allCalculators.filter((calculator) => {
    const searchableText = `
      ${calculator.title.toLowerCase()} 
      ${calculator.description.toLowerCase()} 
      ${calculator.keywords.join(" ").toLowerCase()}
    `

    return searchTerms.some((term) => searchableText.includes(term))
  })
}
