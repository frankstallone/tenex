'use client'

import ResultsDashboard from '@/components/results-dashboard'
import { LogAnalysisResult } from '@/lib/parsers/zscaler'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from './ui/button'

export default function Dashboard() {
  const [analysisResult, setAnalysisResult] =
    useState<LogAnalysisResult | null>(null)
  const router = useRouter()

  useEffect(() => {
    const resultId = new URLSearchParams(window.location.search).get('resultId')
    if (resultId) {
      const storedResult = sessionStorage.getItem(resultId)
      if (storedResult) {
        try {
          const parsedResult = JSON.parse(storedResult)
          setAnalysisResult(parsedResult)
        } catch (error) {
          console.error(error)
          toast.error('Failed to parse analysis result.')
          router.push('/')
        }
      } else {
        toast.error('Analysis result not found.')
        router.push('/')
      }
    } else {
      toast.error('No analysis result specified.')
      router.push('/')
    }
  }, [router])

  const handleGoBack = () => {
    router.push('/')
  }

  if (!analysisResult) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <p>Loading analysis results...</p>
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-4xl">
        <ResultsDashboard analysisResult={analysisResult} />
        <Button onClick={handleGoBack} className="mt-4">
          Upload Another File
        </Button>
      </div>
    </main>
  )
}
