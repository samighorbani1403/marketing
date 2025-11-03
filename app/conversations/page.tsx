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
  const [activeTab, setActiveTab] = useState<'employees' | 'feedback'>('employees')
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('')
  const [employeeMessages, setEmployeeMessages] = useState<Message[]>([])
  const [employeeInput, setEmployeeInput] = useState('')
  const [sendingEmployeeMsg, setSendingEmployeeMsg] = useState(false)
  const [employeeAttachment, setEmployeeAttachment] = useState<File | null>(null)
  const [employeeAttachmentPreview, setEmployeeAttachmentPreview] = useState<string>('')
  const employeeFileInputRef = useRef<HTMLInputElement>(null)

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [feedbackText, setFeedbackText] = useState('')
  const [sendingFeedback, setSendingFeedback] = useState(false)

  const directEndRef = useRef<HTMLDivElement>(null)

  const [currentUser, setCurrentUser] = useState<{ id: string, name: string }>({ id: '', name: '' })
  const [recipients, setRecipients] = useState<Array<{ id: string, name: string }>>([])
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true)
  
  // Build userMap from recipients
  const userMap: Record<string, string> = recipients.reduce((acc, emp) => {
    acc[emp.id] = emp.name
    return acc
  }, {} as Record<string, string>)

  useEffect(() => {
    fetchCurrentUser()
    fetchEmployees()
    
    // Request notification permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          console.log('Notification permission:', permission)
        })
      }
    }
  }, [])


  useEffect(() => {
    fetchFeedbacks()
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const userData = await res.json()
        setCurrentUser({
          id: userData.id || '',
          name: userData.name || userData.username || 'کاربر'
        })
      }
    } catch (error) {
      console.error('Error fetching current user:', error)
    }
  }

  const fetchEmployees = async () => {
    setIsLoadingEmployees(true)
    try {
      const res = await fetch('/api/employees')
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.employees) {
          const employeeList = data.employees.map((emp: any) => ({
            id: emp.id,
            name: emp.fullName || 'کارمند'
          }))
          setRecipients(employeeList)
        }
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setIsLoadingEmployees(false)
    }
  }



  const fetchEmployeeMessages = async () => {
    if (selectedEmployeeId && currentUser.id) {
      try {
        const res = await fetch(`/api/conversations/messages/${selectedEmployeeId}?currentUserId=${currentUser.id}`)
        if (res.ok) {
          const data = await res.json()
          setEmployeeMessages((data.messages || []) as Message[])
        }
      } catch (error) {
        console.error('Error fetching messages:', error)
        setEmployeeMessages([])
      }
    } else {
      setEmployeeMessages([])
    }
  }

  useEffect(() => {
    fetchEmployeeMessages()
    
    // Poll for new messages every 3 seconds
    const interval = setInterval(() => {
      if (selectedEmployeeId && currentUser.id) {
        fetchEmployeeMessages()
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [selectedEmployeeId, currentUser.id])

  useEffect(() => {
    if (activeTab === 'employees' && selectedEmployeeId) {
      // Scroll to bottom of employee chat
      setTimeout(() => {
        directEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [employeeMessages, activeTab, selectedEmployeeId])

  // Check for new messages from other users (notifications)
  useEffect(() => {
    if (!currentUser.id) return

    const checkForNewMessages = async () => {
      try {
        // Get all employees
        const res = await fetch('/api/employees')
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.employees) {
            // Check for new messages from each employee
            for (const emp of data.employees) {
              if (emp.id === currentUser.id) continue
              
              try {
                const msgRes = await fetch(`/api/conversations/messages/${emp.id}?currentUserId=${currentUser.id}`)
                if (msgRes.ok) {
                  const msgData = await msgRes.json()
                  const messages = msgData.messages || []
                  // Get the most recent message in this conversation
                  if (messages.length > 0) {
                    const lastMessage = messages[messages.length - 1]
                    // If last message is from the other person and we're not currently viewing this chat
                    if (lastMessage.fromUserId !== currentUser.id && selectedEmployeeId !== emp.id) {
                      // Show notification
                      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                        const senderName = lastMessage.fromUserName || emp.fullName || 'کارمند'
                        // Check if we already showed notification for this message
                        const notificationKey = `msg_${lastMessage.id}`
                        if (!localStorage.getItem(notificationKey)) {
                          new Notification(`پیام جدید از ${senderName}`, {
                            body: lastMessage.message || 'فایل دریافت شده',
                            icon: '/favicon.ico',
                            tag: `message_${emp.id}` // Group notifications from same sender
                          })
                          localStorage.setItem(notificationKey, 'true')
                          // Clean old notification keys after 1 hour
                          setTimeout(() => {
                            localStorage.removeItem(notificationKey)
                          }, 3600000)
                        }
                      }
                    }
                  }
                }
              } catch {}
            }
          }
        }
      } catch (error) {
        console.error('Error checking for new messages:', error)
      }
    }

    // Check every 5 seconds
    const notificationInterval = setInterval(checkForNewMessages, 5000)
    return () => clearInterval(notificationInterval)
  }, [currentUser.id, selectedEmployeeId])




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

  const readFileAsDataUrl = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const sendEmployeeMessage = async () => {
    const hasText = !!employeeInput.trim()
    const hasFile = !!employeeAttachment
    if (!selectedEmployeeId || (!hasText && !hasFile) || !currentUser.id) return
    
    setSendingEmployeeMsg(true)
    
    try {
      let attachmentPayload: any = null
      if (hasFile) {
        attachmentPayload = {
          name: employeeAttachment!.name,
          type: employeeAttachment!.type,
          size: employeeAttachment!.size,
          dataUrl: employeeAttachmentPreview,
        }
      }

      const res = await fetch(`/api/conversations/messages/${selectedEmployeeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fromUserId: currentUser.id, 
          message: employeeInput || '',
          attachment: attachmentPayload
        })
      })
      if (res.ok) {
        const created = await res.json()
        console.log('✅ Message sent successfully:', created)
        setEmployeeMessages(prev => [...prev, created])
        setEmployeeInput('')
        setEmployeeAttachment(null)
        setEmployeeAttachmentPreview('')
        if (employeeFileInputRef.current) employeeFileInputRef.current.value = ''
        
        // Refresh messages to get the latest
        setTimeout(() => {
          fetchEmployeeMessages()
        }, 500)
        
        // Show success notification
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            const recipientName = recipients.find(r => r.id === selectedEmployeeId)?.name || 'کارمند'
            new Notification('پیام ارسال شد', {
              body: `پیام شما به ${recipientName} ارسال شد`,
              icon: '/favicon.ico'
            })
          }
        }
      } else {
        const errorData = await res.json().catch(() => ({ error: 'خطای ناشناخته' }))
        console.error('❌ Error sending message:', errorData)
        alert('خطا در ارسال پیام: ' + (errorData.error || 'خطای ناشناخته'))
        // Optimistic update
        const temp: Message = {
          id: Date.now().toString(),
          fromUserId: currentUser.id,
          fromUserName: currentUser.name,
          toUserId: selectedEmployeeId,
          message: employeeInput || '',
          attachment: attachmentPayload,
          createdAt: new Date().toISOString()
        }
        setEmployeeMessages(prev => [...prev, temp])
        setEmployeeInput('')
        setEmployeeAttachment(null)
        setEmployeeAttachmentPreview('')
        if (employeeFileInputRef.current) employeeFileInputRef.current.value = ''
      }
    } catch (error: any) {
      console.error('❌ Network error sending message:', error)
      alert('خطای شبکه در ارسال پیام. لطفاً دوباره تلاش کنید.')
    } finally {
      setSendingEmployeeMsg(false)
    }
  }


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
              <button onClick={() => setActiveTab('employees')} className={`px-3 py-1 rounded-lg text-sm ${activeTab==='employees'?'bg-blue-600 text-white':'bg-gray-800 text-gray-300'}`}>کارمندان</button>
              <button onClick={() => setActiveTab('feedback')} className={`px-3 py-1 rounded-lg text-sm ${activeTab==='feedback'?'bg-blue-600 text-white':'bg-gray-800 text-gray-300'}`}>نظرات به مدیریت</button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'employees' && (
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Employee List */}
              <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-700/50 bg-gray-900/80">
                  <h2 className="text-lg font-bold text-white">لیست کارمندان</h2>
                  <p className="text-xs text-gray-400 mt-1">برای شروع چت، کارمند را انتخاب کنید</p>
                </div>
                <div className="overflow-y-auto max-h-[calc(100vh-250px)]">
                  {isLoadingEmployees ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : recipients.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">هیچ کارمندی یافت نشد</div>
                  ) : (
                    <div className="divide-y divide-gray-700/50">
                      {recipients.map(emp => (
                        <button
                          key={emp.id}
                          onClick={() => {
                            setSelectedEmployeeId(emp.id)
                          }}
                          className={`w-full px-4 py-3 text-right hover:bg-gray-800/50 transition ${selectedEmployeeId === emp.id ? 'bg-blue-900/30 border-r-4 border-blue-500' : ''}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`w-10 h-10 rounded-full ${selectedEmployeeId === emp.id ? 'bg-blue-600' : 'bg-gray-700'} text-white flex items-center justify-center ml-3 text-sm font-semibold`}>
                                {emp.name.slice(0, 2)}
                              </div>
                              <div>
                                <div className="text-white font-medium">{emp.name}</div>
                                <div className="text-xs text-gray-400">کارمند</div>
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
                          {recipients.find(r => r.id === selectedEmployeeId)?.name.slice(0, 2) || 'DM'}
                        </div>
                        <div>
                          <div className="text-white font-semibold">{recipients.find(r => r.id === selectedEmployeeId)?.name || 'کارمند'}</div>
                          <div className="text-xs text-gray-400">گفتگوی خصوصی</div>
                        </div>
                      </div>
                    </div>

                    <div className="h-[calc(100vh-350px)] overflow-y-auto p-4 space-y-2 bg-gradient-to-b from-gray-900/60 to-gray-900">
                      {employeeMessages.map(m => {
                        const isMe = m.fromUserId === currentUser.id
                        return (
                          <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            {!isMe && (
                              <div className="w-8 h-8 rounded-full bg-gray-700 text-white flex items-center justify-center ml-2 text-xs">
                                {(m.fromUserName || 'کاربر').slice(0, 2)}
                              </div>
                            )}
                            <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow ${isMe ? 'bg-purple-600 text-white rounded-br-sm' : 'bg-gray-800 text-gray-100 rounded-bl-sm'}`}>
                              {!isMe && <div className="text-xs text-purple-300 mb-1">{m.fromUserName}</div>}
                              {m.message && <div className="whitespace-pre-wrap leading-6">{m.message}</div>}
                              {renderAttachment(m.attachment)}
                              <div className={`text-[10px] mt-1 ${isMe ? 'text-purple-100/80' : 'text-gray-400'}`}>{new Date(m.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                            {isMe && (
                              <div className="w-8 h-8 rounded-full bg-purple-700 text-white flex items-center justify-center mr-2 text-xs">
                                {(currentUser.name || 'من').slice(0, 2)}
                              </div>
                            )}
                          </div>
                        )
                      })}
                      {employeeMessages.length === 0 && (
                        <div className="text-gray-400 text-center mt-10">هنوز پیامی رد و بدل نشده است. اولین پیام را ارسال کنید.</div>
                      )}
                      <div ref={directEndRef} />
                    </div>

                    <form onSubmit={(e) => {
                      e.preventDefault()
                      if (selectedEmployeeId && currentUser.id) {
                        sendEmployeeMessage()
                      }
                    }} className="p-3 border-t border-gray-700/50 bg-gray-900/80 flex items-end gap-2">
                      <input 
                        type="file" 
                        ref={employeeFileInputRef} 
                        onChange={async (e) => {
                          if (e.target.files && e.target.files[0]) {
                            const f = e.target.files[0]
                            setEmployeeAttachment(f)
                            try {
                              const dataUrl = await readFileAsDataUrl(f)
                              setEmployeeAttachmentPreview(dataUrl)
                            } catch {
                              setEmployeeAttachmentPreview('')
                            }
                          }
                        }} 
                        className="hidden" 
                        accept="image/*,video/*,application/*" 
                      />
                      <button 
                        type="button" 
                        onClick={() => employeeFileInputRef.current?.click()} 
                        className="px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-200 hover:bg-gray-700"
                        disabled={!selectedEmployeeId}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828L18 9.828M16 5h6m0 0v6m0-6L10 17" />
                        </svg>
                      </button>
                      <textarea
                        value={employeeInput}
                        onChange={e => setEmployeeInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            if (selectedEmployeeId && currentUser.id) {
                              sendEmployeeMessage()
                            }
                          }
                        }}
                        rows={1}
                        placeholder={selectedEmployeeId ? 'پیام خود را بنویسید...' : 'ابتدا کارمند را انتخاب کنید'}
                        disabled={!selectedEmployeeId || !currentUser.id}
                        className="flex-1 max-h-40 p-3 bg-gray-800 border border-gray-700 rounded-xl text-white resize-none focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
                      />
                      <button 
                        type="submit" 
                        disabled={sendingEmployeeMsg || !selectedEmployeeId || (!employeeInput.trim() && !employeeAttachment) || !currentUser.id} 
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white disabled:opacity-50"
                      >
                        ارسال
                      </button>
                    </form>
                    {employeeAttachment && (
                      <div className="px-3 pb-3">
                        <div className="border border-gray-700 rounded-xl p-2 bg-gray-900/70 flex items-center justify-between">
                          <div className="text-xs text-gray-300 truncate">پیوست: {employeeAttachment.name} — {(employeeAttachment.size/1024).toFixed(1)} KB</div>
                          <div className="flex items-center gap-2">
                            {employeeAttachmentPreview && employeeAttachment.type.startsWith('image/') && (
                              <img src={employeeAttachmentPreview} className="w-10 h-10 object-cover rounded border border-gray-700" alt="preview" />
                            )}
                            {employeeAttachmentPreview && employeeAttachment.type.startsWith('video/') && (
                              <video src={employeeAttachmentPreview} className="w-16 h-10 object-cover rounded border border-gray-700" />
                            )}
                            <button onClick={() => {
                              setEmployeeAttachment(null)
                              setEmployeeAttachmentPreview('')
                              if (employeeFileInputRef.current) employeeFileInputRef.current.value = ''
                            }} className="text-red-400 text-xs px-2 py-1 border border-red-400/40 rounded hover:bg-red-400/10">حذف</button>
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
