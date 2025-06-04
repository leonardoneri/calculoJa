import { generateSchemaOrg, SchemaOrg } from '@/components/SchemaOrg'

export default async function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const schemas = await generateSchemaOrg({ type: 'blog', data: null })
  return (
    <>
      <SchemaOrg schemas={schemas} />
      {children}
    </>
  )
}
