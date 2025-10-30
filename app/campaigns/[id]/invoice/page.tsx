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

interface Client {
  id: string
  name: string
  company?: string
  email?: string
  phone?: string
  city?: string
}

export default function CampaignInvoicePage({ params }: { params: { id: string } }) {
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [client, setClient] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
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
        
        // Fetch client details
        const clientResponse = await fetch(`/api/clients/${data.campaign.clientId}`)
        if (clientResponse.ok) {
          const clientData = await clientResponse.json()
          setClient(clientData.client)
        }
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

  const getTypeText = (type: string) => {
    switch (type) {
      case 'email':
        return 'کمپین ایمیل بازاریابی'
      case 'sms':
        return 'کمپین پیامک تبلیغاتی'
      case 'phone':
        return 'کمپین تلفنی فروش'
      case 'social':
        return 'کمپین شبکه‌های اجتماعی'
      case 'display':
        return 'کمپین تبلیغات نمایشی'
      default:
        return 'کمپین بازاریابی'
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

  const handleGeneratePDF = async () => {
    setIsGenerating(true)
    
    try {
      // Generate PDF content
      const invoiceData = {
        campaignId: campaign?.id,
        campaignName: campaign?.name,
        clientName: client?.name,
        clientCompany: client?.company,
        clientEmail: client?.email,
        clientPhone: client?.phone,
        clientCity: client?.city,
        campaignType: getTypeText(campaign?.type || ''),
        campaignStatus: getStatusText(campaign?.status || ''),
        budget: campaign?.budget || 0,
        startDate: campaign?.startDate,
        endDate: campaign?.endDate,
        description: campaign?.description,
        targetAudience: campaign?.targetAudience,
        objectives: campaign?.objectives,
        metrics: campaign?.metrics,
        createdAt: campaign?.createdAt,
        invoiceDate: new Date().toISOString().split('T')[0],
        invoiceNumber: `INV-${campaign?.id}-${Date.now()}`
      }

      // Call PDF generation API
      const response = await fetch('/api/campaigns/invoice/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `فاکتور_کمپین_${campaign?.name}_${invoiceData.invoiceNumber}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        alert('فاکتور PDF با موفقیت ایجاد و دانلود شد')
      } else {
        alert('خطا در ایجاد فاکتور PDF')
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('خطا در ایجاد فاکتور PDF')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleBack = () => {
    router.push(`/campaigns/${params.id}`)
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center" dir="rtl">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!campaign || !client) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">اطلاعات کمپین یا مشتری یافت نشد</h1>
          <button
            onClick={handleBack}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            بازگشت
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
                ایجاد فاکتور PDF کمپین
              </h1>
              <button
                onClick={handleGeneratePDF}
                disabled={isGenerating}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-lg text-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg disabled:transform-none"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin w-5 h-5 inline-block ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    در حال ایجاد...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 inline-block ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    ایجاد و دانلود PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Invoice Preview */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8" dir="rtl">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">فاکتور کمپین بازاریابی</h1>
                <p className="text-gray-600">شماره فاکتور: INV-{campaign.id}-{Date.now()}</p>
                <p className="text-gray-600">تاریخ: {new Date().toLocaleDateString('fa-IR')}</p>
              </div>

              {/* Company Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">اطلاعات شرکت</h3>
                  <div className="text-gray-600">
                    <p className="font-medium">شرکت بازاریابی دیجیتال</p>
                    <p>تهران، ایران</p>
                    <p>تلفن: 021-12345678</p>
                    <p>ایمیل: info@marketing.com</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">اطلاعات مشتری</h3>
                  <div className="text-gray-600">
                    <p className="font-medium">{client.name}</p>
                    {client.company && <p>{client.company}</p>}
                    {client.email && <p>ایمیل: {client.email}</p>}
                    {client.phone && <p>تلفن: {client.phone}</p>}
                    {client.city && <p>شهر: {client.city}</p>}
                  </div>
                </div>
              </div>

              {/* Campaign Details */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">جزئیات کمپین</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-600">نام کمپین:</span>
                      <span className="font-medium text-gray-800 mr-2">{campaign.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">نوع کمپین:</span>
                      <span className="font-medium text-gray-800 mr-2">{getTypeText(campaign.type)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">وضعیت:</span>
                      <span className="font-medium text-gray-800 mr-2">{getStatusText(campaign.status)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">بودجه:</span>
                      <span className="font-medium text-gray-800 mr-2">{campaign.budget.toLocaleString()} تومان</span>
                    </div>
                    <div>
                      <span className="text-gray-600">تاریخ شروع:</span>
                      <span className="font-medium text-gray-800 mr-2">{campaign.startDate}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">تاریخ پایان:</span>
                      <span className="font-medium text-gray-800 mr-2">{campaign.endDate || 'نامشخص'}</span>
                    </div>
                  </div>
                  
                  {campaign.description && (
                    <div className="mt-4">
                      <span className="text-gray-600">توضیحات:</span>
                      <p className="text-gray-800 mt-2">{campaign.description}</p>
                    </div>
                  )}
                  
                  {campaign.targetAudience && (
                    <div className="mt-4">
                      <span className="text-gray-600">مخاطب هدف:</span>
                      <p className="text-gray-800 mt-2">{campaign.targetAudience}</p>
                    </div>
                  )}
                  
                  {campaign.objectives && (
                    <div className="mt-4">
                      <span className="text-gray-600">اهداف کمپین:</span>
                      <p className="text-gray-800 mt-2">{campaign.objectives}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Metrics */}
              {campaign.metrics && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">آمار عملکرد</h3>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-2">
                          {campaign.metrics.impressions?.toLocaleString() || 0}
                        </div>
                        <div className="text-gray-600">نمایش</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 mb-2">
                          {campaign.metrics.clicks?.toLocaleString() || 0}
                        </div>
                        <div className="text-gray-600">کلیک</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600 mb-2">
                          {campaign.metrics.conversions?.toLocaleString() || 0}
                        </div>
                        <div className="text-gray-600">تبدیل</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600 mb-2">
                          {(campaign.metrics.cost || 0).toLocaleString()}
                        </div>
                        <div className="text-gray-600">هزینه (تومان)</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="border-t pt-8">
                <div className="flex justify-between items-center">
                  <div className="text-lg font-semibold text-gray-800">مجموع:</div>
                  <div className="text-2xl font-bold text-gray-800">{campaign.budget.toLocaleString()} تومان</div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center mt-8 pt-8 border-t text-gray-500 text-sm">
                <p>این فاکتور به صورت خودکار تولید شده است</p>
                <p>تاریخ تولید: {new Date().toLocaleDateString('fa-IR')}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 space-x-reverse">
              <button
                onClick={handleBack}
                className="px-8 py-3 rounded-lg text-white bg-gray-700 hover:bg-gray-600 transition-colors duration-300 font-medium"
              >
                بازگشت
              </button>
              <button
                onClick={handleGeneratePDF}
                disabled={isGenerating}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg disabled:transform-none"
              >
                {isGenerating ? 'در حال ایجاد...' : 'ایجاد و دانلود PDF'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
