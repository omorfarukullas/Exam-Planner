import { addSubject } from '@/app/dashboard/actions'
import Link from 'next/link'

export default function AddSubjectPage() {
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Add New Subject</h1>
          <p className="text-gray-500 mt-1">Fill in the details to start tracking your exam</p>
        </div>
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-xl transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Top gradient accent */}
        <div className="h-1.5 gradient-primary" />

        <form action={addSubject} className="p-8 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              📚 Subject Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              className="input-field"
              placeholder="e.g. Advanced Calculus, Organic Chemistry..."
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
              required
              min={today}
              className="input-field"
            />
            <p className="text-xs text-gray-400 mt-1.5">Past dates are not allowed</p>
          </div>

          <div>
            <label htmlFor="syllabusText" className="block text-sm font-semibold text-gray-700 mb-2">
              📝 Syllabus / Notes <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              name="syllabusText"
              id="syllabusText"
              rows={5}
              className="input-field resize-none"
              placeholder="List the topics you need to cover, important chapters, formulas to remember..."
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="btn-primary w-full py-4 rounded-2xl text-base"
            >
              Add Subject →
            </button>
          </div>
        </form>
      </div>

      {/* Tips card */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-indigo-900 mb-2">💡 Study Tip</h3>
        <p className="text-sm text-indigo-700">
          Adding your syllabus helps you stay focused. Break it into topics and tackle them one by one — the countdown will keep you on track!
        </p>
      </div>
    </div>
  )
}
