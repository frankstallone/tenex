// Types for log parsing and anomaly detection

export type LogEntry = {
  userId: string
  destBytes: number
  action: string
  category: string
  url: string
  // Add more fields as needed from the Zscaler log spec
}

export type Anomaly = {
  type: string
  description: string
  confidence: number // 0.0 to 1.0
}
