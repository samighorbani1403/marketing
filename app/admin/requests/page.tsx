'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminSidebar from '@/components/AdminSidebar'

interface Request {
  id: string
  type: 'leave' | 'reference'
  employeeId?: string
  employeeName: string
  employeePosition?: string
  status: 'pending' | 'approved' | 'rejected'
  leaveStartDate?: string
  leaveEndDate?: string
  leaveDays?: number
  leaveReason?: string
  leaveType?: string
  referencePurpose?: string
  referenceText?: string
  managerResponse?: string
  managerResponseDate?: string
  respondedBy?: string
  createdAt: string
}

export default function AdminRequestsPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<Request[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pending' | 'leave' | 'reference' | 'archive'>('pending')
  const [filterEmployee, setFilterEmployee] = useState('')
  const [filterPosition, setFilterPosition] = useState('')
  const [employees, setEmployees] = useState<Array<{ id: string; fullName: string; position?: string }>>([])
  
  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'approve' | 'reject' | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [responseText, setResponseText] = useState('')

  useEffect(() => {
    fetchRequests()
    fetchEmployees()
  }, [activeTab, filterEmployee, filterPosition])

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees')
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.employees) {
          setEmployees(data.employees.map((emp: any) => ({
            id: emp.id,
            fullName: emp.fullName,
            position: emp.position
          })))
        }
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const fetchRequests = async () => {
    setIsLoading(true)
    try {
      // For archive, fetch all requests (approved and rejected)
      if (activeTab === 'archive') {
        const [approvedRes, rejectedRes] = await Promise.all([
          fetch('/api/requests?status=approved'),
          fetch('/api/requests?status=rejected')
        ])
        
        const approvedData = approvedRes.ok ? await approvedRes.json() : { requests: [] }
        const rejectedData = rejectedRes.ok ? await rejectedRes.json() : { requests: [] }
        
        let allRequests = [
          ...(approvedData.requests || []),
          ...(rejectedData.requests || [])
        ]
        
        // Apply filters
        if (filterEmployee) {
          allRequests = allRequests.filter((req: Request) => req.employeeId === filterEmployee)
        }
        
        if (filterPosition) {
          allRequests = allRequests.filter((req: Request) => req.employeePosition === filterPosition)
        }
        
        // Sort by date
        allRequests.sort((a: Request, b: Request) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        
        setRequests(allRequests)
        setIsLoading(false)
        return
      }

      // For other tabs
      let url = '/api/requests?'
      
      if (activeTab === 'pending') {
        url += 'status=pending'
      } else if (activeTab === 'leave') {
        url += 'type=leave'
      } else if (activeTab === 'reference') {
        url += 'type=reference'
      }
      
      if (filterEmployee) {
        url += `&employeeId=${filterEmployee}`
      }
      
      if (filterPosition) {
        url += `&position=${filterPosition}`
      }

      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.requests) {
          setRequests(data.requests)
        }
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const openModal = (type: 'approve' | 'reject', request: Request) => {
    setModalType(type)
    setSelectedRequest(request)
    setResponseText('')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setModalType(null)
    setSelectedRequest(null)
    setResponseText('')
  }

  const handleApprove = async () => {
    if (!selectedRequest) return

    try {
      const res = await fetch(`/api/requests/${selectedRequest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'approved',
          managerResponse: responseText.trim() || 'تایید شد',
          respondedBy: 'مدیر سیستم'
        })
      })

      if (res.ok) {
        closeModal()
        fetchRequests()
      } else {
        alert('خطا در تایید درخواست')
      }
    } catch (error) {
      console.error('Error approving request:', error)
      alert('خطا در اتصال به سرور')
    }
  }

  const handleReject = async () => {
    if (!selectedRequest) return

    if (!responseText.trim()) {
      alert('لطفاً دلیل رد را وارد کنید')
      return
    }

    try {
      const res = await fetch(`/api/requests/${selectedRequest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejected',
          managerResponse: responseText.trim(),
          respondedBy: 'مدیر سیستم'
        })
      })

      if (res.ok) {
        closeModal()
        fetchRequests()
      } else {
        alert('خطا در رد درخواست')
      }
    } catch (error) {
      console.error('Error rejecting request:', error)
      alert('خطا در اتصال به سرور')
    }
  }

  const handlePrint = (request: Request) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="fa">
      <head>
        <meta charset="UTF-8">
        <title>درخواست ${request.type === 'leave' ? 'مرخصی' : 'معرفی نامه'}</title>
        <style>
          body { font-family: 'Arial', sans-serif; padding: 40px; line-height: 1.8; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
          .content { margin: 20px 0; }
          .field { margin: 15px 0; }
          .label { font-weight: bold; display: inline-block; width: 150px; }
          .value { display: inline-block; }
          .footer { margin-top: 40px; text-align: left; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${request.type === 'leave' ? 'درخواست مرخصی' : 'درخواست معرفی نامه'}</h1>
          <p>شرکت آتامان</p>
        </div>
        <div class="content">
          <div class="field">
            <span class="label">نام کارمند:</span>
            <span class="value">${request.employeeName}</span>
          </div>
          ${request.employeePosition ? `
          <div class="field">
            <span class="label">سمت شغلی:</span>
            <span class="value">${request.employeePosition}</span>
          </div>
          ` : ''}
          ${request.type === 'leave' ? `
          <div class="field">
            <span class="label">تاریخ شروع:</span>
            <span class="value">${request.leaveStartDate ? new Date(request.leaveStartDate).toLocaleDateString('fa-IR') : '—'}</span>
          </div>
          <div class="field">
            <span class="label">تاریخ پایان:</span>
            <span class="value">${request.leaveEndDate ? new Date(request.leaveEndDate).toLocaleDateString('fa-IR') : '—'}</span>
          </div>
          <div class="field">
            <span class="label">تعداد روز:</span>
            <span class="value">${request.leaveDays || '—'}</span>
          </div>
          <div class="field">
            <span class="label">نوع مرخصی:</span>
            <span class="value">${request.leaveType || '—'}</span>
          </div>
          <div class="field">
            <span class="label">دلیل:</span>
            <span class="value">${request.leaveReason || '—'}</span>
          </div>
          ` : `
          <div class="field">
            <span class="label">هدف:</span>
            <span class="value">${request.referencePurpose || '—'}</span>
          </div>
          <div class="field">
            <span class="label">توضیحات:</span>
            <span class="value">${request.referenceText || '—'}</span>
          </div>
          `}
          <div class="field">
            <span class="label">وضعیت:</span>
            <span class="value">${request.status === 'pending' ? 'در انتظار بررسی' : request.status === 'approved' ? 'تایید شده' : 'رد شده'}</span>
          </div>
          ${request.managerResponse ? `
          <div class="field">
            <span class="label">پاسخ مدیر:</span>
            <span class="value">${request.managerResponse}</span>
          </div>
          ` : ''}
        </div>
        <div class="footer">
          <p>تاریخ: ${new Date(request.createdAt).toLocaleDateString('fa-IR')}</p>
        </div>
      </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-900/40 text-green-300 border border-green-700/50">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            تایید شده
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-900/40 text-red-300 border border-red-700/50">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            رد شده
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-900/40 text-yellow-300 border border-yellow-700/50">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            در انتظار بررسی
          </span>
        )
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const uniquePositions = Array.from(new Set(employees.map(e => e.position).filter(Boolean)))

  const pendingCount = requests.filter(r => r.status === 'pending').length

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex overflow-hidden" dir="rtl">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl">
          <div className="px-6 py-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              مدیریت درخواست‌ها
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-700">
            <button
              onClick={() => setActiveTab('pending')}
              className={`relative px-6 py-3 rounded-t-lg transition-all duration-200 ${
                activeTab === 'pending'
                  ? 'bg-gradient-to-br from-blue-600 to-purple-700 text-white shadow-lg'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                درخواست‌های جدید
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{pendingCount}</span>
                )}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('leave')}
              className={`px-6 py-3 rounded-t-lg transition-all duration-200 ${
                activeTab === 'leave'
                  ? 'bg-gradient-to-br from-blue-600 to-purple-700 text-white shadow-lg'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                مرخصی‌ها
              </span>
            </button>
            <button
              onClick={() => setActiveTab('reference')}
              className={`px-6 py-3 rounded-t-lg transition-all duration-200 ${
                activeTab === 'reference'
                  ? 'bg-gradient-to-br from-blue-600 to-purple-700 text-white shadow-lg'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                معرفی نامه‌ها
              </span>
            </button>
            <button
              onClick={() => setActiveTab('archive')}
              className={`px-6 py-3 rounded-t-lg transition-all duration-200 ${
                activeTab === 'archive'
                  ? 'bg-gradient-to-br from-blue-600 to-purple-700 text-white shadow-lg'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                آرشیو
              </span>
            </button>
          </div>

          {/* Filters */}
          {(activeTab === 'archive' || activeTab === 'leave' || activeTab === 'reference') && (
            <div className="mb-6 flex gap-4 flex-wrap">
              <select
                value={filterEmployee}
                onChange={e => setFilterEmployee(e.target.value)}
                className="px-4 py-2.5 bg-gray-800/80 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none transition"
              >
                <option value="">همه کارمندان</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                ))}
              </select>
              <select
                value={filterPosition}
                onChange={e => setFilterPosition(e.target.value)}
                className="px-4 py-2.5 bg-gray-800/80 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none transition"
              >
                <option value="">همه سمت‌ها</option>
                {uniquePositions.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>
          )}

          {/* Requests List */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-400">در حال بارگذاری...</p>
              </div>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-block p-6 bg-gray-900/60 rounded-2xl border border-gray-800">
                <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-400 text-lg">درخواستی یافت نشد</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {requests.map(req => (
                <div key={req.id} className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 shadow-xl">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-700/50">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {req.employeeName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg mb-1">{req.employeeName}</h3>
                        {req.employeePosition && (
                          <p className="text-gray-400 text-sm flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {req.employeePosition}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(req.status)}
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        req.type === 'leave'
                          ? 'bg-blue-900/40 text-blue-300 border border-blue-700/50'
                          : 'bg-purple-900/40 text-purple-300 border border-purple-700/50'
                      }`}>
                        {req.type === 'leave' ? 'مرخصی' : 'معرفی نامه'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-3 mb-4">
                    {req.type === 'leave' && (
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-gray-800/40 rounded-lg p-3">
                          <div className="text-gray-500 text-xs mb-1">از تاریخ</div>
                          <div className="text-white font-medium">
                            {req.leaveStartDate ? new Date(req.leaveStartDate).toLocaleDateString('fa-IR') : '—'}
                          </div>
                        </div>
                        <div className="bg-gray-800/40 rounded-lg p-3">
                          <div className="text-gray-500 text-xs mb-1">تا تاریخ</div>
                          <div className="text-white font-medium">
                            {req.leaveEndDate ? new Date(req.leaveEndDate).toLocaleDateString('fa-IR') : '—'}
                          </div>
                        </div>
                        <div className="bg-gray-800/40 rounded-lg p-3">
                          <div className="text-gray-500 text-xs mb-1">تعداد روز</div>
                          <div className="text-white font-medium">{req.leaveDays || '—'}</div>
                        </div>
                        {req.leaveType && (
                          <div className="bg-gray-800/40 rounded-lg p-3">
                            <div className="text-gray-500 text-xs mb-1">نوع</div>
                            <div className="text-white font-medium">{req.leaveType}</div>
                          </div>
                        )}
                      </div>
                    )}

                    {req.type === 'reference' && (
                      <div className="space-y-2 text-sm">
                        {req.referencePurpose && (
                          <div className="bg-gray-800/40 rounded-lg p-3">
                            <div className="text-gray-500 text-xs mb-1">هدف درخواست</div>
                            <div className="text-white">{req.referencePurpose}</div>
                          </div>
                        )}
                        {req.referenceText && (
                          <div className="bg-gray-800/40 rounded-lg p-3">
                            <div className="text-gray-500 text-xs mb-1">توضیحات</div>
                            <div className="text-white">{req.referenceText}</div>
                          </div>
                        )}
                      </div>
                    )}

                    {req.leaveReason && (
                      <div className="bg-gray-800/40 rounded-lg p-3">
                        <div className="text-gray-500 text-xs mb-1">دلیل</div>
                        <div className="text-white text-sm">{req.leaveReason}</div>
                      </div>
                    )}

                    {req.managerResponse && (
                      <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-700/50 rounded-lg p-3 mt-4">
                        <div className="text-purple-300 text-xs font-semibold mb-1 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          پاسخ مدیر
                        </div>
                        <div className="text-purple-100 text-sm">{req.managerResponse}</div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatDate(req.createdAt)}
                    </div>
                    <div className="flex gap-2">
                      {req.status === 'pending' && (
                        <>
                          <button
                            onClick={() => openModal('approve', req)}
                            className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-lg"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            تایید
                          </button>
                          <button
                            onClick={() => openModal('reject', req)}
                            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-lg"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            رد
                          </button>
                        </>
                      )}
                      {(req.type === 'leave' || req.type === 'reference') && (
                        <button
                          onClick={() => handlePrint(req)}
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                          پرینت
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={closeModal}>
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-4">
              {modalType === 'approve' ? 'تایید درخواست' : 'رد درخواست'}
            </h3>
            <p className="text-gray-300 mb-4">
              {modalType === 'approve' 
                ? `آیا از تایید درخواست ${selectedRequest.type === 'leave' ? 'مرخصی' : 'معرفی نامه'} ${selectedRequest.employeeName} اطمینان دارید؟`
                : 'لطفاً دلیل رد درخواست را وارد کنید:'}
            </p>
            <textarea
              value={responseText}
              onChange={e => setResponseText(e.target.value)}
              placeholder={modalType === 'approve' ? 'نظر خود را وارد کنید (اختیاری)' : 'دلیل رد درخواست...'}
              rows={4}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none resize-none mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
              >
                انصراف
              </button>
              <button
                onClick={modalType === 'approve' ? handleApprove : handleReject}
                className={`px-4 py-2 text-white rounded-lg transition ${
                  modalType === 'approve'
                    ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600'
                    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600'
                }`}
              >
                {modalType === 'approve' ? 'تایید' : 'رد'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
