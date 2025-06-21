import { Suspense } from 'react'
import Dashboard from '@/components/dashboard'

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center pt-4 pb-24 px-24">
          <p>Loading...</p>
        </div>
      }
    >
      <Dashboard />
    </Suspense>
  )
}
