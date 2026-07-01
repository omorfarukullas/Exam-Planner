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
      toast.success('Friend request sent!')
    } catch {
      toast.error('Failed to send request.')
    }
  }

  const handleAccept = async (friendshipId: string) => {
    try {
      await acceptFriendRequest(friendshipId)
      toast.success('Friend request accepted!')
    } catch {
      toast.error('Failed to accept request.')
    }
  }

  const handleDecline = async (friendshipId: string) => {
    try {
      await declineFriendRequest(friendshipId)
      toast.success('Friend request declined.')
    } catch {
      toast.error('Failed to decline request.')
    }
  }

  const handleRemove = async (friendshipId: string) => {
    if (confirm('Are you sure you want to remove this friend?')) {
      try {
        await removeFriend(friendshipId)
        toast.success('Friend removed.')
      } catch {
        toast.error('Failed to remove friend.')
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('friends')}
          className={`py-2 px-4 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'friends' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          My Friends ({friends.length})
        </button>
        <button
          onClick={() => setActiveTab('find')}
          className={`py-2 px-4 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'find' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Find Friends
        </button>
      </div>

      {/* Friends Tab */}
      {activeTab === 'friends' && (
        <div className="space-y-8">
          {pendingIncoming.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Friend Requests</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {pendingIncoming.map(req => (
                  <div key={req.friendshipId} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                        {req.avatar_url ? (
                          <img src={req.avatar_url} alt="" className="w-10 h-10 rounded-full" />
                        ) : (
                          req.full_name?.charAt(0) || '?'
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{req.full_name}</p>
                        <p className="text-xs text-gray-500">Wants to connect</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleAccept(req.friendshipId)} className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-full transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      </button>
                      <button onClick={() => handleDecline(req.friendshipId)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-full transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Leaderboard</h2>
            {friends.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-300">
                <p className="text-gray-500 font-medium">No friends yet.</p>
                <button onClick={() => setActiveTab('find')} className="mt-2 text-indigo-600 font-semibold text-sm hover:underline">
                  Find people to study with
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
                <ul className="divide-y divide-gray-100">
                  {friends.map((friend, idx) => (
                    <li key={friend.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <span className={`text-lg font-bold w-6 text-center ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-amber-600' : 'text-gray-300'}`}>
                          {idx + 1}
                        </span>
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                          {friend.avatar_url ? (
                            <img src={friend.avatar_url} alt="" className="w-10 h-10 rounded-full" />
                          ) : (
                            friend.full_name?.charAt(0) || '?'
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{friend.full_name}</p>
                          <button onClick={() => handleRemove(friend.friendshipId)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-sm font-bold border border-orange-100">
                        🔥 {friend.streak || 0}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Find Friends Tab */}
      {activeTab === 'find' && (
        <div className="space-y-6">
          <div className="relative max-w-md">
            <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
            />
          </div>

          <div className="space-y-4">
            {isSearching && <p className="text-sm text-gray-500 animate-pulse">Searching...</p>}
            
            {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
              <p className="text-sm text-gray-500">No users found.</p>
            )}

            {!isSearching && searchResults.map(user => {
              const isFriend = friends.some(f => f.id === user.id)
              const hasIncoming = pendingIncoming.some(req => req.id === user.id)
              const hasOutgoing = pendingOutgoingIds.includes(user.id)
              
              return (
                <div key={user.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-sm max-w-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center font-bold">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full" />
                      ) : (
                        user.full_name?.charAt(0) || '?'
                      )}
                    </div>
                    <p className="font-semibold text-gray-900">{user.full_name}</p>
                  </div>
                  <div>
                    {isFriend ? (
                      <span className="text-sm text-gray-400 font-medium px-3 py-1.5">Friends</span>
                    ) : hasIncoming ? (
                      <span className="text-sm text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl font-medium">Requested you</span>
                    ) : hasOutgoing ? (
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-xl font-medium">Request Sent</span>
                    ) : (
                      <button
                        onClick={() => handleSendRequest(user.id)}
                        className="text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors"
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
