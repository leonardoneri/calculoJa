"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { useMemo } from 'react'

interface BreadcrumbItem {
  href: string
  label: string
  isCurrentPage: boolean
}

export default function Breadcrumbs() {
  const pathname = usePathname()

  const breadcrumbs = useMemo(() => {
    const pathSegments = pathname.split('/').filter(Boolean)
    let breadcrumbPath = ''
    
    let items: BreadcrumbItem[] = [{
      href: '/',
      label: 'Home',
      isCurrentPage: pathname === '/'
    }]
    
    if (pathSegments.length > 0) {
      for (let i = 0; i < pathSegments.length; i++) {
        const segment = pathSegments[i]
        breadcrumbPath += `/${segment}`
        
        let label = ''
        
        // Definindo labels para diferentes tipos de páginas
        if (segment === 'categoria') {
          // Este é um segmento intermediário que não precisa ser mostrado
          continue
        } else if (pathSegments[i-1] === 'categoria') {
          // Este é um segmento de categoria, vamos traduzir
          switch (segment) {
            case 'health':
              label = 'Saúde'
              break
            case 'finance':
              label = 'Finanças'
              break
            case 'business':
              label = 'Negócios'
              break
            case 'conversion':
              label = 'Conversão'
              break
            default:
              label = segment.charAt(0).toUpperCase() + segment.slice(1)
          }
        } else if (segment === 'calculadora') {
          // Este é um segmento intermediário que não precisa ser mostrado
          continue
        } else if (pathSegments[i-1] === 'calculadora') {
          // Este é um slug de calculadora, formatar como título
          label = segment
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        } else if (segment === 'recursos-humanos') {
          label = 'Recursos Humanos'
        } else if (segment === 'emprestimos-financiamentos') {
          label = 'Empréstimos e Financiamentos'
        } else if (segment === 'sobre') {
          label = 'Sobre Nós'
        } else {
          // Outros casos, apenas formatar
          label = segment
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        }
        
        // Adiciona apenas se tiver um label
        if (label) {
          items.push({
            href: breadcrumbPath,
            label,
            isCurrentPage: i === pathSegments.length - 1 && pathname.endsWith(segment)
          })
        }
      }
    }
    
    return items
  }, [pathname])

  // Se tivermos apenas a home, não mostramos breadcrumbs
  if (breadcrumbs.length <= 1) {
    return null
  }

  return (
    <nav aria-label="Breadcrumb" className="py-2 text-sm">
      <ol className="flex flex-wrap items-center">
        {breadcrumbs.map((crumb, index) => (
          <li 
            key={crumb.href} 
            className="flex items-center"
          >
            {index === 0 ? (
              <Link 
                href={crumb.href} 
                className="flex items-center text-gray-500 hover:text-blue-600"
                aria-current={crumb.isCurrentPage ? 'page' : undefined}
              >
                <Home size={16} className="mr-1" />
                <span className="sr-only">{crumb.label}</span>
              </Link>
            ) : (
              <>
                <ChevronRight size={16} className="mx-2 text-gray-400" />
                {crumb.isCurrentPage ? (
                  <span className="font-medium text-gray-900" aria-current="page">
                    {crumb.label}
                  </span>
                ) : (
                  <Link 
                    href={crumb.href} 
                    className="text-gray-500 hover:text-blue-600"
                  >
                    {crumb.label}
                  </Link>
                )}
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
} 