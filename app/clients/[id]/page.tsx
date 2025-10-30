'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  company?: string
  city?: string
  source?: string
  status: string
  stage?: string
  notes?: string
  createdAt: string
}

export default function ClientDetailsPage() {
  const [client, setClient] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    if (params.id) {
      fetchClient(params.id as string)
    }
  }, [params.id])

  const fetchClient = async (clientId: string) => {
    try {
      const response = await fetch(`/api/clients/${clientId}`)
      if (response.ok) {
        const data = await response.json()
        setClient(data.client)
      } else {
        console.error('Failed to fetch client')
        router.push('/clients')
      }
    } catch (error) {
      console.error('Error fetching client:', error)
      router.push('/clients')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'potential':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'inactive':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      case 'lost':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'فعال'
      case 'potential':
        return 'پتانسیل'
      case 'inactive':
        return 'غیرفعال'
      case 'lost':
        return 'از دست رفته'
      default:
        return 'نامشخص'
    }
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'lead':
        return 'bg-blue-500/20 text-blue-400'
      case 'qualified':
        return 'bg-purple-500/20 text-purple-400'
      case 'proposal':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'negotiation':
        return 'bg-orange-500/20 text-orange-400'
      case 'closed':
        return 'bg-green-500/20 text-green-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getStageText = (stage: string) => {
    switch (stage) {
      case 'lead':
        return 'لید'
      case 'qualified':
        return 'کوالیفای شده'
      case 'proposal':
        return 'پیشنهاد'
      case 'negotiation':
        return 'مذاکره'
      case 'closed':
        return 'بسته شده'
      default:
        return 'نامشخص'
    }
  }

  const getSourceText = (source: string) => {
    switch (source) {
      case 'website':
        return 'وبسایت'
      case 'social-media':
        return 'شبکه‌های اجتماعی'
      case 'referral':
        return 'معرفی'
      case 'advertisement':
        return 'تبلیغات'
      case 'email':
        return 'ایمیل'
      case 'phone':
        return 'تماس تلفنی'
      case 'event':
        return 'رویداد'
      case 'other':
        return 'سایر'
      default:
        return source || 'نامشخص'
    }
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">مشتری یافت نشد</h1>
          <button
            onClick={() => router.push('/clients')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
          >
            بازگشت به لیست مشتریان
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex overflow-hidden" dir="rtl">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 space-x-reverse">
                <button
                  onClick={() => router.push('/clients')}
                  className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {client.name}
                  </h1>
                  <p className="text-gray-400 mt-1">جزئیات مشتری</p>
                </div>
              </div>
              <div className="flex space-x-3 space-x-reverse">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(client.status)}`}>
                  {getStatusText(client.status)}
                </span>
                {client.stage && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStageColor(client.stage)}`}>
                    {getStageText(client.stage)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Client Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Info */}
                <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
                  <div className="p-6 border-b border-gray-700/50">
                    <h2 className="text-xl font-bold text-white flex items-center">
                      <svg className="w-6 h-6 text-blue-400 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      اطلاعات شخصی
                    </h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">نام و نام خانوادگی</label>
                        <p className="text-white font-medium">{client.name}</p>
                      </div>
                      {client.email && (
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">ایمیل</label>
                          <p className="text-white">{client.email}</p>
                        </div>
                      )}
                      {client.phone && (
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">شماره تلفن</label>
                          <p className="text-white">{client.phone}</p>
                        </div>
                      )}
                      {client.city && (
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">شهر</label>
                          <p className="text-white">{client.city}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Company Info */}
                {client.company && (
                  <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="p-6 border-b border-gray-700/50">
                      <h2 className="text-xl font-bold text-white flex items-center">
                        <svg className="w-6 h-6 text-green-400 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        اطلاعات شرکت
                      </h2>
                    </div>
                    <div className="p-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">نام شرکت</label>
                        <p className="text-white font-medium">{client.company}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {client.notes && (
                  <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="p-6 border-b border-gray-700/50">
                      <h2 className="text-xl font-bold text-white flex items-center">
                        <svg className="w-6 h-6 text-purple-400 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        یادداشت‌ها
                      </h2>
                    </div>
                    <div className="p-6">
                      <p className="text-white leading-relaxed">{client.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Status & Stage */}
                <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
                  <div className="p-6 border-b border-gray-700/50">
                    <h2 className="text-xl font-bold text-white flex items-center">
                      <svg className="w-6 h-6 text-yellow-400 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      وضعیت و مرحله
                    </h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">وضعیت مشتری</label>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(client.status)}`}>
                        {getStatusText(client.status)}
                      </span>
                    </div>
                    {client.stage && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">مرحله فروش</label>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStageColor(client.stage)}`}>
                          {getStageText(client.stage)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Lead Information */}
                <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
                  <div className="p-6 border-b border-gray-700/50">
                    <h2 className="text-xl font-bold text-white flex items-center">
                      <svg className="w-6 h-6 text-orange-400 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      اطلاعات لید
                    </h2>
                  </div>
                  <div className="p-6 space-y-4">
                    {client.source && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">روش آشنایی</label>
                        <p className="text-white">{getSourceText(client.source)}</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">تاریخ ایجاد</label>
                      <p className="text-white">{client.createdAt}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
                  <div className="p-6 border-b border-gray-700/50">
                    <h2 className="text-xl font-bold text-white flex items-center">
                      <svg className="w-6 h-6 text-red-400 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      عملیات
                    </h2>
                  </div>
                  <div className="p-6 space-y-3">
                    <button
                      onClick={() => router.push(`/clients/edit/${client.id}`)}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105"
                    >
                      ویرایش مشتری
                    </button>
                    <button
                      onClick={() => router.push('/clients')}
                      className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105"
                    >
                      بازگشت به لیست
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
