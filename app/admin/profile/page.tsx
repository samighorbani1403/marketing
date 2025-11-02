'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'

interface UserProfile {
  id: string
  name: string
  email: string
  createdAt?: string
}

export default function AdminProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    bio: ''
  })

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
          setProfileForm(prev => ({
            ...prev,
            name: userData.name || '',
            email: userData.email || ''
          }))
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileForm),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'پروفایل با موفقیت به‌روزرسانی شد' })
        const data = await response.json()
        if (data.profile) {
          setUser(prev => prev ? { ...prev, ...data.profile } : null)
        }
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'خطا در به‌روزرسانی پروفایل' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'خطا در اتصال به سرور' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    if (confirm('آیا مطمئن هستید که می‌خواهید خارج شوید؟')) {
      try {
        await fetch('/api/auth/logout', { method: 'POST' })
        router.push('/login')
      } catch (error) {
        router.push('/login')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex overflow-hidden" dir="rtl">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto flex items-center justify-center">
          <div className="text-white text-xl">در حال بارگذاری...</div>
        </main>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex overflow-hidden" dir="rtl">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                پروفایل مدیر
              </h1>
              <p className="text-gray-400 mt-1">مدیریت اطلاعات شخصی و تنظیمات حساب کاربری</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              خروج
            </button>
          </div>
        </header>

        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            {/* Profile Card */}
            <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl mb-6">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl font-bold text-white">
                  {user?.name?.charAt(0) || 'م'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{user?.name || 'مدیر سیستم'}</h2>
                  <p className="text-gray-400">{user?.email || 'admin@admin.com'}</p>
                  <p className="text-gray-500 text-sm mt-1">مدیر سیستم</p>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <svg className="w-6 h-6 text-blue-400 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                اطلاعات شخصی
              </h3>

              {message && (
                <div className={`mb-4 p-4 rounded-lg ${
                  message.type === 'success' 
                    ? 'bg-green-500/20 border border-green-500/50 text-green-400' 
                    : 'bg-red-500/20 border border-red-500/50 text-red-400'
                }`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-2">نام کامل</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">ایمیل</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-2">شماره تلفن</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">سمت</label>
                    <input
                      type="text"
                      value={profileForm.position}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, position: e.target.value }))}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">دپارتمان</label>
                  <input
                    type="text"
                    value={profileForm.department}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">درباره من</label>
                  <textarea
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 font-medium"
                  >
                    بازگشت
                  </button>
                </div>
              </form>
            </div>

            {/* Account Info */}
            <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl mt-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <svg className="w-6 h-6 text-blue-400 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                اطلاعات حساب کاربری
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-400">شناسه کاربری:</span>
                  <span className="text-white font-mono">{user?.id || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-400">تاریخ ایجاد حساب:</span>
                  <span className="text-white">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fa-IR') : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-400">نوع حساب:</span>
                  <span className="text-white">مدیر سیستم</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

