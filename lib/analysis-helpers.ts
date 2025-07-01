import { LogAnalysisResult, Anomaly } from './parsers/zscaler'

/**
 * Represents the count of anomalies for each severity level.
 * @interface SummaryMetrics
 * @property {number} high - Count of high severity anomalies
 * @property {number} medium - Count of medium severity anomalies
 * @property {number} low - Count of low severity anomalies
 */
export interface SummaryMetrics {
  high: number
  medium: number
  low: number
}

/**
 * Represents a data point for chart visualization.
 * @interface ChartData
 * @property {string} name - The category name (e.g., severity level)
 * @property {number} total - The count or value for the category
 */
export interface ChartData {
  name: string
  total: number
}

/**
 * Represents a data point for time-series chart visualization.
 * @interface TimeseriesData
 * @property {string} time - The timestamp in ISO format
 * @property {number} count - The number of events at this timestamp
 */
export interface TimeseriesData {
  time: string
  count: number
}

/**
 * Calculates summary metrics by counting anomalies for each severity level.
 *
 * This function processes an analysis result and counts how many anomalies
 * exist for each severity level (High, Medium, Low). Anomalies without a
 * severity or with invalid severity values are ignored.
 *
 * @param {LogAnalysisResult} analysisResult - The full analysis result from the parser
 * @returns {SummaryMetrics} An object containing counts for each severity level
 *
 * @example
 * ```ts
 * const metrics = calculateSummaryMetrics(analysisResult)
 * console.log(metrics) // { high: 1, medium: 2, low: 3 }
 * ```
 */
export function calculateSummaryMetrics(
  analysisResult: LogAnalysisResult
): SummaryMetrics {
  const metrics: SummaryMetrics = { high: 0, medium: 0, low: 0 }

  for (const anomaly of analysisResult.anomalies) {
    if (anomaly.severity === 'High') {
      metrics.high++
    } else if (anomaly.severity === 'Medium') {
      metrics.medium++
    } else if (anomaly.severity === 'Low') {
      metrics.low++
    }
  }

  return metrics
}

/**
 * Transforms anomaly data into a time-series format for area charts.
 *
 * This function processes an array of anomalies and groups them by minute,
 * creating a chronological series of data points showing the number of
 * anomalies over time. The function:
 * - Groups anomalies by minute (normalizing timestamps to minute boundaries)
 * - Handles invalid dates gracefully
 * - Sorts the results chronologically
 * - Skips entries without datetime information
 *
 * @param {Anomaly[]} anomalies - The array of anomalies to process
 * @returns {TimeseriesData[]} An array of data points sorted chronologically
 *
 * @example
 * ```ts
 * const timeData = transformAnomaliesForTimeseriesChart(anomalies)
 * // Returns: [
 * //   { time: '2024-01-01T10:00:00.000Z', count: 3 },
 * //   { time: '2024-01-01T10:01:00.000Z', count: 1 }
 * // ]
 * ```
 */
export function transformAnomaliesForTimeseriesChart(
  anomalies: Anomaly[]
): TimeseriesData[] {
  const countsByMinute: Record<string, number> = {}

  for (const anomaly of anomalies) {
    if (anomaly.logEntry.datetime) {
      try {
        const date = new Date(anomaly.logEntry.datetime)
        // Normalize to the beginning of the minute
        date.setSeconds(0, 0)
        const minuteKey = date.toISOString()

        countsByMinute[minuteKey] = (countsByMinute[minuteKey] || 0) + 1
      } catch {
        // Gracefully ignore invalid date formats
        console.warn('Invalid date format for anomaly:', anomaly)
      }
    }
  }

  return Object.entries(countsByMinute)
    .map(([time, count]) => ({ time, count }))
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
}
