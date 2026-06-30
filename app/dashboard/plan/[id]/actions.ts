'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function togglePlanItem(id: string, completed: boolean, subjectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return

  // Update plan item
  const { data: item } = await supabase
    .from('study_plans')
    .update({ completed })
    .eq('id', id)
    .select('day_date, estimated_minutes')
    .single()

  // Log session if completed
  if (completed && item) {
    const date = item.day_date

    // Check for existing session on that date
    const { data: existingSession } = await supabase
      .from('study_sessions')
      .select('id, minutes_logged')
      .eq('user_id', user.id)
      .eq('subject_id', subjectId)
      .eq('date', date)
      .single()

    if (existingSession) {
      await supabase
        .from('study_sessions')
        .update({ minutes_logged: existingSession.minutes_logged + item.estimated_minutes })
        .eq('id', existingSession.id)
    } else {
      await supabase
        .from('study_sessions')
        .insert({
          user_id: user.id,
          subject_id: subjectId,
          date: date,
          minutes_logged: item.estimated_minutes
        })
    }
  }

  revalidatePath(`/dashboard/plan/${subjectId}`)
  revalidatePath('/dashboard') // Revalidate dashboard for streaks
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
