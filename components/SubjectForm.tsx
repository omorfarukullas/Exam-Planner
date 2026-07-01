'use client'

import { useState, useRef } from 'react'
import { toast } from 'react-hot-toast'

export interface Subtopic {
  id: string
  name: string
}

export interface Topic {
  id: string
  name: string
  subtopics: Subtopic[]
}

const EXAM_TYPES = [
  { value: 'midterm', label: 'Mid-Term' },
  { value: 'final', label: 'Final' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'assignment', label: 'Assignment' },
  { value: 'other', label: 'Other' },
]

function genId() {
  return Math.random().toString(36).slice(2, 9)
}

interface SubjectFormProps {
  action: (formData: FormData) => Promise<void>
  defaultValues?: {
    name?: string
    examDate?: string
    examType?: string
    syllabusText?: string
    dailyHours?: number
    topics?: Topic[]
  }
  submitLabel?: string
  children?: React.ReactNode
}

export function SubjectForm({ action, defaultValues, submitLabel = 'Save Subject', children }: SubjectFormProps) {
  const [examType, setExamType] = useState(defaultValues?.examType || 'final')
  const [topics, setTopics] = useState<Topic[]>(defaultValues?.topics || [])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const addTopic = () => {
    setTopics(prev => [...prev, { id: genId(), name: '', subtopics: [] }])
  }

  const removeTopic = (topicId: string) => {
    setTopics(prev => prev.filter(t => t.id !== topicId))
  }

  const updateTopicName = (topicId: string, name: string) => {
    setTopics(prev => prev.map(t => t.id === topicId ? { ...t, name } : t))
  }

  const addSubtopic = (topicId: string) => {
    setTopics(prev => prev.map(t =>
      t.id === topicId
        ? { ...t, subtopics: [...t.subtopics, { id: genId(), name: '' }] }
        : t
    ))
  }

  const removeSubtopic = (topicId: string, subtopicId: string) => {
    setTopics(prev => prev.map(t =>
      t.id === topicId
        ? { ...t, subtopics: t.subtopics.filter(s => s.id !== subtopicId) }
        : t
    ))
  }

  const updateSubtopicName = (topicId: string, subtopicId: string, name: string) => {
    setTopics(prev => prev.map(t =>
      t.id === topicId
        ? { ...t, subtopics: t.subtopics.map(s => s.id === subtopicId ? { ...s, name } : s) }
        : t
    ))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const fd = new FormData(e.currentTarget)
    fd.set('examType', examType)
    fd.set('topicsJson', JSON.stringify(topics))
    try {
      await action(fd)
      toast.success('Subject saved successfully!')
    } catch {
      toast.error('Failed to save subject.')
      setIsSubmitting(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Subject Name <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          name="name"
          id="name"
          defaultValue={defaultValues?.name}
          required
          placeholder="e.g. Advanced Calculus"
          className="input-simple"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Exam Type <span className="text-destructive">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {EXAM_TYPES.map(type => (
            <button
              key={type.value}
              type="button"
              onClick={() => setExamType(type.value)}
              className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                examType === type.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-foreground hover:bg-secondary'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="examDate" className="block text-sm font-medium mb-2">
            Exam Date <span className="text-destructive">*</span>
          </label>
          <input
            type="date"
            name="examDate"
            id="examDate"
            required
            min={new Date().toISOString().split('T')[0]}
            defaultValue={defaultValues?.examDate}
            className="input-simple"
          />
        </div>
        <div>
          <label htmlFor="dailyHours" className="block text-sm font-medium mb-2">
            Study Goal (Hours/Day) <span className="text-destructive">*</span>
          </label>
          <input
            type="number"
            name="dailyHours"
            id="dailyHours"
            required
            min="0.5"
            step="0.5"
            max="24"
            defaultValue={defaultValues?.dailyHours || 2}
            className="input-simple"
          />
        </div>
      </div>

      <div className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium">
            Topics & Subtopics
          </label>
          <button
            type="button"
            onClick={addTopic}
            className="text-sm font-medium text-primary hover:underline"
          >
            + Add Topic
          </button>
        </div>

        {topics.length === 0 ? (
          <div
            onClick={addTopic}
            className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:bg-secondary transition-colors"
          >
            <p className="text-sm font-medium text-muted-foreground">
              Click to add your first topic
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {topics.map((topic, tIdx) => (
              <div key={topic.id} className="border border-border rounded-xl p-4 bg-background">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-muted-foreground">{tIdx + 1}.</span>
                  <input
                    type="text"
                    placeholder="Topic Name..."
                    value={topic.name}
                    onChange={e => updateTopicName(topic.id, e.target.value)}
                    className="flex-1 input-simple !border-transparent !bg-transparent hover:!border-input focus:!border-input focus:!bg-background"
                  />
                  <button
                    type="button"
                    onClick={() => addSubtopic(topic.id)}
                    className="text-xs font-medium text-primary hover:underline shrink-0"
                  >
                    Add Subtopic
                  </button>
                  <button
                    type="button"
                    onClick={() => removeTopic(topic.id)}
                    className="text-muted-foreground hover:text-destructive shrink-0 p-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {topic.subtopics.length > 0 && (
                  <div className="mt-3 ml-6 pl-4 border-l border-border space-y-2">
                    {topic.subtopics.map((sub, sIdx) => (
                      <div key={sub.id} className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">{String.fromCharCode(97 + sIdx)}.</span>
                        <input
                          type="text"
                          placeholder="Subtopic Name..."
                          value={sub.name}
                          onChange={e => updateSubtopicName(topic.id, sub.id, e.target.value)}
                          className="flex-1 input-simple !py-1 !text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeSubtopic(topic.id, sub.id)}
                          className="text-muted-foreground hover:text-destructive shrink-0 p-1"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="syllabusText" className="block text-sm font-medium mb-2">
          Notes (Optional)
        </label>
        <textarea
          name="syllabusText"
          id="syllabusText"
          rows={3}
          defaultValue={defaultValues?.syllabusText}
          placeholder="Any extra context or syllabus details..."
          className="input-simple resize-none"
        />
      </div>

      <div className="pt-4 flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary py-2 px-4 flex-1"
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
        {children}
      </div>
    </form>
  )
}
