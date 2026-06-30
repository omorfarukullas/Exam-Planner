'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function searchUsers(query: string) {
  if (!query || query.length < 2) return []

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('search_users', { search_query: query })
  
  if (error) {
    console.error('Error searching users:', error)
    return []
  }
  
  return data
}

export async function sendFriendRequest(friendId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('friendships').insert({
    user_id: user.id,
    friend_id: friendId,
    status: 'pending'
  })

  if (error) {
    console.error('Error sending friend request:', error)
    throw new Error('Could not send friend request')
  }

  revalidatePath('/dashboard/friends')
}

export async function acceptFriendRequest(friendshipId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // The RLS policy ensures they can only update if they are the friend_id
  const { error } = await supabase
    .from('friendships')
    .update({ status: 'accepted' })
    .eq('id', friendshipId)
    .eq('friend_id', user.id)

  if (error) {
    console.error('Error accepting friend request:', error)
    throw new Error('Could not accept friend request')
  }

  revalidatePath('/dashboard/friends')
  revalidatePath('/dashboard') // Revalidate dashboard to update shared courses
}

export async function declineFriendRequest(friendshipId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('id', friendshipId)
    .eq('friend_id', user.id)

  if (error) {
    console.error('Error declining friend request:', error)
    throw new Error('Could not decline friend request')
  }

  revalidatePath('/dashboard/friends')
}

export async function removeFriend(friendshipId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('id', friendshipId)

  if (error) {
    console.error('Error removing friend:', error)
    throw new Error('Could not remove friend')
  }

  revalidatePath('/dashboard/friends')
  revalidatePath('/dashboard')
}
