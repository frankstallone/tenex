'use client'

import {
  calculateSummaryMetrics,
  transformAnomaliesForTimeseriesChart,
} from '@/lib/analysis-helpers'
import { Anomaly, LogAnalysisResult } from '@/lib/parsers/zscaler'
import {
  AlertTriangle,
  ArrowUpDown,
  FileText,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Info,
} from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { SummaryCard } from './summary-card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from './ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { type ChartConfig } from '@/components/ui/chart'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import TimelineChart from './timeline-chart'
import { Separator } from './ui/separator'

/**
 * Props for the ResultsDashboard component.
 * @interface ResultsDashboardProps
 * @property {LogAnalysisResult} analysisResult - The analysis result containing anomalies and metrics
 * @property {boolean} [isLoading] - Optional flag to indicate if the dashboard is in a loading state
 */
interface ResultsDashboardProps {
  analysisResult: LogAnalysisResult
  isLoading?: boolean
}

type SortKey = 'severity' | 'rule' | 'details' | 'line' | 'timestamp'
type SortDirection = 'asc' | 'desc'

interface Filters {
  severity: 'all' | 'High' | 'Medium' | 'Low'
  rule: string
}

const PAGE_SIZE = 20

/**
 * A dashboard component that displays log analysis results and anomalies.
 *
 * Features:
 * - Summary metrics cards showing total records and anomaly counts by severity
 * - Interactive data table with sorting and filtering capabilities
 * - Visual representations of data through area charts
 * - Responsive layout with loading and empty states
 * - Pagination for handling large datasets
 *
 * @component
 * @param {ResultsDashboardProps} props - The component props
 * @returns {JSX.Element} The rendered dashboard
 *
 * @example
 * ```tsx
 * <ResultsDashboard
 *   analysisResult={analysisResult}
 *   isLoading={false}
 * />
 * ```
 */
