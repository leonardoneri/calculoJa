import { NextResponse } from 'next/server'

export async function GET() {
  const adsContent = 'google.com, pub-2877556290224566, DIRECT, f08c47fec0942fa0'
  
  return new NextResponse(adsContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    }
  })
} 