'use client'

import { useState } from 'react'

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
}

interface ClientCardProps {
  client: Client
  onEdit: (id: string) => void
  onViewDetails: (id: string) => void
  onCreateQuotation: (id: string) => void
  onCreateInvoice: (id: string) => void
  onViewInvoices: (id: string) => void
  onApproveClient: (id: string) => void
  onSendToManager: (id: string) => void
  onDelete: (id: string) => void
  onDragStart: (e: React.DragEvent, client: Client) => void
  onDragEnd: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, targetClient: Client) => void
}

export default function ClientCard({
  client,
  onEdit,
  onViewDetails,
  onCreateQuotation,
  onCreateInvoice,
  onViewInvoices,
  onApproveClient,
  onSendToManager,
  onDelete,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop
}: ClientCardProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    onDragStart(e, client)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false)
    onDragEnd(e)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    onDragOver(e)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    onDrop(e, client)
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`group bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-visible hover:border-gray-600/50 transition-all duration-300 hover:scale-105 cursor-move ${
        isDragging ? 'opacity-50 scale-95' : ''
      }`}
    >
      {/* Client Header */}
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                {client.name}
              </h3>
              
              {/* Compact Actions Button */}
              <div className="relative z-50">
                <button
                  onClick={() => {
                    const menu = document.getElementById(`menu-${client.id}`)
                    if (menu) {
                      menu.classList.toggle('hidden')
                    }
                  }}
                  className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white p-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg border border-gray-600/50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                <div
                  id={`menu-${client.id}`}
                  className="hidden absolute top-full left-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 overflow-hidden min-w-[200px]"
                >
                  {/* Edit */}
                  <button
                    onClick={() => {
                      onEdit(client.id)
                      document.getElementById(`menu-${client.id}`)?.classList.add('hidden')
                    }}
                    className="w-full text-right px-4 py-3 text-white hover:bg-gray-700 transition-colors duration-200 flex items-center"
                  >
                    <svg className="w-4 h-4 ml-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    ویرایش
                  </button>
                  
                  {/* Details */}
                  <button
                    onClick={() => {
                      onViewDetails(client.id)
                      document.getElementById(`menu-${client.id}`)?.classList.add('hidden')
                    }}
                    className="w-full text-right px-4 py-3 text-white hover:bg-gray-700 transition-colors duration-200 flex items-center"
                  >
                    <svg className="w-4 h-4 ml-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    جزئیات
                  </button>
                  
                  {/* Create Quotation */}
                  <button
                    onClick={() => {
                      onCreateQuotation(client.id)
                      document.getElementById(`menu-${client.id}`)?.classList.add('hidden')
                    }}
                    className="w-full text-right px-4 py-3 text-white hover:bg-gray-700 transition-colors duration-200 flex items-center"
                  >
                    <svg className="w-4 h-4 ml-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    پیش فاکتور
                  </button>
                  
                  {/* Create Invoice */}
                  <button
                    onClick={() => {
                      onCreateInvoice(client.id)
                      document.getElementById(`menu-${client.id}`)?.classList.add('hidden')
                    }}
                    className="w-full text-right px-4 py-3 text-white hover:bg-gray-700 transition-colors duration-200 flex items-center"
                  >
                    <svg className="w-4 h-4 ml-3 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    فاکتور
                  </button>
                  
                  {/* View Invoices */}
                  <button
                    onClick={() => {
                      onViewInvoices(client.id)
                      document.getElementById(`menu-${client.id}`)?.classList.add('hidden')
                    }}
                    className="w-full text-right px-4 py-3 text-white hover:bg-gray-700 transition-colors duration-200 flex items-center"
                  >
                    <svg className="w-4 h-4 ml-3 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    مشاهده فاکتورها
                  </button>
                  
                  {/* Approve Client */}
                  {client.status === 'active' && !client.isContractual && (
                    <button
                      onClick={() => {
                        onApproveClient(client.id)
                        document.getElementById(`menu-${client.id}`)?.classList.add('hidden')
                      }}
                      className="w-full text-right px-4 py-3 text-white hover:bg-gray-700 transition-colors duration-200 flex items-center"
                    >
                      <svg className="w-4 h-4 ml-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      تأیید 100% - قراردادی بازاریاب
                    </button>
                  )}
                  
                  {/* Send to Manager */}
                  {client.status === 'active' && !client.sentToManager && (
                    <button
                      onClick={() => {
                        onSendToManager(client.id)
                        document.getElementById(`menu-${client.id}`)?.classList.add('hidden')
                      }}
                      className="w-full text-right px-4 py-3 text-white hover:bg-gray-700 transition-colors duration-200 flex items-center"
                    >
                      <svg className="w-4 h-4 ml-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      ارسال به مدیر
                    </button>
                  )}
                  
                  {/* Status Indicators */}
                  {client.sentToManager && (
                    <div className="w-full text-right px-4 py-3 text-emerald-400 bg-emerald-600/10 border-t border-gray-600 flex items-center">
                      <svg className="w-4 h-4 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      ارسال شده به مدیر
                    </div>
                  )}
                  
                  {client.isContractual && (
                    <div className="w-full text-right px-4 py-3 text-emerald-400 bg-emerald-600/10 border-t border-gray-600 flex items-center">
                      <svg className="w-4 h-4 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      مشتری قراردادی بازاریاب (100% تأیید شده)
                    </div>
                  )}
                  
                  {/* Delete */}
                  <button
                    onClick={() => {
                      onDelete(client.id)
                      document.getElementById(`menu-${client.id}`)?.classList.add('hidden')
                    }}
                    className="w-full text-right px-4 py-3 text-red-400 hover:bg-red-600/10 transition-colors duration-200 flex items-center border-t border-gray-600"
                  >
                    <svg className="w-4 h-4 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    حذف
                  </button>
                </div>
              </div>
            </div>
            
            {client.company && (
              <p className="text-gray-400 text-sm mb-2">{client.company}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                client.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                client.status === 'potential' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                client.status === 'inactive' ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30' :
                client.status === 'lost' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                'bg-purple-500/20 text-purple-400 border border-purple-500/30'
              }`}>
                {client.status === 'active' ? 'فعال' :
                 client.status === 'potential' ? 'پتانسیل' :
                 client.status === 'inactive' ? 'غیرفعال' :
                 client.status === 'lost' ? 'از دست رفته' :
                 client.status === 'contractual' ? 'قراردادی' : 'نامشخص'}
              </span>
              {client.stage && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30">
                  {client.stage}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center text-gray-400 text-sm">
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {client.createdAt}
          </div>
        </div>
        
        {/* Client Details */}
        <div className="grid grid-cols-1 gap-2 text-sm text-gray-300">
          {client.email && (
            <div className="flex items-center">
              <svg className="w-4 h-4 text-gray-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{client.email}</span>
            </div>
          )}
          {client.phone && (
            <div className="flex items-center">
              <svg className="w-4 h-4 text-gray-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{client.phone}</span>
            </div>
          )}
          {client.city && (
            <div className="flex items-center">
              <svg className="w-4 h-4 text-gray-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{client.city}</span>
            </div>
          )}
          {client.source && (
            <div className="flex items-center">
              <svg className="w-4 h-4 text-gray-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="text-sm text-gray-300">{client.source}</span>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
