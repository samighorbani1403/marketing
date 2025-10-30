'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

interface Project {
  id: string
  name: string
  client: string
  clientEmail?: string
  clientPhone?: string
  budget: number
  startDate: string
  endDate?: string
  description?: string
  priority: string
  status: string
  progress: number
  createdAt: string
}

export default function ProjectDetailsPage() {
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    if (params.id) {
      fetchProject(params.id as string)
    }
  }, [params.id])

  const fetchProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data.project)
      } else {
        console.error('Failed to fetch project')
        router.push('/projects')
      }
    } catch (error) {
      console.error('Error fetching project:', error)
      router.push('/projects')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'in-progress':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'pending':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'تکمیل شده'
      case 'in-progress':
        return 'در حال انجام'
      case 'pending':
        return 'در انتظار'
      default:
        return 'نامشخص'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'low':
        return 'bg-green-500/20 text-green-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'بالا'
      case 'medium':
        return 'متوسط'
      case 'low':
        return 'پایین'
      default:
        return 'نامشخص'
    }
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">پروژه یافت نشد</h1>
          <button
            onClick={() => router.push('/projects')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
          >
            بازگشت به لیست پروژه‌ها
          </button>
        </div>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 space-x-reverse">
                <button
                  onClick={() => router.push('/projects')}
                  className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {project.name}
                  </h1>
                  <p className="text-gray-400 mt-1">جزئیات پروژه</p>
                </div>
              </div>
              <div className="flex space-x-3 space-x-reverse">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(project.status)}`}>
                  {getStatusText(project.status)}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(project.priority)}`}>
                  {getPriorityText(project.priority)}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Project Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Info */}
                <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
                  <div className="p-6 border-b border-gray-700/50">
                    <h2 className="text-xl font-bold text-white flex items-center">
                      <svg className="w-6 h-6 text-blue-400 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      اطلاعات کلی
                    </h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">نام پروژه</label>
                        <p className="text-white font-medium">{project.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">مشتری</label>
                        <p className="text-white font-medium">{project.client}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">بودجه</label>
                        <p className="text-white font-medium">{project.budget.toLocaleString()} تومان</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">پیشرفت</label>
                        <p className="text-white font-medium">{project.progress}%</p>
                      </div>
                    </div>
                    
                    {project.description && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">توضیحات</label>
                        <p className="text-white">{project.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Client Info */}
                <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
                  <div className="p-6 border-b border-gray-700/50">
                    <h2 className="text-xl font-bold text-white flex items-center">
                      <svg className="w-6 h-6 text-green-400 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      اطلاعات مشتری
                    </h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">نام مشتری</label>
                      <p className="text-white font-medium">{project.client}</p>
                    </div>
                    {project.clientEmail && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">ایمیل</label>
                        <p className="text-white">{project.clientEmail}</p>
                      </div>
                    )}
                    {project.clientPhone && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">تلفن</label>
                        <p className="text-white">{project.clientPhone}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Progress */}
                <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
                  <div className="p-6 border-b border-gray-700/50">
                    <h2 className="text-xl font-bold text-white flex items-center">
                      <svg className="w-6 h-6 text-yellow-400 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      پیشرفت پروژه
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold text-white mb-2">{project.progress}%</div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
                  <div className="p-6 border-b border-gray-700/50">
                    <h2 className="text-xl font-bold text-white flex items-center">
                      <svg className="w-6 h-6 text-purple-400 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      زمان‌بندی
                    </h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">تاریخ شروع</label>
                      <p className="text-white">{project.startDate}</p>
                    </div>
                    {project.endDate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">تاریخ پایان</label>
                        <p className="text-white">{project.endDate}</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">تاریخ ایجاد</label>
                      <p className="text-white">{project.createdAt}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
                  <div className="p-6 border-b border-gray-700/50">
                    <h2 className="text-xl font-bold text-white flex items-center">
                      <svg className="w-6 h-6 text-red-400 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      عملیات
                    </h2>
                  </div>
                  <div className="p-6 space-y-3">
                    <button
                      onClick={() => router.push(`/projects/edit/${project.id}`)}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105"
                    >
                      ویرایش پروژه
                    </button>
                    <button
                      onClick={() => router.push('/projects')}
                      className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105"
                    >
                      بازگشت به لیست
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
