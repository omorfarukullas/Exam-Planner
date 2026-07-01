import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { differenceInDays, addDays, format, startOfDay } from 'date-fns'

export interface StudyPlanItem {
  day_date: string
  topic: string
  estimated_minutes: number
  priority: 'high' | 'medium' | 'low'
  concept_summary?: string
}

function buildGroqPrompt(params: {
  subjectName: string
  examDate: string
  daysRemaining: number
  dailyMinutes: number
  syllabusText: string
  topics: { name: string; subtopics: { name: string }[] }[]
  remainingItems?: { topic: string; estimated_minutes: number; priority: string }[]
}): string {
  const { subjectName, examDate, daysRemaining, dailyMinutes, syllabusText, topics, remainingItems } = params

  const topicList = topics.length > 0
    ? topics.map(t => {
        const subs = t.subtopics.length > 0 ? ` (subtopics: ${t.subtopics.map(s => s.name).join(', ')})` : ''
        return `- ${t.name}${subs}`
      }).join('\n')
    : syllabusText || 'General revision and past papers'

  const isReshuffle = !!remainingItems && remainingItems.length > 0
  const reshuffleNote = isReshuffle
    ? `\nIMPORTANT: This is a RESHUFFLE. The student missed some sessions. Only schedule these REMAINING incomplete topics: ${JSON.stringify(remainingItems)}\n`
    : ''

  return `You are an expert academic study planner. Create a day-by-day study schedule for a student.

SUBJECT: ${subjectName}
EXAM DATE: ${examDate}
DAYS REMAINING (excluding exam day): ${daysRemaining}
DAILY STUDY TIME: ${dailyMinutes} minutes
${reshuffleNote}
TOPICS TO COVER:
${topicList}

RULES (MUST FOLLOW):
1. Output ONLY a raw JSON array. No markdown, no explanation, no preamble, no code blocks.
2. Each object must have exactly these keys: "day_date" (YYYY-MM-DD), "topic" (string), "estimated_minutes" (integer), "priority" ("high", "medium", or "low"), and "concept_summary" (string).
3. The "concept_summary" must contain a proper explanation, basic concepts breakdown, and a quick brainstorm to help the student easily understand the basics before starting the topic in detail. Keep it highly digestible (2-3 sentences).
4. Daily total estimated_minutes must NOT exceed ${dailyMinutes}
5. Spread topics so earlier days cover foundational content (low/medium priority), later days focus on harder topics and revision (high priority)
6. Leave the last 1-2 days before the exam for full revision (high priority)
7. If a topic is complex, split it across multiple days with clear subtopic names
8. Do not schedule anything on ${examDate} (exam day)
9. Start scheduling from TODAY: ${format(new Date(), 'yyyy-MM-dd')}

OUTPUT FORMAT EXAMPLE (follow exactly):
[{"day_date":"2025-01-10","topic":"Introduction to Calculus - Limits","estimated_minutes":60,"priority":"low","concept_summary":"Limits describe the value that a function approaches as the input approaches some value. Think of it as approaching a destination without ever arriving. Key brainstorming: infinity, asymptotes, and continuity."}]

IMPORTANT: Output NOTHING except the JSON array. Start your response with [ and end with ].`
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { subjectId, isReshuffle = false } = body

    if (!subjectId) return NextResponse.json({ error: 'subjectId is required' }, { status: 400 })

    // Fetch subject
    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', subjectId)
      .eq('user_id', user.id)
      .single()

    if (subjectError || !subject) return NextResponse.json({ error: 'Subject not found' }, { status: 404 })

    const today = startOfDay(new Date())
    const examDate = startOfDay(new Date(subject.exam_date + 'T00:00:00'))
    const daysRemaining = differenceInDays(examDate, today)

    if (daysRemaining <= 0) {
      return NextResponse.json({ error: 'Exam date has already passed or is today. Cannot generate a plan.' }, { status: 400 })
    }

    const dailyMinutes = Math.round((subject.daily_hours || 2) * 60)

    // For reshuffle: get remaining incomplete items
    let remainingItems: StudyPlanItem[] | undefined
    if (isReshuffle) {
      const { data: incompletePlans } = await supabase
        .from('study_plans')
        .select('topic, estimated_minutes, priority')
        .eq('subject_id', subjectId)
        .eq('completed', false)

      remainingItems = incompletePlans?.map(p => ({
        day_date: '',
        topic: p.topic,
        estimated_minutes: p.estimated_minutes,
        priority: p.priority as 'high' | 'medium' | 'low',
      })) || []

      // Delete all existing incomplete plans for this subject
      await supabase
        .from('study_plans')
        .delete()
        .eq('subject_id', subjectId)
        .eq('completed', false)
    } else {
      // Delete all existing plans for this subject (fresh generation)
      await supabase.from('study_plans').delete().eq('subject_id', subjectId)
    }

    // Build prompt
    const prompt = buildGroqPrompt({
      subjectName: subject.name,
      examDate: subject.exam_date,
      daysRemaining,
      dailyMinutes,
      syllabusText: subject.syllabus_text || '',
      topics: subject.topics || [],
      remainingItems,
    })

    // Call Groq API
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
            content: 'You are a study plan generator. You output ONLY valid JSON arrays, nothing else. Never use markdown. Never add explanations.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    })

    if (!groqResponse.ok) {
      const errText = await groqResponse.text()
      console.error('Groq API error:', errText)
      return NextResponse.json({ error: 'AI service returned an error. Please try again.' }, { status: 502 })
    }

    const groqData = await groqResponse.json()
    const rawContent = groqData.choices?.[0]?.message?.content?.trim()

    if (!rawContent) {
      return NextResponse.json({ error: 'AI returned an empty response. Please try again.' }, { status: 502 })
    }

    // Parse JSON strictly
    let planItems: StudyPlanItem[]
    try {
      // Strip any accidental markdown code fences
      const cleaned = rawContent.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '').trim()
      planItems = JSON.parse(cleaned)

      if (!Array.isArray(planItems)) throw new Error('Not an array')

      // Validate each item
      planItems = planItems.filter(item =>
        item.day_date && typeof item.day_date === 'string' &&
        item.topic && typeof item.topic === 'string' &&
        typeof item.estimated_minutes === 'number' &&
        ['high', 'medium', 'low'].includes(item.priority) &&
        item.concept_summary && typeof item.concept_summary === 'string'
      )

      if (planItems.length === 0) throw new Error('No valid items after filtering')

    } catch (parseError) {
      console.error('JSON parse error:', parseError, '\nRaw content:', rawContent)
      return NextResponse.json({
        error: 'AI returned malformed data. Please try again.',
        rawResponse: rawContent.slice(0, 300),
      }, { status: 422 })
    }

    // Insert into study_plans
    const insertData = planItems.map(item => ({
      subject_id: subjectId,
      user_id: user.id,
      day_date: item.day_date,
      topic: item.topic,
      estimated_minutes: item.estimated_minutes,
      priority: item.priority,
      concept_summary: item.concept_summary,
      completed: false,
    }))

    const { error: insertError } = await supabase.from('study_plans').insert(insertData)
    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json({ error: 'Failed to save the study plan. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, itemCount: planItems.length })

  } catch (err) {
    console.error('Unhandled error in /api/generate-plan:', err)
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 })
  }
}
