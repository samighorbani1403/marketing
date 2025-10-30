'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { useRef } from 'react'
import Link from 'next/link'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
)

export default function MarketingDashboard() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeClients: 0,
    monthlyRevenue: 0,
    pendingLeads: 0
  })
  const [reqSummary, setReqSummary] = useState<{submitted:number; approved:number; rejected:number}>({submitted:0,approved:0,rejected:0})
  const [reqRecent, setReqRecent] = useState<Array<{id:string,type:string,status:string,createdAt:string}>>([])
  const router = useRouter()
  const [range, setRange] = useState<'3m'|'6m'|'12m'>('12m')
  const [compact, setCompact] = useState(false)

  const lineRef = useRef<any>(null)
  const doughnutRef = useRef<any>(null)
  const barRef = useRef<any>(null)

  // Mock extra data
  const [recent, setRecent] = useState<Array<{id:string,type:'invoice'|'project'|'client',title:string,date:string,amount?:number}>>([
    {id:'1', type:'invoice', title:'فاکتور #10023 پرداخت شد', date:'امروز', amount: 1250000},
    {id:'2', type:'project', title:'پروژه «کمپین تابستانه» شروع شد', date:'دیروز'},
    {id:'3', type:'client', title:'مشتری جدید: شرکت سپهر', date:'۳ روز پیش'},
  ])
  const [topClients] = useState<Array<{name:string,revenue:number,invoices:number}>>([
    {name:'شرکت آفتاب', revenue: 42000000, invoices: 12},
    {name:'گروه سپهر', revenue: 31800000, invoices: 9},
    {name:'صنایع کیان', revenue: 27600000, invoices: 7},
  ])
  const [target] = useState({ monthlyTarget: 50000000, achieved: 34200000 })

  const randomizeData = () => {
    // quick mock refresh for charts and stats
    const rand = () => Math.max(8, Math.round(8 + Math.random()*32))
    const data = Array.from({length:12}, rand)
    const monthsRevenue = data
    // mutate chart data by range
    // Using setStats to slightly shuffle
    setStats(s => ({...s, monthlyRevenue: Math.round(100000 + Math.random()*300000)}))
    // Not storing line series in state; range slicing will use this variable below
    ;(monthlyRevenueDataRef as any).current = monthsRevenue
    setRecent(r => [{id:Date.now().toString(), type:'invoice', title:'فاکتور جدید ثبت شد', date:'همین الان', amount: Math.round(500000+Math.random()*1500000)}, ...r].slice(0,5))
  }

  const monthlyRevenueDataRef = useRef<number[]>([12, 18, 14, 20, 24, 22, 28, 26, 30, 34, 31, 38])

  useEffect(() => {
    // Fetch user data
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          router.push('/login')
        }
      } catch (error) {
        router.push('/login')
      }
    }

    const fetchRequests = async () => {
      try {
        const res = await fetch('/api/requests')
        if (res.ok) {
          const data = await res.json()
          const list: Array<{status:string; id:string; type:string; createdAt:string}> = data.requests || []
          const summary = { submitted: 0, approved: 0, rejected: 0 }
          list.forEach(r => { if (r.status==='approved') summary.approved++; else if (r.status==='rejected') summary.rejected++; else summary.submitted++; })
          setReqSummary(summary)
          setReqRecent(list.slice(0,3))
        }
      } catch {}
    }

    // Mock stats data
    setStats({
      totalProjects: 24,
      activeClients: 18,
      monthlyRevenue: 125000,
      pendingLeads: 7
    })

    fetchUser()
    fetchRequests()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      router.push('/login')
    }
  }

  // Charts data (mock)
  const monthsAll = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند']
  let monthlyRevenueData = monthlyRevenueDataRef.current
  const sliceByRange = (arr: number[]) => {
    if (range === '3m') return arr.slice(-3)
    if (range === '6m') return arr.slice(-6)
    return arr
  }
  const sliceLabels = (arr: string[]) => {
    if (range === '3m') return arr.slice(-3)
    if (range === '6m') return arr.slice(-6)
    return arr
  }
  monthlyRevenueData = sliceByRange(monthlyRevenueData)
  const revenueLabels = sliceLabels(monthsAll)

  const invoicePaid = 68
  const invoiceUnpaid = 24
  const invoicePartial = 8
  const campaignsDraft = 6
  const campaignsActive = 11
  const campaignsCompleted = 7

  // Reports mock KPIs
  const totalInvoices = 100
  const paidInvoices = invoicePaid
  const paymentRate = Math.round((paidInvoices / totalInvoices) * 100)
  const avgInvoiceAmount = 2350000
  const avgDaysToPay = 9

  const lineData = {
    labels: revenueLabels,
    datasets: [
      {
        label: 'درآمد ماهانه (میلیون تومان)',
        data: monthlyRevenueData,
        borderColor: 'rgba(99,102,241,1)',
        backgroundColor: 'rgba(99,102,241,0.12)',
        fill: true,
        tension: 0.35,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  }
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index' as const, intersect: false },
    },
    scales: {
      x: { ticks: { color: '#9CA3AF' }, grid: { color: 'rgba(55,65,81,0.2)', drawBorder: false } },
      y: { ticks: { color: '#9CA3AF' }, grid: { color: 'rgba(55,65,81,0.2)', drawBorder: false } },
    },
  }

  const doughnutData = {
    labels: ['پرداخت‌شده','باقی‌مانده','قسمتی پرداخت'],
    datasets: [
      {
        data: [invoicePaid, invoiceUnpaid, invoicePartial],
        backgroundColor: ['#10B981','#EF4444','#F59E0B'],
        borderWidth: 0,
      },
    ],
  }
  const doughnutOptions = {
    cutout: '70%',
    plugins: { legend: { display: false } },
  }

  const barData = {
    labels: ['پیش‌نویس','فعال','تکمیل‌شده'],
    datasets: [
      {
        label: 'کمپین‌ها',
        data: [campaignsDraft, campaignsActive, campaignsCompleted],
        backgroundColor: ['#6B7280','#3B82F6','#8B5CF6'],
        borderRadius: 8,
        borderWidth: 0,
      },
    ],
  }
  const barOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#9CA3AF' }, grid: { display: false, drawBorder: false } },
      y: { ticks: { color: '#9CA3AF' }, grid: { color: 'rgba(55,65,81,0.2)', drawBorder: false } },
    },
  }

  const downloadChartImage = (ref: any, filename: string) => {
    const chart = ref?.current
    if (!chart) return
    const url = chart.toBase64Image ? chart.toBase64Image() : chart.canvas?.toDataURL?.()
    if (!url) return
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
  }

  const exportCSV = (rows: Array<{ label: string; value: number }>, filename: string) => {
    const header = 'label,value\n'

    const body = rows.map(r => `${r.label},${r.value}`).join('\n')
    const csv = header + body
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!user) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-32 w-32 border-4 border-transparent border-t-blue-500 border-r-purple-500"></div>
          <div className="absolute inset-0 animate-pulse rounded-full h-32 w-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 flex overflow-hidden" dir="rtl">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-transparent border-b border-gray-800/60">
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">داشبورد</h1>
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm text-gray-400">نمایش:</span>
                <button onClick={()=>setCompact(false)} className={`px-2 py-1 rounded ${!compact?'bg-gray-700 text-white':'text-gray-300 hover:bg-gray-800'}`}>کامل</button>
                <button onClick={()=>setCompact(true)} className={`px-2 py-1 rounded ${compact?'bg-gray-700 text-white':'text-gray-300 hover:bg-gray-800'}`}>فشرده</button>
              </div>
              <select value={range} onChange={e=>setRange(e.target.value as any)} className="bg-gray-900 text-gray-200 border border-gray-700 rounded-lg px-3 py-1 text-sm">
                <option value="3m">۳ ماه</option>
                <option value="6m">۶ ماه</option>
                <option value="12m">۱۲ ماه</option>
              </select>
              <button onClick={randomizeData} className="bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-1 rounded-lg text-sm">تازه‌سازی</button>
              <button
                onClick={handleLogout}
                className="bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-1 rounded-lg text-sm"
              >
                خروج
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Quick Actions */}
          <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6 ${compact?'mb-4':''}`}>
            <Link href="/clients/new" className="rounded-xl p-3 bg-gray-900/40 hover:bg-gray-900/60 text-sm text-gray-200 text-center">+ مشتری جدید</Link>
            <Link href="/invoices/new" className="rounded-xl p-3 bg-gray-900/40 hover:bg-gray-900/60 text-sm text-gray-200 text-center">+ فاکتور</Link>
            <Link href="/campaigns/new" className="rounded-xl p-3 bg-gray-900/40 hover:bg-gray-900/60 text-sm text-gray-200 text-center">+ کمپین</Link>
            <Link href="/projects/new" className="rounded-xl p-3 bg-gray-900/40 hover:bg-gray-900/60 text-sm text-gray-200 text-center">+ پروژه</Link>
            <Link href="/conversations" className="rounded-xl p-3 bg-gray-900/40 hover:bg-gray-900/60 text-sm text-gray-200 text-center">مکاتبات</Link>
            <Link href="/notices" className="rounded-xl p-3 bg-gray-900/40 hover:bg-gray-900/60 text-sm text-gray-200 text-center">اطلاعیه‌ها</Link>
          </div>

          {/* Minimal Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="rounded-xl p-3 bg-gray-900/40">
              <div className="flex items-center justify-between mb-2">
                <div className="text-gray-300 text-sm">درآمد ماهانه</div>
                <div className="flex items-center gap-1">
                  <button onClick={()=>downloadChartImage(lineRef,'monthly-revenue.png')} className="text-xs text-gray-400 hover:text-gray-200">PNG</button>
                  <button onClick={()=>exportCSV(revenueLabels.map((l,i)=>({label:l, value: monthlyRevenueData[i]})),'monthly-revenue.csv')} className="text-xs text-gray-400 hover:text-gray-200">CSV</button>
                </div>
              </div>
              <Line ref={lineRef} data={lineData as any} options={lineOptions as any} height={120} />
            </div>
            <div className="rounded-xl p-3 bg-gray-900/40">
              <div className="flex items-center justify-between mb-2">
                <div className="text-gray-300 text-sm">وضعیت پرداخت فاکتورها</div>
                <div className="flex items-center gap-1">
                  <button onClick={()=>downloadChartImage(doughnutRef,'invoices-status.png')} className="text-xs text-gray-400 hover:text-gray-200">PNG</button>
                  <button onClick={()=>exportCSV([
                    {label:'پرداخت‌شده', value: invoicePaid},
                    {label:'باقی‌مانده', value: invoiceUnpaid},
                    {label:'قسمتی پرداخت', value: invoicePartial},
                  ],'invoices-status.csv')} className="text-xs text-gray-400 hover:text-gray-200">CSV</button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-40">
                  <Doughnut ref={doughnutRef} data={doughnutData as any} options={doughnutOptions as any} />
                </div>
              </div>
              <div className="mt-2 flex items-center justify-center gap-3 text-[11px] text-gray-400">
                <span className="inline-flex items-center"><span className="w-2 h-2 rounded-sm mr-1 bg-emerald-500"></span>پرداخت‌شده</span>
                <span className="inline-flex items-center"><span className="w-2 h-2 rounded-sm mr-1 bg-red-500"></span>باقی‌مانده</span>
                <span className="inline-flex items-center"><span className="w-2 h-2 rounded-sm mr-1 bg-amber-500"></span>قسمتی</span>
              </div>
            </div>
            <div className="rounded-xl p-3 bg-gray-900/40">
              <div className="flex items-center justify-between mb-2">
                <div className="text-gray-300 text-sm">وضعیت کمپین‌ها</div>
                <div className="flex items-center gap-1">
                  <button onClick={()=>downloadChartImage(barRef,'campaigns.png')} className="text-xs text-gray-400 hover:text-gray-200">PNG</button>
                  <button onClick={()=>exportCSV([
                    {label:'پیش‌نویس', value: campaignsDraft},
                    {label:'فعال', value: campaignsActive},
                    {label:'تکمیل‌شده', value: campaignsCompleted},
                  ],'campaigns.csv')} className="text-xs text-gray-400 hover:text-gray-200">CSV</button>
                </div>
              </div>
              <Bar ref={barRef} data={barData as any} options={barOptions as any} height={120} />
            </div>
          </div>

          {/* KPI + Target Row */}
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${compact?'mt-4':'mt-6'}`}>
            <div className="rounded-xl p-4 bg-gray-900/40">
              <div className="text-gray-400 text-xs mb-1">پروژه‌ها</div>
              <div className="text-2xl font-bold text-white">{stats.totalProjects}</div>
            </div>
            <div className="rounded-xl p-4 bg-gray-900/40">
              <div className="text-gray-400 text-xs mb-1">مشتریان فعال</div>
              <div className="text-2xl font-bold text-white">{stats.activeClients}</div>
            </div>
            <div className="rounded-xl p-4 bg-gray-900/40">
              <div className="text-gray-400 text-xs mb-1">درآمد ماه جاری (تومان)</div>
              <div className="text-2xl font-bold text-white">{stats.monthlyRevenue.toLocaleString()}</div>
            </div>
            <div className="rounded-xl p-4 bg-gray-900/40">
              <div className="flex items-center justify-between mb-2">
                <div className="text-gray-400 text-xs">هدف درآمد ماه</div>
                <div className="text-[11px] text-gray-400">{Math.round((target.achieved/target.monthlyTarget)*100)}%</div>
              </div>
              <div className="w-full h-2 rounded bg-gray-800 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-emerald-500 to-green-600" style={{width: `${Math.min(100, (target.achieved/target.monthlyTarget)*100)}%`}} />
              </div>
              <div className="mt-2 text-xs text-gray-300">{target.achieved.toLocaleString()} / {target.monthlyTarget.toLocaleString()}</div>
            </div>
          </div>

          {/* Reports Highlights */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${compact?'mt-4':'mt-6'}`}>
            <div className="rounded-xl p-4 bg-gray-900/40">
              <div className="text-gray-400 text-xs mb-1">نرخ پرداخت فاکتورها</div>
              <div className="text-2xl font-bold text-white">{paymentRate}%</div>
              <div className="text-[11px] text-gray-500 mt-1">{paidInvoices}/{totalInvoices} فاکتور</div>
            </div>
            <div className="rounded-xl p-4 bg-gray-900/40">
              <div className="text-gray-400 text-xs mb-1">میانگین مبلغ فاکتور</div>
              <div className="text-2xl font-bold text-white">{avgInvoiceAmount.toLocaleString()} تومان</div>
              <div className="text-[11px] text-gray-500 mt-1">ماه جاری</div>
            </div>
            <div className="rounded-xl p-4 bg-gray-900/40">
              <div className="text-gray-400 text-xs mb-1">میانگین زمان پرداخت</div>
              <div className="text-2xl font-bold text-white">{avgDaysToPay} روز</div>
              <div className="text-[11px] text-gray-500 mt-1">از تاریخ صدور</div>
            </div>
            <div className="rounded-xl p-4 bg-gray-900/40">
              <div className="text-gray-400 text-xs mb-1">کمپین‌های فعال</div>
              <div className="text-2xl font-bold text-white">{campaignsActive}</div>
              <div className="text-[11px] text-gray-500 mt-1">این ماه</div>
            </div>
          </div>

          {/* Requests Summary */}
          <div className={`grid grid-cols-1 lg:grid-cols-3 gap-4 ${compact?'mt-4':'mt-6'}`}>
            <div className="rounded-xl p-4 bg-gray-900/40">
              <div className="text-sm text-gray-300 mb-2">خلاصه درخواست‌ها</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-amber-500/10 text-amber-300 p-3">
                  <div className="text-xs">در انتظار</div>
                  <div className="text-xl font-bold">{reqSummary.submitted}</div>
                </div>
                <div className="rounded-lg bg-emerald-500/10 text-emerald-300 p-3">
                  <div className="text-xs">تایید</div>
                  <div className="text-xl font-bold">{reqSummary.approved}</div>
                </div>
                <div className="rounded-lg bg-rose-500/10 text-rose-300 p-3">
                  <div className="text-xs">رد</div>
                  <div className="text-xl font-bold">{reqSummary.rejected}</div>
                </div>
              </div>
            </div>
            <div className="rounded-xl p-4 bg-gray-900/40 lg:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-300">سه درخواست اخیر</div>
                <a href="/requests" className="text-xs text-gray-400 hover:text-gray-200">مشاهده همه</a>
              </div>
              <div className="space-y-2">
                {reqRecent.map(r => (
                  <div key={r.id} className="flex items-center justify-between text-sm bg-gray-800/50 rounded-lg p-2">
                    <div className="text-gray-200">{r.type==='leave'?'مرخصی': r.type==='financial'?'مالی':'معرفی‌نامه'}</div>
                    <div className="text-[11px] text-gray-400">{new Date(r.createdAt).toLocaleString('fa-IR')}</div>
                  </div>
                ))}
                {reqRecent.length===0 && <div className="text-xs text-gray-500">درخواستی یافت نشد.</div>}
              </div>
            </div>
          </div>

          {/* Report Shortcuts */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${compact?'mt-4':'mt-6'}`}>
            <Link href="/invoices" className="rounded-xl p-4 bg-gray-900/40 hover:bg-gray-900/60">
              <div className="text-sm text-gray-300 mb-1">گزارش فاکتورها</div>
              <div className="text-xs text-gray-500">پرداخت‌شده، باقی‌مانده و میانگین مبلغ</div>
            </Link>
            <Link href="/campaigns" className="rounded-xl p-4 bg-gray-900/40 hover:bg-gray-900/60">
              <div className="text-sm text-gray-300 mb-1">گزارش کمپین‌ها</div>
              <div className="text-xs text-gray-500">وضعیت‌ها و عملکرد</div>
            </Link>
            <Link href="/projects" className="rounded-xl p-4 bg-gray-900/40 hover:bg-gray-900/60">
              <div className="text-sm text-gray-300 mb-1">گزارش پروژه‌ها</div>
              <div className="text-xs text-gray-500">پیشرفت و وضعیت ارسال به مدیر</div>
            </Link>
          </div>

          {/* Recent + Top Clients */}
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 ${compact?'mt-4':'mt-6'}`}>
            <div className="rounded-xl p-4 bg-gray-900/40">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-300">فعالیت‌های اخیر</div>
                <button onClick={randomizeData} className="text-xs text-gray-400 hover:text-gray-200">به‌روزرسانی</button>
              </div>
              <div className="space-y-3">
                {recent.map(item => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${item.type==='invoice'?'bg-emerald-500': item.type==='project'?'bg-blue-500':'bg-purple-500'}`}></span>
                      <div className="text-sm text-gray-200">{item.title}</div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.amount ? item.amount.toLocaleString()+' تومان' : item.date}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl p-4 bg-gray-900/40">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-300">مشتریان برتر</div>
                <Link href="/clients" className="text-xs text-gray-400 hover:text-gray-200">مشاهده همه</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="text-xs text-gray-400">
                    <tr>
                      <th className="py-2">مشتری</th>
                      <th className="py-2">درآمد</th>
                      <th className="py-2">تعداد فاکتور</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topClients.map((c, idx) => (
                      <tr key={idx} className="border-b border-gray-800/60">
                        <td className="py-2">{c.name}</td>
                        <td className="py-2">{c.revenue.toLocaleString()} تومان</td>
                        <td className="py-2">{c.invoices}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}