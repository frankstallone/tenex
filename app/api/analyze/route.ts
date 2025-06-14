import { NextResponse } from 'next/server'
import { analyzeLogs } from '@/lib/log-analyzer'

export async function POST(request: Request) {
  try {
    const body = await request.text()

    if (!body) {
      return NextResponse.json(
        { error: 'Log content is empty' },
        { status: 400 }
      )
    }

    const analysisResult = analyzeLogs(body)

    return NextResponse.json(analysisResult)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
