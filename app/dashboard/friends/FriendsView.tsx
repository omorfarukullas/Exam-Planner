'use client'

import { useState, useTransition } from 'react'
import { toast } from 'react-hot-toast'
import { searchUsers, sendFriendRequest, acceptFriendRequest, declineFriendRequest, removeFriend } from './actions'

type Friend = {
  friendshipId: string
  id: string
  full_name: string
  avatar_url: string
  streak?: number
}

type FriendsViewProps = {
  currentUserId: string
  friends: Friend[]
  pendingIncoming: Friend[]
  pendingOutgoingIds: string[]
}

export function FriendsView({ currentUserId, friends, pendingIncoming, pendingOutgoingIds }: FriendsViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{ id: string; full_name: string; avatar_url: string }[]>([])
  const [isSearching, startSearch] = useTransition()
  const [activeTab, setActiveTab] = useState<'friends' | 'find'>('friends')

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    
    if (query.length >= 2) {
      startSearch(async () => {
        const results = await searchUsers(query)
        setSearchResults(results)
      })
    } else {
      setSearchResults([])
    }
  }

  const handleSendRequest = async (id: string) => {
    try {
      await sendFriendRequest(id)
      toast.success('Friend request sent')
    } catch {
      toast.error('Failed to send request')
    }
  }

  const handleAccept = async (friendshipId: string) => {
    try {
      await acceptFriendRequest(friendshipId)
      toast.success('Friend request accepted')
    } catch {
      toast.error('Failed to accept request')
    }
  }

  const handleDecline = async (friendshipId: string) => {
    try {
      await declineFriendRequest(friendshipId)
      toast.success('Friend request declined')
    } catch {
      toast.error('Failed to decline request')
    }
  }

  const handleRemove = async (friendshipId: string) => {
    if (confirm('Are you sure you want to remove this friend?')) {
      try {
        await removeFriend(friendshipId)
        toast.success('Friend removed')
      } catch {
        toast.error('Failed to remove friend')
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-border">
        <button
          onClick={() => setActiveTab('friends')}
          className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'friends' 
              ? 'border-primary text-foreground' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          My Network
        </button>
        <button
          onClick={() => setActiveTab('find')}
          className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'find' 
              ? 'border-primary text-foreground' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Add Friends
        </button>
      </div>

      {/* Friends Tab */}
      {activeTab === 'friends' && (
        <div className="space-y-6">
          {pendingIncoming.length > 0 && (
            <div className="card-simple p-4 bg-primary/5 border-primary/20">
              <h2 className="text-sm font-semibold text-primary mb-3">
                Pending Requests ({pendingIncoming.length})
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {pendingIncoming.map(req => (
                  <div key={req.friendshipId} className="bg-background border border-border rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground font-medium shrink-0 overflow-hidden">
                        {req.avatar_url ? (
                          <img src={req.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          req.full_name?.charAt(0) || '?'
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{req.full_name}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleAccept(req.friendshipId)} className="w-8 h-8 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      </button>
                      <button onClick={() => handleDecline(req.friendshipId)} className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold mb-3">Leaderboard</h2>
            {friends.length === 0 ? (
              <div className="card-simple p-12 text-center border-dashed">
                <p className="text-muted-foreground mb-4">You haven't added any friends yet.</p>
                <button onClick={() => setActiveTab('find')} className="btn-primary py-2 px-4">
                  Find Friends
                </button>
              </div>
            ) : (
              <div className="card-simple overflow-hidden">
                <div className="divide-y divide-border">
                  {friends.map((friend, idx) => (
                    <div key={friend.id} className="p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold w-4 text-center ${idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-amber-700' : 'text-muted-foreground'}`}>
                          {idx + 1}
                        </span>
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground font-medium overflow-hidden shrink-0">
                          {friend.avatar_url ? (
                            <img src={friend.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            friend.full_name?.charAt(0) || '?'
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{friend.full_name}</p>
                          <button onClick={() => handleRemove(friend.friendshipId)} className="text-xs text-destructive hover:underline">
                            Remove
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-muted-foreground mb-0.5">Streak</span>
                        <span className="font-semibold text-sm">🔥 {friend.streak || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Find Friends Tab */}
      {activeTab === 'find' && (
        <div className="space-y-6">
          <div className="card-simple p-4 sm:p-6">
            <label className="block text-sm font-medium mb-2">Search Users</label>
            <div className="relative max-w-md">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Name or email..."
                value={searchQuery}
                onChange={handleSearch}
                className="input-simple !pl-9"
              />
            </div>
          </div>

          <div className="space-y-3">
            {isSearching && (
              <div className="text-sm text-muted-foreground">Searching...</div>
            )}
            
            {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
              <div className="text-sm text-muted-foreground">No users found.</div>
            )}

            {!isSearching && searchResults.map(user => {
              const isFriend = friends.some(f => f.id === user.id)
              const hasIncoming = pendingIncoming.some(req => req.id === user.id)
              const hasOutgoing = pendingOutgoingIds.includes(user.id)
              
              return (
                <div key={user.id} className="card-simple p-4 flex items-center justify-between max-w-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground font-medium overflow-hidden shrink-0">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        user.full_name?.charAt(0) || '?'
                      )}
                    </div>
                    <p className="font-medium">{user.full_name}</p>
                  </div>
                  <div>
                    {isFriend ? (
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-md border border-green-200">Friends</span>
                    ) : hasIncoming ? (
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-md">Review Request</span>
                    ) : hasOutgoing ? (
                      <span className="text-xs font-medium text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">Request Sent</span>
                    ) : (
                      <button
                        onClick={() => handleSendRequest(user.id)}
                        className="btn-secondary px-3 py-1.5 text-xs"
                      >
                        Add Friend
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
