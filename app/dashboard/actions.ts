'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export interface Subtopic {
  id: string
  name: string
}

export interface Topic {
  id: string
  name: string
  subtopics: Subtopic[]
}

export async function addSubject(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('User not found')

  const name = formData.get('name') as string
  const examDate = formData.get('examDate') as string
  const syllabusText = formData.get('syllabusText') as string
  const examType = formData.get('examType') as string
  const topicsJson = formData.get('topicsJson') as string
  const dailyHours = parseFloat(formData.get('dailyHours') as string || '2')

  let topics: Topic[] = []
  try {
    topics = JSON.parse(topicsJson || '[]')
  } catch {}

  const { error } = await supabase.from('subjects').insert({
    user_id: user.id,
    name,
    exam_date: examDate,
    syllabus_text: syllabusText,
    exam_type: examType || 'final',
    daily_hours: dailyHours,
    topics,
  })

  if (error) {
    console.error(error)
    throw new Error('Failed to add subject')
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function editSubject(id: string, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const examDate = formData.get('examDate') as string
  const syllabusText = formData.get('syllabusText') as string
  const examType = formData.get('examType') as string
  const topicsJson = formData.get('topicsJson') as string
  const dailyHours = parseFloat(formData.get('dailyHours') as string || '2')

  let topics: Topic[] = []
  try {
    topics = JSON.parse(topicsJson || '[]')
  } catch {}

  const { error } = await supabase
    .from('subjects')
    .update({
      name,
      exam_date: examDate,
      syllabus_text: syllabusText,
      exam_type: examType || 'final',
      daily_hours: dailyHours,
      topics,
    })
    .eq('id', id)

  if (error) {
    console.error(error)
    throw new Error('Failed to update subject')
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function deleteSubject(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('subjects')
    .delete()
    .eq('id', id)

  if (error) {
    console.error(error)
    throw new Error('Failed to delete subject')
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}
