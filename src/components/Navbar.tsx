'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { localeNames, Locale } from '@/lib/i18n';

const navItems = [
  { key: 'home', href: '/', icon: 'home' },
  { key: 'fairyTale', href: '/fairy-tale', icon: 'book' },
  { key: 'futurePath', href: '/future-path', icon: 'star' },
  { key: 'nutrifai', href: '/nutrifai', icon: 'heart' },
] as const;

const desktopNavItems = [
  ...navItems,
  { key: 'tokens', href: '/tokens', icon: 'coin' },
] as const;

function NavIcon({ icon, size = 20 }: { icon: string; size?: number }) {
  switch (icon) {
    case 'home':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case 'book':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
    case 'star':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    case 'heart':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      );
    case 'coin':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v12M6 12h12" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Navbar() {
  const { t, locale, setLocale, tokens, isAuthenticated, user, logout } = useApp();
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <>
      {/* Top navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 px-4 py-3"
      >
        <div className="max-w-7xl mx-auto">
          <div className="glass-strong rounded-2xl px-3 sm:px-6 py-3 flex items-center justify-between gap-2">
            {/* Logo - always visible */}
            <Link href="/" className="flex items-center gap-2 min-w-0 shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center relative shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
                <svg width="7" height="7" viewBox="0 0 24 24" fill="white" className="absolute -top-0.5 -right-0.5">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-bold text-sm sm:text-lg text-white">DreamLabs</span>
                <span className="text-[9px] sm:text-xs text-purple-400">by Xyrenium</span>
              </div>
            </Link>

            {/* Desktop Nav - hidden on mobile */}
            {isAuthenticated && !isAuthPage && (
              <div className="hidden lg:flex items-center gap-1">
                {desktopNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  const label = t.nav[item.key];
                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      className={'relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ' + (isActive ? 'text-white' : 'text-white/60 hover:text-white/90')}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="navbar-indicator"
                          className="absolute inset-0 bg-white/10 rounded-xl"
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <span className="relative z-10">{label}</span>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Right side controls */}
            <div className="flex items-center gap-1 sm:gap-3 shrink-0">
              {/* Token balance */}
              {isAuthenticated && (
                <Link
                  href="/tokens"
                  className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/20 hover:border-purple-500/40 transition-all"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400 shrink-0">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v12M6 12h12" />
                  </svg>
                  <span className="text-xs sm:text-sm font-semibold text-white">{tokens}</span>
                </Link>
              )}

              {/* User menu with language toggle inside */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-white/70 hidden sm:block">{user?.name}</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/50 hidden sm:block">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 glass-strong rounded-xl overflow-hidden py-1 z-50"
                      >
                        {/* User info */}
                        <div className="px-4 py-2 border-b border-white/5">
                          <p className="text-sm text-white font-medium">{user?.name}</p>
                          <p className="text-xs text-white/40">{user?.email}</p>
                        </div>

                        {/* Language selector */}
                        <div className="px-4 py-2 border-b border-white/5">
                          <p className="text-xs text-white/40 mb-2">Language</p>
                          <div className="flex gap-1">
                            {(Object.keys(localeNames) as Locale[]).map((l) => (
                              <button
                                key={l}
                                onClick={() => setLocale(l)}
                                className={'flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ' + (l === locale ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent')}
                              >
                                {l.toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Logout */}
                        <button
                          onClick={() => { logout(); setUserMenuOpen(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                          </svg>
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : !isAuthPage && (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition-all"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile bottom nav - only on mobile when authenticated */}
      {isAuthenticated && !isAuthPage && (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
          <div className="glass-strong border-t border-white/10 px-2 py-2 flex items-center justify-around">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const label = t.nav[item.key];
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={'flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all min-w-[60px] ' + (isActive ? 'text-purple-400' : 'text-white/40 hover:text-white/70')}
                >
                  <NavIcon icon={item.icon} size={20} />
                  <span className="text-[10px] font-medium leading-none">{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Click-away overlay for user menu */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
      )}
    </>
  );
}
