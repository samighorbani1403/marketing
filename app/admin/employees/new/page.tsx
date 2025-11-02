'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import moment from 'moment-jalaali'

export default function AdminNewEmployeePage() {
  const router = useRouter()
  
  const [fullName, setFullName] = useState('')
  const [education, setEducation] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [persianBirthDate, setPersianBirthDate] = useState('')
  const [fatherName, setFatherName] = useState('')
  const [nationalId, setNationalId] = useState('')
  const [interviewDate, setInterviewDate] = useState('')
  const [persianInterviewDate, setPersianInterviewDate] = useState('')
  const [hireDate, setHireDate] = useState('')
  const [persianHireDate, setPersianHireDate] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [employeeNumber, setEmployeeNumber] = useState('')
  const [maritalStatus, setMaritalStatus] = useState('single')
  const [childrenCount, setChildrenCount] = useState('0')
  const [religion, setReligion] = useState('')
  const [workType, setWorkType] = useState('full-time')
  const [salary, setSalary] = useState('')
  const [position, setPosition] = useState('')
  const [employeeRank, setEmployeeRank] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [terminationDate, setTerminationDate] = useState('')
  const [persianTerminationDate, setPersianTerminationDate] = useState('')
  const [terminationReason, setTerminationReason] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [sendingSMS, setSendingSMS] = useState(false)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setPhotoFile(file)
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview('')
  }

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let pass = ''
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setPassword(pass)
  }

  const generateUsername = () => {
    if (fullName.trim()) {
      const nameParts = fullName.trim().split(' ')
      const firstPart = nameParts[0].toLowerCase()
      const lastPart = nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : ''
      const randomNum = Math.floor(Math.random() * 1000)
      setUsername(`${firstPart}${lastPart}${randomNum}`.replace(/\s/g, ''))
    } else {
      const randomNum = Math.floor(Math.random() * 10000)
      setUsername(`user${randomNum}`)
    }
  }

  const handleSendSMS = async () => {
    if (!phone || !phone.trim()) {
      return alert('شماره تماس کارمند را وارد کنید')
    }
    if (!username || !username.trim()) {
      return alert('نام کاربری را ایجاد کنید')
    }
    if (!password || !password.trim()) {
      return alert('رمز عبور را ایجاد کنید')
    }

    setSendingSMS(true)
    try {
      const res = await fetch(`/api/employees/send-credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          username,
          password,
          fullName
        })
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          alert('پیامک با موفقیت ارسال شد')
        } else {
          alert(data.error || 'خطا در ارسال پیامک')
        }
      } else {
        const err = await res.json()
        alert(err.error || 'خطا در ارسال پیامک')
      }
    } catch (error) {
      console.error('Error sending SMS:', error)
      alert('خطا در اتصال به سرور')
    } finally {
      setSendingSMS(false)
    }
  }

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
    
    if (!fullName.trim()) {
      return alert('نام و نام خانوادگی الزامی است')
    }

    // Convert Persian dates to Gregorian
    const gregorianBirthDate = persianBirthDate ? convertPersianDateToGregorian(persianBirthDate) : null
    const gregorianInterviewDate = persianInterviewDate ? convertPersianDateToGregorian(persianInterviewDate) : null
    const gregorianHireDate = persianHireDate ? convertPersianDateToGregorian(persianHireDate) : null
    const gregorianTerminationDate = persianTerminationDate ? convertPersianDateToGregorian(persianTerminationDate) : null

    // Validate dates if provided
    if (persianBirthDate && !gregorianBirthDate) {
      return alert('فرمت تاریخ تولد صحیح نیست. لطفاً به فرمت 1403/01/15 وارد کنید')
    }
    if (persianInterviewDate && !gregorianInterviewDate) {
      return alert('فرمت تاریخ مصاحبه صحیح نیست. لطفاً به فرمت 1403/01/15 وارد کنید')
    }
    if (persianHireDate && !gregorianHireDate) {
      return alert('فرمت تاریخ استخدام صحیح نیست. لطفاً به فرمت 1403/01/15 وارد کنید')
    }
    if (persianTerminationDate && !gregorianTerminationDate) {
      return alert('فرمت تاریخ قطع همکاری صحیح نیست. لطفاً به فرمت 1403/01/15 وارد کنید')
    }

    setSaving(true)
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          education: education.trim() || null,
          birthDate: gregorianBirthDate,
          fatherName: fatherName.trim() || null,
          nationalId: nationalId.trim() || null,
          interviewDate: gregorianInterviewDate,
          hireDate: gregorianHireDate,
          phone: phone.trim() || null,
          address: address.trim() || null,
          employeeNumber: employeeNumber.trim() || null,
          photoDataUrl: photoPreview || null,
          maritalStatus,
          childrenCount: maritalStatus === 'married' ? parseInt(childrenCount || '0') : 0,
          religion: religion.trim() || null,
          workType,
          salary: salary.trim() ? parseInt(salary.trim()) : null,
          position: position.trim() || null,
          employeeRank: employeeRank.trim() || null,
          username: username.trim() || null,
          password: password.trim() || null,
          terminationDate: gregorianTerminationDate,
          terminationReason: terminationReason.trim() || null
        })
      })
      
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          alert('کارمند با موفقیت ثبت شد')
          router.push('/admin/employees')
        } else {
          alert(data.error || 'خطا در ثبت کارمند')
        }
      } else {
        let errorMessage = 'خطا در ثبت کارمند'
        try {
          const err = await res.json()
          errorMessage = err.error || errorMessage
        } catch {
          // If response is not JSON
          errorMessage = `خطا ${res.status}: ${res.statusText}`
        }
        alert(errorMessage)
      }
    } catch (error: any) {
      console.error('Error:', error)
      alert(error?.message || 'خطا در اتصال به سرور. لطفاً مطمئن شوید که سرور در حال اجرا است.')
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
        <Link href="/admin/employees" className="px-3 py-2 rounded hover:bg-gray-800/60 text-gray-300">کارمندان</Link>
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
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl">
          <div className="px-6 py-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              ثبت کارمند جدید
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
            <form onSubmit={submit} className="space-y-6">
              {/* اطلاعات شخصی */}
              <div className="border-b border-gray-700 pb-4">
                <h2 className="text-xl text-white font-semibold mb-4">اطلاعات شخصی</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">نام و نام خانوادگی <span className="text-red-400">*</span></label>
                    <input
                      value={fullName}
                      onChange={e=>setFullName(e.target.value)}
                      required
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="نام و نام خانوادگی"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">کد ملی</label>
                    <input
                      value={nationalId}
                      onChange={e=>setNationalId(e.target.value)}
                      maxLength={10}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="کد ملی"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">نام پدر</label>
                    <input
                      value={fatherName}
                      onChange={e=>setFatherName(e.target.value)}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="نام پدر"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">تاریخ تولد (شمسی)</label>
                    <input
                      type="text"
                      value={persianBirthDate}
                      onChange={e => {
                        const value = e.target.value.replace(/[^0-9/]/g, '')
                        setPersianBirthDate(value)
                      }}
                      placeholder="1403/01/15"
                      pattern="\d{4}/\d{1,2}/\d{1,2}"
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      dir="ltr"
                    />
                    <p className="text-xs text-gray-500 mt-1">فرمت: سال/ماه/روز (مثلاً: 1403/01/15)</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">میزان تحصیلات</label>
                    <input
                      value={education}
                      onChange={e=>setEducation(e.target.value)}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="مثلاً: کارشناسی، کارشناسی ارشد"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">دین / مذهب</label>
                    <input
                      value={religion}
                      onChange={e=>setReligion(e.target.value)}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="دین / مذهب"
                    />
                  </div>
                </div>
              </div>

              {/* اطلاعات تماس */}
              <div className="border-b border-gray-700 pb-4">
                <h2 className="text-xl text-white font-semibold mb-4">اطلاعات تماس</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">شماره تماس</label>
                    <input
                      value={phone}
                      onChange={e=>setPhone(e.target.value)}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="09123456789"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-300 mb-2">آدرس منزل</label>
                    <textarea
                      rows={2}
                      value={address}
                      onChange={e=>setAddress(e.target.value)}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="آدرس کامل منزل"
                    />
                  </div>
                </div>
              </div>

              {/* اطلاعات استخدام */}
              <div className="border-b border-gray-700 pb-4">
                <h2 className="text-xl text-white font-semibold mb-4">اطلاعات استخدام</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">شماره استخدامی</label>
                    <input
                      value={employeeNumber}
                      onChange={e=>setEmployeeNumber(e.target.value)}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="شماره استخدامی"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">تاریخ مصاحبه (شمسی)</label>
                    <input
                      type="text"
                      value={persianInterviewDate}
                      onChange={e => {
                        const value = e.target.value.replace(/[^0-9/]/g, '')
                        setPersianInterviewDate(value)
                      }}
                      placeholder="1403/01/15"
                      pattern="\d{4}/\d{1,2}/\d{1,2}"
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      dir="ltr"
                    />
                    <p className="text-xs text-gray-500 mt-1">فرمت: سال/ماه/روز</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">تاریخ استخدام (شمسی)</label>
                    <input
                      type="text"
                      value={persianHireDate}
                      onChange={e => {
                        const value = e.target.value.replace(/[^0-9/]/g, '')
                        setPersianHireDate(value)
                      }}
                      placeholder="1403/01/15"
                      pattern="\d{4}/\d{1,2}/\d{1,2}"
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      dir="ltr"
                    />
                    <p className="text-xs text-gray-500 mt-1">فرمت: سال/ماه/روز</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">سمت شغلی</label>
                    <input
                      value={position}
                      onChange={e=>setPosition(e.target.value)}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="مثلاً: بازاریاب، مدیر فروش"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">نحوه همکاری</label>
                    <select
                      value={workType}
                      onChange={e=>setWorkType(e.target.value)}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="full-time">تمام وقت</option>
                      <option value="part-time">پاره وقت</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">رتبه کارمندی</label>
                    <input
                      value={employeeRank}
                      onChange={e=>setEmployeeRank(e.target.value)}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="بر اساس تخصص و سابقه"
                    />
                  </div>
                </div>
              </div>

              {/* اطلاعات ورود به پنل */}
              <div className="border-b border-gray-700 pb-4">
                <h2 className="text-xl text-white font-semibold mb-4">اطلاعات ورود به پنل</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">نام کاربری</label>
                    <div className="flex gap-2">
                      <input
                        value={username}
                        onChange={e=>setUsername(e.target.value)}
                        className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        placeholder="نام کاربری"
                      />
                      <button
                        type="button"
                        onClick={generateUsername}
                        className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition"
                        title="تولید خودکار"
                      >
                        🔄
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">رمز عبور</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={password}
                        onChange={e=>setPassword(e.target.value)}
                        className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        placeholder="رمز عبور"
                      />
                      <button
                        type="button"
                        onClick={generatePassword}
                        className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition"
                        title="تولید خودکار"
                      >
                        🔄
                      </button>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <button
                      type="button"
                      onClick={handleSendSMS}
                      disabled={sendingSMS || !phone || !username || !password}
                      className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      {sendingSMS ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>در حال ارسال...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <span>ارسال پیامک مشخصات ورود به کاربر</span>
                        </>
                      )}
                    </button>
                    <p className="text-xs text-gray-500 mt-2">پیامک حاوی نام کاربری و رمز عبور به شماره {phone || 'کارمند'} ارسال می‌شود</p>
                  </div>
                </div>
              </div>

              {/* اطلاعات قطع همکاری */}
              <div className="border-b border-gray-700 pb-4">
                <h2 className="text-xl text-white font-semibold mb-4">اطلاعات قطع همکاری</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">تاریخ قطع همکاری (شمسی)</label>
                    <input
                      type="text"
                      value={persianTerminationDate}
                      onChange={e => {
                        const value = e.target.value.replace(/[^0-9/]/g, '')
                        setPersianTerminationDate(value)
                      }}
                      placeholder="1403/01/15"
                      pattern="\d{4}/\d{1,2}/\d{1,2}"
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      dir="ltr"
                    />
                    <p className="text-xs text-gray-500 mt-1">فرمت: سال/ماه/روز</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-300 mb-2">دلیل قطع همکاری</label>
                    <textarea
                      rows={3}
                      value={terminationReason}
                      onChange={e=>setTerminationReason(e.target.value)}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="دلیل قطع همکاری را وارد کنید..."
                    />
                  </div>
                </div>
              </div>

              {/* اطلاعات مالی */}
              <div className="border-b border-gray-700 pb-4">
                <h2 className="text-xl text-white font-semibold mb-4">اطلاعات مالی (مخفی از کارمند)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      حقوق دریافتی (تومان)
                      <span className="block text-xs text-gray-500 mt-1">عدم نمایش در پروفایل کارمندان</span>
                    </label>
                    <input
                      type="number"
                      value={salary}
                      onChange={e=>setSalary(e.target.value)}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* وضعیت تاهل */}
              <div className="border-b border-gray-700 pb-4">
                <h2 className="text-xl text-white font-semibold mb-4">وضعیت تاهل</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">وضعیت تاهل</label>
                    <select
                      value={maritalStatus}
                      onChange={e=>setMaritalStatus(e.target.value)}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="single">مجرد</option>
                      <option value="married">متأهل</option>
                    </select>
                  </div>
                  {maritalStatus === 'married' && (
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">تعداد فرزند</label>
                      <input
                        type="number"
                        value={childrenCount}
                        onChange={e=>setChildrenCount(e.target.value)}
                        min="0"
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        placeholder="0"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* عکس پرسنلی */}
              <div className="border-b border-gray-700 pb-4">
                <h2 className="text-xl text-white font-semibold mb-4">عکس پرسنلی</h2>
                <div className="flex items-start gap-4">
                  {photoPreview ? (
                    <div className="relative">
                      <img src={photoPreview} alt="Preview" className="w-32 h-32 rounded-lg object-cover" />
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-lg bg-gray-800 border-2 border-dashed border-gray-600 flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1">
                    <label className="block text-sm text-gray-300 mb-2">بارگذاری عکس</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">فرمت‌های مجاز: JPG, PNG, GIF</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => router.push('/admin/employees')}
                  className="px-6 py-3 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {saving ? 'در حال ذخیره...' : 'ذخیره کارمند'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}

