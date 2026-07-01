'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'

interface Friend {
  id: string
  full_name: string
  avatar_url: string | null
}

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  attachment_url: string | null
  is_ai_response: boolean
  status?: 'sent' | 'delivered' | 'seen'
  created_at: string
}

export function MessagesView({ currentUserId, friends }: { currentUserId: string, friends: Friend[] }) {
  const [activeFriend, setActiveFriend] = useState<Friend | null>(friends[0] || null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!activeFriend) return

    // 1. Fetch initial messages
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${activeFriend.id}),and(sender_id.eq.${activeFriend.id},receiver_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true })

      if (data) setMessages(data)
    }
    fetchMessages()

    // 2. Subscribe to realtime
    const channel = supabase.channel('realtime:messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `sender_id=eq.${activeFriend.id}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message])
      })
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'messages',
        filter: `receiver_id=eq.${activeFriend.id}` // Listen for updates to messages WE sent
      }, (payload) => {
        const updatedMsg = payload.new as Message
        setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeFriend, currentUserId, supabase])

  // 3. Mark incoming messages as seen automatically
  useEffect(() => {
    if (!activeFriend || messages.length === 0) return

    const unreadMessages = messages.filter(m => m.sender_id === activeFriend.id && m.status !== 'seen' && !m.is_ai_response)
    
    if (unreadMessages.length > 0) {
      const markAsSeen = async () => {
        await supabase
          .from('messages')
          .update({ status: 'seen' })
          .in('id', unreadMessages.map(m => m.id))
      }
      markAsSeen()

      setMessages(prev => prev.map(m => 
        m.sender_id === activeFriend.id && m.status !== 'seen' 
          ? { ...m, status: 'seen' } 
          : m
      ))
    }
  }, [messages, activeFriend, supabase])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!newMessage.trim() && !selectedFile) || !activeFriend || uploading) return

    const msgText = newMessage
    setNewMessage('') // Clear input optimistic

    if (selectedFile) {
      setUploading(true)
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${currentUserId}-${Date.now()}.${fileExt}`

      const { data, error } = await supabase.storage
        .from('chat_attachments')
        .upload(fileName, selectedFile)

      if (error) {
        console.error('Upload failed:', error)
        setUploading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('chat_attachments')
        .getPublicUrl(fileName)

      const urlWithOriginalName = `${publicUrl}?download=${encodeURIComponent(selectedFile.name)}`
      
      const content = msgText.trim() ? msgText : `Shared a file: ${selectedFile.name}`

      const tempMsg: Message = {
        id: crypto.randomUUID(),
        sender_id: currentUserId,
        receiver_id: activeFriend.id,
        content: content,
        attachment_url: urlWithOriginalName,
        is_ai_response: false,
        status: 'sent',
        created_at: new Date().toISOString()
      }
      setMessages(prev => [...prev, tempMsg])

      await supabase.from('messages').insert({
        sender_id: currentUserId,
        receiver_id: activeFriend.id,
        content: content,
        attachment_url: urlWithOriginalName,
      })

      setSelectedFile(null)
      setUploading(false)
    } else {
      // Just a normal text message
      const tempMsg: Message = {
        id: crypto.randomUUID(),
        sender_id: currentUserId,
        receiver_id: activeFriend.id,
        content: msgText,
        attachment_url: null,
        is_ai_response: false,
        status: 'sent',
        created_at: new Date().toISOString()
      }

      setMessages(prev => [...prev, tempMsg])

      const { error } = await supabase.from('messages').insert({
        sender_id: currentUserId,
        receiver_id: activeFriend.id,
        content: msgText,
      })

      if (error) {
        console.error('Failed to send message:', error)
      }
    }

    // Trigger AI if `@tutor` is mentioned
    if (msgText.includes('@tutor')) {
      fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: msgText,
          senderId: currentUserId,
          receiverId: activeFriend.id
        })
      })
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
    // reset value so the same file can be selected again if canceled
    e.target.value = ''
  }

  if (friends.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-14 text-center h-full flex flex-col items-center justify-center">
        <div className="text-4xl mb-3">👻</div>
        <h3 className="font-bold text-gray-900">No friends yet!</h3>
        <p className="text-sm text-gray-500 mt-1">Add some friends on the Friends tab to start chatting and studying together.</p>
      </div>
    )
  }

  return (
    <div className="flex h-full bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-100 flex flex-col bg-gray-50/50">
        <div className="p-4 border-b border-gray-100 bg-white">
          <h2 className="font-bold text-gray-900">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {friends.map(friend => (
            <button
              key={friend.id}
              onClick={() => setActiveFriend(friend)}
              className={`w-full text-left flex items-center gap-3 p-4 transition-colors border-b border-gray-50 ${
                activeFriend?.id === friend.id ? 'bg-indigo-50 hover:bg-indigo-50/80' : 'hover:bg-gray-100/50'
              }`}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 border border-gray-200 flex items-center justify-center text-indigo-700 font-bold overflow-hidden">
                  {friend.avatar_url ? (
                    <img src={friend.avatar_url} alt={friend.full_name} className="w-full h-full object-cover" />
                  ) : (
                    friend.full_name.charAt(0)
                  )}
                </div>
                {/* Simulated online dot */}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 truncate">{friend.full_name}</p>
                <p className="text-xs text-gray-400 truncate">Tap to chat...</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      {activeFriend ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white/50 backdrop-blur-sm z-10 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold overflow-hidden">
                {activeFriend.avatar_url ? (
                  <img src={activeFriend.avatar_url} alt={activeFriend.full_name} className="w-full h-full object-cover" />
                ) : (
                  activeFriend.full_name.charAt(0)
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{activeFriend.full_name}</h3>
                <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online
                </p>
              </div>
            </div>
            
            {/* Action Buttons (Roast / Challenge) */}
            <div className="flex gap-2">
              <button 
                onClick={async () => {
                  toast.success('Summoning the Roast Bot...')
                  await fetch('/api/roast', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ senderId: currentUserId, receiverId: activeFriend.id })
                  })
                }}
                className="px-3 py-1.5 rounded-lg bg-orange-50 text-orange-600 font-medium text-xs hover:bg-orange-100 transition-colors border border-orange-100"
              >
                🔥 Roast Progress
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 font-medium text-xs hover:bg-indigo-100 transition-colors border border-indigo-100">
                ⚔️ Study Battle
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-50/20">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 text-sm mt-10">
                Send a message to start the conversation! <br/>
                Try typing <strong>@tutor</strong> to ask the AI a question together.
              </div>
            )}
            
            {messages.map((msg, i) => {
              const isMe = msg.sender_id === currentUserId
              const isAI = msg.is_ai_response

              if (isAI) {
                return (
                  <div key={msg.id || i} className="flex justify-center my-4">
                    <div className="max-w-[85%] bg-indigo-50 border border-indigo-100 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">🤖</span>
                        <span className="text-xs font-bold text-indigo-800 tracking-wide uppercase">AI Tutor</span>
                      </div>
                      <p className="text-sm text-indigo-900 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                )
              }

              return (
                <div key={msg.id || i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm ${
                    isMe ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                  }`}>
                    {msg.attachment_url && (
                      <div className="mb-2">
                        {msg.content.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                          <div className="relative group inline-block">
                            <img src={msg.attachment_url} alt="attachment" className="rounded-xl max-w-full h-auto max-h-48 object-cover border border-black/10" />
                            <a 
                              href={msg.attachment_url} 
                              download={msg.content.replace('Shared a file: ', '').trim()}
                              target="_blank" 
                              rel="noreferrer" 
                              className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm shadow-sm"
                              title="Download Image"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </a>
                          </div>
                        ) : (
                          <a 
                            href={msg.attachment_url} 
                            download={msg.content.replace('Shared a file: ', '').trim()}
                            target="_blank" 
                            rel="noreferrer" 
                            className="flex items-center gap-2 bg-black/5 p-2 rounded-lg text-sm font-medium hover:bg-black/10 transition-colors"
                          >
                            📄 Download File
                          </a>
                        )}
                      </div>
                    )}
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                  <div className={`flex items-center gap-1 mt-1 px-1 text-[10px] text-gray-400 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <span>{format(new Date(msg.created_at), 'h:mm a')}</span>
                    {isMe && !isAI && (
                      <span className="ml-0.5">
                        {msg.status === 'seen' ? (
                          <span className="text-blue-500 font-bold text-xs leading-none">✓✓</span>
                        ) : msg.status === 'delivered' ? (
                          <span className="text-gray-400 font-bold text-xs leading-none">✓✓</span>
                        ) : (
                          <span className="text-gray-400 font-bold text-xs leading-none">✓</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100 flex flex-col gap-2 relative">
            {selectedFile && (
              <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2 w-max max-w-sm absolute bottom-[110%] left-4 shadow-md">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="text-xl">📎</span>
                  <span className="text-sm font-medium text-indigo-900 truncate">{selectedFile.name}</span>
                </div>
                <button 
                  type="button"
                  onClick={() => setSelectedFile(null)} 
                  className="ml-4 p-1 text-indigo-400 hover:text-indigo-700 hover:bg-indigo-100 rounded-md transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <label className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl cursor-pointer transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <input type="file" className="hidden" onChange={handleFileSelect} disabled={uploading} />
              </label>
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type a message or @tutor..."
                className="flex-1 bg-gray-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-2xl px-4 py-2.5 text-sm transition-all"
              />
              <button 
                type="submit" 
                disabled={(!newMessage.trim() && !selectedFile) || uploading}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition-colors shadow-sm flex items-center justify-center min-w-[44px]"
              >
                {uploading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50/30">
          <p className="text-gray-400">Select a conversation</p>
        </div>
      )}
    </div>
  )
}
