'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Mock data with more realistic analytics
  const revenueData = [
    { month: 'فروردین', revenue: 45000000, growth: 8.2 },
    { month: 'اردیبهشت', revenue: 52000000, growth: 15.6 },
    { month: 'خرداد', revenue: 48000000, growth: -7.7 },
    { month: 'تیر', revenue: 61000000, growth: 27.1 },
    { month: 'مرداد', revenue: 55000000, growth: -9.8 },
    { month: 'شهریور', revenue: 68000000, growth: 23.6 }
  ]

  const projectStats = [
    { status: 'تکمیل شده', count: 15, percentage: 62.5, color: 'from-green-500 to-green-600', icon: '✓' },
    { status: 'در حال انجام', count: 7, percentage: 29.2, color: 'from-yellow-500 to-yellow-600', icon: '⏳' },
    { status: 'در انتظار', count: 2, percentage: 8.3, color: 'from-blue-500 to-blue-600', icon: '⏸' }
  ]

  const clientStats = [
    { industry: 'فناوری', count: 8, revenue: 120000000, growth: 12.5, color: 'from-blue-500 to-blue-600' },
    { industry: 'تجارت', count: 6, revenue: 95000000, growth: 8.3, color: 'from-green-500 to-green-600' },
    { industry: 'دولتی', count: 4, revenue: 150000000, growth: 15.2, color: 'from-purple-500 to-purple-600' },
    { industry: 'آموزشی', count: 3, revenue: 45000000, growth: 5.7, color: 'from-orange-500 to-orange-600' }
  ]

  const conversionFunnel = [
    { stage: 'لید', count: 150, percentage: 100, color: 'from-gray-400 to-gray-500' },
    { stage: 'کوالیفای شده', count: 89, percentage: 59.3, color: 'from-blue-400 to-blue-500' },
    { stage: 'پیشنهاد', count: 45, percentage: 30.0, color: 'from-yellow-400 to-yellow-500' },
    { stage: 'مذاکره', count: 28, percentage: 18.7, color: 'from-orange-400 to-orange-500' },
    { stage: 'بسته شده', count: 18, percentage: 12.0, color: 'from-green-400 to-green-500' }
  ]

  const topProjects = [
    { name: 'طراحی وبسایت شرکت X', client: 'شرکت X', revenue: 25000000, status: 'completed', progress: 100 },
    { name: 'کمپین بازاریابی دیجیتال', client: 'استارتاپ Y', revenue: 18000000, status: 'completed', progress: 100 },
    { name: 'بهینه‌سازی SEO', client: 'فروشگاه Z', revenue: 12000000, status: 'in-progress', progress: 75 },
    { name: 'اپلیکیشن موبایل', client: 'شرکت الفا', revenue: 35000000, status: 'in-progress', progress: 60 },
    { name: 'سیستم مدیریت', client: 'سازمان بتا', revenue: 28000000, status: 'pending', progress: 0 }
  ]

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

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

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">در حال بارگذاری گزارش‌ها...</p>
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
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  گزارش‌گیری و آنالیتیکس
                </h1>
                <p className="text-gray-400 mt-1">تحلیل عملکرد و آمار کسب‌وکار</p>
              </div>
              <div className="flex items-center space-x-4 space-x-reverse">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="week">هفته</option>
                  <option value="month">ماه</option>
                  <option value="quarter">فصل</option>
                  <option value="year">سال</option>
                </select>
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg">
                  <svg className="w-5 h-5 inline-block ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  دانلود گزارش
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Revenue */}
            <div className="group relative bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 hover:border-blue-400/50 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">319M</p>
                    <p className="text-sm text-blue-300">درآمد کل (تومان)</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center text-sm text-green-400">
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  +12.5% از ماه گذشته
                </div>
              </div>
            </div>

            {/* Monthly Growth */}
            <div className="group relative bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6 hover:border-green-400/50 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">+23.6%</p>
                    <p className="text-sm text-green-300">رشد ماهانه</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center text-sm text-green-400">
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  بهترین ماه سال
                </div>
              </div>
            </div>

            {/* Average Project Value */}
            <div className="group relative bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-6 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">53.2M</p>
                    <p className="text-sm text-yellow-300">میانگین پروژه</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center text-sm text-yellow-400">
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  +8.3% از ماه گذشته
                </div>
              </div>
            </div>

            {/* Active Clients */}
            <div className="group relative bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 hover:border-purple-400/50 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">21</p>
                    <p className="text-sm text-purple-300">مشتریان فعال</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center text-sm text-green-400">
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  +3 مشتری جدید این ماه
                </div>
              </div>
            </div>
          </div>

          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Chart */}
            <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-700/50">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <svg className="w-6 h-6 text-blue-400 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  درآمد ماهانه
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {revenueData.map((item, index) => (
                    <div key={index} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-gray-300">{item.month}</div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <span className="text-sm text-white font-medium">
                            {item.revenue.toLocaleString()}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            item.growth > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {item.growth > 0 ? '+' : ''}{item.growth}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500 group-hover:from-blue-400 group-hover:to-purple-500" 
                          style={{ width: `${(item.revenue / 70000000) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Project Status */}
            <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-700/50">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <svg className="w-6 h-6 text-green-400 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  وضعیت پروژه‌ها
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {projectStats.map((stat, index) => (
                    <div key={index} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${stat.color} ml-3`}></div>
                          <span className="text-sm text-gray-300">{stat.status}</span>
                        </div>
                        <div className="text-sm text-white font-medium">
                          {stat.count} ({stat.percentage}%)
                        </div>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`bg-gradient-to-r ${stat.color} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${stat.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Conversion Funnel */}
          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-700/50">
              <h3 className="text-xl font-bold text-white flex items-center">
                <svg className="w-6 h-6 text-purple-400 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                قیف تبدیل لید
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {conversionFunnel.map((stage, index) => (
                  <div key={index} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${stage.color} flex items-center justify-center ml-3 text-white text-sm font-bold`}>
                          {index + 1}
                        </div>
                        <span className="text-sm text-gray-300">{stage.stage}</span>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <span className="text-sm text-white font-medium">{stage.count}</span>
                        <span className="text-xs text-gray-400">({stage.percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div 
                        className={`bg-gradient-to-r ${stage.color} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${stage.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Client Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Industry Breakdown */}
            <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-700/50">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <svg className="w-6 h-6 text-orange-400 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  تحلیل صنایع
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {clientStats.map((stat, index) => (
                    <div key={index} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${stat.color} ml-3`}></div>
                          <span className="text-sm text-gray-300">{stat.industry}</span>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <span className="text-sm text-white font-medium">{stat.count} مشتری</span>
                          <span className={`text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400`}>
                            +{stat.growth}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>درآمد: {stat.revenue.toLocaleString()} تومان</span>
                        <span>میانگین: {(stat.revenue / stat.count).toLocaleString()} تومان</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                        <div 
                          className={`bg-gradient-to-r ${stat.color} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${(stat.revenue / 150000000) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Projects */}
            <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-700/50">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <svg className="w-6 h-6 text-yellow-400 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  برترین پروژه‌ها
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {topProjects.map((project, index) => (
                    <div key={index} className="group bg-gray-800/50 p-4 rounded-xl hover:bg-gray-700/50 transition-colors duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center ml-3 text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{project.name}</p>
                            <p className="text-gray-400 text-xs">{project.client}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium text-sm">{project.revenue.toLocaleString()} تومان</p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                            {getStatusText(project.status)}
                          </span>
                        </div>
                      </div>
                      {project.status !== 'completed' && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>پیشرفت</span>
                            <span>{project.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-1">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-1 rounded-full"
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}