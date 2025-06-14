import { parseLogEntries } from '../lib/log-parser'

describe('parseLogEntries', () => {
  it('parses valid TSV data into LogEntry objects', () => {
    const log =
      'user1\t12345\tALLOW\tCategoryA\thttp://example.com\nuser2\t54321\tBLOCK\tPhishing\thttp://malicious.com'
    const { parsedEntries, malformedCount } = parseLogEntries(log)
    expect(parsedEntries).toHaveLength(2)
    expect(parsedEntries[0]).toMatchObject({
      userId: 'user1',
      destBytes: 12345,
      action: 'ALLOW',
      category: 'CategoryA',
      url: 'http://example.com',
    })
    expect(parsedEntries[1]).toMatchObject({
      userId: 'user2',
      destBytes: 54321,
      action: 'BLOCK',
      category: 'Phishing',
      url: 'http://malicious.com',
    })
    expect(malformedCount).toBe(0)
  })

  it('counts malformed lines (wrong column count or non-numeric destBytes)', () => {
    const log =
      'user1\t12345\tALLOW\tCategoryA\thttp://example.com\nmalformed line\nuser2\tNaN\tBLOCK\tPhishing\thttp://malicious.com'
    const { parsedEntries, malformedCount } = parseLogEntries(log)
    expect(parsedEntries).toHaveLength(1)
    expect(parsedEntries[0].userId).toBe('user1')
    expect(malformedCount).toBe(2)
  })

  it('handles empty input', () => {
    const { parsedEntries, malformedCount } = parseLogEntries('')
    expect(parsedEntries).toHaveLength(0)
    expect(malformedCount).toBe(0)
  })
})
