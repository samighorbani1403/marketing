"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

export default function EditCampaignPage() {
  const params = useParams()
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '', clientId: '', type: 'email', budget: '', startDate: '', endDate: '', description: '', targetAudience: '', objectives: '', status: 'draft',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/campaigns/${params.id}`)
      .then(res => res.ok ? res.json() : Promise.reject('not found'))
      .then(data => {
        setFormData({
          name: data.campaign.name,
          clientId: data.campaign.clientId,
          type: data.campaign.type,
          budget: data.campaign.budget,
          startDate: data.campaign.startDate,
          endDate: data.campaign.endDate || '',
          description: data.campaign.description || '',
          targetAudience: data.campaign.targetAudience || '',
          objectives: data.campaign.objectives || '',
          status: data.campaign.status,
        });
        setLoading(false)
      })
      .catch(() => { setError('کمپین یافت نشد'); setLoading(false); })
  }, [params.id])

  const handleChange = (e) => {
    setFormData(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/campaigns/${params.id}`, {method:'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(formData)})
      if (res.ok) {
        alert('کمپین با موفقیت ویرایش شد')
        router.push('/campaigns')
      } else {
        const err = await res.json()
        setError(err.error || 'خطا در ذخیره کمپین')
      }
    } catch {
      setError('خطای سرور در ذخیره کمپین')
    }
    setSaving(false)
  }

  if (loading)
    return <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div></div>

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex overflow-hidden" dir="rtl">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl">
          <div className="px-6 py-4"> <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">ویرایش کمپین بازاریابی</h1></div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">نام کمپین</label>
                  <input name="name" type="text" value={formData.name} onChange={handleChange}
                    className="mt-1 block w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">وضعیت</label>
                  <select name="status" value={formData.status} onChange={handleChange}
                   className="mt-1 block w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500">
                    <option value="draft">پیش‌نویس</option><option value="active">فعال</option><option value="paused">متوقف</option><option value="completed">تکمیل شده</option><option value="cancelled">لغو شده</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">بودجه</label>
                  <input name="budget" type="number" value={formData.budget} onChange={handleChange}
                    className="mt-1 block w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">نوع کمپین</label>
                  <select name="type" value={formData.type} onChange={handleChange}
                    className="mt-1 block w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500">
                    <option value="email">ایمیل</option><option value="sms">پیامک</option><option value="phone">تلفن</option><option value="social">شبکه‌های اجتماعی</option><option value="display">نمایشی</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">تاریخ شروع</label>
                  <input name="startDate" type="date" value={formData.startDate} onChange={handleChange}
                    className="mt-1 block w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">تاریخ پایان (اختیاری)</label>
                  <input name="endDate" type="date" value={formData.endDate} onChange={handleChange}
                    className="mt-1 block w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">مخاطب هدف</label>
                <input name="targetAudience" type="text" value={formData.targetAudience} onChange={handleChange} className="mt-1 block w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">اهداف کمپین</label>
                <input name="objectives" type="text" value={formData.objectives} onChange={handleChange} className="mt-1 block w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">توضیحات</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500" />
              </div>
              {error && <div className="bg-red-500/10 text-red-400 p-3 rounded-lg mb-5">{error}</div>}
              <div className="flex justify-end gap-4">
                <button type="button" onClick={() => router.push('/campaigns')} className="rounded-lg bg-gray-700 hover:bg-gray-600 text-white px-6 py-3">انصراف</button>
                <button type="submit" disabled={saving} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg">
                  {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
