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

export function MessagesView({ currentUserId, friends, initialMessages = [] }: { currentUserId: string, friends: Friend[], initialMessages?: Message[] }) {
  const [activeFriend, setActiveFriend] = useState<Friend | null>(friends[0] || null)
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!activeFriend) return

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${activeFriend.id}),and(sender_id.eq.${activeFriend.id},receiver_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true })

      if (data) setMessages(data)
    }
    
    if (!messages.some(m => m.sender_id === activeFriend.id || m.receiver_id === activeFriend.id)) {
      fetchMessages()
    }

    const channel = supabase.channel('realtime:messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `sender_id=eq.${activeFriend.id}`
      }, (payload) => {
        const newMsg = payload.new as Message
        setMessages(prev => [...prev, newMsg])
        
        supabase.from('messages').update({ status: 'delivered' }).eq('id', newMsg.id)
      })
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'messages',
        filter: `receiver_id=eq.${activeFriend.id}`
      }, (payload) => {
        const updatedMsg = payload.new as Message
        setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeFriend, currentUserId, supabase])

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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, filePreview])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setFilePreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setFilePreview(null)
      }
    }
    e.target.value = ''
  }

  const cancelFile = () => {
    setSelectedFile(null)
    setFilePreview(null)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!newMessage.trim() && !selectedFile) || !activeFriend || uploading) return

    const msgText = newMessage
    setNewMessage('') 

    if (selectedFile) {
      setUploading(true)
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${currentUserId}-${Date.now()}.${fileExt}`

      const { data, error } = await supabase.storage
        .from('chat_attachments')
        .upload(fileName, selectedFile)

      if (error) {
        toast.error('File upload failed')
        setUploading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('chat_attachments')
        .getPublicUrl(fileName)

      const content = msgText.trim() ? msgText : `File: ${selectedFile.name}`

      const tempMsg: Message = {
        id: crypto.randomUUID(),
        sender_id: currentUserId,
        receiver_id: activeFriend.id,
        content: content,
        attachment_url: publicUrl,
        is_ai_response: false,
        status: 'sent',
        created_at: new Date().toISOString()
      }
      setMessages(prev => [...prev, tempMsg])

      await supabase.from('messages').insert({
        sender_id: currentUserId,
        receiver_id: activeFriend.id,
        content: content,
        attachment_url: publicUrl,
      })

      cancelFile()
      setUploading(false)
    } else {
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
        toast.error('Failed to send message')
      }
    }

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

  const activeMessages = activeFriend 
    ? messages.filter(m => 
        (m.sender_id === currentUserId && m.receiver_id === activeFriend.id) ||
        (m.sender_id === activeFriend.id && m.receiver_id === currentUserId)
      )
    : []

  if (friends.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-3xl mb-4 text-muted-foreground">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">No Friends Yet</h3>
        <p className="text-muted-foreground max-w-sm">
          Add friends to start sending messages and collaborating.
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Sidebar (Friends List) */}
      <div className="w-64 border-r border-border bg-background flex flex-col shrink-0 hidden sm:flex">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-sm">Conversations</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {friends.map(friend => {
            const isActive = activeFriend?.id === friend.id
            return (
              <button
                key={friend.id}
                onClick={() => setActiveFriend(friend)}
                className={`w-full text-left flex items-center gap-3 p-3 transition-colors ${
                  isActive ? 'bg-secondary' : 'hover:bg-secondary/50'
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-border flex items-center justify-center font-medium overflow-hidden">
                    {friend.avatar_url ? (
                      <img src={friend.avatar_url} alt={friend.full_name} className="w-full h-full object-cover" />
                    ) : (
                      friend.full_name.charAt(0)
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{friend.full_name}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      {activeFriend ? (
        <div className="flex-1 flex flex-col bg-background relative min-w-0">
          
          {/* Header */}
          <div className="px-4 py-3 border-b border-border bg-background flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              {/* Mobile back button logic could go here */}
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-medium overflow-hidden shrink-0">
                {activeFriend.avatar_url ? (
                  <img src={activeFriend.avatar_url} alt={activeFriend.full_name} className="w-full h-full object-cover" />
                ) : (
                  activeFriend.full_name.charAt(0)
                )}
              </div>
              <div>
                <h3 className="font-semibold text-sm">{activeFriend.full_name}</h3>
                <p className="text-xs text-muted-foreground">Active now</p>
              </div>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeMessages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-xl mb-3">
                  👋
                </div>
                <h3 className="text-lg font-medium mb-1">Start the conversation</h3>
                <p className="text-sm text-muted-foreground">
                  Say hi or mention @tutor for AI help.
                </p>
              </div>
            )}
            
            {activeMessages.map((msg, i) => {
              const isMe = msg.sender_id === currentUserId
              const isAI = msg.is_ai_response

              if (isAI) {
                return (
                  <div key={msg.id || i} className="flex justify-center my-4">
                    <div className="w-full max-w-sm bg-secondary/50 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🤖</span>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Assistant</span>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                )
              }

              return (
                <div key={msg.id || i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[75%] sm:max-w-[60%] rounded-2xl px-4 py-2 ${
                    isMe 
                      ? 'bg-primary text-primary-foreground rounded-br-sm' 
                      : 'bg-secondary text-secondary-foreground rounded-bl-sm'
                  }`}>
                    {msg.attachment_url && (
                      <div className="mb-2 mt-1 rounded-lg overflow-hidden bg-black/5">
                        {msg.content.match(/\.(jpeg|jpg|gif|png|webp)$/i) || msg.attachment_url.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                          <a href={msg.attachment_url} target="_blank" rel="noreferrer" className="block relative cursor-zoom-in">
                            <img src={msg.attachment_url} alt="Shared image" className="max-w-full h-auto max-h-48 object-contain rounded-md" />
                          </a>
                        ) : (
                          <a 
                            href={msg.attachment_url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className={`flex items-center gap-2 p-2 rounded-md ${isMe ? 'bg-primary-foreground/20 hover:bg-primary-foreground/30' : 'bg-background hover:bg-background/80'} transition-colors`}
                          >
                            <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-sm font-medium truncate">
                              {msg.content.replace('File: ', '').trim() || 'Attachment'}
                            </span>
                          </a>
                        )}
                      </div>
                    )}
                    <p className="text-[15px] leading-relaxed break-words">{msg.content}</p>
                    
                    {/* Message Timestamp & Status Indicator */}
                    <div className={`flex items-center justify-end gap-1 mt-1 -mb-1 text-[10px] ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      <span>{format(new Date(msg.created_at), 'h:mm a')}</span>
                      {isMe && !isAI && (
                        <span className="ml-0.5 flex items-center">
                          {msg.status === 'seen' ? (
                            <svg className="w-3 h-3 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7 M5 18l4-4 M19 12l-4 4" />
                            </svg>
                          ) : msg.status === 'delivered' ? (
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7 M5 18l4-4 M19 12l-4 4" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            
            {/* File Review Preview Block */}
            {selectedFile && (
              <div className="flex flex-col items-end my-2">
                <div className="bg-secondary p-3 rounded-2xl rounded-br-sm max-w-[200px] relative">
                  <button onClick={cancelFile} className="absolute -top-2 -right-2 w-5 h-5 bg-background border border-border hover:bg-destructive hover:text-destructive-foreground hover:border-destructive rounded-full flex items-center justify-center transition-colors z-10">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  
                  {filePreview ? (
                    <img src={filePreview} alt="Preview" className="w-full h-auto max-h-32 object-contain rounded bg-background/50 mb-2" />
                  ) : (
                    <div className="w-full h-16 bg-background rounded flex items-center justify-center mb-2">
                      <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                  )}
                  <div className="truncate text-xs font-medium px-1">{selectedFile.name}</div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Interface */}
          <div className="p-3 bg-background border-t border-border shrink-0">
            <form onSubmit={handleSendMessage} className="flex items-end gap-2">
              <label className="shrink-0 w-10 h-10 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <input type="file" className="hidden" onChange={handleFileSelect} disabled={uploading} accept="image/*, .pdf, .doc, .docx, .zip" />
              </label>
              
              <div className="flex-1 bg-secondary rounded-2xl border border-transparent focus-within:border-primary/50 transition-colors">
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Message..."
                  className="w-full bg-transparent border-none focus:outline-none px-4 py-2.5 text-sm"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={(!newMessage.trim() && !selectedFile) || uploading}
                className="shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4 translate-x-[1px] translate-y-[-1px]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                )}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-secondary/20">
          <p className="text-muted-foreground text-sm font-medium">Select a conversation</p>
        </div>
      )}
    </>
  )
}
