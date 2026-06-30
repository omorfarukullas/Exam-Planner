import { startOfDay, differenceInDays, isToday, isYesterday } from 'date-fns'

interface StudySession {
  date: string // YYYY-MM-DD
  minutes_logged: number
}

export function calculateStreak(sessions: StudySession[]): number {
  if (!sessions || sessions.length === 0) return 0

  // Filter out days with 0 minutes and sort by date descending
  const validSessions = sessions
    .filter(s => s.minutes_logged > 0)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (validSessions.length === 0) return 0

  let streak = 0
  const today = startOfDay(new Date())

  // Ensure the most recent session is either today or yesterday
  const mostRecentDate = startOfDay(new Date(validSessions[0].date + 'T00:00:00'))
  if (!isToday(mostRecentDate) && !isYesterday(mostRecentDate)) {
    return 0 // Streak broken
  }

  let currentDate = mostRecentDate

  for (let i = 0; i < validSessions.length; i++) {
    const sessionDate = startOfDay(new Date(validSessions[i].date + 'T00:00:00'))
    
    // Allow multiple sessions on the same day (just skip advancing streak)
    if (i > 0 && sessionDate.getTime() === currentDate.getTime()) {
      continue
    }

    // Check if it's consecutive
    if (differenceInDays(currentDate, sessionDate) <= 1) {
      streak++
      currentDate = sessionDate
    } else {
      break
    }
  }

  return streak
}
