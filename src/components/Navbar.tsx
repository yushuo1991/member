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
    <nav className="fixed top-0 left-0 right-0 bg-[#fbfbfd]/80 backdrop-blur-2xl border-b border-[#d2d2d7]/50 z-50">
      <div className="max-w-[980px] mx-auto px-5">
        <div className="flex justify-between items-center h-11">
          {/* Logo */}
          <Link href="/" className="text-[17px] font-semibold text-[#1d1d1f] -tracking-[0.022em] hover:opacity-80 transition-opacity">
            御朔复盘
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-[13px] text-[#1d1d1f] hover:opacity-80 transition-opacity font-normal"
            >
              首页
            </Link>
            <Link
              href="/membership"
              className="text-[13px] text-[#1d1d1f] hover:opacity-80 transition-opacity font-normal"
            >
              会员方案
            </Link>

            {!loading && (
              <>
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/member"
                      className="text-[13px] text-[#1d1d1f] hover:opacity-80 transition-opacity font-normal"
                    >
                      会员中心
                    </Link>
                    <span className="text-[13px] text-[#6e6e73] font-normal">
                      {user?.username}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="text-[13px] text-[#1d1d1f] hover:opacity-80 transition-opacity font-normal"
                    >
                      退出
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-[13px] text-[#1d1d1f] hover:opacity-80 transition-opacity font-normal"
                    >
                      登录
                    </Link>
                    <Link
                      href="/register"
                      className="px-4 py-1.5 bg-[#0071E3] text-white text-[13px] rounded-full hover:bg-[#0077ED] transition-all duration-150 font-normal"
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
            className="md:hidden p-1.5 rounded-lg hover:bg-[#f5f5f7] transition-colors duration-150"
            aria-label="Menu"
          >
            <svg
              className="w-5 h-5 text-[#1d1d1f]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-[#d2d2d7]/50 animate-fade-in">
            <Link
              href="/"
              className="block text-[15px] text-[#1d1d1f] hover:opacity-80 transition-opacity py-1"
              onClick={() => setIsMenuOpen(false)}
            >
              首页
            </Link>
            <Link
              href="/membership"
              className="block text-[15px] text-[#1d1d1f] hover:opacity-80 transition-opacity py-1"
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
                      className="block text-[15px] text-[#1d1d1f] hover:opacity-80 transition-opacity py-1"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      会员中心
                    </Link>
                    <div className="text-[15px] text-[#6e6e73] py-1">
                      {user?.username}
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left text-[15px] text-[#1d1d1f] hover:opacity-80 transition-opacity py-1"
                    >
                      退出登录
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block text-[15px] text-[#1d1d1f] hover:opacity-80 transition-opacity py-1"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      登录
                    </Link>
                    <Link
                      href="/register"
                      className="block w-full text-center px-4 py-2 bg-[#0071E3] text-white text-[15px] rounded-full hover:bg-[#0077ED] transition-all duration-150 mt-2"
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
