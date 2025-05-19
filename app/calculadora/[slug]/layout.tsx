import { generateSchemaOrg, SchemaOrg } from "@/components/SchemaOrg";
import { getAllCalculators } from "@/lib/calculators";

export default async function CalculatorLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const { slug } = params;
  
  // Obtém todas as calculadoras
  const calculators = await getAllCalculators();
  
  // Encontra a calculadora pelo slug
  const calculator = calculators.find(calc => calc.slug === slug);
  
  const schemas = await generateSchemaOrg({
    type: 'calculator',
    data: calculator
  });

  return (
    <>
      <SchemaOrg schemas={schemas} />
      {children}
    </>
  );
} 