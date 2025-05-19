import { generateSchemaOrg, SchemaOrg } from "@/components/SchemaOrg";

export default async function SobreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const schemas = await generateSchemaOrg({
    type: 'sobre',
    data: null
  });

  return (
    <>
      <SchemaOrg schemas={schemas} />
      {children}
    </>
  );
} 