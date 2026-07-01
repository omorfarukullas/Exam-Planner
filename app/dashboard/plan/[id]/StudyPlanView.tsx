'use client'

import { useState, useTransition } from 'react'
import { toast } from 'react-hot-toast'
import { togglePlanItem, addManualPlanItem, deletePlanItem } from './actions'
import { format, parseISO, isToday, isPast, isFuture } from 'date-fns'

interface PlanItem {
  id: string
  day_date: string
  topic: string
  estimated_minutes: number
  priority: 'high' | 'medium' | 'low'
  completed: boolean
  concept_summary?: string
}

interface DayGroup {
  date: string
  items: PlanItem[]
}

const PRIORITY_CONFIG = {
  high:   { label: 'High',   color: 'bg-red-100 text-red-700 border-red-200',    dot: 'bg-red-400' },
  medium: { label: 'Medium', color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-400' },
  low:    { label: 'Low',    color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-400' },
}

function PlanItemRow({ item, subjectId, onOptimisticToggle }: {
  item: PlanItem
  subjectId: string
  onOptimisticToggle: (id: string) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [deleting, setDeleting] = useState(false)
  const [showBrainstorm, setShowBrainstorm] = useState(false)
  const priority = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.medium

  const handleToggle = () => {
    onOptimisticToggle(item.id)
    startTransition(() => togglePlanItem(item.id, !item.completed, subjectId))
  }

  const handleDelete = () => {
    setDeleting(true)
    startTransition(async () => {
      try {
        await deletePlanItem(item.id, subjectId)
        toast.success('Session removed.')
      } catch {
        toast.error('Failed to remove session.')
        setDeleting(false)
      }
    })
  }

  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all group ${
      item.completed
        ? 'bg-gray-50 border-gray-100 opacity-60'
        : 'bg-white border-gray-200 hover:border-indigo-200 hover:shadow-sm'
    } ${deleting ? 'opacity-30' : ''}`}>
      {/* Checkbox */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
          item.completed
            ? 'border-indigo-500 bg-indigo-500'
            : 'border-gray-300 hover:border-indigo-400'
        }`}
      >
        {item.completed && (
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-snug ${item.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
          {item.topic}
        </p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${priority.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
            {priority.label}
          </span>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {item.estimated_minutes} min
          </span>
          {item.concept_summary && (
            <button
              type="button"
              onClick={() => setShowBrainstorm(!showBrainstorm)}
              className="text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md transition-colors flex items-center gap-1"
            >
              💡 Brainstorm {showBrainstorm ? '▲' : '▼'}
            </button>
          )}
        </div>

        {showBrainstorm && item.concept_summary && (
          <div className="mt-3 p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100/50 text-sm text-indigo-900 leading-relaxed shadow-sm">
            <span className="font-bold text-indigo-700 block mb-1">🧠 Pre-study Concept Breakdown:</span>
            {item.concept_summary}
          </div>
        )}
      </div>

      {/* Delete */}
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all p-1 rounded-lg hover:bg-red-50"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

function ManualEntryForm({ subjectId, onClose }: { subjectId: string; onClose: () => void }) {
  const [isPending, startTransition] = useTransition()
  const today = new Date().toISOString().split('T')[0]

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await addManualPlanItem(subjectId, fd)
        toast.success('Session added!')
        onClose()
      } catch {
        toast.error('Failed to add session.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 space-y-4">
      <h3 className="text-sm font-semibold text-indigo-900">Add Study Session Manually</h3>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Topic</label>
        <input
          name="topic"
          required
          placeholder="e.g. Chapter 3 - Derivatives"
          className="input-field text-sm py-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Date</label>
          <input type="date" name="day_date" required min={today} defaultValue={today} className="input-field text-sm py-2" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Duration (min)</label>
          <input type="number" name="estimated_minutes" defaultValue={60} min={15} max={480} className="input-field text-sm py-2" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Priority</label>
        <select name="priority" className="input-field text-sm py-2">
          <option value="low">Low</option>
          <option value="medium" selected>Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="flex gap-2">
        <button type="submit" disabled={isPending} className="btn-primary flex-1 py-2.5 rounded-xl text-sm">
          {isPending ? 'Adding...' : 'Add Session'}
        </button>
        <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-all">
          Cancel
        </button>
      </div>
    </form>
  )
}

interface StudyPlanViewProps {
  subjectId: string
  subjectName: string
  examDate: string
  hasMissedSessions: boolean
  initialPlan: PlanItem[]
}

export function StudyPlanView({ subjectId, subjectName, examDate, hasMissedSessions, initialPlan }: StudyPlanViewProps) {
  const [plan, setPlan] = useState<PlanItem[]>(initialPlan)
  const [generating, setGenerating] = useState(false)
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [showReshuffle, setShowReshuffle] = useState(hasMissedSessions)

  const generatePlan = async (isReshuffle = false) => {
    setGenerating(true)

    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId, isReshuffle }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Something went wrong. Please try again.')
      } else {
        toast.success(isReshuffle ? 'Plan reshuffled!' : `Generated ${data.itemCount} sessions!`)
        setShowReshuffle(false)
        // Reload the page to get fresh data
        window.location.reload()
      }
    } catch {
      toast.error('Network error. Please check your connection and try again.')
    } finally {
      setGenerating(false)
    }
  }

  const handleOptimisticToggle = (id: string) => {
    setPlan(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item))
  }

  // Group by day
  const grouped = plan.reduce<Record<string, PlanItem[]>>((acc, item) => {
    if (!acc[item.day_date]) acc[item.day_date] = []
    acc[item.day_date].push(item)
    return acc
  }, {})

  const days = Object.keys(grouped).sort()
  const totalMinutes = plan.reduce((acc, i) => acc + i.estimated_minutes, 0)
  const completedCount = plan.filter(i => i.completed).length
  const progressPct = plan.length > 0 ? Math.round((completedCount / plan.length) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Reshuffle Banner */}
      {showReshuffle && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⚠️</div>
            <div className="flex-1">
              <h3 className="font-bold text-amber-900 text-sm">Missed Study Sessions Detected</h3>
              <p className="text-amber-700 text-xs mt-1">
                You have incomplete sessions from past days. Let AI reshuffle your remaining topics across the days you have left.
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => generatePlan(true)}
                  disabled={generating}
                  className="btn-primary text-xs px-4 py-2 rounded-xl"
                >
                  {generating ? '⏳ Reshuffling...' : '🔄 Auto-Reshuffle Plan'}
                </button>
                <button onClick={() => setShowReshuffle(false)} className="text-xs text-amber-600 hover:text-amber-800">
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Card */}
      {plan.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-gray-700">Overall Progress</p>
              <p className="text-xs text-gray-400 mt-0.5">{completedCount} of {plan.length} sessions complete · {Math.round(totalMinutes / 60)}h total</p>
            </div>
            <div className="text-3xl font-extrabold gradient-text">{progressPct}%</div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => generatePlan(false)}
            disabled={generating}
            className="btn-primary px-5 py-2.5 rounded-2xl text-sm flex items-center gap-2"
          >
            {generating ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Generating with AI...
              </>
            ) : (
              <>✨ {plan.length > 0 ? 'Regenerate AI Plan' : 'Generate AI Plan'}</>
            )}
          </button>

          <button
            onClick={() => setShowManualEntry(v => !v)}
            className="px-5 py-2.5 rounded-2xl text-sm border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Manually
          </button>
        </div>

        {plan.length > 0 && (
          <div className="text-xs text-gray-400">
            {days.length} days planned
          </div>
        )}
      </div>

      {/* Manual Entry Form */}
      {showManualEntry && (
        <ManualEntryForm subjectId={subjectId} onClose={() => setShowManualEntry(false)} />
      )}

      {/* Loading Skeleton */}
      {generating && (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-3xl border border-gray-100 p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-32 mb-4" />
              <div className="space-y-2">
                <div className="h-8 bg-gray-100 rounded-2xl" />
                <div className="h-8 bg-gray-100 rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!generating && plan.length === 0 && (
        <div className="border-2 border-dashed border-indigo-200 rounded-3xl p-14 text-center">
          <div className="text-5xl mb-4">🤖</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No study plan yet</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
            Click "Generate AI Plan" to let AI create a personalized day-by-day study schedule based on your syllabus and exam date.
          </p>
          <button
            onClick={() => generatePlan(false)}
            disabled={generating}
            className="btn-primary px-8 py-3.5 rounded-2xl text-base"
          >
            ✨ Generate AI Plan
          </button>
        </div>
      )}

      {/* Day-by-Day Plan */}
      {!generating && days.length > 0 && (
        <div className="space-y-6">
          {days.map(dateStr => {
            const dateObj = new Date(dateStr + 'T00:00:00')
            const isTodays = isToday(dateObj)
            const wasPast = !isTodays && isPast(dateObj)
            const dayItems = grouped[dateStr]
            const dayCompleted = dayItems.every(i => i.completed)
            const dayMins = dayItems.reduce((acc, i) => acc + i.estimated_minutes, 0)

            return (
              <div key={dateStr} className={`bg-white rounded-3xl border shadow-sm overflow-hidden ${
                isTodays ? 'border-indigo-300 ring-2 ring-indigo-100' :
                wasPast ? 'border-gray-100 opacity-80' :
                'border-gray-100'
              }`}>
                {/* Day Header */}
                <div className={`px-5 py-4 flex items-center justify-between border-b ${
                  isTodays ? 'bg-indigo-50 border-indigo-100' :
                  wasPast ? 'bg-gray-50 border-gray-100' :
                  'bg-white border-gray-50'
                }`}>
                  <div className="flex items-center gap-3">
                    {isTodays && <span className="flex h-2 w-2"><span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-indigo-400 opacity-75"/><span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"/></span>}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">
                          {isTodays ? '📍 Today' : format(dateObj, 'EEEE')}
                        </span>
                        {dayCompleted && <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">✓ Done</span>}
                        {wasPast && !dayCompleted && <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">Missed</span>}
                      </div>
                      <p className="text-xs text-gray-400">{format(dateObj, 'MMMM d, yyyy')} · {dayMins} min</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 font-medium">{dayItems.filter(i => i.completed).length}/{dayItems.length}</div>
                </div>

                {/* Items */}
                <div className="p-4 space-y-2">
                  {dayItems.map(item => (
                    <PlanItemRow
                      key={item.id}
                      item={item}
                      subjectId={subjectId}
                      onOptimisticToggle={handleOptimisticToggle}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
