'use client'

import ResultsDashboard from '@/components/results-dashboard'
import { LogAnalysisResult } from '@/lib/parsers/zscaler'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from './ui/button'

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
      <div className="flex min-h-screen flex-col items-center justify-center pt-4 pb-24 px-24">
        <p>Loading analysis results...</p>
      </div>
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
