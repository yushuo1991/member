'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-semibold text-gray-900">
            Member<span className="text-[#007AFF]">System</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 transition-colors duration-300"
            >
              首页
            </Link>
            <Link
              href="/membership"
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
                    <span className="text-gray-600">
                      {user?.username}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="px-6 py-2 bg-gray-100 text-gray-900 rounded-full hover:bg-gray-200 transition-all duration-300 font-semibold text-sm"
                    >
                      退出登录
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
                      className="px-6 py-2 bg-[#007AFF] text-white rounded-full hover:bg-[#0051D5] transition-all duration-300 font-semibold text-sm shadow-sm hover:shadow-md"
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
          <div className="md:hidden py-4 space-y-4">
            <Link
              href="/"
              className="block text-gray-600 hover:text-gray-900 transition-colors duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              首页
            </Link>
            <Link
              href="/membership"
              className="block text-gray-600 hover:text-gray-900 transition-colors duration-300"
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
                      className="block text-gray-600 hover:text-gray-900 transition-colors duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      会员中心
                    </Link>
                    <div className="text-gray-600 font-medium">
                      {user?.username}
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-center px-6 py-2 bg-gray-100 text-gray-900 rounded-full hover:bg-gray-200 transition-all duration-300"
                    >
                      退出登录
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block text-gray-600 hover:text-gray-900 transition-colors duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      登录
                    </Link>
                    <Link
                      href="/register"
                      className="block w-full text-center px-6 py-2 bg-[#007AFF] text-white rounded-full hover:bg-[#0051D5] transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      注册
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
