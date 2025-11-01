'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import AdminSidebar from '@/components/AdminSidebar'

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

interface Employee {
  id: string
  fullName: string
  position?: string
}

export default function AdminCorrespondencePage() {
  const [activeTab, setActiveTab] = useState<'send' | 'list' | 'feedback'>('send')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string>('')
  const [recipientId, setRecipientId] = useState('')
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [correspondences, setCorrespondences] = useState<Correspondence[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [warning, setWarning] = useState<string | null>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchEmployees()
    if (activeTab === 'list') {
      fetchCorrespondences()
    }
  }, [activeTab])

  const fetchEmployees = async () => {
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
    }
  }

  const fetchCorrespondences = async () => {
    setIsLoading(true)
    setWarning(null)
    try {
      const res = await fetch('/api/correspondence')
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.correspondences) {
          setCorrespondences(data.correspondences)
          setWarning(data.warning || null)
        }
      }
    } catch (error) {
      console.error('Error fetching correspondences:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile)
    
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFilePreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    } else {
      setFilePreview('')
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const removeFile = () => {
    setFile(null)
    setFilePreview('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      return alert('عنوان فایل الزامی است')
    }
    
    if (!file) {
      return alert('لطفاً یک فایل انتخاب کنید')
    }
    
    if (!recipientId) {
      return alert('لطفاً مخاطب را انتخاب کنید')
    }

    setIsSending(true)
    try {
      // Read file as base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        const fileDataUrl = reader.result as string
        
        const recipient = employees.find(emp => emp.id === recipientId)
        
        const res = await fetch('/api/correspondence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            fileDataUrl,
            senderName: 'مدیر سیستم',
            recipientId,
            recipientName: recipient?.fullName || 'کارمند',
            message: message.trim() || null
          })
        })

        if (res.ok) {
          const data = await res.json()
          if (data.success) {
            alert('فایل با موفقیت ارسال شد')
            // Reset form
            setTitle('')
            setFile(null)
            setFilePreview('')
            setRecipientId('')
            setMessage('')
            // Switch to list tab
            setActiveTab('list')
            fetchCorrespondences()
          } else {
            // Show detailed error
            const errorMsg = data.error || 'خطا در ارسال فایل'
            alert(errorMsg.split('\n').join('\n'))
          }
        } else {
          const err = await res.json()
          const errorMsg = err.error || 'خطا در ارسال فایل'
          alert(errorMsg.split('\n').join('\n'))
        }
        setIsSending(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error sending file:', error)
      alert('خطا در اتصال به سرور')
      setIsSending(false)
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '—'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const downloadFile = (corr: Correspondence) => {
    if (!corr.fileDataUrl) return
    
    const link = document.createElement('a')
    link.href = corr.fileDataUrl
    link.download = corr.fileName || 'file'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex overflow-hidden" dir="rtl">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl">
          <div className="px-6 py-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              مدیریت مکاتبات
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-700">
            <button
              onClick={() => setActiveTab('send')}
              className={`px-4 py-2 rounded-t-lg transition ${activeTab === 'send' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
              ارسال فایل
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-t-lg transition ${activeTab === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
              لیست مکاتبات
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`px-4 py-2 rounded-t-lg transition ${activeTab === 'feedback' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
              نظرات و انتقادات
            </button>
          </div>

          {/* Send File Tab */}
          {activeTab === 'send' && (
            <div className="max-w-3xl mx-auto bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">عنوان فایل <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="مثال: فایل راهنمای جدید"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">انتخاب مخاطب <span className="text-red-400">*</span></label>
                  <select
                    value={recipientId}
                    onChange={e => setRecipientId(e.target.value)}
                    required
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">انتخاب کنید...</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.fullName} {emp.position ? `(${emp.position})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">انتخاب فایل <span className="text-red-400">*</span></label>
                  <div
                    ref={dropRef}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-gray-600 transition cursor-pointer"
                    onClick={() => document.getElementById('file-input')?.click()}
                  >
                    {filePreview ? (
                      <div className="space-y-4">
                        <img src={filePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                        <div className="text-white">
                          <p className="font-semibold">{file.name}</p>
                          <p className="text-sm text-gray-400">{formatFileSize(file.size)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFile()
                          }}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                        >
                          حذف فایل
                        </button>
                      </div>
                    ) : file ? (
                      <div className="space-y-4">
                        <svg className="w-16 h-16 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <div className="text-white">
                          <p className="font-semibold">{file.name}</p>
                          <p className="text-sm text-gray-400">{formatFileSize(file.size)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFile()
                          }}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                        >
                          حذف فایل
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <svg className="w-16 h-16 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <div>
                          <p className="text-white font-semibold">فایل را اینجا بکشید یا کلیک کنید</p>
                          <p className="text-gray-400 text-sm mt-2">پشتیبانی از تمام انواع فایل</p>
                        </div>
                      </div>
                    )}
                    <input
                      id="file-input"
                      type="file"
                      className="hidden"
                      onChange={handleFileInputChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">پیام (اختیاری)</label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={3}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="پیام همراه فایل..."
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="submit"
                    disabled={isSending}
                    className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {isSending ? 'در حال ارسال...' : 'ارسال فایل'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List Tab */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              {warning && (
                <div className="mb-4 p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg text-yellow-300">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{warning}</span>
                  </div>
                </div>
              )}
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : correspondences.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  هیچ مکاتبه‌ای ثبت نشده است
                </div>
              ) : (
                correspondences.map(corr => (
                  <div key={corr.id} className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-white font-semibold text-lg">{corr.title}</h3>
                        <p className="text-gray-400 text-sm mt-1">
                          از: {corr.senderName} → به: {corr.recipientName || '—'}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(corr.createdAt).toLocaleDateString('fa-IR')}
                      </span>
                    </div>
                    
                    {corr.fileName && (
                      <div className="mb-4 p-3 bg-gray-800/50 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <div>
                            <p className="text-white font-medium">{corr.fileName}</p>
                            <p className="text-gray-400 text-xs">{formatFileSize(corr.fileSize)}</p>
                          </div>
                        </div>
                        {corr.fileDataUrl && (
                          <button
                            onClick={() => downloadFile(corr)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                          >
                            دانلود
                          </button>
                        )}
                      </div>
                    )}
                    
                    {corr.message && (
                      <p className="text-gray-300 text-sm mb-4">{corr.message}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Feedback Tab */}
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

