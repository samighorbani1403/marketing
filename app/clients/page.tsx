'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import ClientCard from '@/components/ClientCard'

interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  company?: string
  city?: string
  source?: string
  status: string
  stage?: string
  notes?: string
  createdAt: string
  sentToManager?: boolean
  isContractual?: boolean
  approvalPercentage?: number
  invoices?: Invoice[]
}

interface Invoice {
  id: string
  clientId: string
  type: 'quotation' | 'invoice'
  number: string
  amount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  createdAt: string
  dueDate?: string
  payments?: Payment[]
}

interface Payment {
  id: string
  invoiceId: string
  amount: number
  method: string
  date: string
  reference?: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [clientType, setClientType] = useState<'all' | 'regular' | 'contractual'>('all')
  const [draggedClient, setDraggedClient] = useState<Client | null>(null)

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
      } else {
        console.error('Failed to fetch clients')
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'potential':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'inactive':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      case 'lost':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'فعال'
      case 'potential':
        return 'پتانسیل'
      case 'inactive':
        return 'غیرفعال'
      case 'lost':
        return 'از دست رفته'
      default:
        return 'نامشخص'
    }
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'lead':
        return 'bg-blue-500/20 text-blue-400'
      case 'qualified':
        return 'bg-purple-500/20 text-purple-400'
      case 'proposal':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'negotiation':
        return 'bg-orange-500/20 text-orange-400'
      case 'closed':
        return 'bg-green-500/20 text-green-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getStageText = (stage: string) => {
    switch (stage) {
      case 'lead':
        return 'لید'
      case 'qualified':
        return 'کوالیفای شده'
      case 'proposal':
        return 'پیشنهاد'
      case 'negotiation':
        return 'مذاکره'
      case 'closed':
        return 'بسته شده'
      default:
        return 'نامشخص'
    }
  }

  const handleCreateClient = () => {
    router.push('/clients/new')
  }

  const handleSendToManager = async (clientId: string) => {
    if (confirm('آیا مطمئن هستید که می‌خواهید این مشتری را به پنل مدیر ارسال کنید؟')) {
      try {
        const response = await fetch(`/api/clients/${clientId}/send-to-manager`, {
          method: 'POST',
        })

        if (response.ok) {
          // Update client status locally
          setClients(prevClients => 
            prevClients.map(client => 
              client.id === clientId 
                ? { ...client, sentToManager: true, status: 'approved' }
                : client
            )
          )
          alert('مشتری با موفقیت به پنل مدیر ارسال شد')
        } else {
          alert('خطا در ارسال مشتری به مدیر')
        }
      } catch (error) {
        console.error('Error sending client to manager:', error)
        alert('خطا در ارسال مشتری به مدیر')
      }
    }
  }

  const handleCreateQuotation = (clientId: string) => {
    router.push(`/invoices/new?clientId=${clientId}&type=quotation`)
  }

  const handleCreateInvoice = (clientId: string) => {
    router.push(`/invoices/new?clientId=${clientId}&type=invoice`)
  }

  const handleViewInvoices = (clientId: string) => {
    router.push(`/invoices?clientId=${clientId}`)
  }

  const handleApproveClient = async (clientId: string) => {
    if (confirm('آیا مطمئن هستید که می‌خواهید این مشتری را 100% تأیید کنید و به لیست مشتریان قراردادی بازاریاب منتقل کنید؟')) {
      try {
        const response = await fetch(`/api/clients/${clientId}/approve`, {
          method: 'POST',
        })

        if (response.ok) {
          // Update client status locally
          setClients(prevClients => 
            prevClients.map(client => 
              client.id === clientId 
                ? { ...client, isContractual: true, approvalPercentage: 100, status: 'contractual' }
                : client
            )
          )
          alert('مشتری با موفقیت تأیید شد و به لیست مشتریان قراردادی بازاریاب منتقل شد')
        } else {
          alert('خطا در تأیید مشتری')
        }
      } catch (error) {
        console.error('Error approving client:', error)
        alert('خطا در تأیید مشتری')
      }
    }
  }

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, client: Client) => {
    setDraggedClient(client)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', client.id)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedClient(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetClient: Client) => {
    e.preventDefault()
    
    if (!draggedClient || draggedClient.id === targetClient.id) {
      return
    }

    // Swap positions of dragged and target clients
    setClients(prevClients => {
      const newClients = [...prevClients]
      const draggedIndex = newClients.findIndex(c => c.id === draggedClient.id)
      const targetIndex = newClients.findIndex(c => c.id === targetClient.id)
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        // Swap the clients
        [newClients[draggedIndex], newClients[targetIndex]] = [newClients[targetIndex], newClients[draggedIndex]]
      }
      
      return newClients
    })

    setDraggedClient(null)
  }

  const handleEditClient = (clientId: string) => {
    router.push(`/clients/edit/${clientId}`)
  }

  const handleViewDetails = (clientId: string) => {
    router.push(`/clients/${clientId}`)
  }

  const handleDeleteClient = async (clientId: string) => {
    if (confirm('آیا مطمئن هستید که می‌خواهید این مشتری را حذف کنید؟')) {
      try {
        const response = await fetch(`/api/clients/${clientId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          const result = await response.json()
          console.log('✅ Client deleted successfully:', result.deletedClient)
          
          // Refresh clients list
          fetchClients()
          
          // Show success message
          alert(`مشتری "${result.deletedClient.name}" با موفقیت حذف شد`)
        } else {
          const errorData = await response.json()
          console.error('❌ Failed to delete client:', errorData)
          alert('خطا در حذف مشتری: ' + (errorData.error || 'خطای نامشخص'))
        }
      } catch (error) {
        console.error('❌ Error deleting client:', error)
        alert('خطا در حذف مشتری')
      }
    }
  }

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.company?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus
    const matchesType = clientType === 'all' || 
                       (clientType === 'regular' && !client.isContractual) ||
                       (clientType === 'contractual' && client.isContractual)
    return matchesSearch && matchesStatus && matchesType
  })

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
                  مدیریت مشتریان
                </h1>
                <p className="text-gray-400 mt-1">مدیریت و پیگیری مشتریان و لیدها</p>
              </div>
              <button
                onClick={handleCreateClient}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>مشتری جدید</span>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-white">{clients.length}</p>
                      <p className="text-sm text-blue-300">کل مشتریان</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-white">{clients.filter(c => c.status === 'active').length}</p>
                      <p className="text-sm text-green-300">مشتریان فعال</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-white">{clients.filter(c => c.status === 'potential').length}</p>
                      <p className="text-sm text-yellow-300">پتانسیل‌ها</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-white">{clients.filter(c => c.stage === 'lead').length}</p>
                      <p className="text-sm text-purple-300">لیدهای جدید</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6 mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="جستجو در مشتریان..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-10 pl-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                  </div>
                  <div className="md:w-64">
                    <select
                      value={clientType}
                      onChange={(e) => setClientType(e.target.value as 'all' | 'regular' | 'contractual')}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="all">همه مشتریان</option>
                      <option value="regular">مشتریان عادی</option>
                      <option value="contractual">مشتریان قراردادی بازاریاب</option>
                    </select>
                  </div>
                  <div className="md:w-64">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="all">همه وضعیت‌ها</option>
                      <option value="active">فعال</option>
                      <option value="potential">پتانسیل</option>
                      <option value="inactive">غیرفعال</option>
                      <option value="lost">از دست رفته</option>
                      <option value="contractual">قراردادی</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Clients Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredClients.map((client) => (
                  <ClientCard
                    key={client.id}
                    client={client}
                    onEdit={handleEditClient}
                    onViewDetails={handleViewDetails}
                    onCreateQuotation={handleCreateQuotation}
                    onCreateInvoice={handleCreateInvoice}
                    onViewInvoices={handleViewInvoices}
                    onApproveClient={handleApproveClient}
                    onSendToManager={handleSendToManager}
                    onDelete={handleDeleteClient}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  />
                ))}
              </div>

              {/* Empty State */}
              {filteredClients.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">هیچ مشتری یافت نشد</h3>
                  <p className="text-gray-400 mb-6">برای شروع، مشتری جدیدی ایجاد کنید</p>
                  <button
                    onClick={handleCreateClient}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    ایجاد مشتری جدید
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}