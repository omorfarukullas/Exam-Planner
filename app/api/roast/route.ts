import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { isPast, startOfDay } from 'date-fns'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { senderId, receiverId } = await request.json()

    // 1. Fetch user's study plans to see their progress
    const { data: plans } = await supabase
      .from('study_plans')
      .select('topic, completed, day_date, estimated_minutes')
      .eq('user_id', senderId)

    const today = startOfDay(new Date())
    let missed = 0
    let completed = 0
    let totalMins = 0

    if (plans) {
      for (const p of plans) {
        if (p.completed) {
          completed++
          totalMins += p.estimated_minutes
        } else {
          const planDate = startOfDay(new Date(p.day_date + 'T00:00:00'))
          if (isPast(planDate) && planDate.getTime() !== today.getTime()) {
            missed++
          }
        }
      }
    }

    const groqApiKey = process.env.GROQ_API_KEY
    if (!groqApiKey) return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })

    const prompt = `
    The user is asking you to roast their study progress.
    Here are their stats:
    - Missed sessions: ${missed}
    - Completed sessions: ${completed}
    - Total minutes studied: ${totalMins}
    
    If they have a lot of missed sessions, brutally (but playfully) roast them. E.g., "Are you trying to invent a new subject on the day of the exam?"
    If they have 0 missed and lots completed, hype them up insanely. E.g., "You are an unstoppable academic weapon!"
    Keep the response under 3 sentences. Be highly entertaining.
    `

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a sassy, entertaining AI study coach in a group chat.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 150,
      }),
    })

    if (!groqResponse.ok) {
      return NextResponse.json({ error: 'AI service error' }, { status: 502 })
    }

    const groqData = await groqResponse.json()
    const aiContent = groqData.choices?.[0]?.message?.content?.trim()

    if (aiContent) {
      await supabase.from('messages').insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content: aiContent,
        is_ai_response: true
      })
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('Unhandled error in /api/roast:', err)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
