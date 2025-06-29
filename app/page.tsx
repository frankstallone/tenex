import { SignedIn, SignedOut } from '@clerk/nextjs'
import LogUploader from '@/components/log-uploader'
import LandingPage from '@/components/landing-page'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-24">
      <SignedIn>
        <LogUploader />
      </SignedIn>
      <SignedOut>
        <LandingPage />
      </SignedOut>
    </main>
  )
}
