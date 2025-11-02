'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import moment from 'moment-jalaali'

interface Employee {
  id: string
  name: string
}

export default function AdminNewProject(){
  const [name, setName] = useState('')
  const [client, setClient] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [employeeSalary, setEmployeeSalary] = useState('')
  const [totalPrice, setTotalPrice] = useState('')
  const [budget, setBudget] = useState('')
  const [startDate, setStartDate] = useState('')
  const [persianStartDate, setPersianStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [persianEndDate, setPersianEndDate] = useState('')
  const [priority, setPriority] = useState('medium')
  const [status, setStatus] = useState('pending')
  const [desc, setDesc] = useState('')
  const [saving, setSaving] = useState(false)
  
  const [employees, setEmployees] = useState<Employee[]>([])

  useEffect(() => {
    // لیست کارمندان
    setEmployees([
      { id: '1', name: 'مدیر سیستم' },
      { id: '2', name: 'سامی قربانی' },
      { id: '3', name: 'کارمند ۳' },
    ])
  }, [])

  const convertPersianDateToGregorian = (persianDateStr: string): string | null => {
    if (!persianDateStr) return null
    try {
      const dateParts = persianDateStr.split('/')
      if (dateParts.length !== 3) {
        return null
      }
      
      const jYear = parseInt(dateParts[0])
      const jMonth = parseInt(dateParts[1])
      const jDay = parseInt(dateParts[2])
      
      if (isNaN(jYear) || isNaN(jMonth) || isNaN(jDay)) {
        return null
      }
      
      const m = moment(`${jYear}/${jMonth}/${jDay}`, 'jYYYY/jMM/jDD')
      if (!m.isValid()) {
        return null
      }
      
      return m.format('YYYY-MM-DD')
    } catch {
      return null
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !client.trim() || !persianStartDate) {
      return alert('نام پروژه، مشتری و تاریخ شروع الزامی است')
    }
    if (!employeeId) {
      return alert('لطفاً کارمند مسئول را انتخاب کنید')
    }

    // Convert Persian dates to Gregorian
    const gregorianStartDate = convertPersianDateToGregorian(persianStartDate)
    if (!gregorianStartDate) {
      return alert('فرمت تاریخ شروع صحیح نیست. لطفاً به فرمت 1403/01/15 وارد کنید')
    }

    const gregorianEndDate = persianEndDate ? convertPersianDateToGregorian(persianEndDate) : null
    if (persianEndDate && !gregorianEndDate) {
      return alert('فرمت تاریخ پایان صحیح نیست. لطفاً به فرمت 1403/01/15 وارد کنید')
    }

    setSaving(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          client,
          clientEmail: clientEmail.trim() || null,
          clientPhone: clientPhone.trim() || null,
          employeeId,
          employeeSalary: employeeSalary.trim() ? parseInt(employeeSalary.trim()) : null,
          totalPrice: totalPrice.trim() ? parseInt(totalPrice.trim()) : null,
          budget: budget.trim() ? parseInt(budget.trim()) : 0,
          startDate: gregorianStartDate,
          endDate: gregorianEndDate,
          description: desc.trim() || null,
          priority,
          status
        })
      })
      if (res.ok) {
        alert('پروژه با موفقیت ثبت شد')
        // Reset form
        setName('')
        setClient('')
        setClientEmail('')
        setClientPhone('')
        setEmployeeId('')
        setEmployeeSalary('')
        setTotalPrice('')
        setBudget('')
        setStartDate('')
        setPersianStartDate('')
        setEndDate('')
        setPersianEndDate('')
        setPriority('medium')
        setStatus('pending')
        setDesc('')
      } else {
        const err = await res.json()
        alert(err.error || 'خطا در ثبت پروژه')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('خطا در ثبت پروژه')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex" dir="rtl">
      <aside className="w-64 bg-gray-900/80 border-l border-gray-800 p-4 flex flex-col gap-2">
        <div className="text-white font-bold text-lg mb-2">پنل مدیریت</div>
        <Link href="/admin" className="px-3 py-2 rounded hover:bg-gray-800/60 text-gray-300">داشبورد</Link>
        <Link href="/admin/projects" className="px-3 py-2 rounded hover:bg-gray-800/60 text-gray-300">پروژه‌ها</Link>
        <Link href="/admin/employees" className="px-3 py-2 rounded hover:bg-gray-800/60 text-gray-300 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span>کارمندان</span>
        </Link>
        <Link href="/admin/requests" className="px-3 py-2 rounded hover:bg-gray-800/60 text-gray-300 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>درخواست‌ها</span>
        </Link>
        <Link href="/admin/correspondence" className="px-3 py-2 rounded hover:bg-gray-800/60 text-gray-300 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span>مکاتبات</span>
        </Link>
      </aside>
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
          <h1 className="text-2xl text-white font-bold mb-6">ثبت پروژه جدید</h1>
          <form onSubmit={submit} className="space-y-6">
            {/* اطلاعات پایه */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">نام پروژه <span className="text-red-400">*</span></label>
                <input
                  value={name}
                  onChange={e=>setName(e.target.value)}
                  required
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="نام پروژه"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">نام مشتری <span className="text-red-400">*</span></label>
                <input
                  value={client}
                  onChange={e=>setClient(e.target.value)}
                  required
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="نام مشتری"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">ایمیل مشتری</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={e=>setClientEmail(e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">تلفن مشتری</label>
                <input
                  value={clientPhone}
                  onChange={e=>setClientPhone(e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="09123456789"
                />
              </div>
            </div>

            {/* تعیین کارمند */}
            <div className="border-t border-gray-700 pt-4">
              <h2 className="text-lg text-white font-semibold mb-4">تعیین کارمند</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">کارمند مسئول <span className="text-red-400">*</span></label>
                  <select
                    value={employeeId}
                    onChange={e=>setEmployeeId(e.target.value)}
                    required
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">انتخاب کنید</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    مبلغ کارمند (تومان)
                    <span className="block text-xs text-gray-500 mt-1">مخفی از کارمند</span>
                  </label>
                  <input
                    type="number"
                    value={employeeSalary}
                    onChange={e=>setEmployeeSalary(e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    قیمت کل پروژه (تومان)
                    <span className="block text-xs text-gray-500 mt-1">مخفی از کارمند</span>
                  </label>
                  <input
                    type="number"
                    value={totalPrice}
                    onChange={e=>setTotalPrice(e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* جزئیات پروژه */}
            <div className="border-t border-gray-700 pt-4">
              <h2 className="text-lg text-white font-semibold mb-4">جزئیات پروژه</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">بودجه (تومان)</label>
                  <input
                    type="number"
                    value={budget}
                    onChange={e=>setBudget(e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">اولویت</label>
                  <select
                    value={priority}
                    onChange={e=>setPriority(e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="low">کم</option>
                    <option value="medium">متوسط</option>
                    <option value="high">زیاد</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">تاریخ شروع (شمسی) <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={persianStartDate}
                    onChange={e => {
                      const value = e.target.value.replace(/[^0-9/]/g, '')
                      setPersianStartDate(value)
                    }}
                    placeholder="1403/01/15"
                    pattern="\d{4}/\d{1,2}/\d{1,2}"
                    required
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    dir="ltr"
                  />
                  <p className="text-xs text-gray-500 mt-1">فرمت: سال/ماه/روز (مثلاً: 1403/01/15)</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">تاریخ پایان (شمسی)</label>
                  <input
                    type="text"
                    value={persianEndDate}
                    onChange={e => {
                      const value = e.target.value.replace(/[^0-9/]/g, '')
                      setPersianEndDate(value)
                    }}
                    placeholder="1403/01/15"
                    pattern="\d{4}/\d{1,2}/\d{1,2}"
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    dir="ltr"
                  />
                  <p className="text-xs text-gray-500 mt-1">فرمت: سال/ماه/روز</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">وضعیت</label>
                  <select
                    value={status}
                    onChange={e=>setStatus(e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="pending">در انتظار</option>
                    <option value="in-progress">در حال انجام</option>
                    <option value="completed">تکمیل شده</option>
                    <option value="on-hold">متوقف شده</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm text-gray-300 mb-2">توضیحات</label>
                <textarea
                  rows={4}
                  value={desc}
                  onChange={e=>setDesc(e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="توضیحات پروژه..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
              <Link
                href="/admin/projects"
                className="px-6 py-3 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition"
              >
                انصراف
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {saving ? 'در حال ذخیره...' : 'ذخیره پروژه'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
