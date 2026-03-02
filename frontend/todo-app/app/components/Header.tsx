'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-[#FCFAEF] border-b border-[#DBD0BD] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-[#FF6700] rounded-lg blur opacity-40 group-hover:opacity-60 transition duration-300" />
              <svg
                className="relative h-8 w-8 text-[#0C5446] transform group-hover:scale-110 transition-transform duration-200"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-[#0C5446]">
              TaskFlow
            </h1>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                href="/chat"
                className="px-3 py-2 text-sm font-medium text-[#0C5446] hover:text-[#FF6700] transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span className="hidden md:inline">Chat</span>
              </Link>
              <Link
                href="/dashboard"
                className="hidden sm:flex px-4 py-2 text-sm font-medium text-white bg-[#FF6700] rounded-lg hover:bg-[#e55c00] transition items-center gap-2 shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Dashboard
              </Link>

              <div className="relative">
                <button
                  ref={buttonRef}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-[#FF6700] focus:ring-offset-2 focus:ring-offset-[#FCFAEF] rounded-full"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-8 w-8 rounded-full ring-2 ring-[#DBD0BD] hover:ring-[#FF6700] transition object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-[#0C5446] flex items-center justify-center text-white font-semibold text-sm ring-2 ring-[#DBD0BD] hover:ring-[#FF6700] transition">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="hidden md:block text-sm font-medium text-[#0C5446]">
                    {user?.name || 'User'}
                  </span>
                  <svg
                    className={`hidden md:block w-4 h-4 text-[#0C5446] transition-transform duration-200 ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div
                    ref={dropdownRef}
                    className="absolute right-0 mt-2 w-48 rounded-lg bg-[#FCFAEF] border border-[#DBD0BD] shadow-xl py-1 z-50"
                  >
                    <div className="px-4 py-2 border-b border-[#DBD0BD]">
                      <p className="text-sm font-medium text-[#0C5446]">{user?.name}</p>
                      {user?.email && (
                        <p className="text-xs text-[#0C5446]/70 truncate">{user.email}</p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-[#FF6700] hover:bg-[#DBD0BD] hover:text-[#0C5446] transition"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-[#0C5446] border border-[#DBD0BD] rounded-lg hover:bg-[#DBD0BD] transition"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-sm font-medium text-white bg-[#FF6700] rounded-lg hover:bg-[#e55c00] hover:scale-105 transition shadow-md"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}