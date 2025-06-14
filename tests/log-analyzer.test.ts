import { analyzeLogs } from '../lib/log-analyzer'

describe('analyzeLogs integration test', () => {
  it('should correctly parse, detect all anomalies, and return a consolidated result', () => {
    // This log contains:
    // - 2 valid entries for user 'normal_user'
    // - 20 valid entries for 'heavy_user' (triggers statistical anomaly)
    // - 1 entry with a large download (triggers rule anomaly)
    // - 1 entry with a blocked request (triggers rule anomaly)
    // - 1 entry with a high-risk category (triggers rule anomaly)
    // - 2 malformed lines
    const logContent = `
normal_user\t100\tALLOW\tGeneral\thttp://site1.com
normal_user\t200\tALLOW\tGeneral\thttp://site2.com
${Array(20).fill('heavy_user\t50\tALLOW\tGeneral\thttp://site3.com').join('\n')}
downloader\t20000000\tALLOW\tDownloads\thttp://download.com
hacker\t100\tBLOCK\tMalicious Sites\thttp://hax.com
this is a malformed line
another bad line
`

    const result = analyzeLogs(logContent)

    // Verify counts
    expect(result.totalRecords).toBe(24) // 2 normal + 20 heavy + 1 download + 1 block
    expect(result.malformedCount).toBe(2)

    // Verify anomalies
    expect(result.anomalies).toHaveLength(4)

    const types = result.anomalies.map((a) => a.type)
    expect(types).toContain('High Traffic User')
    expect(types).toContain('Large Download')
    expect(types).toContain('Blocked Request')
    expect(types).toContain('High-Risk Category')
  })

  it('should return zero results for an empty log file', () => {
    const result = analyzeLogs('')
    expect(result.totalRecords).toBe(0)
    expect(result.malformedCount).toBe(0)
    expect(result.anomalies).toHaveLength(0)
  })
})
