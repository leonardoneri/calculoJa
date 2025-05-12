import { Suspense } from "react"
import Link from "next/link"

function NotFoundContent() {
  return (
    <div className="text-center py-20">
      <h2 className="text-3xl font-bold mb-4">Página não encontrada</h2>
      <p className="text-lg mb-8">Não foi possível encontrar a página que você está procurando.</p>
      <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Voltar para a página inicial
      </Link>
    </div>
  )
}

export default function NotFound() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <NotFoundContent />
    </Suspense>
  )
}
