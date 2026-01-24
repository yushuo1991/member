'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminLoginPage() {
  const router = useRouter()
  const [nextPath, setNextPath] = useState('/admin/dashboard')

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Check if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/dashboard/stats', {
          credentials: 'include'
        })

        if (response.ok) {
          // Already logged in, redirect to dashboard
          router.replace('/admin/dashboard')
          return
        }
      } catch {
        // Not logged in, continue to show login form
      } finally {
        setCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      setNextPath(params.get('next') || '/admin/dashboard')
    } catch {
      setNextPath('/admin/dashboard')
    }
  }, [])

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json().catch(() => ({}))

      // 检查HTTP状态码
      if (!response.ok) {
        throw new Error(data?.message || '管理员登录失败')
      }

      // 检查业务逻辑状态
      if (!data.success) {
        throw new Error(data?.message || '管理员登录失败')
      }

      // 登录成功，跳转到管理后台
      router.replace(nextPath)
    } catch (err: any) {
      setError(err?.message || '管理员登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
      {checkingAuth ? (
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#ff8c42] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">检查登录状态...</p>
        </div>
      ) : (
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <Link href="/" className="text-3xl font-semibold text-gray-900">
              宇硕<span className="text-[#ff8c42]">短线</span>
            </Link>
            <p className="text-gray-600 mt-2">管理员登录</p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  账号
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff8c42] focus:border-transparent transition-all duration-300"
                  placeholder="admin"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  密码
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff8c42] focus:border-transparent transition-all duration-300"
                  required
                />
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 bg-[#ff8c42] text-white rounded-full hover:bg-[#e67d3a] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 font-medium shadow-sm hover:shadow-md"
              >
                {loading ? '登录中…' : '登录'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

