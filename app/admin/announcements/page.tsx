'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'

interface Announcement {
  id: string
  type: 'public' | 'individual'
  title: string
  body: string
  createdBy: string
  createdById?: string
  recipientIds?: string
  recipientNames?: string
  createdAt: string
  commentsCount: number
}

export default function AdminAnnouncementsPage() {
  const router = useRouter()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterType, setFilterType] = useState<'all' | 'public' | 'individual'>('all')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnnouncements()
  }, [filterType])

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const url = filterType === 'all' 
        ? '/api/announcements' 
        : `/api/announcements?type=${filterType}`
      
      const res = await fetch(url)
      
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.announcements) {
          setAnnouncements(data.announcements)
        } else {
          setError('خطا در دریافت اطلاعیه‌ها')
        }
      } else {
        const err = await res.json()
        setError(err.error || 'خطا در دریافت اطلاعیه‌ها')
      }
    } catch (error) {
      console.error('Error fetching announcements:', error)
      setError('خطا در اتصال به سرور')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`آیا از حذف اطلاعیه "${title}" اطمینان دارید؟`)) {
      return
    }

    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        alert('اطلاعیه با موفقیت حذف شد')
        fetchAnnouncements()
      } else {
        const err = await res.json()
        alert(err.error || 'خطا در حذف اطلاعیه')
      }
    } catch (error) {
      console.error('Error deleting announcement:', error)
      alert('خطا در اتصال به سرور')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex overflow-hidden" dir="rtl">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl">
          <div className="px-6 py-4 flex justify-between items-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              لیست اطلاعیه‌ها و اخبار شرکت
            </h1>
            <Link
              href="/admin/announcements/new"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>ایجاد اطلاعیه جدید</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Filter */}
          <div className="mb-6 flex gap-3">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg transition ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              همه
            </button>
            <button
              onClick={() => setFilterType('public')}
              className={`px-4 py-2 rounded-lg transition ${
                filterType === 'public'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              عمومی
            </button>
            <button
              onClick={() => setFilterType('individual')}
              className={`px-4 py-2 rounded-lg transition ${
                filterType === 'individual'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              فردی
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300">
              {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.length === 0 ? (
                <div className="text-center py-12 bg-gray-900/60 border border-gray-800 rounded-2xl">
                  <p className="text-gray-400 text-lg">هیچ اطلاعیه‌ای یافت نشد</p>
                  <Link
                    href="/admin/announcements/new"
                    className="mt-4 inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                  >
                    ایجاد اولین اطلاعیه
                  </Link>
                </div>
              ) : (
                announcements.map(announcement => (
                  <div
                    key={announcement.id}
                    className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 hover:border-blue-500/50 transition"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-xl font-bold text-white">{announcement.title}</h2>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              announcement.type === 'public'
                                ? 'bg-blue-600/40 text-blue-200'
                                : 'bg-purple-600/40 text-purple-200'
                            }`}
                          >
                            {announcement.type === 'public' ? 'عمومی' : 'فردی'}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm line-clamp-2 mb-3">
                          {announcement.body}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>ایجاد شده توسط: {announcement.createdBy}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{formatDate(announcement.createdAt)}</span>
                          </div>
                          {announcement.commentsCount > 0 && (
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              <span>{announcement.commentsCount} نظر</span>
                            </div>
                          )}
                        </div>
                        {announcement.type === 'individual' && announcement.recipientNames && (
                          <div className="mt-2 text-xs text-purple-300">
                            <span className="font-semibold">گیرندگان:</span> {announcement.recipientNames}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/announcements/${announcement.id}`}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition"
                        >
                          مشاهده
                        </Link>
                        <button
                          onClick={() => handleDelete(announcement.id, announcement.title)}
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

