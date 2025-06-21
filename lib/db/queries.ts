import { db } from './index'
import { analysisResults } from './schema'
import { eq } from 'drizzle-orm'

/**
 * Get a single analysis result by its ID.
 * @param resultId The ID of the analysis result.
 * @returns The analysis result, or null if not found.
 */
export async function getAnalysisResultById(resultId: number) {
  try {
    const result = await db
      .select()
      .from(analysisResults)
      .where(eq(analysisResults.id, resultId))
    return result[0] || null
  } catch (error) {
    console.error(`Error fetching analysis result ${resultId}:`, error)
    throw new Error('Failed to fetch analysis result from the database.')
  }
}

/**
 * Deletes all log entries for a specific user.
 * @param userId The ID of the user whose logs should be deleted.
 */
export async function deleteLogsForUser(userId: string) {
  try {
    await db.delete(analysisResults).where(eq(analysisResults.userId, userId))
    console.log(`Successfully deleted logs for user: ${userId}`)
  } catch (error) {
    console.error(`Error deleting logs for user ${userId}:`, error)
    throw new Error('Failed to delete user logs from the database.')
  }
}
