import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Termos de Uso - CálculoJá",
  description: "Entenda as condições para utilização do CálculoJá."
}

export default function TermosDeUsoPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-bold">Termos de Uso</h1>
      <p>
        O uso deste site implica a aceitação integral destes termos. As
        calculadoras são fornecidas \"como estão\" e não garantimos a
        precisão absoluta dos resultados.
      </p>
      <p>
        É proibido utilizar nossos serviços para atividades ilegais ou que violem
        as políticas do Google Ads.
      </p>
    </div>
  )
}
