import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { MessagesView } from './MessagesView'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch accepted friends to use as conversations
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
    .eq('status', 'accepted')
    .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`) as any

  const friends = (friendships || []).map((f: any) => {
    const isSender = f.user_id === user.id
    const profile = isSender 
      ? (Array.isArray(f.receiver) ? f.receiver[0] : f.receiver) 
      : (Array.isArray(f.sender) ? f.sender[0] : f.sender)
    
    return {
      id: profile.id,
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
    }
  })

  // We will let the client component handle fetching the actual messages for the active conversation.

  return (
    <div className="h-[calc(100vh-8rem)]">
      <MessagesView currentUserId={user.id} friends={friends} />
    </div>
  )
}
