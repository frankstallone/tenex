import {
  detectLargeDownload,
  detectBlockedRequest,
  detectHighRiskCategory,
} from '../lib/rule-detectors'
import { LogEntry } from '../lib/types'

describe('Rule-based anomaly detectors', () => {
  describe('detectLargeDownload', () => {
    it('flags large downloads over 10MB', () => {
      const entry: LogEntry = {
        userId: 'user1',
        destBytes: 15_000_000,
        action: 'ALLOW',
        category: 'CategoryA',
        url: 'http://example.com',
      }
      const anomaly = detectLargeDownload(entry)
      expect(anomaly).not.toBeNull()
      expect(anomaly?.type).toBe('Large Download')
      expect(anomaly?.confidence).toBeGreaterThan(0)
    })
    it('does not flag downloads at or below 10MB', () => {
      const entry: LogEntry = {
        userId: 'user2',
        destBytes: 10_000_000,
        action: 'ALLOW',
        category: 'CategoryA',
        url: 'http://example.com',
      }
      expect(detectLargeDownload(entry)).toBeNull()
    })
  })

  describe('detectBlockedRequest', () => {
    it('flags BLOCK actions', () => {
      const entry: LogEntry = {
        userId: 'user3',
        destBytes: 1000,
        action: 'BLOCK',
        category: 'Phishing',
        url: 'http://malicious.com',
      }
      const anomaly = detectBlockedRequest(entry)
      expect(anomaly).not.toBeNull()
      expect(anomaly?.type).toBe('Blocked Request')
      expect(anomaly?.confidence).toBe(0.9)
    })
    it('does not flag non-BLOCK actions', () => {
      const entry: LogEntry = {
        userId: 'user4',
        destBytes: 1000,
        action: 'ALLOW',
        category: 'Phishing',
        url: 'http://malicious.com',
      }
      expect(detectBlockedRequest(entry)).toBeNull()
    })
  })

  describe('detectHighRiskCategory', () => {
    it('flags high-risk categories', () => {
      const entry: LogEntry = {
        userId: 'user5',
        destBytes: 1000,
        action: 'ALLOW',
        category: 'Phishing',
        url: 'http://phishing.com',
      }
      const anomaly = detectHighRiskCategory(entry)
      expect(anomaly).not.toBeNull()
      expect(anomaly?.type).toBe('High-Risk Category')
      expect(anomaly?.confidence).toBe(0.7)
    })
    it('does not flag non-high-risk categories', () => {
      const entry: LogEntry = {
        userId: 'user6',
        destBytes: 1000,
        action: 'ALLOW',
        category: 'SafeCategory',
        url: 'http://safe.com',
      }
      expect(detectHighRiskCategory(entry)).toBeNull()
    })
  })
})
