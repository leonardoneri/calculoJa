import { generateSchemaOrg, SchemaOrg } from "@/components/SchemaOrg"

export default async function TermosDeUsoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const schemas = await generateSchemaOrg({
    type: 'termos-de-uso',
    data: null
  })

  return (
    <>
      <SchemaOrg schemas={schemas} />
      {children}
    </>
  )
}
