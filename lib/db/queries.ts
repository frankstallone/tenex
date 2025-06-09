import { db } from './index'
import { logs } from './schema'
import { eq } from 'drizzle-orm'

/**
 * Deletes all log entries for a specific user.
 * @param userId The ID of the user whose logs should be deleted.
 */
export async function deleteLogsForUser(userId: string) {
  try {
    await db.delete(logs).where(eq(logs.userId, userId))
    console.log(`Successfully deleted logs for user: ${userId}`)
  } catch (error) {
    console.error(`Error deleting logs for user ${userId}:`, error)
    throw new Error('Failed to delete user logs from the database.')
  }
}
