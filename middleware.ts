import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Manipular especificamente a rota ads.txt para garantir que seja servida sem redirecionamento
  if (pathname === '/ads.txt') {
    // Ler o conteúdo do arquivo ads.txt armazenado no projeto
    const adsContent = 'google.com, pub-2877556290224566, DIRECT, f08c47fec0942fa0'
    
    // Retornar o conteúdo diretamente como resposta de texto plano
    return new NextResponse(adsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=3600'
      }
    })
  }

  return NextResponse.next()
}

// Configurar para executar o middleware apenas para a rota /ads.txt
export const config = {
  matcher: '/ads.txt',
} 