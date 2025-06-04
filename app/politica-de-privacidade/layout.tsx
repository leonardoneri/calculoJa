import { generateSchemaOrg, SchemaOrg } from "@/components/SchemaOrg"

export default async function PoliticaPrivacidadeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const schemas = await generateSchemaOrg({
    type: 'politica-de-privacidade',
    data: null
  })

  return (
    <>
      <SchemaOrg schemas={schemas} />
      {children}
    </>
  )
}
