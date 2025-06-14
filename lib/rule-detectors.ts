import { LogEntry, Anomaly } from './types'

/**
 * Detects large downloads in a log entry.
 * Flags if destBytes > 10MB. Confidence is scaled by how much over the threshold, capped at 1.0.
 * @param entry LogEntry
 * @returns Anomaly object or null
 */
export function detectLargeDownload(entry: LogEntry): Anomaly | null {
  const THRESHOLD = 10_000_000 // 10 MB
  if (entry.destBytes > THRESHOLD) {
    // Confidence: min(1.0, (destBytes / 10MB - 1) * 0.2)
    const over = entry.destBytes / THRESHOLD - 1
    const confidence = Math.min(1.0, over * 0.2)
    return {
      type: 'Large Download',
      description: `User ${entry.userId} downloaded ${entry.destBytes} bytes from ${entry.url}`,
      confidence,
    }
  }
  return null
}

/**
 * Detects blocked requests in a log entry.
 * Flags if action is 'BLOCK'. Confidence is fixed at 0.9.
 * @param entry LogEntry
 * @returns Anomaly object or null
 */
export function detectBlockedRequest(entry: LogEntry): Anomaly | null {
  if (entry.action === 'BLOCK') {
    const categoryInfo = entry.category ? ` (Category: ${entry.category})` : ''
    return {
      type: 'Blocked Request',
      description: `User ${entry.userId} attempted to access ${entry.url}${categoryInfo}`,
      confidence: 0.9,
    }
  }
  return null
}

/**
 * Detects high-risk categories in a log entry.
 * Flags if category is in the predefined high-risk list. Confidence is fixed at 0.7.
 * @param entry LogEntry
 * @returns Anomaly object or null
 */
export function detectHighRiskCategory(entry: LogEntry): Anomaly | null {
  const HIGH_RISK_CATEGORIES = [
    'Spyware/Adware',
    'Phishing',
    'Malicious Sites',
    'Botnets',
    'Suspicious Destinations',
  ]
  if (HIGH_RISK_CATEGORIES.includes(entry.category)) {
    return {
      type: 'High-Risk Category',
      description: `User ${entry.userId} accessed ${entry.url} (Category: ${entry.category})`,
      confidence: 0.7,
    }
  }
  return null
}

/**
 * Runs all rule-based anomaly detectors on each log entry.
 * @param entries Array of LogEntry
 * @returns Array of Anomaly
 */
export function runRuleBasedDetection(entries: LogEntry[]): Anomaly[] {
  const anomalies: Anomaly[] = []
  for (const entry of entries) {
    const detectors = [
      detectLargeDownload,
      detectBlockedRequest,
      detectHighRiskCategory,
    ]
    for (const detector of detectors) {
      const result = detector(entry)
      if (result) {
        anomalies.push(result)
      }
    }
  }
  return anomalies
}
