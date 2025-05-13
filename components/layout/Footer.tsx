import Link from "next/link"
import { CalculatorCategory } from "@/lib/types"
import Image from "next/image"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="mb-4">
              <Image 
                src="/calculoja-logo.svg" 
                alt="CálculoJá" 
                width={140} 
                height={40} 
                className="h-10 w-auto mb-2" 
              />
            </div>
            <p className="text-gray-300">Ferramentas de cálculo gratuitas para facilitar seu dia a dia.</p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Categorias</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/categoria/${CalculatorCategory.HEALTH.toLowerCase()}`}
                  className="text-gray-300 hover:text-white"
                >
                  Saúde e Bem-estar
                </Link>
              </li>
              <li>
                <Link
                  href={`/categoria/${CalculatorCategory.FINANCE.toLowerCase()}`}
                  className="text-gray-300 hover:text-white"
                >
                  Finanças e Investimentos
                </Link>
              </li>
              <li>
                <Link
                  href="/recursos-humanos"
                  className="text-gray-300 hover:text-white"
                >
                  Recursos Humanos
                </Link>
              </li>
              <li>
                <Link
                  href="/emprestimos-financiamentos"
                  className="text-gray-300 hover:text-white"
                >
                  Empréstimos e Financiamentos
                </Link>
              </li>
              <li>
                <Link
                  href={`/categoria/${CalculatorCategory.CONVERSION.toLowerCase()}`}
                  className="text-gray-300 hover:text-white"
                >
                  Conversões e Medidas
                </Link>
              </li>
              <li>
                <Link
                  href={`/categoria/${CalculatorCategory.BUSINESS.toLowerCase()}`}
                  className="text-gray-300 hover:text-white"
                >
                  Negócios
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Links Úteis</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/sobre" className="text-gray-300 hover:text-white">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="/politica-de-privacidade" className="text-gray-300 hover:text-white">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/termos-de-uso" className="text-gray-300 hover:text-white">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/contato" className="text-gray-300 hover:text-white">
                  Contato
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>© {currentYear} CálculoJá. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
