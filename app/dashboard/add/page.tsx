import { addSubject } from '@/app/dashboard/actions'
import Link from 'next/link'
import { SubjectForm } from '@/components/SubjectForm'

export default function AddSubjectPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      <div className="flex flex-col gap-1">
        <Link href="/dashboard" className="text-primary hover:underline text-sm font-medium mb-2 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">
          Add Subject
        </h1>
        <p className="text-muted-foreground">Enter your subject details and topics. Our AI will automatically schedule your study sessions.</p>
      </div>

      <div className="card-simple p-6 sm:p-8">
        <SubjectForm action={addSubject} submitLabel="Generate Study Plan">
          <Link
            href="/dashboard"
            className="btn-secondary py-2 px-4 w-full sm:w-auto"
          >
            Cancel
          </Link>
        </SubjectForm>
      </div>
    </div>
  )
}
