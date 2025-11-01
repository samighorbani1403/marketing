'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import AdminSidebar from '@/components/AdminSidebar'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface DashboardStats {
  totalEmployees: number
  totalProjects: number
  pendingRequests: number
  totalSalaryPayments: number
  totalExpenses: number
  totalOvertimeHours: number
  totalAbsences: number
  totalMarketers: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    totalProjects: 0,
    pendingRequests: 0,
    totalSalaryPayments: 0,
    totalExpenses: 0,
    totalOvertimeHours: 0,
    totalAbsences: 0,
    totalMarketers: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [revenueData, setRevenueData] = useState<number[]>([])
  const [expenseData, setExpenseData] = useState<number[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      // Fetch all stats in parallel
      const [
        employeesRes,
        projectsRes,
        requestsRes,
        salaryRes,
        expensesRes,
        billsRes,
        overtimeRes,
        absenceRes,
        performanceRes
      ] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/projects'),
        fetch('/api/requests'),
        fetch('/api/accounting/salary'),
        fetch('/api/accounting/expenses'),
        fetch('/api/accounting/bills'),
        fetch('/api/attendance/overtime'),
        fetch('/api/attendance/absence'),
        fetch('/api/marketers/performance')
      ])

      // Process employees
      let totalEmployees = 0
      if (employeesRes.ok) {
        const empData = await employeesRes.json()
        if (empData.success && empData.employees) {
          totalEmployees = empData.employees.length
        }
      }

      // Process projects
      let totalProjects = 0
      if (projectsRes.ok) {
        const projData = await projectsRes.json()
        if (projData.success && projData.projects) {
          totalProjects = projData.projects.length
        }
      }

      // Process requests
      let pendingRequests = 0
      if (requestsRes.ok) {
        const reqData = await requestsRes.json()
        if (reqData.success && reqData.requests) {
          pendingRequests = reqData.requests.filter((r: any) => r.status === 'pending').length
        }
      }

      // Process salary payments
      let totalSalaryPayments = 0
      if (salaryRes.ok) {
        const salaryData = await salaryRes.json()
        if (salaryData.success && salaryData.payments) {
          totalSalaryPayments = salaryData.payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
        }
      }

      // Process expenses
      let totalExpenses = 0
      if (expensesRes.ok) {
        const expData = await expensesRes.json()
        if (expData.success && expData.expenses) {
          totalExpenses = expData.expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0)
        }
      }

      // Process bills
      let totalBills = 0
      if (billsRes.ok) {
        const billsData = await billsRes.json()
        if (billsData.success && billsData.bills) {
          totalBills = billsData.bills.reduce((sum: number, b: any) => sum + (b.amount || 0), 0)
        }
      }

      // Process overtime
      let totalOvertimeHours = 0
      if (overtimeRes.ok) {
        const overtimeData = await overtimeRes.json()
        if (overtimeData.success && overtimeData.overtimes) {
          totalOvertimeHours = overtimeData.overtimes.reduce((sum: number, o: any) => sum + (o.hours || 0), 0)
        }
      }

      // Process absences
      let totalAbsences = 0
      if (absenceRes.ok) {
        const absenceData = await absenceRes.json()
        if (absenceData.success && absenceData.absences) {
          totalAbsences = absenceData.absences.length
        }
      }

      // Process marketers
      let totalMarketers = 0
      if (performanceRes.ok) {
        const perfData = await performanceRes.json()
        if (perfData.success && perfData.performances) {
          const uniqueMarketers = new Set(perfData.performances.map((p: any) => p.marketerName))
          totalMarketers = uniqueMarketers.size
        }
      }

      setStats({
        totalEmployees,
        totalProjects,
        pendingRequests,
        totalSalaryPayments,
        totalExpenses: totalExpenses + totalBills,
        totalOvertimeHours,
        totalAbsences,
        totalMarketers
      })

      // Generate monthly revenue/expense data (last 6 months)
      const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور']
      setRevenueData([12000000, 15000000, 18000000, 16000000, 20000000, 22000000])
      setExpenseData([8000000, 9000000, 11000000, 9500000, 12000000, 13000000])

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount)
  }

  const revenueChartData = {
    labels: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور'],
    datasets: [
      {
        label: 'درآمد',
        data: revenueData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'هزینه',
        data: expenseData,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }

  const attendanceChartData = {
    labels: ['موجه', 'غیرموجه', 'پزشکی'],
    datasets: [
      {
        data: [60, 25, 15],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(239, 68, 68)',
          'rgb(59, 130, 246)'
        ],
        borderWidth: 2
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(229, 231, 235)'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: 'rgb(156, 163, 175)'
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.3)'
        }
      },
      x: {
        ticks: {
          color: 'rgb(156, 163, 175)'
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.3)'
        }
      }
    }
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'rgb(229, 231, 235)'
        }
      }
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex overflow-hidden" dir="rtl">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl sticky top-0 z-10">
          <div className="px-6 py-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              داشبورد مدیریت
            </h1>
            <p className="text-gray-400 mt-1">نمای کلی از تمام بخش‌های سیستم</p>
          </div>
        </header>

        <div className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Employees */}
              <Link href="/admin/employees" className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-700/50 rounded-xl p-6 hover:border-blue-500 transition group">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-300">کارمندان</div>
                  <svg className="w-6 h-6 text-blue-400 group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-blue-400">{isLoading ? '...' : formatCurrency(stats.totalEmployees)}</div>
                <div className="text-xs text-gray-400 mt-1">کارمند فعال</div>
              </Link>

              {/* Projects */}
              <Link href="/admin/projects" className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-700/50 rounded-xl p-6 hover:border-purple-500 transition group">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-300">پروژه‌ها</div>
                  <svg className="w-6 h-6 text-purple-400 group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-0.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-purple-400">{isLoading ? '...' : formatCurrency(stats.totalProjects)}</div>
                <div className="text-xs text-gray-400 mt-1">پروژه فعال</div>
              </Link>

              {/* Pending Requests */}
              <Link href="/admin/requests" className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/20 border border-yellow-700/50 rounded-xl p-6 hover:border-yellow-500 transition group">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-300">درخواست‌های در انتظار</div>
                  <svg className="w-6 h-6 text-yellow-400 group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-yellow-400">{isLoading ? '...' : formatCurrency(stats.pendingRequests)}</div>
                <div className="text-xs text-gray-400 mt-1">درخواست نیازمند بررسی</div>
              </Link>

              {/* Salary Payments */}
              <Link href="/admin/accounting/salary" className="bg-gradient-to-br from-green-900/40 to-green-800/20 border border-green-700/50 rounded-xl p-6 hover:border-green-500 transition group">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-300">حقوق پرداختی</div>
                  <svg className="w-6 h-6 text-green-400 group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-green-400">{isLoading ? '...' : `${formatCurrency(stats.totalSalaryPayments)} تومان`}</div>
                <div className="text-xs text-gray-400 mt-1">مجموع پرداخت‌ها</div>
              </Link>
            </div>

            {/* Second Row Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Expenses */}
              <Link href="/admin/accounting/expenses" className="bg-gradient-to-br from-red-900/40 to-red-800/20 border border-red-700/50 rounded-xl p-6 hover:border-red-500 transition group">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-300">هزینه‌ها</div>
                  <svg className="w-6 h-6 text-red-400 group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-red-400">{isLoading ? '...' : `${formatCurrency(stats.totalExpenses)} تومان`}</div>
                <div className="text-xs text-gray-400 mt-1">هزینه‌های جاری و قبوض</div>
              </Link>

              {/* Overtime */}
              <Link href="/admin/attendance/overtime" className="bg-gradient-to-br from-cyan-900/40 to-cyan-800/20 border border-cyan-700/50 rounded-xl p-6 hover:border-cyan-500 transition group">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-300">اضافه کاری</div>
                  <svg className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-cyan-400">{isLoading ? '...' : `${stats.totalOvertimeHours.toFixed(1)} ساعت`}</div>
                <div className="text-xs text-gray-400 mt-1">مجموع ساعات اضافه کاری</div>
              </Link>

              {/* Absences */}
              <Link href="/admin/attendance/absence" className="bg-gradient-to-br from-orange-900/40 to-orange-800/20 border border-orange-700/50 rounded-xl p-6 hover:border-orange-500 transition group">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-300">غیبت‌ها</div>
                  <svg className="w-6 h-6 text-orange-400 group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-orange-400">{isLoading ? '...' : formatCurrency(stats.totalAbsences)}</div>
                <div className="text-xs text-gray-400 mt-1">تعداد غیبت‌ها</div>
              </Link>

              {/* Marketers */}
              <Link href="/admin/marketers/performance" className="bg-gradient-to-br from-pink-900/40 to-pink-800/20 border border-pink-700/50 rounded-xl p-6 hover:border-pink-500 transition group">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-300">بازاریابان</div>
                  <svg className="w-6 h-6 text-pink-400 group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-pink-400">{isLoading ? '...' : formatCurrency(stats.totalMarketers)}</div>
                <div className="text-xs text-gray-400 mt-1">بازاریاب فعال</div>
              </Link>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue vs Expenses Chart */}
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">درآمد و هزینه (۶ ماه اخیر)</h2>
                <div className="h-64">
                  <Line data={revenueChartData} options={chartOptions} />
                </div>
              </div>

              {/* Attendance Distribution */}
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">توزیع انواع غیبت</h2>
                <div className="h-64">
                  <Doughnut data={attendanceChartData} options={doughnutOptions} />
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">دسترسی سریع</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                <Link href="/admin/projects/new" className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-blue-500 hover:bg-gray-800 transition text-white text-sm">
                  ثبت پروژه جدید
                </Link>
                <Link href="/admin/employees/new" className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-blue-500 hover:bg-gray-800 transition text-white text-sm">
                  ثبت کارمند جدید
                </Link>
                <Link href="/admin/accounting/salary" className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-blue-500 hover:bg-gray-800 transition text-white text-sm">
                  ثبت حقوق
                </Link>
                <Link href="/admin/accounting/expenses" className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-blue-500 hover:bg-gray-800 transition text-white text-sm">
                  ثبت هزینه
                </Link>
                <Link href="/admin/attendance/overtime" className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-blue-500 hover:bg-gray-800 transition text-white text-sm">
                  ثبت اضافه کاری
                </Link>
                <Link href="/admin/attendance/absence" className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-blue-500 hover:bg-gray-800 transition text-white text-sm">
                  ثبت غیبت
                </Link>
                <Link href="/admin/announcements/new" className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-blue-500 hover:bg-gray-800 transition text-white text-sm">
                  ایجاد اطلاعیه
                </Link>
                <Link href="/admin/marketers/commissions/types" className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-blue-500 hover:bg-gray-800 transition text-white text-sm">
                  تعریف پورسانت
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
