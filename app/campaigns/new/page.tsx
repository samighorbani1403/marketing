'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

interface Client {
  id: string
  name: string
  company?: string
  email?: string
}

export default function NewCampaignPage() {
  const [formData, setFormData] = useState({
    name: '',
    clientId: '',
    type: 'email',
    budget: '',
    startDate: '',
    endDate: '',
    description: '',
    targetAudience: '',
    objectives: '',
    status: 'draft',
  })
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      if (response.ok) {
        const data = await response.json()
        setClients(data.clients)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Client-side validation
      if (!formData.name || !formData.clientId || !formData.type || !formData.startDate) {
        alert('نام، مشتری، نوع و تاریخ شروع الزامی است')
        setIsLoading(false)
        return
      }
      const parsedBudget = parseInt(String(formData.budget))
      if (isNaN(parsedBudget) || parsedBudget < 0) {
        alert('بودجه نامعتبر است')
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, budget: parsedBudget }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Campaign created successfully:', data)

        // Redirect to campaigns page
        router.push('/campaigns')
      } else {
        const errorData = await response.json()
        console.error('❌ Failed to create campaign:', errorData)
        alert('خطا در ایجاد کمپین: ' + (errorData.error || 'خطای نامشخص'))
      }
    } catch (error) {
      console.error('❌ Error creating campaign:', error)
      alert('خطا در ایجاد کمپین')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/campaigns')
  }

  const getTypeDescription = (type: string) => {
    switch (type) {
      case 'email':
        return 'ارسال ایمیل‌های تبلیغاتی به لیست مشتریان'
      case 'sms':
        return 'ارسال پیامک‌های تبلیغاتی به شماره‌های ثبت‌نام شده'
      case 'phone':
        return 'تماس تلفنی مستقیم با مشتریان'
      case 'social':
        return 'تبلیغات در شبکه‌های اجتماعی (اینستاگرام، تلگرام، واتساپ)'
      case 'display':
        return 'تبلیغات نمایشی در وبسایت‌ها و اپلیکیشن‌ها'
      default:
        return ''
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex overflow-hidden" dir="rtl">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl">
          <div className="px-6 py-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent text-right">
              ایجاد کمپین بازاریابی جدید
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campaign Information */}
              <div className="pb-6 border-b border-gray-700/50">
                <h2 className="text-2xl font-bold text-white mb-4 text-right">اطلاعات کمپین</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 text-right">نام کمپین</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1 block w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 text-right"
                      placeholder="مثال: کمپین ایمیل بازاریابی"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="clientId" className="block text-sm font-medium text-gray-300 text-right">مشتری</label>
                    <select
                      id="clientId"
                      name="clientId"
                      value={formData.clientId}
                      onChange={handleChange}
                      className="mt-1 block w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500 text-right"
                      required
                    >
                      <option value="">انتخاب مشتری</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name} {client.company && `- ${client.company}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-300 text-right">نوع کمپین</label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="mt-1 block w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500 text-right"
                      required
                    >
                      <option value="email">ایمیل</option>
                      <option value="sms">پیامک</option>
                      <option value="phone">تلفن</option>
                      <option value="social">شبکه‌های اجتماعی</option>
                      <option value="display">نمایشی</option>
                    </select>
                    <p className="mt-1 text-sm text-gray-400 text-right">{getTypeDescription(formData.type)}</p>
                  </div>
                  <div>
                    <label htmlFor="budget" className="block text-sm font-medium text-gray-300 text-right">بودجه (تومان)</label>
                    <input
                      type="number"
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      className="mt-1 block w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 text-right"
                      placeholder="مثال: 5000000"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-300 text-right">توضیحات</label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleChange}
                      className="mt-1 block w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 text-right"
                      placeholder="توضیحات کامل در مورد کمپین..."
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Campaign Details */}
              <div className="pb-6 border-b border-gray-700/50">
                <h2 className="text-2xl font-bold text-white mb-4 text-right">جزئیات کمپین</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 text-right">تاریخ شروع</label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className="mt-1 block w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500 text-right"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 text-right">تاریخ پایان (اختیاری)</label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className="mt-1 block w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500 text-right"
                    />
                  </div>
                  <div>
                    <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-300 text-right">مخاطب هدف</label>
                    <input
                      type="text"
                      id="targetAudience"
                      name="targetAudience"
                      value={formData.targetAudience}
                      onChange={handleChange}
                      className="mt-1 block w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 text-right"
                      placeholder="مثال: مشتریان موجود و بالقوه"
                    />
                  </div>
                  <div>
                    <label htmlFor="objectives" className="block text-sm font-medium text-gray-300 text-right">اهداف کمپین</label>
                    <input
                      type="text"
                      id="objectives"
                      name="objectives"
                      value={formData.objectives}
                      onChange={handleChange}
                      className="mt-1 block w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 text-right"
                      placeholder="مثال: افزایش فروش و آگاهی از برند"
                    />
                  </div>
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-300 text-right">وضعیت</label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="mt-1 block w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500 text-right"
                    >
                      <option value="draft">پیش‌نویس</option>
                      <option value="active">فعال</option>
                      <option value="paused">متوقف</option>
                      <option value="completed">تکمیل شده</option>
                      <option value="cancelled">لغو شده</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Campaign Preview */}
              <div className="pb-6 border-b border-gray-700/50">
                <h2 className="text-2xl font-bold text-white mb-4 text-right">پیش‌نمایش کمپین</h2>
                <div className="bg-gray-800/50 rounded-xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">نام کمپین:</span>
                      <span className="text-white mr-2">{formData.name || 'نام کمپین'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">نوع:</span>
                      <span className="text-white mr-2">
                        {formData.type === 'email' ? 'ایمیل' :
                         formData.type === 'sms' ? 'پیامک' :
                         formData.type === 'phone' ? 'تلفن' :
                         formData.type === 'social' ? 'شبکه‌های اجتماعی' :
                         formData.type === 'display' ? 'نمایشی' : 'نامشخص'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">بودجه:</span>
                      <span className="text-white mr-2">{formData.budget ? `${parseInt(formData.budget).toLocaleString()} تومان` : 'تعیین نشده'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">تاریخ شروع:</span>
                      <span className="text-white mr-2">{formData.startDate || 'تعیین نشده'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">مخاطب هدف:</span>
                      <span className="text-white mr-2">{formData.targetAudience || 'تعیین نشده'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">وضعیت:</span>
                      <span className="text-white mr-2">
                        {formData.status === 'draft' ? 'پیش‌نویس' :
                         formData.status === 'active' ? 'فعال' :
                         formData.status === 'paused' ? 'متوقف' :
                         formData.status === 'completed' ? 'تکمیل شده' :
                         formData.status === 'cancelled' ? 'لغو شده' : 'نامشخص'}
                      </span>
                    </div>
                  </div>
                  {formData.description && (
                    <div className="mt-4">
                      <span className="text-gray-400">توضیحات:</span>
                      <p className="text-white mr-2 mt-1">{formData.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 space-x-reverse pt-6 border-t border-gray-700/50">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 rounded-lg text-white bg-gray-700 hover:bg-gray-600 transition-colors duration-300 font-medium"
                  disabled={isLoading}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? 'در حال ایجاد...' : 'ایجاد کمپین'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
