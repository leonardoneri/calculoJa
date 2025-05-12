import { type NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

// Secret token for webhook authentication
const REVALIDATE_TOKEN = process.env.REVALIDATE_TOKEN

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Verify the request has the correct token
    const token = request.headers.get("x-revalidate-token")

    if (token !== REVALIDATE_TOKEN) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Get the paths to revalidate
    const paths = body.paths || []

    if (!paths.length) {
      return NextResponse.json({ error: "No paths provided" }, { status: 400 })
    }

    // Revalidate each path
    for (const path of paths) {
      revalidatePath(path)
    }

    return NextResponse.json({
      revalidated: true,
      paths,
    })
  } catch (error) {
    console.error("Error revalidating paths:", error)
    return NextResponse.json({ error: "Failed to revalidate paths" }, { status: 500 })
  }
}
