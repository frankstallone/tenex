export interface Anomaly {
  rule: string
  line: number
  details: string
}

export interface LogAnalysisResult {
  totalRecords: number
  anomalies: Anomaly[]
  malformedCount: number
  malformedLines?: string[]
}

/**
 * Parses Zscaler log file content.
 * @param content The string content of the log file.
 * @returns A LogAnalysisResult object.
 */
export function parseZscalerLog(content: string): LogAnalysisResult {
  // This is a placeholder implementation.
  // The actual parsing logic will be implemented in a later step.
  const lines = content.split('\n').filter((line) => line.trim() !== '')

  // Mock data for demonstration purposes
  const mockResult: LogAnalysisResult = {
    totalRecords: lines.length,
    anomalies: [
      {
        rule: 'Large Download',
        line: 15,
        details: 'Downloaded 25MB from example.com',
      },
      {
        rule: 'Blocked Request',
        line: 42,
        details: 'Access to malicious-site.com was blocked',
      },
    ],
    malformedCount: 1,
    malformedLines: ['This is a malformed line with not enough tabs'],
  }

  return mockResult
}
