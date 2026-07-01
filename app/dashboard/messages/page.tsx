import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { MessagesView } from './MessagesView'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all accepted friends
  const { data: friendships } = await supabase
    .from('friendships')
    .select(`
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

  // Fetch initial messages with related profiles
  const { data: initialMessages } = await supabase
    .from('messages')
    .select(`
      id,
      sender_id,
      receiver_id,
      content,
      file_url,
      file_type,
      file_name,
      created_at,
      sender:profiles!sender_id(id, full_name, avatar_url)
    `)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false })
    .limit(100)

  const messages = (initialMessages || []).reverse().map(msg => ({
    ...msg,
    sender: Array.isArray(msg.sender) ? msg.sender[0] : msg.sender
  }))

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-6rem)] flex flex-col pb-4">
      <div className="flex-1 min-h-0 relative z-10 card-simple overflow-hidden flex shadow-sm">
        <MessagesView 
          currentUserId={user.id} 
          friends={friends} 
          initialMessages={messages} 
        />
      </div>
    </div>
  )
}
