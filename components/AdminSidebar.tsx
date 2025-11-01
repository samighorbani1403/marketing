'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [openProjects, setOpenProjects] = useState(false)
  const [openAccounting, setOpenAccounting] = useState(false)
  const [openMarketers, setOpenMarketers] = useState(false)
  const [openAttendance, setOpenAttendance] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { 
      name: 'داشبورد', 
      href: '/admin', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2 2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      name: 'پروژه‌ها', 
      href: '/admin/projects', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-0.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      subItems: [
        { name: 'ثبت پروژه جدید', href: '/admin/projects/new' },
        { name: 'پروژه‌های در حال اجرا', href: '/admin/projects' }
      ]
    },
    { 
      name: 'کارمندان', 
      href: '/admin/employees', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    { 
      name: 'درخواست‌ها', 
      href: '/admin/requests', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      name: 'مکاتبات', 
      href: '/admin/correspondence', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      name: 'اطلاعیه و اخبار شرکت', 
      href: '/admin/announcements', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    },
    { 
      name: 'حسابداری', 
      href: '/admin/accounting/salary', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      subItems: [
        { name: 'حقوق و مزایا', href: '/admin/accounting/salary' },
        { name: 'گزارش حقوق پرسنل', href: '/admin/accounting/salary/report' },
        { name: 'ثبت قبوض شرکتی', href: '/admin/accounting/bills' },
        { name: 'ثبت هزینه‌های جاری', href: '/admin/accounting/expenses' },
        { name: 'گزارش هزینه‌های جاری', href: '/admin/accounting/expenses/report' }
      ]
    },
    { 
      name: 'بازاریابان شرکت', 
      href: '/admin/marketers/performance', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      subItems: [
        { name: 'عملکرد بازاریابان', href: '/admin/marketers/performance' },
        { name: 'سهم دریافتی بازاریابان', href: '/admin/marketers/shares' },
        { name: 'گزارش بر اساس بازاریاب', href: '/admin/marketers/report/individual' },
        { name: 'گزارش گیری گروهی', href: '/admin/marketers/report/group' },
        { name: 'تعریف انواع پورسانت', href: '/admin/marketers/commissions/types' },
        { name: 'تخصیص پورسانت', href: '/admin/marketers/commissions/assignments' },
        { name: 'گزارش پورسانت', href: '/admin/marketers/commissions/report' }
      ]
    },
    { 
      name: 'غیبت و اضافه کاری', 
      href: '/admin/attendance/overtime', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      subItems: [
        { name: 'ثبت اضافه کاری', href: '/admin/attendance/overtime' },
        { name: 'ثبت غیبت', href: '/admin/attendance/absence' },
        { name: 'گزارش اضافه کاری', href: '/admin/attendance/overtime/report' },
        { name: 'گزارش غیبت‌ها', href: '/admin/attendance/absence/report' }
      ]
    }
  ]

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="lg:hidden fixed top-4 right-4 z-50 p-2 rounded-md text-white bg-gray-800/70 backdrop-blur-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 right-0 z-40 w-72 bg-gray-900/80 backdrop-blur-xl shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 lg:static lg:inset-0 h-screen flex flex-col`} dir="rtl">
        {/* Logo */}
        <div className="flex items-center justify-center h-20 px-6 border-b border-gray-700/50">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg ml-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              پنل مدیریت
            </h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.href)
            const hasSubItems = item.subItems && item.subItems.length > 0
            const isProjectsItem = item.href === '/admin/projects'
            const isAccountingItem = item.href === '/admin/accounting/salary'
            const isMarketersItem = item.href === '/admin/marketers/performance'
            const isAttendanceItem = item.href === '/admin/attendance/overtime'
            const showSubItems = (isProjectsItem && openProjects) || (isAccountingItem && openAccounting) || (isMarketersItem && openMarketers) || (isAttendanceItem && openAttendance)

            return (
              <div key={item.name}>
                <Link 
                  href={item.href} 
                  className={`flex items-center p-3 rounded-xl transition-all duration-200 group ${
                    active
                      ? 'bg-gradient-to-br from-blue-600 to-purple-700 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                  }`}
                  onClick={(e) => {
                    if (hasSubItems) {
                      e.preventDefault()
                      if (isProjectsItem) {
                        setOpenProjects(!openProjects)
                      } else if (isAccountingItem) {
                        setOpenAccounting(!openAccounting)
                      } else if (isMarketersItem) {
                        setOpenMarketers(!openMarketers)
                      } else if (isAttendanceItem) {
                        setOpenAttendance(!openAttendance)
                      }
                    }
                  }}
                >
                  <span className={`ml-3 ${active ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                    {item.icon}
                  </span>
                  <span className="font-medium text-lg flex-1">{item.name}</span>
                  {hasSubItems && (
                    <svg 
                      className={`w-4 h-4 transition-transform ${showSubItems ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </Link>
                
                {/* Sub Items */}
                {showSubItems && item.subItems && (
                  <div className="mr-4 mt-2 space-y-1 border-r border-gray-700/50 pr-4">
                    {item.subItems.map((subItem) => {
                      const subActive = pathname === subItem.href
                      return (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                            subActive
                              ? 'bg-gray-800/70 text-blue-300'
                              : 'text-gray-400 hover:bg-gray-800/40 hover:text-gray-200'
                          }`}
                        >
                          <span className="text-sm">{subItem.name}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* User Profile */}
        <div className="p-6 border-t border-gray-700/50">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg ml-3">
              <span className="text-xl font-bold text-white">مد</span>
            </div>
            <div>
              <p className="text-white font-medium">مدیر سیستم</p>
              <p className="text-gray-400 text-sm">admin@company.com</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

