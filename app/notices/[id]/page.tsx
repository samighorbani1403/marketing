"use client"
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

interface Notice {
  id: string
  title: string
  body: string
  type: 'public' | 'private'
  createdAt: string
}
interface NoticeComment {
  id: string
  noticeId: string
  userId: string
  body: string
  createdAt: string
  managerReply?: string
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

  useEffect(() => {
    fetch(`/api/notices/${params.id}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setNotice(data.notice))
      .finally(() => setIsLoading(false))
    fetch(`/api/notices/${params.id}/comments`).then(r => r.json()).then(data => setComments(data.comments || []))
  }, [params.id])

  const handleSendComment = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault()
    if (!comment || !comment.trim()) {
      setError('متن نظر را وارد کنید')
      return
    }
    setSendLock(true)
    try {
      const res = await fetch(`/api/notices/${params.id}/comments`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ body: comment, userId }) })
      if (res.ok) {
        const created = await res.json()
        setComments(prev => [...prev, created])
        setComment("")
      } else {
        setError('خطا در ارسال کامنت')
      }
    } finally { setSendLock(false) }
  }

  if (isLoading) return <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500" /></div>
  if (!notice) return <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center text-white">اطلاعیه یافت نشد</div>

  // فقط کامنت‌های نویسنده جاری (userId) و پاسخ مدیر
  const myComments = isAdmin ? comments : comments.filter(c => c.userId === userId)

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
            <div className="flex items-center text-xs text-gray-500 mb-5"><svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>{notice.createdAt}{notice.type==='public' ? <span className="mr-4 bg-blue-700/50 px-2 py-1 rounded text-blue-100 text-xs">عمومی</span> : <span className="mr-4 bg-purple-700/60 px-2 py-1 rounded text-purple-100 text-xs">خصوصی</span>}</div>
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
                {c.managerReply && <div className="bg-gray-900 border border-purple-700 rounded-xl px-4 py-2 text-purple-300 text-xs">پاسخ مدیر: {c.managerReply}</div>}
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
