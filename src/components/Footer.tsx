'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export default function Footer() {
  const { t } = useApp();

  return (
    <footer className="relative border-t border-white/5 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center relative">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              <svg width="6" height="6" viewBox="0 0 24 24" fill="white" className="absolute -top-0.5 -right-0.5">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-white">DreamLabs</span>
              <span className="text-xs text-purple-400 ml-1">by Xyrenium</span>
              <p className="text-xs text-white/40 mt-0.5">{t.footer.tagline}</p>
            </div>
          </div>

          <div className="text-center md:text-right">
            <p className="text-sm text-white/40">
              &copy; 2026 DreamLabs by Xyrenium. {t.footer.rights}
            </p>
            <p className="text-xs text-white/30 mt-1">{t.footer.madeWith}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
