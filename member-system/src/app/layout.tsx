import type { Metadata } from 'next'
import './globals.css'
import ClientLayout from '@/components/ClientLayout'

export const metadata: Metadata = {
  title: 'Member System - 会员管理系统',
  description: '基于Next.js 14的现代化会员管理系统',
  keywords: ['会员管理', 'Member System', 'Next.js', 'React'],
  authors: [{ name: 'Member System Team' }],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: '#0ea5e9',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      </head>
      <body className="min-h-screen bg-gray-50 antialiased">
        <ClientLayout>
          <div id="root" className="min-h-screen">
            {children}
          </div>
        </ClientLayout>
      </body>
    </html>
  )
}