const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  analysisResult,
  isLoading = false,
}) => {
  const summaryMetrics = calculateSummaryMetrics(analysisResult)
  const timeseriesData = transformAnomaliesForTimeseriesChart(
    analysisResult.anomalies
  )
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey
    direction: SortDirection
  }>({ key: 'severity', direction: 'desc' })
  const [filters, setFilters] = useState<Filters>({
    severity: 'all',
    rule: 'all',
  })
  const [currentPage, setCurrentPage] = useState(1)

  const filteredAndSortedAnomalies = useMemo(() => {
    let filteredItems = [...analysisResult.anomalies]

    // Apply filters
    if (filters.severity !== 'all') {
      filteredItems = filteredItems.filter(
        (a) => a.severity === filters.severity
      )
    }
    if (filters.rule !== 'all') {
      filteredItems = filteredItems.filter((a) => a.rule === filters.rule)
    }

    // Apply sorting to the filtered items
    const sortableItems = [...filteredItems]
    const { key, direction } = sortConfig

    const severityOrder: Record<NonNullable<Anomaly['severity']>, number> = {
      High: 3,
      Medium: 2,
      Low: 1,
    }

    sortableItems.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      if (key === 'timestamp') {
        aValue = a.logEntry.datetime || ''
        bValue = b.logEntry.datetime || ''
      } else if (key === 'severity') {
        aValue = severityOrder[a.severity!] ?? 0
        bValue = severityOrder[b.severity!] ?? 0
      } else {
        aValue = a[key]
        bValue = b[key]
      }

      if (aValue < bValue) {
        return direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return direction === 'asc' ? 1 : -1
      }
      return 0
    })
    return sortableItems
  }, [analysisResult.anomalies, sortConfig, filters])

  const paginatedAnomalies = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE
    return filteredAndSortedAnomalies.slice(startIndex, startIndex + PAGE_SIZE)
  }, [filteredAndSortedAnomalies, currentPage])

  const totalPages = Math.ceil(filteredAndSortedAnomalies.length / PAGE_SIZE)

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const handleFilterChange = (filterType: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }))
  }

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  const uniqueRules = [...new Set(analysisResult.anomalies.map((a) => a.rule))]

  const severityColorMap: Record<NonNullable<Anomaly['severity']>, string> = {
    High: 'bg-red-500 hover:bg-red-600',
    Medium: 'bg-yellow-500 hover:bg-yellow-600',
    Low: 'bg-green-500 hover:bg-green-600',
  }

  const timelineChartConfig = {
    count: {
      label: 'Anomalies',
      color: 'hsl(var(--chart-1))',
    },
  } satisfies ChartConfig

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <Skeleton className="h-4 w-24" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <Skeleton className="h-8 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 w-32" />
              </CardTitle>
              <div className="flex items-center space-x-4 pt-4">
                <Skeleton className="h-10 w-[180px]" />
                <Skeleton className="h-10 w-[180px]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 flex-1" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 w-32" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <Skeleton className="h-[200px] w-full" />
              </div>
              <div>
                <Skeleton className="h-[200px] w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {analysisResult.anomalies.length === 0 ? (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>No Anomalies Found</AlertTitle>
          <AlertDescription>
            The analysis has completed successfully, but no anomalies were
            detected in the provided logs. This could mean either the system is
            functioning normally or the detection rules might need adjustment.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="flex flex-col gap-8">
            <div className="flex flex-row justify-between">
              <div className="flex flex-col gap-4">
                <h1 className="text-4xl font-bold">Operations dashboard</h1>
                <p className="text-muted-foreground">
                  Manage threats and ongoing cases.
                </p>
              </div>
              <div className="flex flex-row gap-4 justify-center items-center">
                <Badge className="text-green-800 bg-green-100 h-6">
                  Systems fully operational
                </Badge>
                <Button>
                  <ShieldAlert className="h-4 w-4" />
                  View all recent priority cases
                </Button>
              </div>
            </div>
            <Separator orientation="horizontal" />
          </div>
          <div className="flex space-x-8 h-20 py-2">
            <SummaryCard
              title="Volume"
              value={analysisResult.totalRecords}
              icon={FileText}
            />
            <Separator orientation="vertical" className="h-full" />
            <SummaryCard
              title="Total Anomalies"
              value={analysisResult.anomalies.length}
              icon={AlertTriangle}
            />
            <Separator orientation="vertical" />
            <SummaryCard
              title="High Severity"
              value={summaryMetrics.high}
              icon={ShieldAlert}
              valueClassName="text-red-500"
            />
            <Separator orientation="vertical" />
            <SummaryCard
              title="Medium Severity"
              value={summaryMetrics.medium}
              icon={ShieldCheck}
              valueClassName="text-yellow-500"
            />
            <Separator orientation="vertical" />
            <SummaryCard
              title="Low Severity"
              value={summaryMetrics.low}
              icon={ShieldQuestion}
              valueClassName="text-green-500"
            />
          </div>

          <div className="flex flex-col gap-8">
            <div className="flex flex-row gap-4">
              <TimelineChart
                data={timeseriesData}
                chartConfig={timelineChartConfig}
              />
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center space-x-4 pt-4">
                {/* Severity Filter */}
                <Select
                  value={filters.severity}
                  onValueChange={(value) =>
                    handleFilterChange('severity', value)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
                {/* Rule Filter */}
                <Select
                  value={filters.rule}
                  onValueChange={(value) => handleFilterChange('rule', value)}
                >
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Filter by Rule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Rules</SelectItem>
                    {uniqueRules.map((rule) => (
                      <SelectItem key={rule} value={rule}>
                        {rule}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Card>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <Button
                            variant="ghost"
                            onClick={() => requestSort('severity')}
                          >
                            Severity
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            onClick={() => requestSort('rule')}
                          >
                            Rule
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            onClick={() => requestSort('details')}
                          >
                            Details
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </Button>
                        </TableHead>
                        <TableHead className="text-right">
                          <Button
                            variant="ghost"
                            onClick={() => requestSort('line')}
                          >
                            Line
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            onClick={() => requestSort('timestamp')}
                          >
                            Timestamp
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </Button>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedAnomalies.map((anomaly, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Badge
                              className={`${
                                severityColorMap[anomaly.severity!]
                              } text-white`}
                            >
                              {anomaly.severity}
                            </Badge>
                          </TableCell>
                          <TableCell>{anomaly.rule}</TableCell>
                          <TableCell>{anomaly.details}</TableCell>
                          <TableCell>{anomaly.logEntry.linenumber}</TableCell>
                          <TableCell>{anomaly.logEntry.datetime}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between py-4">
                      <div className="text-sm text-muted-foreground">
                        Showing page {currentPage} of {totalPages}
                      </div>
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                handlePageChange(currentPage - 1)
                              }}
                              isActive={currentPage > 1}
                            />
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationNext
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                handlePageChange(currentPage + 1)
                              }}
                              isActive={currentPage < totalPages}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ResultsDashboard
