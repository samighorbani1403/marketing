'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface Payment {
  id: string
  amount: number
  method: string
  date: string
  reference?: string
}

interface Invoice {
  id: string
  clientId: string
  type: 'quotation' | 'invoice'
  number: string
  date: string
  dueDate?: string
  items: InvoiceItem[]
  payments: Payment[]
  subtotal: number
  discount: number
  tax: number
  total: number
  paidAmount: number
  remainingAmount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  notes: string
  terms: string
  createdAt: string
}

interface Client {
  id: string
  name: string
  company?: string
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    fetchInvoices()
    fetchClients()
  }, [filterType, filterStatus])

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices')
      if (response.ok) {
        const data = await response.json()
        setInvoices(data.invoices)
      } else {
        console.error('Failed to fetch invoices')
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setIsLoading(false)
    }
  }

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

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId)
    return client ? client.name : 'نامشخص'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      case 'sent':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'paid':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'overdue':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return 'پیش‌نویس'
      case 'sent':
        return 'ارسال شده'
      case 'paid':
        return 'پرداخت شده'
      case 'overdue':
        return 'سررسید گذشته'
      default:
        return 'نامشخص'
    }
  }

  const getTypeText = (type: string) => {
    return type === 'quotation' ? 'پیش فاکتور' : 'فاکتور'
  }

  const getTypeColor = (type: string) => {
    return type === 'quotation' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-orange-500/20 text-orange-400'
  }

  const handleCreateInvoice = (type: 'quotation' | 'invoice') => {
    router.push(`/invoices/new?type=${type}`)
  }

  const handleViewInvoice = (invoiceId: string) => {
    router.push(`/invoices/${invoiceId}`)
  }

  const handleEditInvoice = (invoiceId: string) => {
    router.push(`/invoices/edit/${invoiceId}`)
  }

  const handleMarkComplete = async (invoice: Invoice) => {
    if (!confirm('این فاکتور به‌عنوان تکمیل‌شده علامت‌گذاری شود؟')) return
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/complete`, { method: 'POST' })
      if (res.ok) {
        setInvoices(prev => prev.map(inv => inv.id === invoice.id
          ? { ...inv, status: 'paid', paidAmount: inv.total, remainingAmount: 0 }
          : inv
        ))
        alert('فاکتور با موفقیت تکمیل شد')
      } else {
        const err = await res.json()
        alert(err.error || 'خطا در تکمیل فاکتور')
      }
    } catch (e) {
      alert('خطای شبکه در تکمیل فاکتور')
    }
  }

  const handleRegisterPayment = async (invoice: Invoice) => {
    const raw = prompt('مبلغ واریزی مشتری (تومان) را وارد کنید:')
    if (!raw) return
    const amount = parseInt(raw.replace(/[,\s]/g, ''))
    if (!amount || amount <= 0) {
      alert('مبلغ نامعتبر است')
      return
    }

    try {
      const response = await fetch(`/api/invoices/${invoice.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, method: 'cash' }),
      })
      if (response.ok) {
        const data = await response.json()
        // Update local state
        setInvoices(prev => prev.map(inv => {
          if (inv.id !== invoice.id) return inv
          const newPaid = inv.paidAmount + amount
          const newRemaining = Math.max(inv.total - newPaid, 0)
          const newStatus = newRemaining === 0 ? 'paid' : (inv.status === 'draft' ? 'sent' : inv.status)
          const newPayments = [...(inv.payments || []), data.payment]
          return { ...inv, paidAmount: newPaid, remainingAmount: newRemaining, status: newStatus, payments: newPayments }
        }))
        alert('واریز با موفقیت ثبت شد')
      } else {
        const err = await response.json()
        alert(err.error || 'خطا در ثبت واریز')
      }
    } catch (e) {
      alert('خطای شبکه در ثبت واریز')
    }
  }

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (confirm('آیا مطمئن هستید که می‌خواهید این فاکتور را حذف کنید؟')) {
      try {
        const response = await fetch(`/api/invoices/${invoiceId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          const result = await response.json()
          console.log('✅ Invoice deleted successfully:', result.deletedInvoice)
          
          // Refresh invoices list
          fetchInvoices()
          
          // Show success message
          alert(`فاکتور "${result.deletedInvoice.number}" با موفقیت حذف شد`)
        } else {
          const errorData = await response.json()
          console.error('❌ Failed to delete invoice:', errorData)
          alert('خطا در حذف فاکتور: ' + (errorData.error || 'خطای نامشخص'))
        }
      } catch (error) {
        console.error('❌ Error deleting invoice:', error)
        alert('خطا در حذف فاکتور')
      }
    }
  }

  const generatePDF = (invoiceId: string) => {
    // Open invoice details page in new tab for PDF generation
    window.open(`/invoices/${invoiceId}?pdf=true`, '_blank')
  }

  const filteredInvoices = invoices.filter(invoice => {
    if (filterType !== 'all' && invoice.type !== filterType) return false
    if (filterStatus !== 'all' && invoice.status !== filterStatus) return false
    return true
  })

  const calculateStats = () => {
    const totalInvoices = invoices.length
    const totalQuotations = invoices.filter(i => i.type === 'quotation').length
    const totalInvoicesOnly = invoices.filter(i => i.type === 'invoice').length
    const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.total, 0)
    const paidAmount = invoices.reduce((sum, invoice) => sum + invoice.paidAmount, 0)
    const pendingAmount = invoices.reduce((sum, invoice) => sum + invoice.remainingAmount, 0)

    return {
      totalInvoices,
      totalQuotations,
      totalInvoicesOnly,
      totalAmount,
      paidAmount,
      pendingAmount
    }
  }

  const stats = calculateStats()

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
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
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  مدیریت فاکتورها
                </h1>
                <p className="text-gray-400 mt-1">مدیریت پیش فاکتورها و فاکتورها</p>
              </div>
              <div className="flex space-x-3 space-x-reverse">
                <button
                  onClick={() => handleCreateInvoice('quotation')}
                  className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <svg className="w-5 h-5 inline-block ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  پیش فاکتور جدید
                </button>
                <button
                  onClick={() => handleCreateInvoice('invoice')}
                  className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <svg className="w-5 h-5 inline-block ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  فاکتور جدید
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalInvoices}</p>
                  <p className="text-sm text-blue-300">کل فاکتورها</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalQuotations}</p>
                  <p className="text-sm text-yellow-300">پیش فاکتورها</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{stats.paidAmount.toLocaleString()}</p>
                  <p className="text-sm text-green-300">مبلغ پرداخت شده</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-600/20 to-red-800/20 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{stats.pendingAmount.toLocaleString()}</p>
                  <p className="text-sm text-red-300">مبلغ باقی‌مانده</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl mb-8">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">نوع</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="all">همه</option>
                  <option value="quotation">پیش فاکتور</option>
                  <option value="invoice">فاکتور</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">وضعیت</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="all">همه</option>
                  <option value="draft">پیش‌نویس</option>
                  <option value="sent">ارسال شده</option>
                  <option value="paid">پرداخت شده</option>
                  <option value="overdue">سررسید گذشته</option>
                </select>
              </div>
            </div>
          </div>

          {/* Invoices List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInvoices.map((invoice) => (
              <div key={invoice.id} className="group relative bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden hover:border-blue-500/50 transition-all duration-300">
                {invoice.status === 'paid' && (
                  <div className="absolute top-3 left-3 z-10">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-600/20 text-emerald-300 border border-emerald-500/30">
                      <svg className="w-3.5 h-3.5 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      تکمیل شد
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{invoice.number}</h3>
                      <p className="text-gray-400 text-sm">{getClientName(invoice.clientId)}</p>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                        {getStatusText(invoice.status)}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(invoice.type)}`}>
                        {getTypeText(invoice.type)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-300 mb-4">
                    <div className="flex justify-between">
                      <span>تاریخ:</span>
                      <span>{invoice.date}</span>
                    </div>
                    {invoice.dueDate && (
                      <div className="flex justify-between">
                        <span>سررسید:</span>
                        <span>{invoice.dueDate}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>مبلغ کل:</span>
                      <span className="text-white font-medium">{invoice.total.toLocaleString()} تومان</span>
                    </div>
                    {invoice.type === 'invoice' && (
                      <>
                        <div className="flex justify-between">
                          <span>پرداخت شده:</span>
                          <span className="text-green-400">{invoice.paidAmount.toLocaleString()} تومان</span>
                        </div>
                        <div className="flex justify-between">
                          <span>باقی‌مانده:</span>
                          <span className={`${invoice.remainingAmount > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                            {invoice.remainingAmount.toLocaleString()} تومان
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Progress Bar for Invoices */}
                  {invoice.type === 'invoice' && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>پیشرفت پرداخت</span>
                        <span>{Math.round((invoice.paidAmount / invoice.total) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                          style={{ width: `${(invoice.paidAmount / invoice.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Invoice Actions */}
                <div className="p-6 border-t border-gray-700/50 bg-gray-800/30">
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button
                      onClick={() => handleViewInvoice(invoice.id)}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105"
                    >
                      مشاهده
                    </button>
                    <button
                      onClick={() => handleEditInvoice(invoice.id)}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105"
                    >
                      ویرایش
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <button
                      onClick={() => generatePDF(invoice.id)}
                      className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105"
                    >
                      PDF
                    </button>
                    {(invoice.type === 'quotation' || invoice.remainingAmount > 0) && (
                      <button
                        onClick={() => handleRegisterPayment(invoice)}
                        className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105"
                      >
                        ثبت واریز
                      </button>
                    )}
                    {invoice.remainingAmount === 0 && invoice.status !== 'paid' && (
                      <button
                        onClick={() => handleMarkComplete(invoice)}
                        className="bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-600 hover:to-emerald-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105"
                      >
                        تیک تکمیل
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteInvoice(invoice.id)}
                      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredInvoices.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">هیچ فاکتوری یافت نشد</h3>
              <p className="text-gray-400 mb-6">برای شروع، فاکتور یا پیش فاکتور جدیدی ایجاد کنید</p>
              <div className="flex justify-center space-x-4 space-x-reverse">
                <button
                  onClick={() => handleCreateInvoice('quotation')}
                  className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  ایجاد پیش فاکتور
                </button>
                <button
                  onClick={() => handleCreateInvoice('invoice')}
                  className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  ایجاد فاکتور
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
