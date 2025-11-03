'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'

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

export default function CorrespondencePage() {
  const [correspondences, setCorrespondences] = useState<Correspondence[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  useEffect(() => {
    if (currentUserId) {
      fetchCorrespondences()
    }
  }, [currentUserId])

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const userData = await res.json()
        if (userData.id) {
          setCurrentUserId(userData.id)
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    }
  }

  const fetchCorrespondences = async () => {
    setIsLoading(true)
    try {
      const url = currentUserId 
        ? `/api/correspondence?recipientId=${currentUserId}`
        : '/api/correspondence'
      
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.correspondences) {
          setCorrespondences(data.correspondences)
        } else {
          setCorrespondences([])
        }
      } else {
        setCorrespondences([])
      }
    } catch (error) {
      console.error('Error fetching correspondences:', error)
      setCorrespondences([])
    } finally {
      setIsLoading(false)
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

  const previewFile = (corr: Correspondence) => {
    if (!corr.fileDataUrl) return
    
    if (corr.fileType?.startsWith('image/')) {
      window.open(corr.fileDataUrl, '_blank')
    } else {
      downloadFile(corr)
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex overflow-hidden" dir="rtl">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl">
          <div className="px-6 py-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              مکاتبات و فایل‌های دریافتی
            </h1>
            <p className="text-gray-400 text-sm mt-2">فایل‌ها و مکاتبات ارسال شده از مدیریت</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            </div>
          ) : correspondences.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <svg className="w-24 h-24 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <p className="text-lg">هیچ فایل یا مکاتبه‌ای دریافت نکرده‌اید</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {correspondences.map(corr => (
                <div key={corr.id} className="bg-gray-900/60 border border-gray-800 rounded-xl p-6 hover:border-blue-500/50 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg mb-2">{corr.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>از: {corr.senderName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{new Date(corr.createdAt).toLocaleDateString('fa-IR')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {corr.message && (
                    <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-gray-300 text-sm whitespace-pre-wrap">{corr.message}</p>
                    </div>
                  )}
                  
                  {corr.fileName && (
                    <div className="mb-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`p-3 rounded-lg ${
                            corr.fileType?.startsWith('image/') ? 'bg-green-900/30' :
                            corr.fileType?.startsWith('video/') ? 'bg-purple-900/30' :
                            corr.fileType?.startsWith('application/pdf') ? 'bg-red-900/30' :
                            'bg-blue-900/30'
                          }`}>
                            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium">{corr.fileName}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <p className="text-gray-400 text-xs">{formatFileSize(corr.fileSize)}</p>
                              {corr.fileType && (
                                <span className="text-gray-500 text-xs">{corr.fileType}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {corr.fileDataUrl && (
                          <div className="flex gap-2">
                            {corr.fileType?.startsWith('image/') && (
                              <button
                                onClick={() => previewFile(corr)}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition"
                              >
                                مشاهده
                              </button>
                            )}
                            <button
                              onClick={() => downloadFile(corr)}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition"
                            >
                              دانلود
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {corr.fileDataUrl && corr.fileType?.startsWith('image/') && (
                        <div className="mt-4">
                          <img 
                            src={corr.fileDataUrl} 
                            alt={corr.fileName} 
                            className="max-w-full rounded-lg border border-gray-700 cursor-pointer hover:opacity-90 transition"
                            onClick={() => window.open(corr.fileDataUrl!, '_blank')}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

