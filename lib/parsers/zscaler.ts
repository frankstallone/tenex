export interface Anomaly {
  rule: string
  line: number
  details: string
  logEntry: Record<string, string>
  severity?: 'High' | 'Medium' | 'Low'
}

export interface LogAnalysisResult {
  totalRecords: number
  anomalies: Anomaly[]
  malformedCount: number
  malformedLines?: string[]
}

// Based on common Zscaler NSS feed formats. The actual format can be customized,
// but we'll assume a standard set of fields for this implementation.
const ZSCALER_HEADERS = [
  'datetime',
  'user',
  'department',
  'url',
  'urlcategory',
  'urlsupercategory',
  'urlclass',
  'requestmethod',
  'useragent',
  'refererurl',
  'requestsize',
  'responsesize',
  'action',
  'threatname',
  'threatcat',
  'malwareclass',
  'malwarecat',
  'filetype',
  'fileclass',
  'riskscore',
  'location',
  'clientip',
  'serverip',
  'protocol',
]

/**
 * Parses Zscaler log file content.
 * @param content The string content of the log file.
 * @returns A LogAnalysisResult object.
 */
export function parseZscalerLog(content: string): LogAnalysisResult {
  const lines = content.split('\n').filter((line) => line.trim() !== '')
  const anomalies: Anomaly[] = []
  const malformedLines: string[] = []
  let totalRecords = 0

  lines.forEach((line, index) => {
    // Skip header lines if they exist
    if (line.startsWith('#')) {
      return
    }

    const fields = line.split('\t')

    if (fields.length !== ZSCALER_HEADERS.length) {
      malformedLines.push(`L${index + 1}: ${line}`)
      return
    }

    totalRecords++
    const logEntry = Object.fromEntries(
      ZSCALER_HEADERS.map((header, i) => [header, fields[i]])
    )

    // --- Anomaly Detection (Task 3.5) ---
    // Rule: Flag any blocked requests.
    if (logEntry.action && logEntry.action.toUpperCase() === 'BLOCK') {
      anomalies.push({
        rule: 'Blocked Request',
        line: index + 1,
        details: `Access to ${logEntry.url} was blocked due to category: ${logEntry.urlcategory}`,
        logEntry,
        severity: 'Medium',
      })
    }

    // Rule: Flag high-risk categories
    const HIGH_RISK_CATEGORIES = [
      'Spyware/Adware',
      'Phishing',
      'Malicious Sites',
      'Botnets',
      'Suspicious Destinations',
    ]
    if (
      logEntry.urlcategory &&
      HIGH_RISK_CATEGORIES.includes(logEntry.urlcategory)
    ) {
      anomalies.push({
        rule: 'High-Risk Category',
        line: index + 1,
        details: `User ${logEntry.user} accessed ${logEntry.url} (Category: ${logEntry.urlcategory})`,
        logEntry,
        severity: 'High',
      })
    }

    // Rule: Flag large downloads (over 50MB)
    const responseSize = parseInt(logEntry.responsesize) || 0
    if (responseSize > 50000000) {
      anomalies.push({
        rule: 'Large Download',
        line: index + 1,
        details: `User ${logEntry.user} downloaded ${responseSize} bytes from ${logEntry.url}`,
        logEntry,
        severity: 'Medium',
      })
    }

    // Rule: Flag threat detections
    if (logEntry.threatname && logEntry.threatname !== '-') {
      anomalies.push({
        rule: 'Threat Detected',
        line: index + 1,
        details: `Threat detected: ${logEntry.threatname} for user ${logEntry.user} accessing ${logEntry.url}`,
        logEntry,
        severity: 'High',
      })
    }

    // Placeholder for more advanced rules (e.g., large downloads)
  })

  return {
    totalRecords,
    anomalies,
    malformedCount: malformedLines.length,
    malformedLines,
  }
}
