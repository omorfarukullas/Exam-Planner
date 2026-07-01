'use client'

import { useState, useEffect } from 'react'
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds, startOfDay } from 'date-fns'

interface LiveCountdownProps {
  targetDate: string // YYYY-MM-DD format
  className?: string
  variant?: 'badge' | 'hero'
}

export function LiveCountdown({ targetDate, className = '', variant = 'badge' }: LiveCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number; isPast: boolean } | null>(null)

  useEffect(() => {
    const target = startOfDay(new Date(targetDate + 'T00:00:00'))

    const updateTimer = () => {
      const now = new Date()
      const diffSecs = differenceInSeconds(target, now)
      
      if (diffSecs <= 0) {
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0, isPast: true })
        return
      }
      
      setTimeLeft({
        d: differenceInDays(target, now),
        h: differenceInHours(target, now) % 24,
        m: differenceInMinutes(target, now) % 60,
        s: diffSecs % 60,
        isPast: false
      })
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  if (!timeLeft) {
    return <span className={className}>...</span>
  }

  // --- BADGE VARIANT (Classic text) ---
  if (variant === 'badge') {
    if (timeLeft.isPast) return <span className={`${className} opacity-80`}>Past</span>
    
    let text = ''
    if (timeLeft.d > 0) text = `${timeLeft.d}d ${timeLeft.h}h ${timeLeft.m}m ${timeLeft.s}s`
    else if (timeLeft.h > 0) text = `${timeLeft.h}h ${timeLeft.m}m ${timeLeft.s}s`
    else if (timeLeft.m > 0) text = `${timeLeft.m}m ${timeLeft.s}s`
    else text = `${timeLeft.s}s left`
    
    return <span className={className}>{text}</span>
  }

  // --- HERO VARIANT (Big, eye-catching) ---
  
  // Determine color scheme based on urgency
  let colorClass = 'from-green-500 to-emerald-600 shadow-green-200'
  let labelColor = 'text-green-700'
  
  if (timeLeft.isPast || timeLeft.d <= 0) {
    colorClass = 'from-red-500 to-rose-600 shadow-red-200 animate-pulse'
    labelColor = 'text-red-700'
  } else if (timeLeft.d <= 6) {
    colorClass = 'from-amber-400 to-orange-500 shadow-amber-200'
    labelColor = 'text-amber-700'
  }

  const TimeBox = ({ value, label }: { value: number | string; label: string }) => (
    <div className="flex flex-col items-center justify-center p-3 sm:p-5 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 shadow-sm min-w-[70px] sm:min-w-[90px]">
      <span className={`text-3xl sm:text-5xl font-black bg-gradient-to-br ${colorClass} bg-clip-text text-transparent drop-shadow-sm`}>
        {value.toString().padStart(2, '0')}
      </span>
      <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider mt-1 ${labelColor}`}>
        {label}
      </span>
    </div>
  )

  if (timeLeft.isPast) {
    return (
      <div className={`flex flex-col items-center justify-center p-6 bg-gradient-to-br from-red-50 to-rose-50 rounded-3xl border border-red-100 ${className}`}>
        <span className="text-4xl mb-2">🚨</span>
        <h3 className="text-xl font-bold text-red-800">Exam Passed</h3>
      </div>
    )
  }

  return (
    <div className={`p-6 sm:p-8 rounded-3xl bg-gradient-to-br ${colorClass.replace('text-transparent', '').replace('bg-clip-text', '')} bg-opacity-10 shadow-lg ${className}`}>
      <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4">
        <TimeBox value={timeLeft.d} label="Days" />
        <span className={`text-2xl sm:text-4xl font-bold ${labelColor} opacity-50 mb-4 sm:mb-6`}>:</span>
        <TimeBox value={timeLeft.h} label="Hours" />
        <span className={`text-2xl sm:text-4xl font-bold ${labelColor} opacity-50 mb-4 sm:mb-6`}>:</span>
        <TimeBox value={timeLeft.m} label="Mins" />
        <span className={`text-2xl sm:text-4xl font-bold ${labelColor} opacity-50 mb-4 sm:mb-6`}>:</span>
        <TimeBox value={timeLeft.s} label="Secs" />
      </div>
    </div>
  )
}
