import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contato - CálculoJá",
  description: "Entre em contato com a equipe do CálculoJá."
}

export default function ContatoPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-bold">Fale Conosco</h1>
      <p>
        Para dúvidas, sugestões ou para reportar algum problema, envie um e-mail para
        <a href="mailto:contato@calculoja.com" className="text-blue-600 hover:underline ml-1">contato@calculoja.com</a>.
      </p>
      <p>Responderemos o mais breve possível.</p>
    </div>
  )
}
