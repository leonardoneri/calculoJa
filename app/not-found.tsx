import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">Página não encontrada</h1>
      <p className="text-lg text-gray-600 mb-8">
        Não foi possível encontrar a página que você está procurando.
      </p>
      
      <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
        <Link 
          href="/" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-center"
        >
          Voltar para a página inicial
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Categorias disponíveis</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold mb-3 text-blue-700">Saúde</h3>
            <div className="flex flex-col space-y-2">
              <Link href="/categoria/health" className="text-blue-600 hover:text-blue-800 hover:underline py-1">
                Ver calculadoras de saúde
              </Link>
            </div>
          </div>
          
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold mb-3 text-blue-700">Finanças</h3>
            <div className="flex flex-col space-y-2">
              <Link href="/categoria/finance" className="text-blue-600 hover:text-blue-800 hover:underline py-1">
                Ver calculadoras financeiras
              </Link>
            </div>
          </div>
          
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold mb-3 text-blue-700">Conversões</h3>
            <div className="flex flex-col space-y-2">
              <Link href="/categoria/conversion" className="text-blue-600 hover:text-blue-800 hover:underline py-1">
                Ver calculadoras de conversão
              </Link>
            </div>
          </div>
          
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold mb-3 text-blue-700">Veterinária</h3>
            <div className="flex flex-col space-y-2">
              <Link href="/categoria/veterinary" className="text-blue-600 hover:text-blue-800 hover:underline py-1">
                Ver calculadoras veterinárias
              </Link>
            </div>
          </div>
          
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 md:col-span-2">
            <h3 className="text-xl font-semibold mb-3 text-blue-700">Negócios</h3>
            <div className="flex flex-col space-y-2">
              <Link href="/categoria/business" className="text-blue-600 hover:text-blue-800 hover:underline py-1">
                Ver calculadoras de negócios
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
