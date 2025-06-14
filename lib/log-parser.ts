import { LogEntry } from './types'

/**
 * Parses a Zscaler log file content string into structured log entries.
 * @param logContent - The raw log file content as a string.
 * @returns An object with parsedEntries (array of LogEntry) and malformedCount (number).
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function parseLogEntries(logContent: string): {
  parsedEntries: LogEntry[]
  malformedCount: number
} {
  // Split input into lines
  const lines = logContent.split(/\r?\n/).filter(Boolean)
  const expectedFieldCount = 5 // userId, destBytes, action, category, url
  let malformedCount = 0
  const parsedEntries: LogEntry[] = []

  for (const line of lines) {
    const fields = line.split('\t')
    if (fields.length !== expectedFieldCount) {
      malformedCount++
      continue
    }
    const [userId, destBytesStr, action, category, url] = fields
    const destBytes = Number(destBytesStr)
    if (isNaN(destBytes)) {
      malformedCount++
      continue
    }
    parsedEntries.push({
      userId,
      destBytes,
      action,
      category,
      url,
    })
  }

  return {
    parsedEntries,
    malformedCount,
  }
}
