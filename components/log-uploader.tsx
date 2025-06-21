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
import { useRouter } from 'next/navigation'
import React, { useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

export default function LogUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle')
  const router = useRouter()

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
    }
  }, [])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setUploadStatus('idle')
      setUploadProgress(0)
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
        router.push(`/dashboard?resultId=${response.resultId}`)
      } else {
        setUploadStatus('error')
        toast.error(response.error || 'An unknown error occurred.')
      }
    }

    xhr.onerror = () => {
      setUploadStatus('error')
      toast.error('A network error occurred. Please try again.')
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
        {uploadStatus === 'uploading' && (
          <div className="mt-4">
            <Progress value={uploadProgress} />
            <p className="text-sm text-center mt-2 text-muted-foreground">
              Uploading... {Math.round(uploadProgress)}%
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
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
