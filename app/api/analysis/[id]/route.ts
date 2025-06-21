import { NextResponse } from 'next/server'
import { getAnalysisResultById } from '@/lib/db/queries'
import { currentUser } from '@clerk/nextjs/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const resultId = parseInt(params.id, 10)
  if (isNaN(resultId)) {
    return NextResponse.json({ error: 'Invalid result ID' }, { status: 400 })
  }

  try {
    const result = await getAnalysisResultById(resultId)

    if (!result) {
      return NextResponse.json({ error: 'Result not found' }, { status: 404 })
    }

    // Security check: ensure the user requesting the result is the one who owns it
    if (result.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(result.analysisResult)
  } catch (error) {
    console.error(`Error fetching analysis result ${resultId}:`, error)
    return NextResponse.json(
      { error: 'Failed to fetch analysis result' },
      { status: 500 }
    )
  }
}
