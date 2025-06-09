import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

const MAX_FILE_SIZE_MB = 4
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
const ALLOWED_MIME_TYPE = 'text/plain'

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

  // Validate MIME type
  if (file.type !== ALLOWED_MIME_TYPE) {
    return NextResponse.json(
      { error: 'Invalid file type. Only text/plain files are allowed.' },
      { status: 415 } // Unsupported Media Type
    )
  }

  // console.log(file);

  return NextResponse.json({
    message: 'File validated successfully.',
    userId,
  })
}
