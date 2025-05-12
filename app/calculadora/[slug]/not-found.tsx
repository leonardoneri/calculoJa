export default function CalculadoraNotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Calculadora não encontrada</h1>
        <p className="text-lg text-gray-600 mb-8">
          A calculadora que você está procurando não existe ou foi movida.
        </p>
        <a 
          href="/" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg inline-block"
        >
          Explorar todas as calculadoras
        </a>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Calculadoras disponíveis</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-blue-700 border-b pb-2">Saúde</h3>
            <ul className="space-y-1">
              <li>
                <a href="/calculadora/imc" className="text-blue-600 hover:text-blue-800 hover:underline py-1 block">
                  Calculadora de IMC
                </a>
              </li>
              <li>
                <a href="/calculadora/calorias-diarias" className="text-blue-600 hover:text-blue-800 hover:underline py-1 block">
                  Calculadora de Calorias Diárias
                </a>
              </li>
              <li>
                <a href="/calculadora/percentual-gordura" className="text-blue-600 hover:text-blue-800 hover:underline py-1 block">
                  Calculadora de Percentual de Gordura
                </a>
              </li>
              <li>
                <a href="/calculadora/frequencia-cardiaca" className="text-blue-600 hover:text-blue-800 hover:underline py-1 block">
                  Calculadora de Frequência Cardíaca
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3 text-blue-700 border-b pb-2">Finanças</h3>
            <ul className="space-y-1">
              <li>
                <a href="/calculadora/juros-compostos" className="text-blue-600 hover:text-blue-800 hover:underline py-1 block">
                  Calculadora de Juros Compostos
                </a>
              </li>
              <li>
                <a href="/calculadora/markup" className="text-blue-600 hover:text-blue-800 hover:underline py-1 block">
                  Calculadora de Markup
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-blue-700 border-b pb-2">Conversões</h3>
            <ul className="space-y-1">
              <li>
                <a href="/calculadora/conversao-moedas" className="text-blue-600 hover:text-blue-800 hover:underline py-1 block">
                  Conversão de Moedas
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3 text-blue-700 border-b pb-2">Veterinária</h3>
            <ul className="space-y-1">
              <li>
                <a href="/calculadora/dosagem-veterinaria" className="text-blue-600 hover:text-blue-800 hover:underline py-1 block">
                  Dosagem Veterinária
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
