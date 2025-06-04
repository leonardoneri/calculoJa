export default function PostNotFound() {
  return (
    <div className="max-w-2xl mx-auto text-center py-12">
      <h1 className="text-4xl font-bold mb-4">Artigo não encontrado</h1>
      <p className="text-gray-600 mb-6">O artigo que você procura não está disponível.</p>
      <a href="/blog" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
        Voltar para o blog
      </a>
    </div>
  )
}
