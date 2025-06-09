'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { LogAnalysisResult } from '@/lib/parsers/zscaler'
import React, { useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

export default function LogUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle')
  const [analysisResult, setAnalysisResult] =
    useState<LogAnalysisResult | null>(null)

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      setIsDragOver(true)
    },
    []
  )

  const handleDragLeave = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      setIsDragOver(false)
    },
    []
  )

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(false)
    const droppedFile = event.dataTransfer.files?.[0]
    if (droppedFile) {
      setFile(droppedFile)
      setUploadStatus('idle')
      setUploadProgress(0)
      setAnalysisResult(null)
    }
  }, [])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setUploadStatus('idle')
      setUploadProgress(0)
      setAnalysisResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploadStatus('uploading')
    setUploadProgress(0)

    const formData = new FormData()
    formData.append('file', file)

    const xhr = new XMLHttpRequest()

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100
        setUploadProgress(percentComplete)
      }
    }

    xhr.onload = () => {
      const response = JSON.parse(xhr.responseText)
      if (xhr.status >= 200 && xhr.status < 300) {
        setUploadStatus('success')
        setUploadProgress(100)
        toast.success('File processed successfully.')
        setAnalysisResult(response)
      } else {
        setUploadStatus('error')
        toast.error(response.error || 'An unknown error occurred.')
        setAnalysisResult(null)
      }
    }

    xhr.onerror = () => {
      setUploadStatus('error')
      toast.error('A network error occurred. Please try again.')
      setAnalysisResult(null)
    }

    xhr.open('POST', '/api/logs/upload', true)
    xhr.send(formData)
  }

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Log File Uploader</CardTitle>
        <CardDescription>
          Upload a Zscaler log file for parsing and anomaly detection.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() =>
            uploadStatus !== 'uploading' && fileInputRef.current?.click()
          }
          className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-md transition-colors ${
            uploadStatus === 'uploading'
              ? 'cursor-not-allowed'
              : 'cursor-pointer'
          } ${
            isDragOver
              ? 'border-primary bg-accent'
              : 'border-border hover:bg-accent/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".log,.txt,text/plain"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploadStatus === 'uploading'}
          />
          <p className="text-sm text-muted-foreground">
            Drag & drop a log file here, or click to select
          </p>
          <p className="text-xs text-muted-foreground/80 mt-1">
            (.log or .txt, up to 4MB)
          </p>
        </div>
        {file && (
          <div className="mt-4 text-sm font-medium">
            <p>Selected file: {file.name}</p>
            <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
          </div>
        )}
        {analysisResult && (
          <div className="mt-6 p-4 border rounded-md bg-muted/50">
            <h3 className="text-lg font-semibold mb-2">Analysis Results</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <p>
                <strong>Total Records:</strong> {analysisResult.totalRecords}
              </p>
              <p>
                <strong>Anomalies:</strong> {analysisResult.anomalies.length}
              </p>
              <p>
                <strong>Malformed Lines:</strong>{' '}
                {analysisResult.malformedCount}
              </p>
            </div>
            {analysisResult.anomalies.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold">Detected Anomalies:</h4>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  {analysisResult.anomalies.map((anomaly, index) => (
                    <li key={index}>
                      <span className="font-semibold">{anomaly.rule}:</span>{' '}
                      {anomaly.details} (Line: {anomaly.line})
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {analysisResult.malformedCount > 0 && (
              <div className="mt-4">
                <details>
                  <summary className="cursor-pointer font-semibold text-sm">
                    View {analysisResult.malformedCount} Malformed Lines
                  </summary>
                  <pre className="mt-2 p-2 bg-background rounded-md text-xs overflow-x-auto">
                    <code>{analysisResult.malformedLines?.join('\n')}</code>
                  </pre>
                </details>
              </div>
            )}
          </div>
        )}
        {uploadStatus === 'uploading' && (
          <div className="mt-4">
            <Progress value={uploadProgress} />
            <p className="text-sm text-center mt-2 text-muted-foreground">
              Uploading... {Math.round(uploadProgress)}%
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleUpload}
          disabled={!file || uploadStatus === 'uploading'}
          className="w-full"
        >
          {uploadStatus === 'uploading' ? 'Uploading...' : 'Parse Log File'}
        </Button>
      </CardFooter>
    </Card>
  )
}
