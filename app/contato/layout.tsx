import { generateSchemaOrg, SchemaOrg } from "@/components/SchemaOrg";

export default async function ContatoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const schemas = await generateSchemaOrg({
    type: 'contato',
    data: null
  });

  return (
    <>
      <SchemaOrg schemas={schemas} />
      {children}
    </>
  );
}
