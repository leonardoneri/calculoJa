import { NextResponse } from "next/server"

// Endpoint para verificação de saúde do sistema
// Usado por serviços como UptimeRobot para monitorar a disponibilidade
export async function GET() {
  try {
    // Verificar conexão com a API de taxas de câmbio
    const exchangeRateResponse = await fetch("https://api.exchangerate-api.com/v4/latest/BRL", {
      next: { revalidate: 60 }, // Revalidar a cada minuto para este teste
    })

    const healthStatus = {
      status: "ok",
      timestamp: new Date().toISOString(),
      services: {
        exchangeRates: exchangeRateResponse.ok ? "healthy" : "degraded",
      },
      version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
      environment: process.env.NODE_ENV,
    }

    return NextResponse.json(healthStatus)
  } catch (error) {
    console.error("Health check failed:", error)

    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        message: "Health check failed",
      },
      { status: 500 },
    )
  }
}
