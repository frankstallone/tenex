import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import ResultsDashboard from './results-dashboard'
import { LogAnalysisResult } from '@/lib/parsers/zscaler'
import '@testing-library/jest-dom'

// Mock the recharts library since it uses canvas which isn't available in jsdom
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="recharts-responsive-container">{children}</div>
  ),
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="recharts-area-chart">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="recharts-bar-chart">{children}</div>
  ),
  Area: () => <div data-testid="recharts-area" />,
  Bar: () => <div data-testid="recharts-bar" />,
  XAxis: () => <div data-testid="recharts-x-axis" />,
  YAxis: () => <div data-testid="recharts-y-axis" />,
  CartesianGrid: () => <div data-testid="recharts-cartesian-grid" />,
  Tooltip: () => <div data-testid="recharts-tooltip" />,
  Legend: () => <div data-testid="recharts-legend" />,
}))

jest.mock('@/components/ui/chart', () => ({
  ChartContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="chart-container">{children}</div>
  ),
  ChartTooltip: () => <div data-testid="chart-tooltip" />,
  ChartTooltipContent: () => <div data-testid="chart-tooltip-content" />,
}))

const mockAnalysisResult: LogAnalysisResult = {
  totalRecords: 125,
  malformedCount: 5,
  anomalies: [
    {
      rule: 'High Severity Rule',
      line: 10,
      details: 'Critical security event detected.',
      logEntry: { datetime: '2023-10-27T10:00:00Z' },
      severity: 'High',
    },
    {
      rule: 'Medium Severity Rule',
      line: 25,
      details: 'Suspicious activity observed.',
      logEntry: { datetime: '2023-10-27T11:00:00Z' },
      severity: 'Medium',
    },
    {
      rule: 'Another Medium Rule',
      line: 26,
      details: 'More suspicious activity.',
      logEntry: { datetime: '2023-10-27T11:05:00Z' },
      severity: 'Medium',
    },
    {
      rule: 'Low Severity Rule',
      line: 50,
      details: 'Informational event.',
      logEntry: { datetime: '2023-10-27T12:00:00Z' },
      severity: 'Low',
    },
  ],
}

describe('ResultsDashboard', () => {
  it('renders correctly with data', () => {
    render(<ResultsDashboard analysisResult={mockAnalysisResult} />)
    expect(screen.getByText('Total Records')).toBeInTheDocument()
  })

  it('renders summary cards with correct values', () => {
    render(<ResultsDashboard analysisResult={mockAnalysisResult} />)

    expect(screen.getByText('125')).toBeInTheDocument() // Total Records
    expect(screen.getByText('4')).toBeInTheDocument() // Total Anomalies
    expect(screen.getAllByText('1')[0]).toBeInTheDocument() // High Severity
    expect(screen.getByText('2')).toBeInTheDocument() // Medium Severity
    expect(screen.getAllByText('1')[1]).toBeInTheDocument() // Low Severity
  })

  it('renders data table with correct anomaly information', () => {
    render(<ResultsDashboard analysisResult={mockAnalysisResult} />)

    // Check table headers
    expect(screen.getByText('Severity')).toBeInTheDocument()
    expect(screen.getByText('Rule')).toBeInTheDocument()
    expect(screen.getByText('Details')).toBeInTheDocument()
    expect(screen.getByText('Timestamp')).toBeInTheDocument()

    // Check table content
    expect(screen.getByText('High Severity Rule')).toBeInTheDocument()
    expect(
      screen.getByText('Critical security event detected.')
    ).toBeInTheDocument()
    expect(screen.getByText('Medium Severity Rule')).toBeInTheDocument()
  })

  it('displays a color-coded badge for severity', () => {
    render(<ResultsDashboard analysisResult={mockAnalysisResult} />)

    const highSeverityBadge = screen.getByText('High').closest('span')
    expect(highSeverityBadge).toHaveClass('bg-red-500')

    const mediumSeverityBadges = screen.getAllByText('Medium')
    expect(mediumSeverityBadges[0].closest('span')).toHaveClass('bg-yellow-500')
    expect(mediumSeverityBadges[1].closest('span')).toHaveClass('bg-yellow-500')

    const lowSeverityBadge = screen.getByText('Low').closest('span')
    expect(lowSeverityBadge).toHaveClass('bg-green-500')
  })

  it('handles sorting correctly', () => {
    render(<ResultsDashboard analysisResult={mockAnalysisResult} />)

    // Click severity column header to sort
    fireEvent.click(screen.getByRole('button', { name: /severity/i }))

    // Check order of severity badges (should be Low -> Medium -> High)
    let rows = within(screen.getByRole('table')).getAllByRole('row')
    // Note: this is a simple check, a more robust check would verify the content of each row
    expect(rows[1]).toHaveTextContent('Low')
    expect(rows[2]).toHaveTextContent('Medium')
    expect(rows[3]).toHaveTextContent('Medium')
    expect(rows[4]).toHaveTextContent('High')

    // Click again to reverse order
    fireEvent.click(screen.getByRole('button', { name: /severity/i }))
    rows = within(screen.getByRole('table')).getAllByRole('row')
    expect(rows[1]).toHaveTextContent('High')
    expect(rows[2]).toHaveTextContent('Medium')
    expect(rows[3]).toHaveTextContent('Medium')
    expect(rows[4]).toHaveTextContent('Low')
  })
})
