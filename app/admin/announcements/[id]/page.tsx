'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'

interface Announcement {
  id: string
  title: string
  body: string
  type: 'public' | 'individual'
  createdAt: string
  createdBy?: string
  recipientNames?: string
}
interface Comment {
  id: string
  announcementId: string
  userId?: string
  body: string
  createdAt: string
  isManagerReply?: boolean
  userName?: string
}

export default function AdminAnnouncementDetails() {
  const params = useParams()
  const router = useRouter()
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorDetail, setErrorDetail] = useState('')

  useEffect(() => {
    fetchAnnouncement()
    fetchComments()
  }, [params.id])

  const fetchAnnouncement = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/announcements/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.announcement) {
          setAnnouncement({
            id: data.announcement.id,
            title: data.announcement.title,
            body: data.announcement.body,
            type: data.announcement.type === 'individual' ? 'individual' : 'public',
            createdAt: data.announcement.createdAt,
            createdBy: data.announcement.createdBy,
            recipientNames: data.announcement.recipientNames
          })
        } else {
          setErrorDetail('اطلاعیه یافت نشد')
        }
      } else {
        const err = await res.json()
        setErrorDetail(err.error || 'خطا در دریافت اطلاعیه')
      }
    } catch (error) {
      console.error('Error fetching announcement:', error)
      setErrorDetail('خطا در اتصال به سرور')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/announcements/${params.id}/comments`)
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.comments) {
          setComments(data.comments)
        }
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
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

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex overflow-hidden" dir="rtl">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  if (!announcement) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex overflow-hidden" dir="rtl">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center text-white" dir="rtl">
          <div className="text-center">
            <div className="text-2xl font-bold mb-2">اطلاعیه یافت نشد</div>
            {errorDetail && <div className="text-red-400 text-sm">{errorDetail}</div>}
            <button
              onClick={() => router.push('/admin/announcements')}
              className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              بازگشت به لیست اطلاعیه‌ها
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex overflow-hidden" dir="rtl">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl">
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {announcement.title}
            </h1>
            <button
              onClick={() => router.push('/admin/announcements')}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
            >
              بازگشت
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto max-w-4xl mx-auto w-full p-6">
          <div className="bg-gray-900/80 rounded-2xl border border-gray-700/50 shadow-xl p-8 mb-8">
            <p className="text-gray-200 mb-8 text-lg leading-8 whitespace-pre-wrap">{announcement.body}</p>
            <div className="flex items-center flex-wrap gap-4 text-xs text-gray-500 mb-5">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(announcement.createdAt)}</span>
              </div>
              {announcement.type === 'public' ? (
                <span className="bg-blue-700/50 px-3 py-1 rounded text-blue-100 text-xs">عمومی</span>
              ) : (
                <span className="bg-purple-700/60 px-3 py-1 rounded text-purple-100 text-xs">فردی</span>
              )}
              {announcement.createdBy && (
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>ایجاد شده توسط: {announcement.createdBy}</span>
                </div>
              )}
              {announcement.type === 'individual' && announcement.recipientNames && (
                <div className="w-full text-purple-300 text-sm mt-2">
                  <span className="font-semibold">گیرندگان:</span> {announcement.recipientNames}
                </div>
              )}
            </div>
            <hr className="border-gray-700 my-6"/>
            
            {/* Comments Section */}
            <div className="mt-8">
              <h2 className="text-lg font-bold text-purple-200 mb-4">نظرات ({comments.length})</h2>
              {comments.length === 0 ? (
                <div className="text-gray-400 mb-3">هنوز نظری ثبت نشده است.</div>
              ) : (
                <div className="space-y-4">
                  {comments.map(c => (
                    <div key={c.id} className="mb-5 bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-700 text-white flex items-center justify-center text-xs">
                            {(c.userName || 'کاربر').slice(0, 2)}
                          </div>
                          <div>
                            <div className="text-sm text-blue-300">{c.userName || 'کاربر'}</div>
                            {c.isManagerReply && (
                              <span className="text-xs text-purple-400">پاسخ مدیر</span>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">{formatDate(c.createdAt)}</div>
                      </div>
                      <div className="text-sm text-gray-300">{c.body}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

