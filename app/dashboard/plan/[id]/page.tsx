import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { differenceInDays, startOfDay, isPast, isToday, format } from 'date-fns'
import { StudyPlanView } from './StudyPlanView'

const EXAM_TYPE_META: Record<string, { label: string; emoji: string; color: string }> = {
  midterm:    { label: 'Mid-Term',   emoji: '📘', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  final:      { label: 'Final',      emoji: '🎯', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  quiz:       { label: 'Quiz',       emoji: '⚡', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  assignment: { label: 'Assignment', emoji: '📝', color: 'bg-green-50 text-green-700 border-green-200' },
  other:      { label: 'Other',      emoji: '📌', color: 'bg-gray-50 text-gray-700 border-gray-200' },
}

export default async function PlanPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createClient()

  const { data: subject } = await supabase
    .from('subjects')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!subject) notFound()

  const { data: planItems } = await supabase
    .from('study_plans')
    .select('*')
    .eq('subject_id', params.id)
    .order('day_date', { ascending: true })

  const today = startOfDay(new Date())
  const examDate = startOfDay(new Date(subject.exam_date + 'T00:00:00'))
  const daysLeft = differenceInDays(examDate, today)

  const typeMeta = EXAM_TYPE_META[subject.exam_type || 'final']

  // Check for missed sessions (past date + incomplete)
  const hasMissedSessions = (planItems || []).some(item => {
    const itemDate = startOfDay(new Date(item.day_date + 'T00:00:00'))
    return !item.completed && isPast(itemDate) && !isToday(itemDate)
  })

  const topics = subject.topics || []
  const totalSubtopics = topics.reduce((acc: number, t: any) => acc + (t.subtopics?.length || 0), 0)

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Dashboard
            </Link>
            <svg className="w-3 h-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-sm text-gray-600 font-medium truncate max-w-48">{subject.name}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">AI Study Plan</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${typeMeta.color}`}>
              {typeMeta.emoji} {typeMeta.label}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              daysLeft <= 1 ? 'bg-red-50 text-red-700 border-red-200' :
              daysLeft <= 6 ? 'bg-amber-50 text-amber-700 border-amber-200' :
              'bg-green-50 text-green-700 border-green-200'
            }`}>
              {daysLeft <= 0 ? '🚨 Exam passed' : `⏳ ${daysLeft} days left`}
            </span>
          </div>
        </div>
        <Link
          href={`/dashboard/edit/${subject.id}`}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-xl transition-all shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Subject
        </Link>
      </div>

      {/* Subject Info Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Subject</p>
            <p className="text-sm font-bold text-gray-800 line-clamp-2">{subject.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Exam Date</p>
            <p className="text-sm font-bold text-gray-800">{format(examDate, 'MMM d, yyyy')}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Daily Hours</p>
            <p className="text-sm font-bold text-gray-800">{subject.daily_hours || 2}h available</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Syllabus</p>
            <p className="text-sm font-bold text-gray-800">
              {topics.length > 0 ? `${topics.length} topics · ${totalSubtopics} subtopics` : 'Notes based'}
            </p>
          </div>
        </div>
      </div>

      {/* Plan View */}
      <StudyPlanView
        subjectId={subject.id}
        subjectName={subject.name}
        examDate={subject.exam_date}
        hasMissedSessions={hasMissedSessions}
        initialPlan={planItems || []}
      />
    </div>
  )
}
