'use client'

import { useState, useEffect, useRef } from 'react'
import AdminSidebar from '@/components/AdminSidebar'

interface Message {
  id: string
  fromUserId?: string
  fromUserName?: string
  toUserId?: string
  toUserName?: string
  message: string
  createdAt: string
  attachment?: {
    name: string
    type: string
    size: number
    dataUrl?: string | null
    url?: string | null
  }
}

interface Employee {
  id: string
  fullName: string
  position?: string
}

interface Correspondence {
  id: string
  title: string
  fileName?: string
  fileType?: string
  fileSize?: number
  fileDataUrl?: string
  senderId?: string
  senderName: string
  recipientId?: string
  recipientName?: string
  message?: string
  createdAt: string
}

export default function AdminCorrespondencePage() {
  const [activeTab, setActiveTab] = useState<'chat' | 'feedback'>('chat')
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true)
  const [attachment, setAttachment] = useState<File | null>(null)
  const [attachmentPreview, setAttachmentPreview] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [currentUserId] = useState<string>('1') // Admin ID

  useEffect(() => {
    fetchEmployees()
  }, [])

  useEffect(() => {
    if (selectedEmployeeId) {
      fetchMessages()
      
      // Poll for new messages every 2 seconds
      const interval = setInterval(() => {
        if (selectedEmployeeId) {
          fetchMessages()
        }
      }, 2000)
      
      return () => clearInterval(interval)
    } else {
      setMessages([])
    }
  }, [selectedEmployeeId])

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])


  const fetchEmployees = async () => {
    setIsLoadingEmployees(true)
    try {
      const res = await fetch('/api/employees')
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.employees) {
          setEmployees(data.employees)
        }
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setIsLoadingEmployees(false)
    }
  }

  const fetchMessages = async () => {
    if (!selectedEmployeeId) return
    
    try {
      // Fetch direct messages
      const res = await fetch(`/api/conversations/messages/${selectedEmployeeId}?currentUserId=${currentUserId}`)
      let msgs: Message[] = []
      
      if (res.ok) {
        const data = await res.json()
        msgs = (data.messages || []) as Message[]
      }

      // Also fetch correspondence files sent to this employee
      try {
        const corrRes = await fetch(`/api/correspondence?recipientId=${selectedEmployeeId}`)
        if (corrRes.ok) {
          const corrData = await corrRes.json()
          if (corrData.success && corrData.correspondences) {
            const corrMessages: Message[] = corrData.correspondences.map((corr: any) => ({
              id: `corr_${corr.id}`,
              fromUserId: corr.senderId || '1',
              fromUserName: corr.senderName || 'مدیر سیستم',
              toUserId: corr.recipientId,
              message: corr.message || '',
              createdAt: corr.createdAt,
              attachment: corr.fileName ? {
                name: corr.fileName,
                type: corr.fileType || '',
                size: corr.fileSize || 0,
                dataUrl: corr.fileDataUrl || null,
                url: null
              } : undefined
            }))
            // Merge and sort by date
            msgs = [...msgs, ...corrMessages].sort((a, b) => {
              return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            })
          }
        }
      } catch (corrError) {
        console.error('Error fetching correspondences:', corrError)
      }

      // Only update if messages actually changed (prevent unnecessary re-renders)
      setMessages(prev => {
        const prevIds = new Set(prev.map(m => m.id))
        const newIds = new Set(msgs.map(m => m.id))
        const hasChanged = prev.length !== msgs.length || 
                         msgs.some(m => !prevIds.has(m.id)) ||
                         prev.some(m => !newIds.has(m.id))
        return hasChanged ? msgs : prev
      })
    } catch (error) {
      console.error('Error fetching messages:', error)
      // Don't clear messages on error to prevent flickering
    }
  }

  const readFileAsDataUrl = (file: File): Promise<string> => 
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const handleFileSelect = async (file: File) => {
    setAttachment(file)
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      try {
        const dataUrl = await readFileAsDataUrl(file)
        setAttachmentPreview(dataUrl)
      } catch {
        setAttachmentPreview('')
      }
    } else {
      setAttachmentPreview('')
    }
  }

  const sendMessage = async () => {
    const hasText = !!inputMessage.trim()
    const hasFile = !!attachment
    if (!selectedEmployeeId || (!hasText && !hasFile)) return
    
    setIsSending(true)
    
    try {
      let attachmentPayload: any = null
      if (hasFile) {
        const dataUrl = await readFileAsDataUrl(attachment!)
        attachmentPayload = {
          name: attachment!.name,
          type: attachment!.type,
          size: attachment!.size,
          dataUrl,
        }
      }

      // Send as direct message
      const res = await fetch(`/api/conversations/messages/${selectedEmployeeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fromUserId: currentUserId, 
          message: inputMessage || '',
          attachment: attachmentPayload
        })
      })

      if (res.ok) {
        const created = await res.json()
        // Optimistically add message to UI
        setMessages(prev => [...prev, created])
        setInputMessage('')
        setAttachment(null)
        setAttachmentPreview('')
        if (fileInputRef.current) fileInputRef.current.value = ''
        
        // Refresh messages to get the latest
        setTimeout(() => {
          fetchMessages()
        }, 500)
      } else {
        const errorData = await res.json().catch(() => ({ error: 'خطای ناشناخته' }))
        console.error('❌ Error sending message:', errorData)
        alert('خطا در ارسال پیام: ' + (errorData.error || 'خطای ناشناخته'))
      }
    } catch (error: any) {
      console.error('❌ Network error sending message:', error)
      alert('خطای شبکه در ارسال پیام. لطفاً دوباره تلاش کنید.')
    } finally {
      setIsSending(false)
    }
  }

  const renderAttachment = (att?: Message['attachment']) => {
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
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828L18 9.828M16 5h6m0 0v6m0-6L10 17" />
        </svg>
        {att.name}
      </a>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex overflow-hidden" dir="rtl">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl">
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              مدیریت مکاتبات
            </h1>
            <div className="flex gap-2">
              <button 
                onClick={() => setActiveTab('chat')} 
                className={`px-3 py-1 rounded-lg text-sm ${activeTab === 'chat' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}
              >
                چت با کارمندان
              </button>
              <button 
                onClick={() => setActiveTab('feedback')} 
                className={`px-3 py-1 rounded-lg text-sm ${activeTab === 'feedback' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}
              >
                نظرات و انتقادات
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'chat' && (
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Employee List */}
              <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-gray-700/50 bg-gray-900/80">
                  <h2 className="text-lg font-bold text-white">لیست کارمندان</h2>
                  <p className="text-xs text-gray-400 mt-1">برای شروع چت، کارمند را انتخاب کنید</p>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {isLoadingEmployees ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : employees.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">هیچ کارمندی یافت نشد</div>
                  ) : (
                    <div className="divide-y divide-gray-700/50">
                      {employees.map(emp => (
                        <button
                          key={emp.id}
                          onClick={() => setSelectedEmployeeId(emp.id)}
                          className={`w-full px-4 py-3 text-right hover:bg-gray-800/50 transition ${selectedEmployeeId === emp.id ? 'bg-blue-900/30 border-r-4 border-blue-500' : ''}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`w-10 h-10 rounded-full ${selectedEmployeeId === emp.id ? 'bg-blue-600' : 'bg-gray-700'} text-white flex items-center justify-center ml-3 text-sm font-semibold`}>
                                {emp.fullName.slice(0, 2)}
                              </div>
                              <div>
                                <div className="text-white font-medium">{emp.fullName}</div>
                                <div className="text-xs text-gray-400">{emp.position || 'کارمند'}</div>
                              </div>
                            </div>
                            {selectedEmployeeId === emp.id && (
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Window */}
              <div className="lg:col-span-2 bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                {selectedEmployeeId ? (
                  <>
                    <div className="px-4 py-3 border-b border-gray-700/50 bg-gray-900/80 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center ml-3">
                          {employees.find(r => r.id === selectedEmployeeId)?.fullName.slice(0, 2) || 'EM'}
                        </div>
                        <div>
                          <div className="text-white font-semibold">
                            {employees.find(r => r.id === selectedEmployeeId)?.fullName || 'کارمند'}
                          </div>
                          <div className="text-xs text-gray-400">گفتگوی خصوصی</div>
                        </div>
                      </div>
                    </div>

                    <div className="h-[calc(100vh-350px)] overflow-y-auto p-4 space-y-2 bg-gradient-to-b from-gray-900/60 to-gray-900">
                      {messages.map(m => {
                        const isMe = m.fromUserId === currentUserId
                        return (
                          <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            {!isMe && (
                              <div className="w-8 h-8 rounded-full bg-gray-700 text-white flex items-center justify-center ml-2 text-xs">
                                {(m.fromUserName || 'کاربر').slice(0, 2)}
                              </div>
                            )}
                            <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow ${isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-800 text-gray-100 rounded-bl-sm'}`}>
                              {!isMe && <div className="text-xs text-blue-300 mb-1">{m.fromUserName}</div>}
                              {m.message && <div className="whitespace-pre-wrap leading-6">{m.message}</div>}
                              {renderAttachment(m.attachment)}
                              <div className={`text-[10px] mt-1 ${isMe ? 'text-blue-100/80' : 'text-gray-400'}`}>
                                {new Date(m.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                            {isMe && (
                              <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center mr-2 text-xs">
                                {'مد'}
                              </div>
                            )}
                          </div>
                        )
                      })}
                      {messages.length === 0 && (
                        <div className="text-gray-400 text-center mt-10">هنوز پیامی رد و بدل نشده است. اولین پیام را ارسال کنید.</div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    <form 
                      onSubmit={(e) => {
                        e.preventDefault()
                        sendMessage()
                      }} 
                      className="p-3 border-t border-gray-700/50 bg-gray-900/80 flex items-end gap-2"
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={async (e) => {
                          if (e.target.files && e.target.files[0]) {
                            await handleFileSelect(e.target.files[0])
                          }
                        }} 
                        className="hidden" 
                        accept="image/*,video/*,application/*" 
                      />
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()} 
                        className="px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-200 hover:bg-gray-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828L18 9.828M16 5h6m0 0v6m0-6L10 17" />
                        </svg>
                      </button>
                      <textarea
                        value={inputMessage}
                        onChange={e => setInputMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            sendMessage()
                          }
                        }}
                        rows={1}
                        placeholder="پیام خود را بنویسید..."
                        className="flex-1 max-h-40 p-3 bg-gray-800 border border-gray-700 rounded-xl text-white resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button 
                        type="submit" 
                        disabled={isSending || (!inputMessage.trim() && !attachment)} 
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white disabled:opacity-50"
                      >
                        ارسال
                      </button>
                    </form>
                    {attachment && (
                      <div className="px-3 pb-3">
                        <div className="border border-gray-700 rounded-xl p-2 bg-gray-900/70 flex items-center justify-between">
                          <div className="text-xs text-gray-300 truncate">
                            پیوست: {attachment.name} — {(attachment.size/1024).toFixed(1)} KB
                          </div>
                          <div className="flex items-center gap-2">
                            {attachmentPreview && attachment.type.startsWith('image/') && (
                              <img src={attachmentPreview} className="w-10 h-10 object-cover rounded border border-gray-700" alt="preview" />
                            )}
                            {attachmentPreview && attachment.type.startsWith('video/') && (
                              <video src={attachmentPreview} className="w-16 h-10 object-cover rounded border border-gray-700" />
                            )}
                            <button 
                              onClick={() => {
                                setAttachment(null)
                                setAttachmentPreview('')
                                if (fileInputRef.current) fileInputRef.current.value = ''
                              }} 
                              className="text-red-400 text-xs px-2 py-1 border border-red-400/40 rounded hover:bg-red-400/10"
                            >
                              حذف
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <p className="text-lg mb-2">کارمندی انتخاب نشده است</p>
                      <p className="text-sm">برای شروع گفتگو، کارمند را از لیست سمت راست انتخاب کنید</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'feedback' && (
            <PrivateFeedbackTab />
          )}
        </main>
      </div>
    </div>
  )
}

function PrivateFeedbackTab() {
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFeedback, setSelectedFeedback] = useState<any | null>(null)
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)

  useEffect(() => {
    fetchFeedbacks()
  }, [])

  const fetchFeedbacks = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/private-feedback')
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.feedbacks) {
          setFeedbacks(data.feedbacks)
        }
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReply = async (feedbackId: string) => {
    if (!replyText.trim()) {
      return alert('لطفاً پاسخ خود را وارد کنید')
    }

    setSendingReply(true)
    try {
      const res = await fetch(`/api/private-feedback/${feedbackId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          managerReply: replyText,
          status: 'replied'
        })
      })

      if (res.ok) {
        alert('پاسخ با موفقیت ارسال شد')
        setReplyText('')
        setSelectedFeedback(null)
        fetchFeedbacks()
      } else {
        alert('خطا در ارسال پاسخ')
      }
    } catch (error) {
      console.error('Error sending reply:', error)
      alert('خطا در اتصال به سرور')
    } finally {
      setSendingReply(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unread':
        return <span className="px-2 py-1 rounded text-xs bg-yellow-900/50 text-yellow-300">خوانده نشده</span>
      case 'read':
        return <span className="px-2 py-1 rounded text-xs bg-blue-900/50 text-blue-300">خوانده شده</span>
      case 'replied':
        return <span className="px-2 py-1 rounded text-xs bg-green-900/50 text-green-300">پاسخ داده شده</span>
      default:
        return <span className="px-2 py-1 rounded text-xs bg-gray-900/50 text-gray-300">{status}</span>
    }
  }

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          هیچ نظر و انتقادی ثبت نشده است
        </div>
      ) : (
        feedbacks.map(fb => (
          <div key={fb.id} className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-white font-semibold text-lg">
                  {fb.title || 'بدون عنوان'}
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  از: {fb.employeeName} {fb.employeePosition ? `(${fb.employeePosition})` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(fb.status)}
                <span className="text-xs text-gray-500">
                  {new Date(fb.createdAt).toLocaleDateString('fa-IR')}
                </span>
              </div>
            </div>
            
            <p className="text-gray-300 mb-4 whitespace-pre-wrap">{fb.message}</p>
            
            {fb.managerReply && (
              <div className="mb-4 p-4 bg-blue-900/20 border-r-4 border-blue-500 rounded">
                <p className="text-blue-300 font-semibold text-sm mb-2">پاسخ مدیر:</p>
                <p className="text-blue-200 whitespace-pre-wrap">{fb.managerReply}</p>
                {fb.repliedAt && (
                  <p className="text-blue-400 text-xs mt-2">
                    {new Date(fb.repliedAt).toLocaleDateString('fa-IR')}
                  </p>
                )}
              </div>
            )}
            
            {!fb.managerReply && (
              <div className="mt-4">
                {selectedFeedback?.id === fb.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      rows={3}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="پاسخ خود را وارد کنید..."
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReply(fb.id)}
                        disabled={sendingReply}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm disabled:opacity-50"
                      >
                        {sendingReply ? 'در حال ارسال...' : 'ارسال پاسخ'}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedFeedback(null)
                          setReplyText('')
                        }}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm"
                      >
                        انصراف
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedFeedback(fb)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                  >
                    پاسخ
                  </button>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
