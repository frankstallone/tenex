import { LogEntry, Anomaly } from './types'

/**
 * Detects users whose request count is at least 2x the mean request count.
 * @param entries Array of LogEntry
 * @returns Array of Anomaly
 */
export function detectHighTrafficUsers(entries: LogEntry[]): Anomaly[] {
  // Aggregate request counts per user
  const userCounts: Record<string, number> = {}
  for (const entry of entries) {
    userCounts[entry.userId] = (userCounts[entry.userId] || 0) + 1
  }
  const userIds = Object.keys(userCounts)
  if (userIds.length < 2) return []

  const counts = userIds.map((id) => userCounts[id])
  const mean = counts.reduce((a, b) => a + b, 0) / counts.length
  if (mean === 0) return []

  const anomalies: Anomaly[] = []
  for (const userId of userIds) {
    const count = userCounts[userId]
    if (count >= 2 * mean) {
      anomalies.push({
        type: 'High Traffic User',
        description: `User ${userId} made ${count} requests (mean: ${mean.toFixed(
          2
        )})`,
        confidence: 0.8,
      })
    }
  }
  return anomalies
}
