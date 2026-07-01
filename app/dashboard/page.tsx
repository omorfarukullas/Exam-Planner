import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { format, differenceInDays, startOfDay } from 'date-fns'
import { calculateStreak } from '@/utils/streaks'

const EXAM_TYPE_META: Record<string, { label: string; icon: string }> = {
  midterm:    { label: 'Mid-Term',   icon: '📘' },
  final:      { label: 'Final',      icon: '🎯' },
  quiz:       { label: 'Quiz',       icon: '⚡' },
  assignment: { label: 'Assignment', icon: '📝' },
  other:      { label: 'Other',      icon: '📌' },
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: subjects } = await supabase
    .from('subjects')
    .select('*')
    .order('exam_date', { ascending: true })

  const today = startOfDay(new Date())
  const upcoming = (subjects || []).filter(s => differenceInDays(startOfDay(new Date(s.exam_date + 'T00:00:00')), today) >= 0)
  const critical = upcoming.filter(s => differenceInDays(startOfDay(new Date(s.exam_date + 'T00:00:00')), today) <= 2)
  const nextExam = upcoming[0]

  const { data: sessions } = await supabase
    .from('study_sessions')
    .select('date, minutes_logged')
    .eq('user_id', user.id)
  
  const currentStreak = calculateStreak(sessions || [])

  if (!subjects || subjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome to ExamPlanner</h1>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          Get started by adding your first subject. Our AI will automatically generate a study plan for you.
        </p>
        <Link href="/dashboard/add" className="btn-primary px-6 py-3">
          Add First Subject
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Here is an overview of your active study goals.</p>
        </div>
        <Link href="/dashboard/add" className="btn-primary px-4 py-2 text-sm">
          Add Subject
        </Link>
      </div>

      {/* Standard Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Subjects', value: subjects.length },
          { label: 'Active Goals', value: upcoming.length },
          { label: 'Study Streak', value: `${currentStreak} Days` },
          {
            label: 'Next Exam In',
            value: nextExam ? `${Math.max(0, differenceInDays(startOfDay(new Date(nextExam.exam_date + 'T00:00:00')), today))} Days` : 'N/A',
          },
        ].map(s => (
          <div key={s.label} className="card-simple p-6">
            <div className="text-sm font-medium text-muted-foreground mb-1">{s.label}</div>
            <div className="text-2xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Subjects Grid */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          Your Subjects
          {critical.length > 0 && (
            <span className="bg-destructive/10 text-destructive text-xs px-2.5 py-1 rounded-full font-medium">
              {critical.length} Critical
            </span>
          )}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => {
            const examDate = startOfDay(new Date(subject.exam_date + 'T00:00:00'))
            const daysLeft = differenceInDays(examDate, today)
            const isPast = daysLeft < 0
            const topics = subject.topics || []
            const typeMeta = EXAM_TYPE_META[subject.exam_type || 'final']

            // Progress calculation
            const progressPct = isPast ? 100 : Math.max(0, Math.min(100, 100 - (daysLeft / 30) * 100))
            
            return (
              <div key={subject.id} className={`card-simple p-6 flex flex-col ${isPast ? 'opacity-60' : ''}`}>
                
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="text-xs font-medium px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground flex items-center gap-1.5">
                    <span>{typeMeta.icon}</span>
                    {typeMeta.label}
                  </div>
                  {!isPast && (
                    <div className="text-right">
                      <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Countdown</div>
                      <div className={`text-sm font-bold ${daysLeft <= 2 ? 'text-destructive' : daysLeft <= 7 ? 'text-amber-500' : 'text-primary'}`}>
                        {daysLeft} Days
                      </div>
                    </div>
                  )}
                </div>

                <h3 className="font-bold text-lg mb-1 line-clamp-1" title={subject.name}>
                  {subject.name}
                </h3>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {format(examDate, 'MMM d, yyyy')}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    {topics.length} Topics
                  </div>
                </div>

                {/* Progress Bar (Standard) */}
                <div className="mb-6 mt-auto">
                  <div className="flex justify-between text-xs font-medium mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-bold">{Math.round(progressPct)}%</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link 
                    href={`/dashboard/plan/${subject.id}`}
                    className="flex-1 btn-primary py-2 text-sm"
                  >
                    View Plan
                  </Link>
                  <Link 
                    href={`/dashboard/edit/${subject.id}`}
                    className="btn-secondary px-3"
                    title="Edit Subject"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
