import { NextRequest, NextResponse } from 'next/server'

const notices = [
  {
    id: '1',
    title: 'اطلاعیه عمومی شماره ۱',
    body: 'این اطلاعیه برای همه بازاریابان قابل مشاهده است. لطفا ساعت جلسه فردا را فراموش نکنید.',
    type: 'public',
    createdAt: '2025-10-29'
  },
  {
    id: '2',
    title: 'اطلاعیه محرمانه – فقط کاربر تستی',
    body: 'این پیام فقط به شما (userId=2) ارسال شده است و خصوصی است.',
    type: 'private',
    userId: '2',
    createdAt: '2025-10-30',
  },
  {
    id: '3',
    title: 'اطلاعیه عمومی شماره ۲',
    body: 'اخبار مهم شرکت: فاز جدید تبلیغات راه‌اندازی شد. لطفاً پیشنهادات خود را در قالب کامنت ثبت کنید.',
    type: 'public',
    createdAt: '2025-11-01',
  },
  {
    id: '4',
    title: 'اطلاعیه فقط برای کاربر ۳',
    body: 'این اطلاعیه ویژه و فقط برای userId=3 است (سایرین نمی‌بینند).',
    type: 'private',
    userId: '3',
    createdAt: '2025-11-01',
  }
]

export async function GET(request, { params }) {
  const { id } = params
  const notice = notices.find(n => n.id === id)
  if(!notice) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ notice })
}
