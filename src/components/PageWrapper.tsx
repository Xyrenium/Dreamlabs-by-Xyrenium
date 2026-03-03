'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
}

export default function PageWrapper({ children, className = '' }: PageWrapperProps) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`min-h-screen pt-24 pb-24 lg:pb-12 px-4 relative z-10 ${className}`}
    >
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </motion.main>
  );
}

export function SectionHeader({ title, subtitle, badge }: { title: string; subtitle: string; badge?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="text-center mb-12"
    >
      {badge && (
        <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-4">
          {badge}
        </span>
      )}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text mb-4">{title}</h1>
      <p className="text-white/50 text-base sm:text-lg max-w-2xl mx-auto">{subtitle}</p>
    </motion.div>
  );
}

export function LoadingOverlay({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-strong rounded-3xl p-8 flex flex-col items-center gap-4 max-w-sm mx-4"
      >
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-purple-500/30" />
          <div className="absolute inset-0 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-pink-500/30" />
          <div className="absolute inset-2 rounded-full border-2 border-pink-500 border-t-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
        </div>
        <p className="text-white/80 text-center font-medium">{message}</p>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-purple-400"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function TokenCostPreview({ cost, label }: { cost: number; label: string }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10">
      <span className="text-white/60 text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v12M6 12h12" />
        </svg>
        <span className="text-white font-bold text-lg">{cost}</span>
        <span className="text-white/40 text-sm">tokens</span>
      </div>
    </div>
  );
}

export function ConfirmModal({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-strong rounded-3xl p-6 max-w-sm w-full"
      >
        <p className="text-white text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-outline-magic flex-1 py-3 text-sm">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn-magic flex-1 py-3 text-sm">
            Confirm
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
