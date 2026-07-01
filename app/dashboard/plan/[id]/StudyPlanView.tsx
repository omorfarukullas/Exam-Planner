'use client'

import { useState, useTransition } from 'react'
import { toast } from 'react-hot-toast'
import { togglePlanItem, addManualPlanItem, deletePlanItem } from './actions'
import { format, isToday, isPast } from 'date-fns'

interface PlanItem {
  id: string
  day_date: string
  topic: string
  estimated_minutes: number
  priority: 'high' | 'medium' | 'low'
  completed: boolean
  concept_summary?: string
}

function PlanItemRow({ item, subjectId, onOptimisticToggle }: {
  item: PlanItem
  subjectId: string
  onOptimisticToggle: (id: string) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [deleting, setDeleting] = useState(false)
  const [showBrainstorm, setShowBrainstorm] = useState(false)

  const handleToggle = () => {
    onOptimisticToggle(item.id)
    startTransition(() => togglePlanItem(item.id, !item.completed, subjectId))
  }

  const handleDelete = () => {
    setDeleting(true)
    startTransition(async () => {
      try {
        await deletePlanItem(item.id, subjectId)
        toast.success('Task removed')
      } catch {
        toast.error('Failed to remove task')
        setDeleting(false)
      }
    })
  }

  return (
    <div className={`flex items-start gap-3 p-3 border-b border-border last:border-0 transition-all ${
      item.completed ? 'opacity-50' : ''
    } ${deleting ? 'hidden' : ''}`}>
      
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        className={`mt-0.5 w-5 h-5 shrink-0 rounded border flex items-center justify-center transition-colors ${
          item.completed
            ? 'bg-primary border-primary text-primary-foreground'
            : 'border-input bg-background hover:border-primary'
        }`}
      >
        {item.completed && (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
          <p className={`font-medium text-sm ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
            {item.topic}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {item.priority === 'high' && <span className="text-destructive font-medium">Critical</span>}
            <span>{item.estimated_minutes} mins</span>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="text-muted-foreground hover:text-destructive transition-colors ml-2"
              title="Delete task"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {item.concept_summary && (
          <div>
            <button
              type="button"
              onClick={() => setShowBrainstorm(!showBrainstorm)}
              className="text-xs font-medium text-primary hover:underline transition-colors flex items-center gap-1 mt-0.5"
            >
              <svg className={`w-3 h-3 transition-transform ${showBrainstorm ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              View Summary
            </button>
            {showBrainstorm && (
              <div className="mt-2 p-3 bg-secondary rounded-lg text-sm text-secondary-foreground leading-relaxed">
                {item.concept_summary}
              </div>
            )}
          </div>
        )}
      </div>
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
        toast.success('Task added')
        onClose()
      } catch {
        toast.error('Failed to add task')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="card-simple p-4 sm:p-6 mb-6">
      <h3 className="font-semibold text-lg mb-4">Add Custom Task</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Task Name</label>
          <input name="topic" required placeholder="e.g., Review Chapter 4" className="input-simple" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input type="date" name="day_date" required min={today} defaultValue={today} className="input-simple" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Duration (mins)</label>
            <input type="number" name="estimated_minutes" defaultValue={60} min={15} max={480} className="input-simple" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Priority</label>
          <select name="priority" className="input-simple">
            <option value="low">Optional</option>
            <option value="medium" selected>Standard</option>
            <option value="high">Critical</option>
          </select>
        </div>

        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={isPending} className="btn-primary px-4 py-2 flex-1">
            {isPending ? 'Saving...' : 'Add Task'}
          </button>
          <button type="button" onClick={onClose} className="btn-secondary px-4 py-2">
            Cancel
          </button>
        </div>
      </div>
    </form>
  )
}

export function StudyPlanView({ subjectId, subjectName, examDate, hasMissedSessions, initialPlan }: any) {
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
      if (!res.ok) throw new Error(data.error)
      toast.success(isReshuffle ? 'Schedule optimized' : `Generated ${data.itemCount} tasks`)
      setShowReshuffle(false)
      window.location.reload()
    } catch {
      toast.error('Failed to generate plan')
    } finally {
      setGenerating(false)
    }
  }

  const handleOptimisticToggle = (id: string) => {
    setPlan(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item))
  }

  const grouped = plan.reduce<Record<string, PlanItem[]>>((acc, item) => {
    if (!acc[item.day_date]) acc[item.day_date] = []
    acc[item.day_date].push(item)
    return acc
  }, {})

  const days = Object.keys(grouped).sort()
  const completedCount = plan.filter(i => i.completed).length
  const progressPct = plan.length > 0 ? Math.round((completedCount / plan.length) * 100) : 0

  return (
    <div className="space-y-6">
      {showReshuffle && (
        <div className="card-simple p-4 bg-destructive/10 border-destructive flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h3 className="font-semibold text-destructive">Missed Study Sessions</h3>
            <p className="text-sm text-destructive/80 mt-1">
              You have overdue tasks. You can recalculate your timeline to catch up.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => generatePlan(true)} disabled={generating} className="btn-primary !bg-destructive !text-destructive-foreground px-4 py-2 text-sm whitespace-nowrap">
              {generating ? 'Optimizing...' : 'Re-optimize Schedule'}
            </button>
            <button onClick={() => setShowReshuffle(false)} className="btn-secondary px-4 py-2 text-sm">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <button onClick={() => generatePlan(false)} disabled={generating} className="btn-primary px-4 py-2 text-sm">
            {generating ? 'Generating...' : 'AI Generate Plan'}
          </button>
          <button onClick={() => setShowManualEntry(v => !v)} className="btn-secondary px-4 py-2 text-sm">
            Add Custom Task
          </button>
        </div>
        
        {plan.length > 0 && (
          <div className="text-sm font-medium text-muted-foreground flex items-center gap-4">
            <span>Completed: {completedCount}/{plan.length}</span>
            <span>Progress: {progressPct}%</span>
          </div>
        )}
      </div>

      {showManualEntry && (
        <ManualEntryForm subjectId={subjectId} onClose={() => setShowManualEntry(false)} />
      )}

      {!generating && plan.length === 0 && (
        <div className="card-simple p-12 text-center">
          <h3 className="text-lg font-semibold mb-2">No tasks generated</h3>
          <p className="text-muted-foreground mb-6">Generate a plan to let the AI create your study schedule.</p>
          <button onClick={() => generatePlan(false)} className="btn-primary px-6 py-2">
            Generate Plan
          </button>
        </div>
      )}

      {!generating && days.length > 0 && (
        <div className="space-y-6">
          {days.map(dateStr => {
            let isTodays = false;
            let wasPast = false;
            let formattedDate = dateStr;
            
            try {
              if (dateStr) {
                const dateObj = new Date(dateStr + 'T00:00:00')
                if (!isNaN(dateObj.getTime())) {
                  isTodays = isToday(dateObj)
                  wasPast = !isTodays && isPast(dateObj)
                  formattedDate = isTodays ? 'Today' : format(dateObj, 'EEEE, MMM d')
                }
              }
            } catch (e) {}

            const dayItems = grouped[dateStr]
            const dayCompleted = dayItems.every(i => i.completed)
            const dayMins = dayItems.reduce((acc, i) => acc + i.estimated_minutes, 0)
            
            return (
              <div key={dateStr} className="card-simple overflow-hidden">
                <div className={`px-4 py-3 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                  isTodays ? 'bg-primary/5' : 'bg-secondary/50'
                }`}>
                  <h3 className="font-semibold flex items-center gap-2">
                    {formattedDate}
                    {dayCompleted && <span className="text-xs bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full font-medium">Completed</span>}
                    {wasPast && !dayCompleted && <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-medium">Overdue</span>}
                  </h3>
                  <div className="text-sm text-muted-foreground">
                    {dayItems.length} Tasks • {dayMins} mins
                  </div>
                </div>

                <div>
                  {dayItems.map(item => (
                    <PlanItemRow key={item.id} item={item} subjectId={subjectId} onOptimisticToggle={handleOptimisticToggle} />
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
