'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import PageWrapper, { SectionHeader } from '@/components/PageWrapper';

declare global {
  interface Window {
    snap?: {
      pay: (token: string, callbacks: {
        onSuccess?: (result: Record<string, string>) => void;
        onPending?: (result: Record<string, string>) => void;
        onError?: (result: Record<string, string>) => void;
        onClose?: () => void;
      }) => void;
    };
  }
}

const PRICE_PER_TOKEN_IDR = 100;
const PRICE_PER_TOKEN_USD = 0.01;
const MIN_TOKENS = 100;

export default function TokensPage() {
  const { t, tokens, addTokens, transactions, currency, setCurrency, isAuthenticated, locale } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tokenAmount, setTokenAmount] = useState(100);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'buy' | 'history'>('buy');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [snapLoaded, setSnapLoaded] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Load Midtrans Snap.js for IDR payments
  useEffect(() => {
    if (currency !== 'IDR') return;
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
    if (!clientKey) return;

    const existingScript = document.getElementById('midtrans-snap');
    if (existingScript) {
      setSnapLoaded(!!window.snap);
      return;
    }

    const isProduction = clientKey.startsWith('Mid-client-') && !clientKey.includes('SB-');
    const snapUrl = isProduction
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';

    const script = document.createElement('script');
    script.id = 'midtrans-snap';
    script.src = snapUrl;
    script.setAttribute('data-client-key', clientKey);
    script.onload = () => setSnapLoaded(true);
    script.onerror = () => console.error('Failed to load Midtrans Snap.js');
    document.head.appendChild(script);
  }, [currency]);

  // Handle payment return from PayPal redirect
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const returnedTokens = searchParams.get('tokens');

    if (paymentStatus === 'success' && returnedTokens) {
      const amount = parseInt(returnedTokens, 10);
      if (amount > 0) {
        addTokens(amount, 'Purchased ' + amount + ' tokens via PayPal');
        setStatusMessage({ type: 'success', text: t.tokens.paymentSuccess });
      }
      // Clean URL params
      window.history.replaceState({}, '', '/tokens');
    } else if (paymentStatus === 'cancelled') {
      setStatusMessage({ type: 'info', text: t.tokens.paymentCancelled });
      window.history.replaceState({}, '', '/tokens');
    } else if (paymentStatus === 'failed') {
      setStatusMessage({ type: 'error', text: t.tokens.paymentFailed });
      window.history.replaceState({}, '', '/tokens');
    }
  }, [searchParams, addTokens, t]);

  if (!isAuthenticated) return null;

  const pricePerToken = currency === 'IDR' ? PRICE_PER_TOKEN_IDR : PRICE_PER_TOKEN_USD;
  const totalPrice = tokenAmount * pricePerToken;

  const formatPrice = (amount: number) => {
    if (currency === 'IDR') return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
    return '$' + amount.toFixed(2);
  };

  const handleTokenAmountChange = (value: string) => {
    const num = parseInt(value, 10);
    if (isNaN(num)) {
      setTokenAmount(0);
    } else {
      setTokenAmount(num);
    }
  };

  const processPayment = async () => {
    if (tokenAmount < MIN_TOKENS) return;
    setProcessing(true);
    setStatusMessage(null);

    try {
      if (currency === 'IDR') {
        // Midtrans Snap flow
        const response = await fetch('/api/payment/midtrans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tokens: tokenAmount,
            amount: totalPrice,
            currency: 'IDR',
            locale,
          }),
        });

        const data = await response.json();

        if (!data.success) {
          setStatusMessage({ type: 'error', text: data.error || t.tokens.paymentFailed });
          setProcessing(false);
          return;
        }

        if (window.snap && data.snapToken) {
          // Use Snap popup
          try {
            window.snap.pay(data.snapToken, {
              onSuccess: () => {
                addTokens(tokenAmount, 'Purchased ' + tokenAmount + ' tokens via Midtrans');
                setStatusMessage({ type: 'success', text: t.tokens.paymentSuccess });
                setProcessing(false);
              },
              onPending: () => {
                setStatusMessage({ type: 'info', text: 'Payment pending. Tokens will be added after confirmation.' });
                setProcessing(false);
              },
              onError: () => {
                setStatusMessage({ type: 'error', text: t.tokens.paymentFailed });
                setProcessing(false);
              },
              onClose: () => {
                setProcessing(false);
              },
            });
          } catch (snapErr) {
            console.error('Snap.pay error:', snapErr);
            // Fallback to redirect if Snap popup fails
            if (data.redirectUrl) {
              window.location.href = data.redirectUrl;
            } else {
              setStatusMessage({ type: 'error', text: t.tokens.paymentFailed });
              setProcessing(false);
            }
          }
        } else if (data.redirectUrl) {
          // Fallback to redirect
          setStatusMessage({ type: 'info', text: t.tokens.redirecting });
          window.location.href = data.redirectUrl;
        } else {
          setStatusMessage({ type: 'error', text: t.tokens.paymentFailed });
          setProcessing(false);
        }
      } else {
        // PayPal redirect flow
        const response = await fetch('/api/payment/paypal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tokens: tokenAmount,
            amount: totalPrice,
            currency: 'USD',
            locale,
          }),
        });

        const data = await response.json();

        if (data.success && data.approvalUrl) {
          setStatusMessage({ type: 'info', text: t.tokens.redirecting });
          window.location.href = data.approvalUrl;
        } else {
          setStatusMessage({ type: 'error', text: data.error || t.tokens.paymentFailed });
          setProcessing(false);
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      setStatusMessage({ type: 'error', text: t.tokens.paymentFailed });
      setProcessing(false);
    }
  };

  const quickAmounts = [100, 300, 500, 1000, 2000, 5000];

  return (
    <PageWrapper>
      <SectionHeader title={t.tokens.title} subtitle={t.tokens.subtitle} badge="Token System" />

      {/* Status Message */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={'max-w-md mx-auto mb-6 p-4 rounded-xl text-sm text-center ' + (
              statusMessage.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' :
              statusMessage.type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-400' :
              'bg-blue-500/10 border border-blue-500/20 text-blue-400'
            )}
          >
            {statusMessage.text}
            <button onClick={() => setStatusMessage(null)} className="ml-3 opacity-60 hover:opacity-100">x</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto mb-10"
      >
        <div className="glass-card rounded-3xl p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 pointer-events-none" />
          <div className="relative z-10">
            <p className="text-[var(--text-muted)] text-sm mb-2">{t.tokens.balance}</p>
            <div className="flex items-center justify-center gap-3 mb-2">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v12M6 12h12" />
              </svg>
              <span className="text-5xl font-extrabold">{tokens}</span>
            </div>
            <p className="text-[var(--text-muted)] text-sm">{t.common.tokens}</p>
          </div>
        </div>
      </motion.div>

      {/* Currency Selector */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="flex items-center justify-center gap-4 mb-6">
          <span className="text-[var(--text-secondary)] text-sm">{t.tokens.selectCurrency}:</span>
          <div className="flex gap-2 p-1 rounded-xl bg-[var(--bg-card)]">
            <button
              onClick={() => setCurrency('IDR')}
              className={'px-4 py-2 rounded-lg text-sm font-medium transition-all ' + (
                currency === 'IDR'
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              )}
            >
              IDR (Rupiah)
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={'px-4 py-2 rounded-lg text-sm font-medium transition-all ' + (
                currency === 'USD'
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              )}
            >
              USD (Dollar)
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-[var(--bg-card)] max-w-xs mx-auto">
          <button
            onClick={() => setActiveTab('buy')}
            className={'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ' + (
              activeTab === 'buy' ? 'bg-purple-500/20 text-purple-400' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            )}
          >
            {t.tokens.buyTokens}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ' + (
              activeTab === 'history' ? 'bg-purple-500/20 text-purple-400' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            )}
          >
            {t.tokens.history}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'buy' ? (
          <motion.div
            key="buy"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-lg mx-auto"
          >
            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
              {/* Token Amount Input */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  {t.tokens.tokenAmount}
                </label>
                <input
                  type="number"
                  min={MIN_TOKENS}
                  value={tokenAmount || ''}
                  onChange={(e) => handleTokenAmountChange(e.target.value)}
                  className="input-magic text-center text-2xl font-bold"
                  placeholder={String(MIN_TOKENS)}
                />
                <p className="text-xs text-[var(--text-muted)] mt-1.5 text-center">{t.tokens.minTokens}</p>
              </div>

              {/* Quick Amount Buttons */}
              <div className="flex flex-wrap gap-2 justify-center">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setTokenAmount(amt)}
                    className={'px-4 py-2 rounded-xl text-sm font-medium transition-all border ' + (
                      tokenAmount === amt
                        ? 'bg-purple-500/20 border-purple-500/30 text-purple-400'
                        : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--border-color-strong)]'
                    )}
                  >
                    {amt}
                  </button>
                ))}
              </div>

              {/* Pricing Info */}
              <div className="bg-[var(--bg-card)] rounded-2xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">{t.tokens.perToken}</span>
                  <span className="text-[var(--text-secondary)]">{formatPrice(pricePerToken)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">{t.tokens.tokenAmount}</span>
                  <span className="text-[var(--text-secondary)]">{tokenAmount} {t.common.tokens}</span>
                </div>
                <div className="border-t border-[var(--border-color)] pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">{t.tokens.totalPrice}</span>
                    <span className="text-xl font-extrabold gradient-text">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method Indicator */}
              <div className="flex items-center justify-center gap-3 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <span className="text-xl">{currency === 'IDR' ? '\uD83C\uDFE6' : '\uD83D\uDCB3'}</span>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm">{currency === 'IDR' ? 'Midtrans' : 'PayPal'}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {currency === 'IDR'
                      ? 'Bank Transfer, GoPay, OVO, DANA, ShopeePay'
                      : 'Credit Card, Debit Card, PayPal Balance'}
                  </p>
                </div>
              </div>

              {/* Buy Button */}
              <button
                onClick={processPayment}
                disabled={processing || tokenAmount < MIN_TOKENS}
                className="btn-magic w-full py-4 text-lg disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t.tokens.processingPayment}
                  </span>
                ) : (
                  t.tokens.buyTokens + ' - ' + formatPrice(totalPrice)
                )}
              </button>

              {tokenAmount > 0 && tokenAmount < MIN_TOKENS && (
                <p className="text-center text-sm text-amber-400/70">{t.tokens.minTokens}</p>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-2xl mx-auto"
          >
            <div className="glass-card rounded-3xl p-6">
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-[var(--text-muted)] mx-auto mb-3 opacity-30">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                  <p className="text-[var(--text-muted)] text-sm">{t.tokens.noHistory}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={'w-8 h-8 rounded-lg flex items-center justify-center ' + (
                          tx.type === 'purchase' || tx.type === 'bonus'
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-red-500/10 text-red-400'
                        )}>
                          {tx.type === 'purchase' || tx.type === 'bonus' ? '+' : '-'}
                        </div>
                        <div>
                          <p className="text-sm">{tx.description}</p>
                          <p className="text-xs text-[var(--text-muted)]">{new Date(tx.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={'text-sm font-bold ' + (tx.amount > 0 ? 'text-green-400' : 'text-red-400')}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
