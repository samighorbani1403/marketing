"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

interface Notice {
  id: string
  title: string
  body: string
  type: 'public' | 'individual'
  recipientIds?: string
  createdBy: string
  createdById?: string
  createdAt: string
  commentsCount?: number
}

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    // Get current user
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const userData = await res.json()
          if (userData.id) {
            setUserId(userData.id)
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    }

    fetchUser()
  }, [])

  useEffect(() => {
    if (userId) {
      fetchAnnouncements()
    }
  }, [userId])

  const fetchAnnouncements = async () => {
    setIsLoading(true)
    try {
      const url = userId 
        ? `/api/announcements?userId=${userId}`
        : '/api/announcements?type=public'
      
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.announcements) {
          setNotices(data.announcements)
        } else {
          setNotices([])
        }
      } else {
        setNotices([])
      }
    } catch (error) {
      console.error('Error fetching announcements:', error)
      setNotices([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex overflow-hidden" dir="rtl">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl">
          <div className="px-6 py-4 flex justify-between items-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">اطلاعیه‌ها و اخبار شرکت</h1>
            {/* هیچ دکمه‌ای نشان داده نشود */}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {isLoading ? (<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500" /></div>) : (
            <div className="max-w-3xl mx-auto space-y-8">
              {notices.length === 0 && (
                <div className="text-center py-12 text-white">هیچ اطلاعیه‌ای وجود ندارد</div>
              )}
              {notices.map(n => {
                // Filter: show public announcements to everyone, individual only if user is in recipientIds
                const isIndividual = n.type === 'individual'
                let userInRecipients = false
                if (userId && n.recipientIds) {
                  // recipientIds is comma-separated string like "id1,id2,id3"
                  // Split and check if userId is exactly in the list
                  const recipientList = n.recipientIds.split(',').map(id => id.trim())
                  userInRecipients = recipientList.includes(userId) || 
                                   n.recipientIds === userId ||
                                   n.recipientIds.startsWith(userId + ',') ||
                                   n.recipientIds.endsWith(',' + userId) ||
                                   n.recipientIds.includes(',' + userId + ',')
                }
                const shouldShow = n.type === 'public' || (isIndividual && userInRecipients)

                if (!shouldShow) return null

                return (
                  <div key={n.id} className="bg-gray-900 border border-gray-700 rounded-2xl p-5 relative hover:border-blue-400 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-xl font-bold text-white">{n.title}</h2>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${n.type === 'public' ? 'bg-blue-600/40 text-blue-200' : 'bg-purple-700/40 text-purple-200'}`}>{n.type === 'public' ? 'عمومی' : 'فردی'}</span>
                    </div>
                    <p className="text-gray-300 text-sm line-clamp-3 mb-3">{n.body.substring(0, 110)}{n.body.length > 110 ? '...' : ''}</p>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center text-xs text-gray-500">
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        <span>{n.createdBy}</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span>{new Date(n.createdAt).toLocaleDateString('fa-IR')}</span>
                      </div>
                    </div>
                    {n.commentsCount !== undefined && n.commentsCount > 0 && (
                      <div className="text-xs text-gray-400 mb-3">
                        {n.commentsCount} نظر
                      </div>
                    )}
                    <Link href={`/notices/${n.id}`} className="inline-block bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-500 hover:to-purple-500 text-white text-sm font-medium px-4 py-2 rounded-xl shadow transition-all">مشاهده جزئیات</Link>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
