'use client'

import { useEffect, useRef, useState } from 'react'
import Sidebar from '@/components/Sidebar'

interface Attachment { name: string; type: string; size: number; dataUrl?: string | null }
interface RequestItem { id: string; userId: string; type: 'leave'|'financial'|'letter'; status: 'submitted'|'approved'|'rejected'; createdAt: string; payload: any; attachments?: Attachment[]; managerNote?: string }

export default function RequestsPage(){
  const [activeTab, setActiveTab] = useState<'leave'|'financial'|'letter'|'list'>('leave')
  const currentUser = { id: '2', name: 'سامی قربانی' }

  // Leave form
  const [leaveType, setLeaveType] = useState<'daily'|'hourly'>('daily')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [leaveDesc, setLeaveDesc] = useState('')
  const [sendingLeave, setSendingLeave] = useState(false)

  // Financial form
  const [finTitle, setFinTitle] = useState('')
  const [finBody, setFinBody] = useState('')
  const [finFiles, setFinFiles] = useState<File[]>([])
  const [finPreviews, setFinPreviews] = useState<string[]>([])
  const [sendingFin, setSendingFin] = useState(false)
  const finInputRef = useRef<HTMLInputElement>(null)

  // Letter form
  const [organization, setOrganization] = useState('')
  const [letterDesc, setLetterDesc] = useState('')
  const [sendingLetter, setSendingLetter] = useState(false)

  // List
  const [items, setItems] = useState<RequestItem[]>([])
  const [loadingList, setLoadingList] = useState(true)

  const readAsDataUrl = (f: File) => new Promise<string>((resolve, reject) => { const r = new FileReader(); r.onload=()=>resolve(String(r.result)); r.onerror=reject; r.readAsDataURL(f) })

  const fetchList = async () => {
    try {
      const res = await fetch('/api/requests')
      if (res.ok) {
        const data = await res.json()
        setItems(data.requests || [])
      }
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(()=>{ fetchList() }, [])

  const submitLeave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!startDate) return alert('تاریخ شروع را وارد کنید')
    setSendingLeave(true)
    try {
      const res = await fetch('/api/requests', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          type: 'leave',
          payload: { leaveType, startDate, endDate, startTime, endTime, description: leaveDesc }
        })
      })
      if (res.ok) {
        const created = await res.json()
        setItems(prev => [created, ...prev])
        setStartDate(''); setEndDate(''); setStartTime(''); setEndTime(''); setLeaveDesc('')
        setActiveTab('list')
      } else {
        const err = await res.json(); alert(err.error || 'خطا در ثبت مرخصی')
      }
    } finally { setSendingLeave(false) }
  }

  const onPickFinFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    setFinFiles(files)
    const previews: string[] = []
    for (const f of files) { try { previews.push(await readAsDataUrl(f)) } catch { previews.push('') } }
    setFinPreviews(previews)
  }

  const submitFinancial = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!finTitle.trim() || !finBody.trim()) return alert('عنوان و متن درخواست را وارد کنید')
    setSendingFin(true)
    try {
      const attachments: Attachment[] = []
      for (let i=0;i<finFiles.length;i++) {
        const f = finFiles[i]
        const dataUrl = finPreviews[i]
        attachments.push({ name: f.name, type: f.type, size: f.size, dataUrl })
      }
      const res = await fetch('/api/requests', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          type: 'financial',
          payload: { title: finTitle, body: finBody },
          attachments
        })
      })
      if (res.ok) {
        const created = await res.json()
        setItems(prev => [created, ...prev])
        setFinTitle(''); setFinBody(''); setFinFiles([]); setFinPreviews([])
        setActiveTab('list')
      } else { const err = await res.json(); alert(err.error || 'خطا در ثبت درخواست مالی') }
    } finally { setSendingFin(false) }
  }

  const submitLetter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!organization) return alert('سازمان مقصد را وارد کنید')
    setSendingLetter(true)
    try {
      const res = await fetch('/api/requests', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          type: 'letter',
          payload: { organization, description: letterDesc }
        })
      })
      if (res.ok) {
        const created = await res.json()
        setItems(prev => [created, ...prev])
        setOrganization(''); setLetterDesc('')
        setActiveTab('list')
      } else { const err = await res.json(); alert(err.error || 'خطا در ثبت معرفی‌نامه') }
    } finally { setSendingLetter(false) }
  }

  const StatusBadge = ({ status }: { status: RequestItem['status'] }) => {
    const map: Record<RequestItem['status'], { text: string; cls: string }> = {
      submitted: { text: 'در انتظار بررسی', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
      approved: { text: 'تایید شد', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
      rejected: { text: 'رد شد', cls: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
    }
    const s = map[status]
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border ${s.cls}`}>{s.text}</span>
  }

  const renderList = () => (
    <div className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-gray-300">لیست درخواست‌ها</div>
        <button onClick={()=>{ setLoadingList(true); fetchList() }} className="text-xs text-gray-400 hover:text-gray-200">به‌روزرسانی</button>
      </div>
      {loadingList ? (
        <div className="h-40 flex items-center justify-center text-gray-400">در حال بارگذاری...</div>
      ) : (
        <div className="space-y-3">
          {items.map(it => (
            <div key={it.id} className="p-3 rounded-xl bg-gray-800/50 border border-gray-700/50">
              <div className="flex items-center justify-between gap-3">
                <div className="text-white text-sm">
                  {it.type==='leave'?'درخواست مرخصی': it.type==='financial'?'درخواست مالی':'درخواست معرفی‌نامه'}
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={it.status} />
                  <div className="text-xs text-gray-400">{new Date(it.createdAt).toLocaleString('fa-IR')}</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-300">
                {it.type==='leave' && (
                  <div>
                    نوع: {it.payload.leaveType==='daily'?'روزانه':'ساعتی'} | از {it.payload.startDate}{it.payload.startTime?` ${it.payload.startTime}`:''}
                    {it.payload.endDate?` تا ${it.payload.endDate}`:''}{it.payload.endTime?` ${it.payload.endTime}`:''}
                    {it.payload.description?` — ${it.payload.description}`:''}
                  </div>
                )}
                {it.type==='financial' && (
                  <div>
                    {it.payload.title} — {it.payload.body}
                    {it.attachments?.length ? (
                      <div className="mt-1 text-[11px] text-gray-400">پیوست: {it.attachments.length} فایل</div>
                    ) : null}
                  </div>
                )}
                {it.type==='letter' && (
                  <div>
                    سازمان مقصد: {it.payload.organization}
                    {it.payload.description?` — ${it.payload.description}`:''}
                  </div>
                )}
              </div>
              {it.managerNote && (
                <div className="mt-2 text-[11px] text-blue-300 bg-blue-900/20 border border-blue-800/40 rounded-lg px-2 py-1">
                  نظر مدیر: {it.managerNote}
                </div>
              )}
            </div>
          ))}
          {items.length===0 && <div className="h-32 flex items-center justify-center text-gray-500 text-sm">درخواستی ثبت نشده است.</div>}
        </div>
      )}
    </div>
  )

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex overflow-hidden" dir="rtl">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl">
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">درخواست‌ها</h1>
            <div className="flex gap-2">
              <button onClick={()=>setActiveTab('leave')} className={`px-3 py-1 rounded-lg text-sm ${activeTab==='leave'?'bg-blue-600 text-white':'bg-gray-800 text-gray-300'}`}>درخواست مرخصی</button>
              <button onClick={()=>setActiveTab('financial')} className={`px-3 py-1 rounded-lg text-sm ${activeTab==='financial'?'bg-blue-600 text-white':'bg-gray-800 text-gray-300'}`}>درخواست مالی</button>
              <button onClick={()=>setActiveTab('letter')} className={`px-3 py-1 rounded-lg text-sm ${activeTab==='letter'?'bg-blue-600 text-white':'bg-gray-800 text-gray-300'}`}>درخواست معرفی‌نامه</button>
              <button onClick={()=>setActiveTab('list')} className={`px-3 py-1 rounded-lg text-sm ${activeTab==='list'?'bg-blue-600 text-white':'bg-gray-800 text-gray-300'}`}>لیست درخواست‌ها</button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab==='leave' && (
            <div className="max-w-3xl mx-auto bg-gray-900/80 border border-gray-700/50 rounded-2xl p-6">
              <form onSubmit={submitLeave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">نوع مرخصی</label>
                    <select value={leaveType} onChange={e=>setLeaveType(e.target.value as any)} className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white">
                      <option value="daily">روزانه</option>
                      <option value="hourly">ساعتی</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">تاریخ شروع</label>
                    <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"/>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">تاریخ پایان</label>
                    <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"/>
                  </div>
                </div>
                {leaveType==='hourly' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">از ساعت</label>
                      <input type="time" value={startTime} onChange={e=>setStartTime(e.target.value)} className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"/>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">تا ساعت</label>
                      <input type="time" value={endTime} onChange={e=>setEndTime(e.target.value)} className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"/>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">توضیحات</label>
                  <textarea rows={3} value={leaveDesc} onChange={e=>setLeaveDesc(e.target.value)} className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white" placeholder="توضیحات اختیاری"/>
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={sendingLeave} className="px-6 py-3 rounded-lg bg-blue-600 text-white disabled:opacity-50">{sendingLeave?'در حال ارسال...':'ارسال به مدیر'}</button>
                </div>
              </form>
            </div>
          )}

          {activeTab==='financial' && (
            <div className="max-w-3xl mx-auto bg-gray-900/80 border border-gray-700/50 rounded-2xl p-6">
              <form onSubmit={submitFinancial} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">عنوان درخواست</label>
                  <input value={finTitle} onChange={e=>setFinTitle(e.target.value)} className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white" placeholder="مثال: مساعده حقوق"/>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">متن درخواست</label>
                  <textarea rows={4} value={finBody} onChange={e=>setFinBody(e.target.value)} className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white" placeholder="توضیحات کامل درخواست"/>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">پیوست مدارک</label>
                  <input ref={finInputRef} type="file" multiple onChange={onPickFinFiles} className="hidden"/>
                  <button type="button" onClick={()=>finInputRef.current?.click()} className="px-4 py-2 rounded-lg bg-gray-800 text-gray-200 border border-gray-700">انتخاب فایل</button>
                  {!!finFiles.length && (
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                      {finFiles.map((f, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-xs text-gray-300">
                          <div className="truncate">{f.name}</div>
                          {finPreviews[idx] && f.type.startsWith('image/') && (
                            <img src={finPreviews[idx]} className="mt-1 w-full h-20 object-cover rounded" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={sendingFin} className="px-6 py-3 rounded-lg bg-blue-600 text-white disabled:opacity-50">{sendingFin?'در حال ارسال...':'ارسال به مدیر'}</button>
                </div>
              </form>
            </div>
          )}

          {activeTab==='letter' && (
            <div className="max-w-3xl mx-auto bg-gray-900/80 border border-gray-700/50 rounded-2xl p-6">
              <form onSubmit={submitLetter} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">عنوان سازمان یا ارگان مقصد</label>
                  <input
                    value={organization}
                    onChange={e=>setOrganization(e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    placeholder="نام سازمان/ارگان مقصد را وارد کنید"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">توضیحات</label>
                  <textarea rows={3} value={letterDesc} onChange={e=>setLetterDesc(e.target.value)} className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white" placeholder="توضیحات اختیاری"/>
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={sendingLetter} className="px-6 py-3 rounded-lg bg-blue-600 text-white disabled:opacity-50">{sendingLetter?'در حال ارسال...':'ارسال به مدیر'}</button>
                </div>
              </form>
            </div>
          )}

          {activeTab==='list' && (
            <div className="max-w-4xl mx-auto">
              {renderList()}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
