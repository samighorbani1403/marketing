"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

interface Notice {
  id: string
  title: string
  body: string
  type: 'public' | 'private'
  userId?: string
  createdBy: string
  createdAt: string
}

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false) // always false: بازاریاب دکمه نمی‌بیند
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    // فرض نقش admin و userId تستی
    setIsAdmin(true)
    setUserId('1')

    fetch('/api/notices')
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => setNotices(data.notices || []))
      .finally(() => setIsLoading(false))
  }, [])

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
              {notices.filter(n => n.type === 'public' || n.userId === userId).map(n => (
                <div key={n.id} className="bg-gray-900 border border-gray-700 rounded-2xl p-5 relative hover:border-blue-400 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold text-white">{n.title}</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${n.type === 'public' ? 'bg-blue-600/40 text-blue-200' : 'bg-purple-700/40 text-purple-200'}`}>{n.type === 'public' ? 'عمومی' : 'خصوصی'}</span>
                  </div>
                  <p className="text-gray-300 text-sm line-clamp-3 mb-3">{n.body.substring(0, 110)}{n.body.length > 110 ? '...' : ''}</p>
                  <div className="flex items-center text-xs text-gray-500 mb-2">
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span >{n.createdAt}</span>
                  </div>
                  <Link href={`/notices/${n.id}`} className="inline-block bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-500 hover:to-purple-500 text-white text-sm font-medium px-4 py-2 rounded-xl shadow transition-all">مشاهده جزئیات</Link>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
