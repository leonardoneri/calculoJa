import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Política de Privacidade - CálculoJá",
  description: "Saiba como tratamos seus dados e a política de anúncios do CálculoJá."
}

export default function PoliticaPrivacidadePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-bold">Política de Privacidade</h1>
      <p>
        Respeitamos sua privacidade e seguimos as diretrizes do Google Ads para coleta e
        uso de dados. Utilizamos cookies para personalização de anúncios e medição de
        desempenho. Você pode desativar a personalização de anúncios nas configurações do
        seu navegador.
      </p>
      <p>
        Não coletamos dados pessoais sensíveis. Quaisquer informações fornecidas são usadas
        apenas para melhorar a experiência no site.
      </p>
    </div>
  )
}
