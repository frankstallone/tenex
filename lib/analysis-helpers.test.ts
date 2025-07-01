// lib/analysis-helpers.test.ts
import { LogAnalysisResult, Anomaly } from './parsers/zscaler'
import {
  calculateSummaryMetrics,
  SummaryMetrics,
  transformAnomaliesForTimeseriesChart,
} from './analysis-helpers'

describe('analysis-helpers', () => {
  describe('calculateSummaryMetrics', () => {
    it('should correctly count anomalies by severity', () => {
      const mockResult: LogAnalysisResult = {
        totalRecords: 10,
        malformedCount: 0,
        anomalies: [
          { severity: 'High', rule: 'r', line: 1, details: 'd', logEntry: {} },
          {
            severity: 'Medium',
            rule: 'r',
            line: 1,
            details: 'd',
            logEntry: {},
          },
          {
            severity: 'Medium',
            rule: 'r',
            line: 1,
            details: 'd',
            logEntry: {},
          },
          { severity: 'Low', rule: 'r', line: 1, details: 'd', logEntry: {} },
          { severity: 'Low', rule: 'r', line: 1, details: 'd', logEntry: {} },
          { severity: 'Low', rule: 'r', line: 1, details: 'd', logEntry: {} },
          { rule: 'r', line: 1, details: 'd', logEntry: {} }, // No severity
        ],
      }
      const metrics = calculateSummaryMetrics(mockResult)
      expect(metrics).toEqual({ high: 1, medium: 2, low: 3 })
    })

    it('should return all zeros if there are no anomalies', () => {
      const mockResult: LogAnalysisResult = {
        totalRecords: 10,
        malformedCount: 0,
        anomalies: [],
      }
      const metrics = calculateSummaryMetrics(mockResult)
      expect(metrics).toEqual({ high: 0, medium: 0, low: 0 })
    })

    it('should handle undefined severity values', () => {
      const mockResult: LogAnalysisResult = {
        totalRecords: 5,
        malformedCount: 0,
        anomalies: [
          { rule: 'r1', line: 1, details: 'd', logEntry: {} },
          {
            severity: undefined,
            rule: 'r2',
            line: 2,
            details: 'd',
            logEntry: {},
          },
          { severity: 'High', rule: 'r3', line: 3, details: 'd', logEntry: {} },
        ],
      }
      const metrics = calculateSummaryMetrics(mockResult)
      expect(metrics).toEqual({ high: 1, medium: 0, low: 0 })
    })

    it('should handle invalid severity values', () => {
      const mockResult: LogAnalysisResult = {
        totalRecords: 5,
        malformedCount: 0,
        anomalies: [
          {
            severity: 'Invalid' as NonNullable<Anomaly['severity']>,
            rule: 'r1',
            line: 1,
            details: 'd',
            logEntry: {},
          },
          { severity: 'High', rule: 'r2', line: 2, details: 'd', logEntry: {} },
        ],
      }
      const metrics = calculateSummaryMetrics(mockResult)
      expect(metrics).toEqual({ high: 1, medium: 0, low: 0 })
    })
  })

  describe('transformAnomaliesForTimeseriesChart', () => {
    it('should group anomalies by minute and count them correctly', () => {
      const anomalies: Anomaly[] = [
        {
          rule: 'A',
          line: 1,
          details: 'd',
          logEntry: { datetime: '2023-10-27T10:00:15Z' },
        },
        {
          rule: 'B',
          line: 2,
          details: 'd',
          logEntry: { datetime: '2023-10-27T10:00:45Z' },
        },
        {
          rule: 'C',
          line: 3,
          details: 'd',
          logEntry: { datetime: '2023-10-27T10:01:20Z' },
        },
        {
          rule: 'D',
          line: 4,
          details: 'd',
          logEntry: { datetime: '2023-10-27T10:00:55Z' },
        },
        {
          rule: 'E',
          line: 5,
          details: 'd',
          logEntry: { datetime: '2023-10-27T10:02:05Z' },
        },
        { rule: 'F', line: 6, details: 'd', logEntry: {} }, // No datetime
      ]
      const result = transformAnomaliesForTimeseriesChart(anomalies)
      expect(result).toEqual([
        { time: '2023-10-27T10:00:00.000Z', count: 3 },
        { time: '2023-10-27T10:01:00.000Z', count: 1 },
        { time: '2023-10-27T10:02:00.000Z', count: 1 },
      ])
    })

    it('should handle empty anomalies array', () => {
      const result = transformAnomaliesForTimeseriesChart([])
      expect(result).toEqual([])
    })

    it('should handle invalid date formats gracefully', () => {
      const anomalies: Anomaly[] = [
        {
          rule: 'A',
          line: 1,
          details: 'd',
          logEntry: { datetime: 'invalid-date' },
        },
        {
          rule: 'B',
          line: 2,
          details: 'd',
          logEntry: { datetime: '2023-10-27T10:00:00Z' },
        },
        {
          rule: 'C',
          line: 3,
          details: 'd',
          logEntry: { datetime: 'not-a-date' },
        },
      ]
      const result = transformAnomaliesForTimeseriesChart(anomalies)
      expect(result).toEqual([{ time: '2023-10-27T10:00:00.000Z', count: 1 }])
    })

    it('should normalize timestamps to the start of the minute', () => {
      const anomalies: Anomaly[] = [
        {
          rule: 'A',
          line: 1,
          details: 'd',
          logEntry: { datetime: '2023-10-27T10:00:15.123Z' },
        },
        {
          rule: 'B',
          line: 2,
          details: 'd',
          logEntry: { datetime: '2023-10-27T10:00:45.999Z' },
        },
      ]
      const result = transformAnomaliesForTimeseriesChart(anomalies)
      expect(result).toEqual([{ time: '2023-10-27T10:00:00.000Z', count: 2 }])
    })

    it('should sort timestamps chronologically', () => {
      const anomalies: Anomaly[] = [
        {
          rule: 'A',
          line: 1,
          details: 'd',
          logEntry: { datetime: '2023-10-27T10:02:00Z' },
        },
        {
          rule: 'B',
          line: 2,
          details: 'd',
          logEntry: { datetime: '2023-10-27T10:00:00Z' },
        },
        {
          rule: 'C',
          line: 3,
          details: 'd',
          logEntry: { datetime: '2023-10-27T10:01:00Z' },
        },
      ]
      const result = transformAnomaliesForTimeseriesChart(anomalies)
      const times = result.map((r) => r.time)
      expect(times).toEqual([
        '2023-10-27T10:00:00.000Z',
        '2023-10-27T10:01:00.000Z',
        '2023-10-27T10:02:00.000Z',
      ])
    })
  })
})
