'use client'

import { useEffect, useState, useRef } from 'react'
import Sidebar from '@/components/Sidebar'

interface Conversation {
  id: string
  title: string
  fileName: string
  fileType: string
  fileSize: number
  recipientId: string
  recipientName: string
  createdAt: string
}

interface Attachment {
  name: string
  type: string
  size: number
  dataUrl?: string | null
  url?: string | null
}

interface Message {
  id: string
  userId?: string // for group chat
  userName?: string // for group chat
  message: string
  createdAt: string
  fromUserId?: string // for direct
  fromUserName?: string // for direct
  toUserId?: string // for direct
  attachment?: Attachment
}

interface Feedback {
  id: string
  userId: string
  userName: string
  body: string
  createdAt: string
}

export default function ConversationsPage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'list' | 'chat' | 'feedback'>('upload')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [recipientId, setRecipientId] = useState('')
  const [isSending, setIsSending] = useState(false)

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoadingConvs, setIsLoadingConvs] = useState(true)

  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sendingMsg, setSendingMsg] = useState(false)

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [feedbackText, setFeedbackText] = useState('')
  const [sendingFeedback, setSendingFeedback] = useState(false)

  const [directMessages, setDirectMessages] = useState<Message[]>([])
  const [directInput, setDirectInput] = useState('')
  const [sendingDirect, setSendingDirect] = useState(false)

  const [groupAttachment, setGroupAttachment] = useState<File | null>(null)
  const [groupAttachmentPreview, setGroupAttachmentPreview] = useState<string>('')

  const dropRef = useRef<HTMLDivElement>(null)
  const chatListRef = useRef<HTMLDivElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const directEndRef = useRef<HTMLDivElement>(null)
  const groupFileInputRef = useRef<HTMLInputElement>(null)

  const currentUser = { id: '2', name: 'سامی قربانی' }
  const recipients = [
    { id: '1', name: 'مدیر سیستم' },
    { id: '2', name: 'سامی قربانی' },
    { id: '3', name: 'کارمند ۳' },
  ]
  const userMap: Record<string, string> = {
    '1': 'مدیر سیستم',
    '2': 'سامی قربانی',
    '3': 'کارمند ۳',
  }

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    fetchMessages()
  }, [])

  useEffect(() => {
    fetchFeedbacks()
  }, [])

  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, activeTab])

  useEffect(() => {
    if (recipientId) {
      fetch(`/api/conversations/messages/${recipientId}`)
        .then(r => r.json())
        .then(data => setDirectMessages((data.messages || []) as Message[]))
        .catch(() => setDirectMessages([]))
    } else {
      setDirectMessages([])
    }
  }, [recipientId])

  useEffect(() => {
    directEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [directMessages])

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/conversations')
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations || [])
      }
    } finally {
      setIsLoadingConvs(false)
    }
  }

  const normalizeGroup = (list: Message[]): Message[] => {
    return (list || []).map(m => ({
      ...m,
      userName: m.userName || (m.userId ? userMap[String(m.userId)] : undefined) || 'کاربر',
    }))
  }

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/conversations/messages')
      if (res.ok) {
        const data = await res.json()
        setMessages(normalizeGroup(data.messages || []))
      }
    } catch {}
  }

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch('/api/feedback')
      if (res.ok) {
        const data = await res.json()
        setFeedbacks(data.feedbacks || [])
      }
    } catch {}
  }

  const handleSendFeedback = async () => {
    if (!feedbackText.trim()) return
    setSendingFeedback(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: feedbackText, userId: currentUser.id })
      })
      if (res.ok) {
        const created = await res.json()
        setFeedbacks(prev => [created, ...prev])
        setFeedbackText('')
      }
    } finally {
      setSendingFeedback(false)
    }
  }

  const onDropHandler = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const preventDefault = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return alert('عنوان فایل را وارد کنید')
    if (!file) return alert('فایل را انتخاب کنید')
    if (!recipientId) return alert('مخاطب را انتخاب کنید')

    setIsSending(true)
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          recipientId,
          uploadedBy: currentUser.id,
        })
      })
      if (res.ok) {
        const created = await res.json()
        setConversations(prev => [created, ...prev])
        setTitle('')
        setFile(null)
        setRecipientId('')
        setActiveTab('list')
      } else {
        const err = await res.json()
        alert(err.error || 'خطا در ارسال مکاتبه')
      }
    } catch (e) {
      alert('خطای شبکه')
    } finally {
      setIsSending(false)
    }
  }

  const readFileAsDataUrl = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const onPickGroupAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0]
      setGroupAttachment(f)
      try {
        const dataUrl = await readFileAsDataUrl(f)
        setGroupAttachmentPreview(dataUrl)
      } catch {
        setGroupAttachmentPreview('')
      }
    }
  }

  const clearGroupAttachment = () => {
    setGroupAttachment(null)
    setGroupAttachmentPreview('')
    if (groupFileInputRef.current) groupFileInputRef.current.value = ''
  }

  const sendMessage = async () => {
    const hasText = !!newMessage.trim()
    const hasFile = !!groupAttachment
    if (!hasText && !hasFile) return

    setSendingMsg(true)

    // optimistic append
    const tempId = Date.now().toString()
    const optimistic: Message = {
      id: tempId,
      userId: currentUser.id,
      userName: currentUser.name,
      message: hasText ? newMessage : '',
      createdAt: new Date().toISOString(),
      attachment: hasFile ? {
        name: groupAttachment!.name,
        type: groupAttachment!.type,
        size: groupAttachment!.size,
        dataUrl: groupAttachmentPreview,
      } : undefined
    }
    setMessages(prev => [...prev, optimistic])

    try {
      const payload: any = { userId: currentUser.id, message: newMessage }
      if (hasFile) {
        payload.attachment = {
          name: groupAttachment!.name,
          type: groupAttachment!.type,
          size: groupAttachment!.size,
          dataUrl: groupAttachmentPreview,
        }
      }
      const res = await fetch('/api/conversations/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        const created: Message = await res.json()
        const normalized: Message = {
          ...created,
          userName: created.userName || userMap[String(created.userId || currentUser.id)] || currentUser.name,
        }
        // replace optimistic or just append true result; simplest: keep both fine for mock
      }
    } catch {}
    finally {
      setNewMessage('')
      clearGroupAttachment()
      setSendingMsg(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    await sendMessage()
  }

  const handleMessageKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const sendDirect = async () => {
    if (!recipientId || !directInput.trim()) return
    setSendingDirect(true)
    try {
      const res = await fetch(`/api/conversations/messages/${recipientId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromUserId: currentUser.id, message: directInput })
      })
      if (res.ok) {
        const created = await res.json()
        setDirectMessages(prev => [...prev, created])
        setDirectInput('')
      } else {
        const temp: Message = {
          id: Date.now().toString(),
          fromUserId: currentUser.id,
          fromUserName: currentUser.name,
          toUserId: recipientId,
          message: directInput,
          createdAt: new Date().toISOString()
        }
        setDirectMessages(prev => [...prev, temp])
        setDirectInput('')
      }
    } catch {
      const temp: Message = {
        id: Date.now().toString(),
        fromUserId: currentUser.id,
        fromUserName: currentUser.name,
        toUserId: recipientId,
        message: directInput,
        createdAt: new Date().toISOString()
      }
      setDirectMessages(prev => [...prev, temp])
      setDirectInput('')
    } finally {
      setSendingDirect(false)
    }
  }

  const handleDirectSubmit = (e: React.FormEvent) => { e.preventDefault(); sendDirect() }
  const handleDirectKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { if (e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendDirect() } }

  const selectedRecipientName = recipients.find(r=>r.id===recipientId)?.name

  const renderAttachment = (att?: Attachment) => {
    if (!att) return null
    const isImage = att.type.startsWith('image/')
    const isVideo = att.type.startsWith('video/')
    if (isImage && (att.dataUrl || att.url)) {
      return (
        <div className="mt-2">
          <img src={att.dataUrl || att.url || ''} alt={att.name} className="max-w-full rounded-lg border border-gray-700" />
        </div>
      )
    }
    if (isVideo && (att.dataUrl || att.url)) {
      return (
        <div className="mt-2">
          <video src={att.dataUrl || att.url || ''} controls className="max-w-full rounded-lg border border-gray-700" />
        </div>
      )
    }
    return (
      <a
        href={att.dataUrl || att.url || '#'}
        target="_blank" rel="noreferrer"
        className="mt-2 inline-flex items-center px-2 py-1 rounded bg-gray-700 text-gray-100 text-xs border border-gray-600"
      >
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828L18 9.828M16 5h6m0 0v6m0-6L10 17" /></svg>
        {att.name}
      </a>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex overflow-hidden" dir="rtl">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl">
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">مکاتبات</h1>
            <div className="flex gap-2">
              <button onClick={() => setActiveTab('upload')} className={`px-3 py-1 rounded-lg text-sm ${activeTab==='upload'?'bg-blue-600 text-white':'bg-gray-800 text-gray-300'}`}>ارسال فایل</button>
              <button onClick={() => setActiveTab('list')} className={`px-3 py-1 rounded-lg text-sm ${activeTab==='list'?'bg-blue-600 text-white':'bg-gray-800 text-gray-300'}`}>لیست مکاتبات</button>
              <button onClick={() => setActiveTab('chat')} className={`px-3 py-1 rounded-lg text-sm ${activeTab==='chat'?'bg-blue-600 text-white':'bg-gray-800 text-gray-300'}`}>چت گروهی</button>
              <button onClick={() => setActiveTab('feedback')} className={`px-3 py-1 rounded-lg text-sm ${activeTab==='feedback'?'bg-blue-600 text-white':'bg-gray-800 text-gray-300'}`}>نظرات به مدیریت</button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'upload' && (
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upload card */}
              <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
                <form onSubmit={handleUpload} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">عنوان فایل</label>
                    <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white" placeholder="مثال: قرارداد مشتری الف"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">انتخاب مخاطب برای چت</label>
                    <select value={recipientId} onChange={e=>setRecipientId(e.target.value)} className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white">
                      <option value="">انتخاب کنید</option>
                      {recipients.map(r=> <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                    {recipientId && (
                      <div className="mt-2 text-sm text-blue-300">چت با: <span className="font-semibold">{selectedRecipientName}</span></div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">انتخاب فایل (Drag & Drop)</label>
                    <div ref={dropRef} onDrop={onDropHandler} onDragOver={preventDefault} onDragEnter={preventDefault} onDragLeave={preventDefault}
                      className="w-full border-2 border-dashed border-gray-600 rounded-xl p-8 text-center bg-gray-800/40">
                      <div className="text-gray-300 mb-3">فایل را بکشید و رها کنید یا از دکمه زیر استفاده کنید</div>
                      <input type="file" onChange={onFileInput} className="hidden" id="fileInput" />
                      <label htmlFor="fileInput" className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg cursor-pointer">انتخاب فایل</label>
                      {file && (
                        <div className="mt-4 text-gray-200 text-sm">{file.name} — {(file.size/1024).toFixed(1)} KB</div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" disabled={isSending} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-lg shadow-lg disabled:opacity-50">{isSending?'در حال ارسال...':'ارسال'}</button>
                  </div>
                </form>
              </div>

              {/* Direct chat card */}
              <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-700/50 bg-gray-900/80 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center ml-3">DM</div>
                    <div>
                      <div className="text-white font-semibold">گفتگوی خصوصی</div>
                      <div className="text-xs text-gray-400">{recipientId? `با ${selectedRecipientName}` : 'ابتدا مخاطب را انتخاب کنید'}</div>
                    </div>
                  </div>
                </div>

                <div className="h-96 overflow-y-auto p-4 space-y-2 bg-gradient-to-b from-gray-900/60 to-gray-900">
                  {recipientId ? (
                    directMessages.map(m => {
                      const isMe = m.fromUserId === currentUser.id
                      return (
                        <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          {!isMe && (
                            <div className="w-8 h-8 rounded-full bg-gray-700 text-white flex items-center justify-center ml-2 text-xs">
                              {(m.fromUserName || 'کاربر').slice(0,2)}
                            </div>
                          )}
                          <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow ${isMe ? 'bg-purple-600 text-white rounded-br-sm' : 'bg-gray-800 text-gray-100 rounded-bl-sm'}`}>
                            {!isMe && <div className="text-xs text-purple-300 mb-1">{m.fromUserName}</div>}
                            <div className="whitespace-pre-wrap leading-6">{m.message}</div>
                            <div className={`text-[10px] mt-1 ${isMe ? 'text-purple-100/80' : 'text-gray-400'}`}>{new Date(m.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</div>
                          </div>
                          {isMe && (
                            <div className="w-8 h-8 rounded-full bg-purple-700 text-white flex items-center justify-center mr-2 text-xs">
                              {(currentUser.name).slice(0,2)}
                            </div>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-gray-400 text-center mt-10">برای شروع گفتگو، مخاطب را انتخاب کنید.</div>
                  )}
                  <div ref={directEndRef} />
                </div>

                <form onSubmit={handleDirectSubmit} className="p-3 border-t border-gray-700/50 bg-gray-900/80 flex items-end gap-2">
                  <textarea
                    value={directInput}
                    onChange={e=>setDirectInput(e.target.value)}
                    onKeyDown={handleDirectKeyDown}
                    rows={1}
                    placeholder={recipientId ? 'پیام خود را بنویسید...' : 'ابتدا مخاطب را انتخاب کنید'}
                    disabled={!recipientId}
                    className="flex-1 max-h-40 p-3 bg-gray-800 border border-gray-700 rounded-xl text-white resize-none focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
                  />
                  <button type="submit" disabled={sendingDirect || !recipientId || !directInput.trim()} className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white disabled:opacity-50">
                    ارسال
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'list' && (
            <div className="max-w-5xl mx-auto">
              {isLoadingConvs ? (
                <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"/></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {conversations.map(c => (
                    <div key={c.id} className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-white font-semibold">{c.title}</div>
                        <div className="text-xs text-gray-500">{c.createdAt}</div>
                      </div>
                      <div className="text-gray-300 text-sm mb-1">فایل: {c.fileName}</div>
                      <div className="text-gray-300 text-sm mb-1">گیرنده: {c.recipientName}</div>
                      <div className="text-gray-500 text-xs">حجم: {(c.fileSize/1024).toFixed(1)} KB</div>
                    </div>
                  ))}
                  {conversations.length===0 && <div className="text-gray-400">مکاتبه‌ای ثبت نشده است.</div>}
                </div>
              )}
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="max-w-3xl mx-auto bg-gray-900/80 border border-gray-700/50 rounded-2xl p-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-700/50 bg-gray-900/80 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center ml-3">TG</div>
                  <div>
                    <div className="text-white font-semibold">چت گروهی کارکنان</div>
                    <div className="text-xs text-gray-400">آنلاین</div>
                  </div>
                </div>
                <div className="text-gray-400 text-sm">مشترک بین همه</div>
              </div>
              <div ref={chatListRef} className="h-96 overflow-y-auto p-4 space-y-2 bg-gradient-to-b from-gray-900/60 to-gray-900">
                {messages.map(m => {
                  const isMe = m.userId === currentUser.id
                  return (
                    <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      {!isMe && (
                        <div className="w-8 h-8 rounded-full bg-gray-700 text-white flex items-center justify-center ml-2 text-xs">
                          {(m.userName || 'کاربر').slice(0,2)}
                        </div>
                      )}
                      <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow ${isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-800 text-gray-100 rounded-bl-sm'}`}>
                        {!isMe && <div className="text-xs text-blue-300 mb-1">{m.userName}</div>}
                        {m.message && <div className="whitespace-pre-wrap leading-6">{m.message}</div>}
                        {renderAttachment(m.attachment)}
                        <div className={`text-[10px] mt-1 ${isMe ? 'text-blue-100/80' : 'text-gray-400'}`}>{new Date(m.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                      {isMe && (
                        <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center mr-2 text-xs">
                          {(currentUser.name).slice(0,2)}
                        </div>
                      )}
                    </div>
                  )
                })}
                {messages.length===0 && <div className="text-gray-400 text-center mt-10">پیامی وجود ندارد. اولین پیام را ارسال کنید.</div>}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-700/50 bg-gray-900/80 flex items-end gap-2">
                <input type="file" ref={groupFileInputRef} onChange={onPickGroupAttachment} className="hidden" accept="image/*,video/*,application/*" />
                <button type="button" onClick={() => groupFileInputRef.current?.click()} className="px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-200 hover:bg-gray-700">پیوست</button>
                <textarea
                  value={newMessage}
                  onChange={e=>setNewMessage(e.target.value)}
                  onKeyDown={handleMessageKeyDown}
                  rows={1}
                  placeholder="پیام خود را بنویسید... (Enter برای ارسال، Shift+Enter برای خط جدید)"
                  className="flex-1 max-h-40 p-3 bg-gray-800 border border-gray-700 rounded-xl text-white resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button type="submit" disabled={sendingMsg || (!newMessage.trim() && !groupAttachment)} className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white disabled:opacity-50">ارسال</button>
              </form>
              {groupAttachment && (
                <div className="px-3 pb-3">
                  <div className="border border-gray-700 rounded-xl p-2 bg-gray-900/70 flex items-center justify-between">
                    <div className="text-xs text-gray-300 truncate">پیوست: {groupAttachment.name} — {(groupAttachment.size/1024).toFixed(1)} KB</div>
                    <div className="flex items-center gap-2">
                      {groupAttachmentPreview && groupAttachment.type.startsWith('image/') && (
                        <img src={groupAttachmentPreview} className="w-10 h-10 object-cover rounded border border-gray-700" alt="preview" />
                      )}
                      {groupAttachmentPreview && groupAttachment.type.startsWith('video/') && (
                        <video src={groupAttachmentPreview} className="w-16 h-10 object-cover rounded border border-gray-700" />
                      )}
                      <button onClick={clearGroupAttachment} className="text-red-400 text-xs px-2 py-1 border border-red-400/40 rounded hover:bg-red-400/10">حذف</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="max-w-3xl mx-auto bg-gray-900/80 border border-gray-700/50 rounded-2xl p-6">
              <form onSubmit={e=>{ e.preventDefault(); }} className="space-y-4 mb-6">
                <textarea value={feedbackText} onChange={e=>setFeedbackText(e.target.value)} rows={4} className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white" placeholder="نظرات و انتقادات خود را مستقیم به مدیریت ارسال کنید..."/>
                <div className="flex justify-end">
                  <button onClick={handleSendFeedback} disabled={sendingFeedback || !feedbackText.trim()} className="px-6 py-3 rounded-lg bg-purple-600 text-white disabled:opacity-50">ارسال به مدیریت</button>
                </div>
              </form>
              <div className="space-y-3">
                {feedbacks.map(f => (
                  <div key={f.id} className="bg-gray-800/60 border border-gray-700 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-blue-300 text-sm">{f.userName}</div>
                      <div className="text-xs text-gray-500">{new Date(f.createdAt).toLocaleString('fa-IR')}</div>
                    </div>
                    <div className="text-gray-200 text-sm">{f.body}</div>
                  </div>
                ))}
                {feedbacks.length===0 && <div className="text-gray-400">نظری ثبت نشده است.</div>}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
