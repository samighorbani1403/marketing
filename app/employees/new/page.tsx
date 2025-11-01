'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

export default function NewEmployeePage() {
  const router = useRouter()
  
  const [fullName, setFullName] = useState('')
  const [education, setEducation] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [fatherName, setFatherName] = useState('')
  const [nationalId, setNationalId] = useState('')
  const [interviewDate, setInterviewDate] = useState('')
  const [hireDate, setHireDate] = useState('')
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
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [saving, setSaving] = useState(false)

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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!fullName.trim()) {
      return alert('نام و نام خانوادگی الزامی است')
    }

    setSaving(true)
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          education: education.trim() || null,
          birthDate: birthDate || null,
          fatherName: fatherName.trim() || null,
          nationalId: nationalId.trim() || null,
          interviewDate: interviewDate || null,
          hireDate: hireDate || null,
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
          employeeRank: employeeRank.trim() || null
        })
      })
      
      if (res.ok) {
        alert('کارمند با موفقیت ثبت شد')
        router.push('/employees')
      } else {
        const err = await res.json()
        alert(err.error || 'خطا در ثبت کارمند')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('خطا در ثبت کارمند')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex overflow-hidden" dir="rtl">
      <Sidebar />
      
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
                    <label className="block text-sm text-gray-300 mb-2">تاریخ تولد</label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={e=>setBirthDate(e.target.value)}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    />
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
                    <label className="block text-sm text-gray-300 mb-2">تاریخ مصاحبه</label>
                    <input
                      type="date"
                      value={interviewDate}
                      onChange={e=>setInterviewDate(e.target.value)}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">تاریخ استخدام</label>
                    <input
                      type="date"
                      value={hireDate}
                      onChange={e=>setHireDate(e.target.value)}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    />
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
                  onClick={() => router.push('/employees')}
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

