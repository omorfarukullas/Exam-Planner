import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { prompt, senderId, receiverId } = await request.json()

    if (!prompt || !senderId || !receiverId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const groqApiKey = process.env.GROQ_API_KEY
    if (!groqApiKey) return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a highly intelligent and encouraging AI tutor in a study chatroom between two friends. Keep your answers concise, accurate, and conversational. Use emojis where appropriate. Do not output markdown code fences unless necessary.',
          },
          { role: 'user', content: prompt.replace('@tutor', '').trim() },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!groqResponse.ok) {
      console.error('Groq API error:', await groqResponse.text())
      return NextResponse.json({ error: 'AI service error' }, { status: 502 })
    }

    const groqData = await groqResponse.json()
    const aiContent = groqData.choices?.[0]?.message?.content?.trim()

    if (aiContent) {
      // Insert AI response into the messages table
      // We use senderId as the "sender" just to satisfy the FK constraint, 
      // but is_ai_response=true will render it differently in the UI.
      await supabase.from('messages').insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content: aiContent,
        is_ai_response: true
      })
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('Unhandled error in /api/ai-chat:', err)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
