import { editSubject, deleteSubject } from '@/app/dashboard/actions'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SubjectForm } from '@/components/SubjectForm'
import { DeleteButton } from '@/components/DeleteButton'
import { LiveCountdown } from '@/components/LiveCountdown'
import { format, differenceInDays, startOfDay } from 'date-fns'

const EXAM_TYPE_META: Record<string, { label: string; emoji: string; color: string; darkColor: string }> = {
  midterm:    { label: 'Mid-Term',   emoji: '📘', color: 'bg-blue-50 text-blue-700 border-blue-200', darkColor: 'dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30' },
  final:      { label: 'Final',      emoji: '🎯', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', darkColor: 'dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/30' },
  quiz:       { label: 'Quiz',       emoji: '⚡', color: 'bg-amber-50 text-amber-700 border-amber-200', darkColor: 'dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30' },
  assignment: { label: 'Assignment', emoji: '📝', color: 'bg-green-50 text-green-700 border-green-200', darkColor: 'dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/30' },
  other:      { label: 'Other',      emoji: '📌', color: 'bg-gray-50 text-gray-700 border-gray-200', darkColor: 'dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/30' },
}

export default async function EditSubjectPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createClient()
  const { data: subject } = await supabase
    .from('subjects')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!subject) notFound()

  const updateAction = editSubject.bind(null, subject.id)
  const deleteAction = async () => {
    'use server'
    await deleteSubject(subject.id)
  }

  const examDate = startOfDay(new Date(subject.exam_date + 'T00:00:00'))
  const daysLeft = differenceInDays(examDate, startOfDay(new Date()))
  const typeMeta = EXAM_TYPE_META[subject.exam_type || 'final']
  const topics = subject.topics || []

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${typeMeta.color} ${typeMeta.darkColor}`}>
              {typeMeta.emoji} {typeMeta.label}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground">Edit Subject</h1>
          <p className="text-muted dark:text-gray-400 mt-1 line-clamp-1">{subject.name}</p>
        </div>
        <Link
          href="/dashboard"
          className="text-sm text-muted dark:text-gray-400 hover:text-foreground flex items-center gap-1.5 btn-secondary !px-4 !py-2 !rounded-xl"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </Link>
      </div>

      {/* Status Banner */}
      <div className="flex flex-col md:flex-row gap-6">
        <LiveCountdown targetDateStr={subject.exam_date} />
        
        <div className="flex-1 rounded-xl p-5 border shadow-sm bg-card flex flex-col justify-center">
          <div className="grid grid-cols-2 gap-4 divide-x divide-border">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Topics</p>
              <p className="text-2xl font-bold">{topics.length} <span className="text-sm font-normal text-muted-foreground">Main</span></p>
            </div>
            <div className="pl-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Subtopics</p>
              <p className="text-2xl font-bold">{topics.reduce((acc: number, t: any) => acc + (t.subtopics?.length || 0), 0)} <span className="text-sm font-normal text-muted-foreground">Total</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="glass-card overflow-hidden">
        <div className="h-1.5 gradient-primary" />
        <div className="p-8">
          <SubjectForm
            action={updateAction}
            submitLabel="Save Changes"
            defaultValues={{
              name: subject.name,
              examDate: subject.exam_date,
              examType: subject.exam_type || 'final',
              syllabusText: subject.syllabus_text || '',
              dailyHours: subject.daily_hours || 2,
              topics: subject.topics || [],
            }}
          >
            <DeleteButton action={deleteAction} />
          </SubjectForm>
        </div>
      </div>
    </div>
  )
}
