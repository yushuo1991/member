'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

// 会员等级显示名称
const LEVEL_NAMES: Record<string, string> = {
  none: '',
  monthly: '月费',
  quarterly: '季度',
  yearly: '年度',
  lifetime: '终身'
};

// 会员等级颜色
const LEVEL_COLORS: Record<string, string> = {
  none: 'bg-gray-100 text-gray-500',
  monthly: 'bg-blue-100 text-blue-600',
  quarterly: 'bg-purple-100 text-purple-600',
  yearly: 'bg-orange-100 text-orange-600',
  lifetime: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
};

export default function Navbar() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const memberLevel = user?.membershipLevel || 'none';
  const levelName = LEVEL_NAMES[memberLevel] || '';
  const levelColor = LEVEL_COLORS[memberLevel] || LEVEL_COLORS.none;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="text-xl sm:text-2xl font-semibold text-gray-900">
            宇硕<span className="text-[#ff8c42]">短线</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 transition-colors duration-300"
            >
              首页
            </Link>
            <Link
              href="/#products"
              className="text-gray-600 hover:text-gray-900 transition-colors duration-300"
            >
              产品
            </Link>
            <Link
              href="/#pricing"
              className="text-gray-600 hover:text-gray-900 transition-colors duration-300"
            >
              会员方案
            </Link>

            {!loading && (
              <>
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/member"
                      className="text-gray-600 hover:text-gray-900 transition-colors duration-300"
                    >
                      会员中心
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700 text-sm font-medium">
                        {user?.username}
                      </span>
                      {levelName && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${levelColor}`}>
                          {levelName}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="px-4 sm:px-6 py-2 bg-gray-100 text-gray-900 rounded-full hover:bg-gray-200 transition-all duration-300 font-medium text-sm"
                    >
                      退出
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-gray-600 hover:text-gray-900 transition-colors duration-300"
                    >
                      登录
                    </Link>
                    <Link
                      href="/register"
                      className="px-4 sm:px-6 py-2 bg-[#ff8c42] text-white rounded-full hover:bg-[#e67d3a] transition-all duration-300 font-medium text-sm shadow-sm hover:shadow-md"
                    >
                      注册
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors duration-300"
            aria-label="菜单"
          >
            <svg
              className="w-6 h-6 text-gray-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-gray-100">
            <Link
              href="/"
              className="block py-2 text-gray-600 hover:text-gray-900 transition-colors duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              首页
            </Link>
            <Link
              href="/#products"
              className="block py-2 text-gray-600 hover:text-gray-900 transition-colors duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              产品
            </Link>
            <Link
              href="/#pricing"
              className="block py-2 text-gray-600 hover:text-gray-900 transition-colors duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              会员方案
            </Link>

            {!loading && (
              <>
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/member"
                      className="block py-2 text-gray-600 hover:text-gray-900 transition-colors duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      会员中心
                    </Link>
                    <div className="py-2 flex items-center gap-2">
                      <span className="text-gray-700 font-medium text-sm">{user?.username}</span>
                      {levelName && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${levelColor}`}>
                          {levelName}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-center py-2.5 bg-gray-100 text-gray-900 rounded-full hover:bg-gray-200 transition-all duration-300 font-medium"
                    >
                      退出登录
                    </button>
                  </>
                ) : (
                  <div className="flex gap-3 pt-2">
                    <Link
                      href="/login"
                      className="flex-1 text-center py-2.5 bg-gray-100 text-gray-900 rounded-full hover:bg-gray-200 transition-all duration-300 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      登录
                    </Link>
                    <Link
                      href="/register"
                      className="flex-1 text-center py-2.5 bg-[#ff8c42] text-white rounded-full hover:bg-[#e67d3a] transition-all duration-300 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      注册
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
