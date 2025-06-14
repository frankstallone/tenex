import { detectHighTrafficUsers } from '../lib/statistical-detectors'
import { LogEntry } from '../lib/types'

describe('detectHighTrafficUsers', () => {
  it('flags users with request count >= 2x the mean', () => {
    const entries: LogEntry[] = [
      { userId: 'a', destBytes: 1, action: 'ALLOW', category: '', url: '' },
      { userId: 'a', destBytes: 1, action: 'ALLOW', category: '', url: '' },
      { userId: 'b', destBytes: 1, action: 'ALLOW', category: '', url: '' },
      { userId: 'b', destBytes: 1, action: 'ALLOW', category: '', url: '' },
      // user c with 20 requests, which should be > 2x the mean
      ...Array(20)
        .fill(null)
        .map(() => ({
          userId: 'c',
          destBytes: 1,
          action: 'ALLOW',
          category: '',
          url: '',
        })),
    ]
    // user a: 2, b: 2, c: 20. Mean is 8. Threshold is 16.
    const anomalies = detectHighTrafficUsers(entries)
    expect(anomalies.length).toBe(1)
    expect(anomalies[0].type).toBe('High Traffic User')
    expect(anomalies[0].description).toContain('c')
  })

  it('does not flag if only one user', () => {
    const entries: LogEntry[] = [
      { userId: 'a', destBytes: 1, action: 'ALLOW', category: '', url: '' },
      { userId: 'a', destBytes: 1, action: 'ALLOW', category: '', url: '' },
    ]
    expect(detectHighTrafficUsers(entries)).toHaveLength(0)
  })

  it('does not flag if all users have same count (stddev=0)', () => {
    const entries: LogEntry[] = [
      { userId: 'a', destBytes: 1, action: 'ALLOW', category: '', url: '' },
      { userId: 'b', destBytes: 1, action: 'ALLOW', category: '', url: '' },
      { userId: 'a', destBytes: 1, action: 'ALLOW', category: '', url: '' },
      { userId: 'b', destBytes: 1, action: 'ALLOW', category: '', url: '' },
    ]
    expect(detectHighTrafficUsers(entries)).toHaveLength(0)
  })

  it('does not flag if no user is an outlier', () => {
    const entries: LogEntry[] = [
      { userId: 'a', destBytes: 1, action: 'ALLOW', category: '', url: '' },
      { userId: 'b', destBytes: 1, action: 'ALLOW', category: '', url: '' },
      { userId: 'c', destBytes: 1, action: 'ALLOW', category: '', url: '' },
      { userId: 'a', destBytes: 1, action: 'ALLOW', category: '', url: '' },
      { userId: 'b', destBytes: 1, action: 'ALLOW', category: '', url: '' },
      { userId: 'c', destBytes: 1, action: 'ALLOW', category: '', url: '' },
    ]
    expect(detectHighTrafficUsers(entries)).toHaveLength(0)
  })
})
