import type { Metadata } from "next"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Sobre - CálculoJá",
  description: "Saiba mais sobre o CálculoJá e a missão do nosso projeto de calculadoras especializadas.",
}

export default function SobrePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="flex justify-center mb-6">
          <Image 
            src="/calculoja-logo.svg" 
            alt="CálculoJá" 
            width={280} 
            height={80} 
            className="h-16 w-auto" 
            priority
          />
        </div>
        <p className="text-lg text-gray-600">
          Conheça a nossa missão e como ajudamos milhares de pessoas com ferramentas de cálculo especializadas.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Nossa Missão</h2>
        <p className="text-gray-700 mb-4">
          O CálculoJá surgiu da necessidade de ferramentas precisas e confiáveis para 
          cálculos em diversas áreas do conhecimento. Nossa missão é disponibilizar gratuitamente calculadoras 
          que ajudem as pessoas em suas atividades diárias, sejam elas relacionadas a saúde, finanças, negócios 
          ou conversões.
        </p>
        <p className="text-gray-700">
          Buscamos sempre a excelência na qualidade das nossas ferramentas, garantindo cálculos precisos e 
          explicações didáticas para que todos possam entender não apenas o resultado, mas o processo por trás de cada cálculo.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Nossas Calculadoras</h2>
        <p className="text-gray-700 mb-6">
          Desenvolvemos calculadoras nas seguintes categorias:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="text-xl font-semibold mb-2 text-blue-800">Saúde</h3>
            <p className="text-gray-700">
              Ferramentas para cálculo de IMC, percentual de gordura corporal, calorias diárias e outros 
              indicadores de saúde importantes para monitoramento do bem-estar.
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <h3 className="text-xl font-semibold mb-2 text-green-800">Finanças</h3>
            <p className="text-gray-700">
              Calculadoras de juros compostos, amortização, ROI e outras ferramentas para planejamento financeiro 
              e análise de investimentos.
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <h3 className="text-xl font-semibold mb-2 text-purple-800">Conversão</h3>
            <p className="text-gray-700">
              Ferramentas para converter unidades de medida, moedas e outras grandezas de forma rápida e precisa.
            </p>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
            <h3 className="text-xl font-semibold mb-2 text-amber-800">Veterinária</h3>
            <p className="text-gray-700">
              Calculadoras especializadas para dosagem de medicamentos, conversão de idade animal para humana e outras 
              ferramentas para cuidados com pets.
            </p>
          </div>

          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 md:col-span-2">
            <h3 className="text-xl font-semibold mb-2 text-indigo-800">Negócios</h3>
            <p className="text-gray-700">
              Ferramentas para análise de ponto de equilíbrio, markup, margens de lucro e outras métricas 
              essenciais para a gestão de negócios.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Feedback</h2>
        <p className="text-gray-700 mb-4">
          Sua opinião é muito importante para nós. Se você tem sugestões de melhorias ou novas calculadoras 
          que gostaria de ver em nosso site, não hesite em nos contatar.
        </p>
        <p className="text-gray-700">
          Agradecemos por usar nossas ferramentas e esperamos continuar ajudando você com cálculos precisos 
          e informações relevantes.
        </p>
      </div>
    </div>
  );
} 