import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { format, differenceInDays, startOfDay } from 'date-fns'

const EXAM_TYPE_META: Record<string, { label: string; emoji: string; color: string }> = {
  midterm:    { label: 'Mid-Term',   emoji: '📘', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  final:      { label: 'Final',      emoji: '🎯', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  quiz:       { label: 'Quiz',       emoji: '⚡', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  assignment: { label: 'Assignment', emoji: '📝', color: 'bg-green-50 text-green-700 border-green-200' },
  other:      { label: 'Other',      emoji: '📌', color: 'bg-gray-50 text-gray-700 border-gray-200' },
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

  if (!subjects || subjects.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Your Dashboard 👋</h1>
          <p className="text-gray-500 mt-1">Get started by adding your first subject.</p>
        </div>
        <div className="border-2 border-dashed border-indigo-200 bg-white rounded-3xl p-16 text-center">
          <div className="w-20 h-20 gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-float">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No subjects yet</h2>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            Add your exam subjects and start tracking countdowns, topics and subtopics.
          </p>
          <Link href="/dashboard/add" className="btn-primary inline-block px-8 py-3.5 rounded-2xl text-base">
            Add Your First Subject →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Your Exam Schedule 📅</h1>
          <p className="text-gray-500 mt-1">{upcoming.length} upcoming · {critical.length} critical</p>
        </div>
        <Link href="/dashboard/add" className="btn-primary px-6 py-3 rounded-2xl text-sm inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Add Subject
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Subjects', value: subjects.length, icon: '📚', color: 'bg-indigo-50 border-indigo-100', text: 'text-indigo-700' },
          { label: 'Upcoming', value: upcoming.length, icon: '⏳', color: 'bg-blue-50 border-blue-100', text: 'text-blue-700' },
          { label: 'Critical (≤2d)', value: critical.length, icon: '🚨', color: 'bg-red-50 border-red-100', text: 'text-red-700' },
          {
            label: 'Next Exam In',
            value: nextExam ? `${Math.max(0, differenceInDays(startOfDay(new Date(nextExam.exam_date + 'T00:00:00')), today))}d` : '—',
            icon: '⚡',
            color: 'bg-purple-50 border-purple-100',
            text: 'text-purple-700',
          },
        ].map(s => (
          <div key={s.label} className={`${s.color} border rounded-2xl p-4`}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className={`text-2xl font-extrabold ${s.text}`}>{s.value}</div>
            <div className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => {
          const examDate = startOfDay(new Date(subject.exam_date + 'T00:00:00'))
          const daysLeft = differenceInDays(examDate, today)
          const isPast = daysLeft < 0
          const topics = subject.topics || []
          const totalSubtopics = topics.reduce((acc: number, t: any) => acc + (t.subtopics?.length || 0), 0)
          const typeMeta = EXAM_TYPE_META[subject.exam_type || 'final']

          let statusText = `${daysLeft} days left`
          if (isPast) statusText = 'Past'
          else if (daysLeft === 0) statusText = 'Today!'
          else if (daysLeft === 1) statusText = 'Tomorrow!'

          let badgeBg = 'bg-green-50 border-green-200 text-green-700'
          let dotColor = 'bg-green-400'
          let cardAccent = 'from-green-400 to-emerald-500'
          let progressColor = 'from-green-400 to-emerald-500'

          if (isPast) {
            badgeBg = 'bg-gray-100 border-gray-200 text-gray-500'
            dotColor = 'bg-gray-400'
            cardAccent = 'from-gray-300 to-gray-400'
            progressColor = 'from-gray-300 to-gray-400'
          } else if (daysLeft <= 1) {
            badgeBg = 'bg-red-50 border-red-200 text-red-700'
            dotColor = 'bg-red-400 animate-pulse'
            cardAccent = 'from-red-500 to-rose-500'
            progressColor = 'from-red-400 to-rose-500'
          } else if (daysLeft <= 6) {
            badgeBg = 'bg-amber-50 border-amber-200 text-amber-700'
            dotColor = 'bg-amber-400'
            cardAccent = 'from-amber-400 to-orange-500'
            progressColor = 'from-amber-400 to-orange-500'
          }

          const progressWidth = isPast ? 100 : Math.max(4, Math.min(96, 100 - (daysLeft / 30) * 100))

          return (
            <Link href={`/dashboard/edit/${subject.id}`} key={subject.id} className="block group">
              <div className={`relative h-full bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 card-hover ${isPast ? 'opacity-60' : ''}`}>
                {/* Accent stripe */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${cardAccent}`} />

                <div className="p-5">
                  {/* Top row: type badge + urgency badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border ${typeMeta.color}`}>
                      {typeMeta.emoji} {typeMeta.label}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeBg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                      {statusText}
                    </span>
                  </div>

                  {/* Subject name */}
                  <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 mb-3" title={subject.name}>
                    {subject.name}
                  </h3>

                  {/* Info rows */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium text-gray-700">{format(examDate, 'MMM d, yyyy')}</span>
                    </div>

                    {topics.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h10" />
                        </svg>
                        <span>
                          <span className="font-semibold text-gray-700">{topics.length}</span> Topics
                          {totalSubtopics > 0 && (
                            <span className="text-gray-400"> · <span className="font-semibold text-gray-600">{totalSubtopics}</span> Subtopics</span>
                          )}
                        </span>
                      </div>
                    )}

                    {subject.syllabus_text && (
                      <div className="flex items-start gap-2 text-sm text-gray-400">
                        <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="line-clamp-1">{subject.syllabus_text}</span>
                      </div>
                    )}
                  </div>

                  {/* Progress bar and Plan Link */}
                  {!isPast && (
                    <div className="mt-4">
                      <div className="flex justify-between items-end mb-2">
                        <div className="w-full pr-4">
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Urgency</span>
                            <span>{Math.round(progressWidth)}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div
                              className={`bg-gradient-to-r ${progressColor} h-1.5 rounded-full transition-all`}
                              style={{ width: `${progressWidth}%` }}
                            />
                          </div>
                        </div>
                        <Link
                          href={`/dashboard/plan/${subject.id}`}
                          className="shrink-0 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-3 py-1.5 rounded-xl transition-all"
                        >
                          View Plan ✨
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-all rounded-3xl pointer-events-none flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Link href={`/dashboard/edit/${subject.id}`} className="text-xs font-semibold text-indigo-600 bg-white border border-indigo-200 px-3 py-1 rounded-full shadow-sm pointer-events-auto">
                    Edit Subject
                  </Link>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
