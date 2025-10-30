'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

interface Campaign {
  id: string
  name: string
  clientId: string
  clientName: string
  type: 'email' | 'sms' | 'phone' | 'social' | 'display'
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
  budget: number
  startDate: string
  endDate?: string
  description?: string
  targetAudience?: string
  objectives?: string
  metrics?: {
    impressions?: number
    clicks?: number
    conversions?: number
    cost?: number
  }
  createdAt: string
}

export default function CampaignDetailsPage({ params }: { params: { id: string } }) {
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchCampaign()
  }, [params.id])

  const fetchCampaign = async () => {
    try {
      const response = await fetch(`/api/campaigns/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setCampaign(data.campaign)
      } else {
        console.error('Failed to fetch campaign')
        router.push('/campaigns')
      }
    } catch (error) {
      console.error('Error fetching campaign:', error)
      router.push('/campaigns')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'paused':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'completed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'draft':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'فعال'
      case 'paused':
        return 'متوقف'
      case 'completed':
        return 'تکمیل شده'
      case 'cancelled':
        return 'لغو شده'
      case 'draft':
        return 'پیش‌نویس'
      default:
        return 'نامشخص'
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'email':
        return 'ایمیل'
      case 'sms':
        return 'پیامک'
      case 'phone':
        return 'تلفن'
      case 'social':
        return 'شبکه‌های اجتماعی'
      case 'display':
        return 'نمایشی'
      default:
        return 'نامشخص'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        )
      case 'sms':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )
      case 'phone':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        )
      case 'social':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V1a1 1 0 011-1h2a1 1 0 011 1v3m0 0h8m-8 0v16a1 1 0 001 1h8a1 1 0 001-1V4" />
          </svg>
        )
      case 'display':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-0.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        )
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )
    }
  }

  const handleGenerateInvoice = () => {
    router.push(`/campaigns/${params.id}/invoice`)
  }

  const handleEditCampaign = () => {
    router.push(`/campaigns/edit/${params.id}`)
  }

  const handleBack = () => {
    router.push('/campaigns')
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center" dir="rtl">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">کمپین یافت نشد</h1>
          <button
            onClick={handleBack}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            بازگشت به لیست کمپین‌ها
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
            <div className="flex justify-between items-center">
              <button
                onClick={handleBack}
                className="flex items-center text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                بازگشت
              </button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                جزئیات کمپین
              </h1>
              <div className="flex space-x-2 space-x-reverse">
                <button
                  onClick={handleEditCampaign}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105"
                >
                  ویرایش
                </button>
                <button
                  onClick={handleGenerateInvoice}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105"
                >
                  ایجاد فاکتور PDF
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Campaign Header */}
            <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl mb-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-4">{campaign.name}</h2>
                  <div className="flex items-center gap-4 mb-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(campaign.status)}`}>
                      {getStatusText(campaign.status)}
                    </span>
                    <div className="flex items-center text-gray-400">
                      {getTypeIcon(campaign.type)}
                      <span className="mr-2">{getTypeText(campaign.type)}</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-lg">مشتری: {campaign.clientName}</p>
                </div>
                <div className="text-left">
                  <div className="text-3xl font-bold text-white mb-2">{campaign.budget.toLocaleString()}</div>
                  <div className="text-gray-400">تومان</div>
                </div>
              </div>

              {campaign.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">توضیحات</h3>
                  <p className="text-gray-300 leading-relaxed">{campaign.description}</p>
                </div>
              )}
            </div>

            {/* Campaign Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Basic Information */}
              <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-6">اطلاعات کلی</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                    <span className="text-gray-400">تاریخ شروع</span>
                    <span className="text-white font-medium">{campaign.startDate}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                    <span className="text-gray-400">تاریخ پایان</span>
                    <span className="text-white font-medium">{campaign.endDate || 'نامشخص'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                    <span className="text-gray-400">تاریخ ایجاد</span>
                    <span className="text-white font-medium">{campaign.createdAt}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-400">شناسه کمپین</span>
                    <span className="text-white font-medium font-mono">{campaign.id}</span>
                  </div>
                </div>
              </div>

              {/* Campaign Objectives */}
              <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-6">اهداف و مخاطبان</h3>
                <div className="space-y-4">
                  {campaign.targetAudience && (
                    <div>
                      <h4 className="text-gray-400 text-sm mb-2">مخاطب هدف</h4>
                      <p className="text-white">{campaign.targetAudience}</p>
                    </div>
                  )}
                  {campaign.objectives && (
                    <div>
                      <h4 className="text-gray-400 text-sm mb-2">اهداف کمپین</h4>
                      <p className="text-white">{campaign.objectives}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Campaign Metrics */}
            {campaign.metrics && (
              <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl mb-8">
                <h3 className="text-xl font-bold text-white mb-6">آمار و عملکرد</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">
                      {campaign.metrics.impressions?.toLocaleString() || 0}
                    </div>
                    <div className="text-gray-400">نمایش</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">
                      {campaign.metrics.clicks?.toLocaleString() || 0}
                    </div>
                    <div className="text-gray-400">کلیک</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-2">
                      {campaign.metrics.conversions?.toLocaleString() || 0}
                    </div>
                    <div className="text-gray-400">تبدیل</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400 mb-2">
                      {(campaign.metrics.cost || 0).toLocaleString()}
                    </div>
                    <div className="text-gray-400">هزینه (تومان)</div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 space-x-reverse">
              <button
                onClick={handleEditCampaign}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                ویرایش کمپین
              </button>
              <button
                onClick={handleGenerateInvoice}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-8 py-3 rounded-lg text-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <svg className="w-5 h-5 inline-block ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                ایجاد فاکتور PDF
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
