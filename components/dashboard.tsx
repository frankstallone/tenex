'use client'

import ResultsDashboard from '@/components/results-dashboard'
import { LogAnalysisResult } from '@/lib/parsers/zscaler'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from './ui/button'
import { Skeleton } from './ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Separator } from './ui/separator'
import { Badge } from './ui/badge'

export default function Dashboard() {
  const [analysisResult, setAnalysisResult] =
    useState<LogAnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const resultId = searchParams.get('resultId')
    if (!resultId) {
      toast.error('No analysis result specified.')
      setError('No analysis result specified.')
      setLoading(false)
      router.push('/')
      return
    }

    const fetchResult = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/analysis/${resultId}`)
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          )
        }
        const data: LogAnalysisResult = await response.json()
        setAnalysisResult(data)
      } catch (e) {
        const error =
          e instanceof Error ? e.message : 'An unknown error occurred'
        console.error(e)
        toast.error(error)
        setError(error)
      } finally {
        setLoading(false)
      }
    }

    fetchResult()
  }, [searchParams, router])

  const handleGoBack = () => {
    router.push('/')
  }

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center pt-4 pb-24 px-24">
        <div className="w-full max-w-8xl">
          <div className="space-y-6">
            {/* Dashboard Header */}
            <div className="flex flex-col gap-8">
              <div className="flex flex-row justify-between">
                <div className="flex flex-col gap-4">
                  <Skeleton className="h-10 w-80" />{' '}
                  {/* Operations dashboard title */}
                  <Skeleton className="h-5 w-64" /> {/* Subtitle */}
                </div>
                <div className="flex flex-row gap-4 justify-center items-center">
                  <Badge className="text-green-800 bg-green-100 h-6">
                    <Skeleton className="h-4 w-32" />
                  </Badge>
                  <Skeleton className="h-10 w-56" />{' '}
                  {/* View all cases button */}
                </div>
              </div>
              <Separator orientation="horizontal" />
            </div>

            {/* Summary Cards */}
            <div className="flex space-x-8 h-20 py-2">
              <Card className="flex-1">
                <CardHeader className="space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    <Skeleton className="h-4 w-16" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20" />
                </CardContent>
              </Card>
              <Separator orientation="vertical" className="h-full" />
              <Card className="flex-1">
                <CardHeader className="space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    <Skeleton className="h-4 w-28" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
              <Separator orientation="vertical" />
              <Card className="flex-1">
                <CardHeader className="space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    <Skeleton className="h-4 w-24" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 bg-red-100" />
                </CardContent>
              </Card>
              <Separator orientation="vertical" />
              <Card className="flex-1">
                <CardHeader className="space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    <Skeleton className="h-4 w-28" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 bg-yellow-100" />
                </CardContent>
              </Card>
            </div>

            {/* Timeline Chart */}
            <div className="flex flex-col gap-8">
              <div className="flex flex-row gap-4">
                <Card className="flex-1">
                  <CardHeader>
                    <CardTitle>
                      <Skeleton className="h-6 w-40" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-64 w-full" />
                  </CardContent>
                </Card>
              </div>

              {/* Filters and Table */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center space-x-4 pt-4">
                  <Skeleton className="h-10 w-[180px]" />
                  <Skeleton className="h-10 w-[220px]" />
                </div>
                <Card>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Table Header */}
                      <div className="flex items-center space-x-4 border-b pb-2">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-6 w-24" />
                      </div>
                      {/* Table Rows */}
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex items-center space-x-4 py-2"
                        >
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-6 w-16" />
                          <Skeleton className="h-6 flex-1" />
                          <Skeleton className="h-6 w-24" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          <Skeleton className="h-10 w-40 mt-4" />{' '}
          {/* Upload Another File button */}
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center pt-4 pb-24 px-24">
        <p className="text-red-500">{error}</p>
        <Button onClick={handleGoBack} className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  if (!analysisResult) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center pt-4 pb-24 px-24">
        <p>No analysis results found.</p>
        <Button onClick={handleGoBack} className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center pt-4 pb-24 px-24">
      <div className="w-full max-w-8xl">
        <ResultsDashboard analysisResult={analysisResult} />
        <Button onClick={handleGoBack} className="mt-4">
          Upload Another File
        </Button>
      </div>
    </main>
  )
}
