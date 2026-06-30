import { editSubject, deleteSubject } from '@/app/dashboard/actions'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SubjectForm } from '@/components/SubjectForm'
import { DeleteButton } from '@/components/DeleteButton'
import { format, differenceInDays, startOfDay } from 'date-fns'

const EXAM_TYPE_META: Record<string, { label: string; emoji: string; color: string }> = {
  midterm:    { label: 'Mid-Term',   emoji: '📘', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  final:      { label: 'Final',      emoji: '🎯', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  quiz:       { label: 'Quiz',       emoji: '⚡', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  assignment: { label: 'Assignment', emoji: '📝', color: 'bg-green-50 text-green-700 border-green-200' },
  other:      { label: 'Other',      emoji: '📌', color: 'bg-gray-50 text-gray-700 border-gray-200' },
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
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${typeMeta.color}`}>
              {typeMeta.emoji} {typeMeta.label}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Edit Subject</h1>
          <p className="text-gray-500 mt-1 line-clamp-1">{subject.name}</p>
        </div>
        <Link
          href="/dashboard"
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-xl transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </Link>
      </div>

      {/* Status Banner */}
      {daysLeft >= 0 && (
        <div className={`rounded-2xl p-4 flex items-center gap-4 border ${
          daysLeft <= 1 ? 'bg-red-50 border-red-200' :
          daysLeft <= 6 ? 'bg-amber-50 border-amber-200' :
          'bg-green-50 border-green-200'
        }`}>
          <div className={`text-3xl ${daysLeft <= 1 ? 'animate-pulse' : ''}`}>
            {daysLeft === 0 ? '🚨' : daysLeft === 1 ? '⚠️' : daysLeft <= 6 ? '⏳' : '✅'}
          </div>
          <div>
            <p className={`font-bold text-sm ${daysLeft <= 1 ? 'text-red-700' : daysLeft <= 6 ? 'text-amber-700' : 'text-green-700'}`}>
              {daysLeft === 0 ? 'Exam is TODAY!' : daysLeft === 1 ? 'Exam is TOMORROW!' : `${daysLeft} days until exam`}
            </p>
            <p className={`text-xs ${daysLeft <= 1 ? 'text-red-600' : daysLeft <= 6 ? 'text-amber-600' : 'text-green-600'}`}>
              {format(examDate, 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          {topics.length > 0 && (
            <div className="ml-auto text-right">
              <p className="text-sm font-bold text-gray-700">{topics.length} Topics</p>
              <p className="text-xs text-gray-500">{topics.reduce((acc: number, t: any) => acc + (t.subtopics?.length || 0), 0)} Subtopics</p>
            </div>
          )}
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
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
