import { addSubject } from '@/app/dashboard/actions'
import Link from 'next/link'
import { SubjectForm } from '@/components/SubjectForm'

export default function AddSubjectPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Add New Subject</h1>
          <p className="text-gray-500 mt-1">Fill in the details to start tracking your exam</p>
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

      {/* Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-1.5 gradient-primary" />
        <div className="p-8">
          <SubjectForm action={addSubject} submitLabel="Add Subject →">
            <Link
              href="/dashboard"
              className="flex items-center justify-center text-gray-500 hover:text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-2xl px-6 py-4 text-base font-medium transition-all"
            >
              Cancel
            </Link>
          </SubjectForm>
        </div>
      </div>

      {/* Tip card */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-indigo-900 mb-1">💡 Study Tip</h3>
        <p className="text-sm text-indigo-700">
          Breaking your syllabus into Topics and Subtopics helps you focus on one section at a time. The countdown keeps you on track!
        </p>
      </div>
    </div>
  )
}
