'use client'

import { useState, useEffect } from 'react'

export function LiveCountdown({ targetDateStr }: { targetDateStr: string }) {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number; total: number } | null>(null)
  
  useEffect(() => {
    // Parse the target date (we assume it's the start of that day, or local midnight)
    const target = new Date(targetDateStr + 'T00:00:00').getTime()
    
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const difference = target - now
      
      if (difference <= 0) {
        return { d: 0, h: 0, m: 0, s: 0, total: 0 }
      }
      
      return {
        d: Math.floor(difference / (1000 * 60 * 60 * 24)),
        h: Math.floor((difference / (1000 * 60 * 60)) % 24),
        m: Math.floor((difference / 1000 / 60) % 60),
        s: Math.floor((difference / 1000) % 60),
        total: difference
      }
    }

    // Set initial state
    setTimeLeft(calculateTimeLeft())

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDateStr])

  // Don't render anything until the first client-side tick to avoid hydration mismatch
  if (!timeLeft) return <div className="h-[72px] animate-pulse bg-secondary/50 rounded-xl w-full max-w-[300px]"></div>

  const isPast = timeLeft.total <= 0
  const daysLeft = timeLeft.d

  // Determine colors based on proximity
  let colors = 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30 text-green-700 dark:text-green-400'
  let label = 'Time until Exam'
  
  if (isPast) {
    colors = 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400'
    label = 'Exam is Today/Past!'
  } else if (daysLeft <= 1) {
    colors = 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 animate-pulse'
    label = 'Exam is Very Close!'
  } else if (daysLeft <= 6) {
    colors = 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400'
    label = 'Exam is Upcoming'
  }

  return (
    <div className={`rounded-xl border p-4 ${colors} flex flex-col items-center justify-center min-w-[280px]`}>
      <div className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">{label}</div>
      <div className="flex gap-4 text-center font-mono font-bold tracking-tight">
        <div className="flex flex-col">
          <span className="text-3xl leading-none">{String(timeLeft.d).padStart(2, '0')}</span>
          <span className="text-[10px] uppercase opacity-70 mt-1">Days</span>
        </div>
        <span className="text-2xl leading-none opacity-50 mt-0.5">:</span>
        <div className="flex flex-col">
          <span className="text-3xl leading-none">{String(timeLeft.h).padStart(2, '0')}</span>
          <span className="text-[10px] uppercase opacity-70 mt-1">Hrs</span>
        </div>
        <span className="text-2xl leading-none opacity-50 mt-0.5">:</span>
        <div className="flex flex-col">
          <span className="text-3xl leading-none">{String(timeLeft.m).padStart(2, '0')}</span>
          <span className="text-[10px] uppercase opacity-70 mt-1">Min</span>
        </div>
        <span className="text-2xl leading-none opacity-50 mt-0.5">:</span>
        <div className="flex flex-col w-[3ch]">
          <span className="text-3xl leading-none">{String(timeLeft.s).padStart(2, '0')}</span>
          <span className="text-[10px] uppercase opacity-70 mt-1">Sec</span>
        </div>
      </div>
    </div>
  )
}
