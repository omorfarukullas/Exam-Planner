'use client'

import { useTransition } from 'react'

export function DeleteButton({ action }: { action: () => void }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={isPending}
      className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white rounded-2xl font-semibold text-base transition-all disabled:opacity-50"
      onClick={() => {
        if (confirm('Are you sure you want to delete this subject? This action cannot be undone.')) {
          startTransition(() => {
            action()
          })
        }
      }}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      {isPending ? 'Deleting…' : 'Delete Subject'}
    </button>
  )
}
