"use client"
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

interface Notice {
  id: string
  title: string
  body: string
  type: 'public' | 'individual'
  createdAt: string
  createdBy?: string
}
interface NoticeComment {
  id: string
  announcementId: string
  userId?: string
  body: string
  createdAt: string
  isManagerReply?: boolean
  userName?: string
}

export default function NoticeDetails() {
  const params = useParams()
  const router = useRouter()
  const [notice, setNotice] = useState<Notice | null>(null)
  const [comments, setComments] = useState<NoticeComment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [sendLock, setSendLock] = useState(false)
  const [userId] = useState('2') // فرض یک کاربر بازاریاب
  const [isAdmin] = useState(false)
  const [error, setError] = useState('')
  const [errorDetail, setErrorDetail] = useState('')

  useEffect(() => {
    fetchAnnouncement()
    fetchComments()
  }, [params.id])

  const fetchAnnouncement = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/announcements/${params.id}?userId=${userId}`)
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.announcement) {
          // Map announcement to notice format
          setNotice({
            id: data.announcement.id,
            title: data.announcement.title,
            body: data.announcement.body,
            type: data.announcement.type === 'individual' ? 'individual' : 'public',
            createdAt: data.announcement.createdAt,
            createdBy: data.announcement.createdBy
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

  const handleSendComment = async (e: React.FormEvent) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault()
    if (!comment || !comment.trim()) {
      setError('متن نظر را وارد کنید')
      return
    }
    setSendLock(true)
    setError('')
    try {
      const res = await fetch(`/api/announcements/${params.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          body: comment, 
          userId: userId,
          userName: 'کاربر' // TODO: Get actual user name
        })
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.comment) {
          setComments(prev => [...prev, data.comment])
          setComment("")
        } else {
          setError('خطا در ارسال کامنت')
        }
      } else {
        const err = await res.json()
        setError(err.error || 'خطا در ارسال کامنت')
      }
    } catch (error) {
      console.error('Error sending comment:', error)
      setError('خطا در اتصال به سرور')
    } finally { 
      setSendLock(false) 
    }
  }

  if (isLoading) return <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500" /></div>
  if (!notice) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center text-white" dir="rtl">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">اطلاعیه یافت نشد</div>
          {errorDetail && <div className="text-red-400 text-sm">{errorDetail}</div>}
        </div>
      </div>
    )
  }

  // فقط کامنت‌های نویسنده جاری (userId) و پاسخ مدیر
  const myComments = isAdmin ? comments : comments.filter(c => c.userId === userId || c.isManagerReply)

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex overflow-hidden" dir="rtl">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl">
          <div className="px-6 py-4"><h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{notice.title}</h1></div>
        </header>
        <main className="flex-1 overflow-y-auto max-w-2xl mx-auto p-6">
          <div className="bg-gray-900/80 rounded-2xl border border-gray-700/50 shadow-xl p-8 mb-8">
            <p className="text-gray-200 mb-8 text-lg leading-8">{notice.body}</p>
            <div className="flex items-center text-xs text-gray-500 mb-5">
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{new Date(notice.createdAt).toLocaleString('fa-IR')}</span>
              {notice.type==='public' ? (
                <span className="mr-4 bg-blue-700/50 px-2 py-1 rounded text-blue-100 text-xs">عمومی</span>
              ) : (
                <span className="mr-4 bg-purple-700/60 px-2 py-1 rounded text-purple-100 text-xs">فردی</span>
              )}
              {notice.createdBy && (
                <span className="mr-4 text-gray-400">ایجاد شده توسط: {notice.createdBy}</span>
              )}
            </div>
            <hr className="border-gray-700 my-6"/>
            <h2 className="text-lg font-bold text-purple-200 mb-3">کامنت‌های شما</h2>
            {myComments.length === 0 && <div className="text-gray-400 mb-3">تاکنون کامنتی ثبت نکردید.</div>}
            {myComments.map(c => (
              <div key={c.id} className="mb-5 bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-700 text-white flex items-center justify-center ml-2 text-xs">
                      {(c.userName || 'کاربر').slice(0,2)}
                    </div>
                    <div className="text-sm text-blue-300">{c.userName || 'کاربر'}</div>
                  </div>
                  <div className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString('fa-IR')}</div>
                </div>
                <div className="text-sm text-gray-300 mb-2">{c.body}</div>
                {c.isManagerReply && (
                  <div className="mt-2 bg-gray-900 border border-purple-700 rounded-xl px-4 py-2 text-purple-300 text-xs">
                    <span className="font-semibold">پاسخ مدیر</span>
                  </div>
                )}
              </div>
            ))}
            {!isAdmin && <form onSubmit={handleSendComment} className="mt-5">
              <textarea rows={3} className="w-full bg-gray-800/50 border border-gray-600 rounded-xl text-white p-4 mb-3" placeholder="نظر خود را وارد کنید..." maxLength={300} value={comment} onChange={e => { setComment(e.target.value); if (error) setError('') }} disabled={sendLock}/>
              <button type="submit" disabled={sendLock || !comment.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-500 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg disabled:opacity-50">ارسال کامنت</button>
              {error && <div className="text-red-400 text-xs mt-2">{error}</div>}
            </form>}
          </div>
        </main>
      </div>
    </div>
  )
}
