import ContactForm from '@/components/ContactForm'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" dir="rtl">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg ml-3"></div>
              <span className="text-xl font-bold text-gray-900">پلتفرم بازاریابی</span>
            </div>
            <div className="flex space-x-4">
              <Link 
                href="/login" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                ورود
              </Link>
              <Link 
                href="/test-db" 
                className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-2 rounded-lg transition-colors"
              >
                تست دیتابیس
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            به پلتفرم بازاریابی ما خوش آمدید
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            کسب و کار خود را با راه‌حل‌های بازاریابی پیشرفته ما متحول کنید. 
            ما به شما کمک می‌کنیم تا مخاطبان خود را پیدا کنید و برند خود را رشد دهید.
          </p>
          <div className="space-x-4">
            <Link 
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300 inline-block"
            >
              شروع کنید
            </Link>
            <button className="border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 px-8 rounded-lg transition duration-300">
              بیشتر بدانید
            </button>
          </div>
        </div>
        
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">عملکرد سریع</h3>
            <p className="text-gray-600">زمان بارگذاری سریع و عملکرد بهینه برای تجربه کاربری بهتر.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">قابل اعتماد</h3>
            <p className="text-gray-600">ساخته شده با تکنولوژی‌های مدرن و بهترین روش‌ها برای حداکثر قابلیت اطمینان.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">کاربرپسند</h3>
            <p className="text-gray-600">طراحی بصری و تجربه کاربری روان در تمام دستگاه‌ها.</p>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">با ما در تماس باشید</h2>
            <p className="text-lg text-gray-600">آماده متحول کردن کسب و کار خود هستید؟ همین امروز با ما تماس بگیرید!</p>
          </div>
          <ContactForm />
        </div>
      </div>
    </main>
  )
}
