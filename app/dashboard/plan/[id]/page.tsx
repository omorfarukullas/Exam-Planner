import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { differenceInDays, startOfDay, format } from 'date-fns'
import { StudyPlanView } from './StudyPlanView'

import { LiveCountdown } from '@/components/LiveCountdown'

export default async function StudyPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: subject } = await supabase
    .from('subjects')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()

  if (!subject) {
    redirect('/dashboard')
  }

  const examDate = startOfDay(new Date(subject.exam_date + 'T00:00:00'))
  const today = startOfDay(new Date())
  const daysLeft = differenceInDays(examDate, today)
  
  const topics = subject.topics || []
  const totalSubtopics = topics.reduce((acc: number, t: any) => acc + (t.subtopics?.length || 0), 0)

  const { data: initialPlan } = await supabase
    .from('study_plans')
    .select('*')
    .eq('subject_id', subject.id)
    .order('day_date', { ascending: true })

  // Check for missed sessions
  const hasMissedSessions = (initialPlan || []).some((item: any) => {
    try {
      if (!item.day_date) return false;
      const dateObj = new Date(item.day_date + 'T00:00:00');
      if (isNaN(dateObj.getTime())) return false;
      const isPast = differenceInDays(startOfDay(dateObj), today) < 0;
      return isPast && !item.completed;
    } catch {
      return false;
    }
  })

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex flex-col gap-1">
        <Link href="/dashboard" className="text-primary hover:underline text-sm font-medium mb-2 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">
            Study Plan: {subject.name}
          </h1>
          <Link href={`/dashboard/edit/${subject.id}`} className="btn-secondary px-4 py-2 text-sm whitespace-nowrap">
            Edit Details
          </Link>
        </div>
      </div>

      {/* Status Banner */}
      <div className="flex flex-col md:flex-row gap-6">
        <LiveCountdown targetDateStr={subject.exam_date} />
        
        <div className="flex-1 rounded-xl p-5 border shadow-sm bg-card flex flex-col justify-center">
          <div className="grid grid-cols-2 gap-4 divide-x divide-border">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Daily Goal</p>
              <p className="text-2xl font-bold">{subject.daily_hours} <span className="text-sm font-normal text-muted-foreground">hrs/day</span></p>
            </div>
            <div className="pl-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Topics Left</p>
              <p className="text-2xl font-bold">{topics.length} <span className="text-sm font-normal text-muted-foreground">({totalSubtopics} Sub)</span></p>
            </div>
          </div>
        </div>
      </div>

      <StudyPlanView 
        subjectId={subject.id}
        subjectName={subject.name}
        examDate={subject.exam_date}
        hasMissedSessions={hasMissedSessions}
        initialPlan={initialPlan || []}
      />
    </div>
  )
}
