'use client'

import { useState, useRef } from 'react'

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
  { value: 'midterm', label: 'Mid-Term', emoji: '📘', color: 'border-blue-500 bg-blue-50 text-blue-700' },
  { value: 'final', label: 'Final', emoji: '🎯', color: 'border-indigo-500 bg-indigo-50 text-indigo-700' },
  { value: 'quiz', label: 'Quiz', emoji: '⚡', color: 'border-amber-500 bg-amber-50 text-amber-700' },
  { value: 'assignment', label: 'Assignment', emoji: '📝', color: 'border-green-500 bg-green-50 text-green-700' },
  { value: 'other', label: 'Other', emoji: '📌', color: 'border-gray-400 bg-gray-50 text-gray-700' },
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

  // --- Topic helpers ---
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
    } catch {
      setIsSubmitting(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">

      {/* Subject Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
          📚 Subject Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="name"
          id="name"
          defaultValue={defaultValues?.name}
          required
          placeholder="e.g. Advanced Calculus, Organic Chemistry..."
          className="input-field"
        />
      </div>

      {/* Exam Type */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          🏷️ Exam Type <span className="text-red-400">*</span>
        </label>
        <div className="flex flex-wrap gap-3">
          {EXAM_TYPES.map(type => (
            <button
              key={type.value}
              type="button"
              onClick={() => setExamType(type.value)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 font-semibold text-sm transition-all ${
                examType === type.value
                  ? type.color + ' shadow-sm scale-[1.03]'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
              }`}
            >
              <span>{type.emoji}</span>
              {type.label}
              {examType === type.value && (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Exam Date & Daily Hours */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="examDate" className="block text-sm font-semibold text-gray-700 mb-2">
            📅 Exam Date <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            name="examDate"
            id="examDate"
            required
            min={new Date().toISOString().split('T')[0]}
            defaultValue={defaultValues?.examDate}
            className="input-field w-full"
          />
          <p className="text-xs text-gray-400 mt-1.5">Past dates are not allowed</p>
        </div>
        <div>
          <label htmlFor="dailyHours" className="block text-sm font-semibold text-gray-700 mb-2">
            ⏱️ Daily Study Hours <span className="text-red-400">*</span>
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
            className="input-field w-full"
          />
          <p className="text-xs text-gray-400 mt-1.5">Used by AI to schedule your plan</p>
        </div>
      </div>

      {/* Topics & Subtopics */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-semibold text-gray-700">
            🗂️ Topics &amp; Subtopics
            <span className="ml-2 text-xs font-normal text-gray-400">(Optional)</span>
          </label>
          <button
            type="button"
            onClick={addTopic}
            className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-xl transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add Topic
          </button>
        </div>

        {topics.length === 0 ? (
          <div
            onClick={addTopic}
            className="border-2 border-dashed border-gray-200 hover:border-indigo-300 rounded-2xl p-8 text-center cursor-pointer transition-all group"
          >
            <div className="text-3xl mb-2">🗂️</div>
            <p className="text-sm text-gray-500 group-hover:text-indigo-600 transition-colors">
              Click to add your first topic
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {topics.map((topic, tIdx) => (
              <div key={topic.id} className="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50">
                {/* Topic Header */}
                <div className="flex items-center gap-3 p-4 bg-white border-b border-gray-100">
                  <div className="w-7 h-7 gradient-primary rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {tIdx + 1}
                  </div>
                  <input
                    type="text"
                    placeholder={`Topic ${tIdx + 1} name...`}
                    value={topic.name}
                    onChange={e => updateTopicName(topic.id, e.target.value)}
                    className="flex-1 text-sm font-semibold text-gray-800 bg-transparent outline-none placeholder:text-gray-400 placeholder:font-normal"
                  />
                  <button
                    type="button"
                    onClick={() => addSubtopic(topic.id)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-all shrink-0"
                  >
                    + Subtopic
                  </button>
                  <button
                    type="button"
                    onClick={() => removeTopic(topic.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Subtopics */}
                {topic.subtopics.length > 0 && (
                  <div className="px-4 py-3 space-y-2">
                    {topic.subtopics.map((sub, sIdx) => (
                      <div key={sub.id} className="flex items-center gap-2 ml-5">
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="w-1 h-1 bg-gray-400 rounded-full" />
                          <span className="text-xs text-gray-400 font-mono">{String.fromCharCode(97 + sIdx)}</span>
                        </div>
                        <input
                          type="text"
                          placeholder={`Subtopic...`}
                          value={sub.name}
                          onChange={e => updateSubtopicName(topic.id, sub.id, e.target.value)}
                          className="flex-1 text-sm text-gray-700 bg-white border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-gray-400"
                        />
                        <button
                          type="button"
                          onClick={() => removeSubtopic(topic.id, sub.id)}
                          className="text-gray-300 hover:text-red-400 transition-colors shrink-0"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {topic.subtopics.length === 0 && (
                  <div className="px-4 py-2">
                    <button
                      type="button"
                      onClick={() => addSubtopic(topic.id)}
                      className="text-xs text-gray-400 hover:text-indigo-600 transition-colors ml-10"
                    >
                      + Add subtopic to this topic
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Add another topic */}
            <button
              type="button"
              onClick={addTopic}
              className="w-full py-3 border-2 border-dashed border-gray-200 hover:border-indigo-300 rounded-2xl text-sm text-gray-400 hover:text-indigo-600 font-medium transition-all"
            >
              + Add Another Topic
            </button>
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="syllabusText" className="block text-sm font-semibold text-gray-700 mb-2">
          📝 Notes / Additional Info
          <span className="ml-2 text-xs font-normal text-gray-400">(Optional)</span>
        </label>
        <textarea
          name="syllabusText"
          id="syllabusText"
          rows={3}
          defaultValue={defaultValues?.syllabusText}
          placeholder="Any extra notes, formulas to remember, important chapters..."
          className="input-field resize-none"
        />
      </div>

      {/* Actions */}
      <div className="pt-2 flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary flex-1 py-4 rounded-2xl text-base flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Saving...
            </>
          ) : submitLabel}
        </button>
        {children}
      </div>
    </form>
  )
}
