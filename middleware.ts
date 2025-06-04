import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  if (host.includes('xn--clculoj-hwag.com.br')) {
    const url = request.nextUrl.clone()
    url.hostname = 'www.calculoja.com'
    return NextResponse.redirect(url, 308)
  }
  return NextResponse.next()
}

export const config = {
  matcher: '/:path*',
}
