import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get('host') || ''

  // Tratar especificamente requisições para ads.txt em qualquer domínio
  if (pathname === '/ads.txt') {
    // Conteúdo padrão do AdSense
    const adsContent = 'google.com, pub-2877556290224566, DIRECT, f08c47fec0942fa0'
    
    console.log(`Servindo ads.txt para ${host}${pathname}`)
    
    // Retornar o conteúdo diretamente como resposta de texto plano
    return new NextResponse(adsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'X-Robots-Tag': 'noindex', // Não indexar o arquivo ads.txt
      }
    })
  }

  return NextResponse.next()
}

// Configurar para executar o middleware apenas para a rota /ads.txt
export const config = {
  matcher: '/ads.txt',
} 