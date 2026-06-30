'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function addSubject(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not found')
  }

  const name = formData.get('name') as string
  const examDate = formData.get('examDate') as string
  const syllabusText = formData.get('syllabusText') as string

  const { error } = await supabase.from('subjects').insert({
    user_id: user.id,
    name,
    exam_date: examDate,
    syllabus_text: syllabusText,
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

  const { error } = await supabase
    .from('subjects')
    .update({
      name,
      exam_date: examDate,
      syllabus_text: syllabusText,
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
}
