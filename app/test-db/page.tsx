'use client'

import { useState } from 'react'

export default function DatabaseTest() {
  const [testResult, setTestResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })

  const testConnection = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/test-db')
      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      setTestResult({ success: false, error: 'Failed to test connection' })
    } finally {
      setIsLoading(false)
    }
  }

  const createTestUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch('/api/test-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      setTestResult(data)
      if (data.success) {
        setFormData({ name: '', email: '' })
      }
    } catch (error) {
      setTestResult({ success: false, error: 'Failed to create user' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg" dir="rtl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        تست اتصال دیتابیس
      </h1>
      
      <div className="space-y-8">
        {/* Connection Test */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            تست اتصال دیتابیس
          </h2>
          <p className="text-gray-600 mb-4">
            روی دکمه زیر کلیک کنید تا اتصال به دیتابیس PostgreSQL "atamandb" را تست کنید
          </p>
          <button
            onClick={testConnection}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-6 rounded-lg transition duration-300"
          >
            {isLoading ? 'در حال تست...' : 'تست اتصال'}
          </button>
        </div>

        {/* Create User Test */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            ایجاد کاربر تست
          </h2>
          <form onSubmit={createTestUser} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                نام
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="نام خود را وارد کنید"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                ایمیل
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ایمیل خود را وارد کنید"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2 px-4 rounded-md transition duration-300"
            >
              {isLoading ? 'در حال ایجاد...' : 'ایجاد کاربر تست'}
            </button>
          </form>
        </div>

        {/* Results */}
        {testResult && (
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              نتایج تست
            </h2>
            <div className={`p-4 rounded-md ${
              testResult.success 
                ? 'bg-green-100 border border-green-400 text-green-700' 
                : 'bg-red-100 border border-red-400 text-red-700'
            }`}>
              <pre className="whitespace-pre-wrap text-sm">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
