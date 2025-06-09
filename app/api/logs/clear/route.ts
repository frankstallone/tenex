import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { deleteLogsForUser } from '@/lib/db/queries'

export async function DELETE() {
  const user = await currentUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: userId } = user

  try {
    await deleteLogsForUser(userId)
    return NextResponse.json({ message: 'All logs cleared successfully.' })
  } catch (error) {
    console.error('API Error clearing logs:', error)
    return NextResponse.json(
      { error: 'Failed to clear logs.' },
      { status: 500 }
    )
  }
}
