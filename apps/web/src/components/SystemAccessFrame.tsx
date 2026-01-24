'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/contexts/AuthContext'

type AccessPayload = {
  hasAccess: boolean
  accessType: 'membership' | 'purchased' | 'trial' | 'none'
  product?: { slug: string; name: string; description: string; url?: string }
  currentLevel?: string
  requiredLevel?: string
  trialRemaining?: number
  redirectUrl?: string
  message?: string
}

export default function SystemAccessFrame({
  productSlug,
  title,
  iframeSrc,
}: {
  productSlug: string
  title: string
  iframeSrc: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, loading } = useAuth()

  const [checking, setChecking] = useState(true)
  const [payload, setPayload] = useState<AccessPayload | null>(null)
  const [trialReady, setTrialReady] = useState(false)
  const [trialBusy, setTrialBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canShowFrame = useMemo(() => {
    if (!payload?.hasAccess) return false
    if (payload.accessType === 'trial') return trialReady
    return true
  }, [payload, trialReady])

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [isAuthenticated, loading, pathname, router])

  useEffect(() => {
    if (loading || !isAuthenticated) return
    let cancelled = false

    const run = async () => {
      setChecking(true)
      setError(null)
      try {
        const res = await fetch(`/api/products/access/${productSlug}`, { credentials: 'include' })
        const json = await res.json()
        if (!res.ok || !json?.success) {
          throw new Error(json?.message || '访问检查失败')
        }
        if (cancelled) return
        setPayload(json.data as AccessPayload)
        setTrialReady(false)
      } catch (e: any) {
        if (cancelled) return
        setError(e?.message || '访问检查失败')
        setPayload(null)
      } finally {
        if (!cancelled) setChecking(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, loading, productSlug])

  const consumeTrialAndEnter = async () => {
    setTrialBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/products/trial/${productSlug}`, {
        method: 'POST',
        credentials: 'include',
      })
      const json = await res.json()
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || '试用失败')
      }
      setTrialReady(true)
    } catch (e: any) {
      setError(e?.message || '试用失败')
    } finally {
      setTrialBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-20 sm:pt-24 px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-600 mt-1">
                {payload?.message || '已为你校验会员权限，加载系统中…'}
              </p>
            </div>
            <a
              href={iframeSrc}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 transition-colors"
            >
              新窗口打开
            </a>
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {checking && (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff8c42] mx-auto"></div>
              <p className="mt-3 text-center text-gray-600">加载中…</p>
            </div>
          )}

          {!checking && payload && !payload.hasAccess && (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">暂无访问权限</h2>
              <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                {payload.message || '请升级会员或使用试用额度后再进入。'}
              </p>
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/products/${productSlug}`}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#ff8c42] text-white font-medium hover:bg-[#e67d3a] transition-colors"
                >
                  查看产品详情
                </Link>
                <Link
                  href="/upgrade"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  升级会员
                </Link>
              </div>
            </div>
          )}

          {!checking && payload?.hasAccess && payload.accessType === 'trial' && !trialReady && (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
              <h2 className="text-lg font-semibold text-gray-900">可使用试用额度进入</h2>
              <p className="mt-2 text-sm text-gray-700">
                剩余试用次数：{payload.trialRemaining ?? 0} 次
              </p>
              <button
                onClick={consumeTrialAndEnter}
                disabled={trialBusy}
                className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {trialBusy ? '处理中…' : '消耗 1 次试用并进入'}
              </button>
            </div>
          )}

          {canShowFrame && (
            <div className="mt-4 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              <iframe
                title={title}
                src={iframeSrc}
                className="w-full"
                style={{ height: 'calc(100vh - 210px)' }}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

