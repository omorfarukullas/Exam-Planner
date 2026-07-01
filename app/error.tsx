'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full p-8 text-center border-red-200 dark:border-red-500/30">
        <div className="w-20 h-20 mx-auto mb-6 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h2 className="text-xl font-bold text-foreground mb-4">Something went wrong!</h2>
        
        <p className="text-muted dark:text-gray-400 mb-8 text-sm">
          An unexpected error occurred. Please try again.
        </p>
        
        <div className="flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="btn-secondary flex-1 py-3 rounded-2xl"
          >
            Reload Page
          </button>
          <button
            onClick={() => reset()}
            className="btn-primary flex-1 py-3 rounded-2xl"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  )
}
