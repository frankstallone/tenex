import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { parseZscalerLog } from '@/lib/parsers/zscaler'
import { db } from '@/lib/db'
import { analysisResults } from '@/lib/db/schema'

const MAX_FILE_SIZE_MB = 4
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
const ALLOWED_MIME_TYPES = ['text/plain', 'text/csv'] // Zscaler logs can be .log (text/plain) or .txt

export async function POST(request: Request) {
  const user = await currentUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: userId } = user

  const formData = await request.formData()
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 })
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: `File size exceeds the limit of ${MAX_FILE_SIZE_MB}MB.` },
      { status: 413 } // Payload Too Large
    )
  }

  // Validate MIME type. Note: .log files might be sent as text/plain.
  // We'll be more lenient here and rely on parser's ability to handle content.
  if (
    !ALLOWED_MIME_TYPES.includes(file.type) &&
    !file.name.endsWith('.log') &&
    !file.name.endsWith('.txt')
  ) {
    return NextResponse.json(
      { error: 'Invalid file type. Only .log or .txt files are allowed.' },
      { status: 415 } // Unsupported Media Type
    )
  }

  try {
    const fileContent = await file.text()
    const analysisResult = parseZscalerLog(fileContent)

    // Store results in the database
    const newAnalysis = await db
      .insert(analysisResults)
      .values({
        userId,
        totalRecords: analysisResult.totalRecords,
        anomaliesSummary: analysisResult.anomalies.slice(0, 10), // Store a summary
        analysisResult: analysisResult, // Store the full result
      })
      .returning({ id: analysisResults.id })

    const resultId = newAnalysis[0].id

    return NextResponse.json({ resultId })
  } catch (error) {
    console.error('Error processing file:', error)
    return NextResponse.json(
      { error: 'Failed to parse the uploaded file.' },
      { status: 500 }
    )
  }
}
