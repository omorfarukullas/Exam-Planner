import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { FriendsView } from './FriendsView'
import { calculateStreak } from '@/utils/streaks'

export default async function FriendsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get all friendships involving the user
  const { data: friendships } = await supabase
    .from('friendships')
    .select(`
      id,
      status,
      user_id,
      friend_id,
      sender:profiles!user_id(id, full_name, avatar_url),
      receiver:profiles!friend_id(id, full_name, avatar_url)
    `)
    .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`) as any

  // Get all study sessions for streak calculation (for friends)
  const { data: allSessions } = await supabase
    .from('study_sessions')
    .select('user_id, date, minutes_logged')

  const friends = (friendships || [])
    .filter((f: any) => f.status === 'accepted')
    .map((f: any) => {
      const isSender = f.user_id === user.id
      const profile = isSender 
        ? (Array.isArray(f.receiver) ? f.receiver[0] : f.receiver) 
        : (Array.isArray(f.sender) ? f.sender[0] : f.sender)
      
      const sessions = (allSessions || []).filter(s => s.user_id === profile.id)
      return {
        friendshipId: f.id,
        id: profile.id,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        streak: calculateStreak(sessions),
      }
    })
    // Sort by streak for leaderboard
    .sort((a: any, b: any) => b.streak - a.streak)

  const pendingIncoming = (friendships || [])
    .filter((f: any) => f.status === 'pending' && f.friend_id === user.id)
    .map((f: any) => {
      const sender = Array.isArray(f.sender) ? f.sender[0] : f.sender
      return {
        friendshipId: f.id,
        id: sender.id,
        full_name: sender.full_name,
        avatar_url: sender.avatar_url,
      }
    })

  const pendingOutgoing = (friendships || [])
    .filter((f: any) => f.status === 'pending' && f.user_id === user.id)
    .map((f: any) => {
      const receiver = Array.isArray(f.receiver) ? f.receiver[0] : f.receiver
      return receiver.id
    })

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Friends & Study Groups</h1>
        <p className="text-gray-500 mt-1">Add friends to see shared exams and compare study streaks.</p>
      </div>

      <FriendsView 
        currentUserId={user.id}
        friends={friends}
        pendingIncoming={pendingIncoming}
        pendingOutgoingIds={pendingOutgoing}
      />
    </div>
  )
}
