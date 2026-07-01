'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)]">
      <div className="glass-card max-w-md w-full p-8 text-center neon-glow">
        <div className="w-20 h-20 mx-auto mb-6 bg-violet-100 dark:bg-violet-500/20 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-extrabold text-foreground mb-2">404</h1>
        <h2 className="text-xl font-bold text-foreground mb-4">Page not found</h2>
        
        <p className="text-muted dark:text-gray-400 mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
        </p>
        
        <Link 
          href="/"
          className="btn-primary w-full py-3 rounded-2xl block text-center"
        >
          Go back home
        </Link>
      </div>
    </div>
  )
}
