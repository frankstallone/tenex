// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { LogEntry, Anomaly } from './types'
import { parseLogEntries } from './log-parser'
import { runRuleBasedDetection } from './rule-detectors'
import { detectHighTrafficUsers } from './statistical-detectors'

/**
 * Orchestrates log parsing and anomaly detection.
 * @param logContent - The raw log file content as a string.
 * @returns An object with totalRecords, malformedCount, and anomalies.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function analyzeLogs(logContent: string): {
  totalRecords: number
  malformedCount: number
  anomalies: Anomaly[]
} {
  const { parsedEntries, malformedCount } = parseLogEntries(logContent)
  const ruleAnomalies = runRuleBasedDetection(parsedEntries)
  const statAnomalies = detectHighTrafficUsers(parsedEntries)
  const anomalies = [...ruleAnomalies, ...statAnomalies]
  return {
    totalRecords: parsedEntries.length,
    malformedCount,
    anomalies,
  }
}
