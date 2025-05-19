import { generateSchemaOrg, SchemaOrg } from "@/components/SchemaOrg";

export default async function RecursosHumanosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const schemas = await generateSchemaOrg({
    type: 'recursos-humanos',
    data: null
  });

  return (
    <>
      <SchemaOrg schemas={schemas} />
      {children}
    </>
  );
} 