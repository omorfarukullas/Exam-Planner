'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function togglePlanItem(id: string, completed: boolean, subjectId: string) {
  const supabase = await createClient()
  await supabase.from('study_plans').update({ completed }).eq('id', id)
  revalidatePath(`/dashboard/plan/${subjectId}`)
}

export async function addManualPlanItem(subjectId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const topic = formData.get('topic') as string
  const day_date = formData.get('day_date') as string
  const estimated_minutes = parseInt(formData.get('estimated_minutes') as string || '60')
  const priority = formData.get('priority') as string || 'medium'

  await supabase.from('study_plans').insert({
    subject_id: subjectId,
    user_id: user.id,
    topic,
    day_date,
    estimated_minutes,
    priority,
    completed: false,
  })

  revalidatePath(`/dashboard/plan/${subjectId}`)
}

export async function deletePlanItem(id: string, subjectId: string) {
  const supabase = await createClient()
  await supabase.from('study_plans').delete().eq('id', id)
  revalidatePath(`/dashboard/plan/${subjectId}`)
}

export async function deleteAllPlans(subjectId: string) {
  const supabase = await createClient()
  await supabase.from('study_plans').delete().eq('subject_id', subjectId)
  revalidatePath(`/dashboard/plan/${subjectId}`)
}
