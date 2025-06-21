import { SignIn } from '@clerk/nextjs'

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-6xl">
        TENEX.AI
      </h1>
      <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
        10× Your Threat Detection & Response with Next-Gen MDR
      </p>
      <div className="mt-10">
        <SignIn routing="hash" />
      </div>
    </div>
  )
}
