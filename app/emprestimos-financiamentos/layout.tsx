import { generateSchemaOrg, SchemaOrg } from "@/components/SchemaOrg";

export default async function EmprestimosFinanciamentosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const schemas = await generateSchemaOrg({
    type: 'emprestimos-financiamentos',
    data: null
  });

  return (
    <>
      <SchemaOrg schemas={schemas} />
      {children}
    </>
  );
} 