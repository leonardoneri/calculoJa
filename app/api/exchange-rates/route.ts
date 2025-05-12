import { NextResponse } from "next/server"

// Revalidate every 24 hours
export const revalidate = 86400

export async function GET() {
  try {
    // Fetch exchange rates from a public API
    const response = await fetch("https://api.exchangerate-api.com/v4/latest/BRL", {
      next: { revalidate: 86400 }, // 24 hours in seconds
    })

    if (!response.ok) {
      throw new Error("Failed to fetch exchange rates")
    }

    const data = await response.json()

    return NextResponse.json({
      base: data.base,
      rates: data.rates,
      timestamp: data.time_last_updated,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching exchange rates:", error)
    return NextResponse.json({ error: "Failed to fetch exchange rates" }, { status: 500 })
  }
}
