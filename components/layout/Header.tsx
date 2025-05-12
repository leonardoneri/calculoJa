"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Search } from "lucide-react"
import { usePathname } from "next/navigation"
import { CalculatorCategory } from "@/lib/types"
import Image from "next/image"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const pathname = usePathname()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen)
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <Image 
              src="/calculoja-logo.svg" 
              alt="CálculoJá" 
              width={140} 
              height={40} 
              className="h-10 w-auto mr-2" 
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link
              href="/"
              className={`hover:text-blue-600 ${pathname === "/" ? "text-blue-600 font-medium" : "text-gray-600"}`}
            >
              Início
            </Link>
            <Link
              href={`/categoria/${CalculatorCategory.HEALTH.toLowerCase()}`}
              className={`hover:text-blue-600 ${pathname.includes(CalculatorCategory.HEALTH.toLowerCase()) ? "text-blue-600 font-medium" : "text-gray-600"}`}
            >
              Saúde
            </Link>
            <Link
              href={`/categoria/${CalculatorCategory.FINANCE.toLowerCase()}`}
              className={`hover:text-blue-600 ${pathname.includes(CalculatorCategory.FINANCE.toLowerCase()) ? "text-blue-600 font-medium" : "text-gray-600"}`}
            >
              Finanças
            </Link>
            <Link
              href={`/categoria/${CalculatorCategory.CONVERSION.toLowerCase()}`}
              className={`hover:text-blue-600 ${pathname.includes(CalculatorCategory.CONVERSION.toLowerCase()) ? "text-blue-600 font-medium" : "text-gray-600"}`}
            >
              Conversão
            </Link>
            <Link
              href={`/categoria/${CalculatorCategory.VETERINARY.toLowerCase()}`}
              className={`hover:text-blue-600 ${pathname.includes(CalculatorCategory.VETERINARY.toLowerCase()) ? "text-blue-600 font-medium" : "text-gray-600"}`}
            >
              Veterinária
            </Link>
            <Link
              href={`/categoria/${CalculatorCategory.BUSINESS.toLowerCase()}`}
              className={`hover:text-blue-600 ${pathname.includes(CalculatorCategory.BUSINESS.toLowerCase()) ? "text-blue-600 font-medium" : "text-gray-600"}`}
            >
              Negócios
            </Link>
            <Link
              href="/sobre"
              className={`hover:text-blue-600 ${pathname === "/sobre" ? "text-blue-600 font-medium" : "text-gray-600"}`}
            >
              Sobre
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <button onClick={toggleSearch} className="text-gray-600 hover:text-blue-600" aria-label="Pesquisar">
              <Search size={20} />
            </button>

            <button
              onClick={toggleMenu}
              className="md:hidden text-gray-600"
              aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                className={`hover:text-blue-600 ${pathname === "/" ? "text-blue-600 font-medium" : "text-gray-600"}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Início
              </Link>
              <Link
                href={`/categoria/${CalculatorCategory.HEALTH.toLowerCase()}`}
                className={`hover:text-blue-600 ${pathname.includes(CalculatorCategory.HEALTH.toLowerCase()) ? "text-blue-600 font-medium" : "text-gray-600"}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Saúde
              </Link>
              <Link
                href={`/categoria/${CalculatorCategory.FINANCE.toLowerCase()}`}
                className={`hover:text-blue-600 ${pathname.includes(CalculatorCategory.FINANCE.toLowerCase()) ? "text-blue-600 font-medium" : "text-gray-600"}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Finanças
              </Link>
              <Link
                href={`/categoria/${CalculatorCategory.CONVERSION.toLowerCase()}`}
                className={`hover:text-blue-600 ${pathname.includes(CalculatorCategory.CONVERSION.toLowerCase()) ? "text-blue-600 font-medium" : "text-gray-600"}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Conversão
              </Link>
              <Link
                href={`/categoria/${CalculatorCategory.VETERINARY.toLowerCase()}`}
                className={`hover:text-blue-600 ${pathname.includes(CalculatorCategory.VETERINARY.toLowerCase()) ? "text-blue-600 font-medium" : "text-gray-600"}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Veterinária
              </Link>
              <Link
                href={`/categoria/${CalculatorCategory.BUSINESS.toLowerCase()}`}
                className={`hover:text-blue-600 ${pathname.includes(CalculatorCategory.BUSINESS.toLowerCase()) ? "text-blue-600 font-medium" : "text-gray-600"}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Negócios
              </Link>
              <Link
                href="/sobre"
                className={`hover:text-blue-600 ${pathname === "/sobre" ? "text-blue-600 font-medium" : "text-gray-600"}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Sobre
              </Link>
            </nav>
          </div>
        )}

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="py-4 border-t">
            <form
              className="flex"
              onSubmit={(e) => {
                e.preventDefault()
                // Implement search functionality
                setIsSearchOpen(false)
              }}
            >
              <input
                type="text"
                placeholder="Buscar calculadoras..."
                className="flex-grow p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="bg-blue-600 text-white p-2 rounded-r-md">
                <Search size={20} />
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  )
}
