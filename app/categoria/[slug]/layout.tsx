import { generateSchemaOrg, SchemaOrg } from "@/components/SchemaOrg";

export default async function CategoryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const { slug } = params;
  
  const schemas = await generateSchemaOrg({
    type: 'category',
    data: slug
  });

  return (
    <>
      <SchemaOrg schemas={schemas} />
      {children}
    </>
  );
} 