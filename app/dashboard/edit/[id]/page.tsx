import { editSubject, deleteSubject } from '@/app/dashboard/actions'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DeleteButton } from '@/components/DeleteButton'
import { format, differenceInDays, startOfDay } from 'date-fns'

export default async function EditSubjectPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createClient()
  const { data: subject } = await supabase
    .from('subjects')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!subject) {
    notFound()
  }

  const updateSubjectAction = editSubject.bind(null, subject.id)
  const deleteSubjectAction = async () => {
    'use server'
    await deleteSubject(subject.id)
    
  }

  const examDate = startOfDay(new Date(subject.exam_date + 'T00:00:00'))
  const daysLeft = differenceInDays(examDate, startOfDay(new Date()))

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Edit Subject</h1>
          <p className="text-gray-500 mt-1">Update your exam details below</p>
        </div>
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-xl transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </Link>
      </div>

      {/* Current status card */}
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
        </div>
      )}

      {/* Form card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-1.5 gradient-primary" />

        <form action={updateSubjectAction} className="p-8 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              📚 Subject Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              defaultValue={subject.name}
              required
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="examDate" className="block text-sm font-semibold text-gray-700 mb-2">
              📅 Exam Date
            </label>
            <input
              type="date"
              name="examDate"
              id="examDate"
              defaultValue={subject.exam_date}
              required
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="syllabusText" className="block text-sm font-semibold text-gray-700 mb-2">
              📝 Syllabus / Notes <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              name="syllabusText"
              id="syllabusText"
              rows={5}
              defaultValue={subject.syllabus_text || ''}
              className="input-field resize-none"
              placeholder="Add topics, notes, formulas..."
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              className="btn-primary flex-1 py-3.5 rounded-2xl text-base"
            >
              Save Changes
            </button>
            <div className="sm:w-auto">
              <DeleteButton action={deleteSubjectAction} />
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
