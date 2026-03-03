'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Locale, getTranslations, detectLocale, Translations } from '@/lib/i18n';

export type Currency = 'IDR' | 'USD';
export type Theme = 'dark' | 'light';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface TokenTransaction {
  id: string;
  type: 'purchase' | 'usage' | 'bonus';
  amount: number;
  description: string;
  date: string;
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  tokens: number;
  setTokens: (tokens: number) => void;
  deductTokens: (amount: number, description: string) => boolean;
  addTokens: (amount: number, description: string) => void;
  transactions: TokenTransaction[];
  isNavOpen: boolean;
  setIsNavOpen: (open: boolean) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [locale, setLocaleState] = useState<Locale>('en');
  const [theme, setThemeState] = useState<Theme>('dark');
  const [currency, setCurrencyState] = useState<Currency>('IDR');
  const [tokens, setTokensState] = useState(0);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Sync tokens to server
  const syncTokensToServer = useCallback(async (userId: string, newTokens: number, tx?: TokenTransaction) => {
    try {
      await fetch('/api/auth/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, tokens: newTokens, transaction: tx }),
      });
    } catch (e) {
      console.error('Failed to sync tokens to server:', e);
    }
  }, []);

  useEffect(() => {
    setMounted(true);

    const savedLocale = localStorage.getItem('dreamlabs-locale') as Locale | null;
    if (savedLocale && ['en', 'id', 'zh'].includes(savedLocale)) {
      setLocaleState(savedLocale);
    } else {
      setLocaleState(detectLocale());
    }

    const savedTheme = localStorage.getItem('dreamlabs-theme') as Theme | null;
    if (savedTheme && ['dark', 'light'].includes(savedTheme)) {
      setThemeState(savedTheme);
    }

    const savedCurrency = localStorage.getItem('dreamlabs-currency') as Currency | null;
    if (savedCurrency && ['IDR', 'USD'].includes(savedCurrency)) {
      setCurrencyState(savedCurrency);
    }

    // Restore session from localStorage, then sync from server
    const savedUser = localStorage.getItem('dreamlabs-user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);

      // Load local cache first for instant display
      const cachedTokens = localStorage.getItem('dreamlabs-tokens-' + userData.id);
      if (cachedTokens) setTokensState(parseInt(cachedTokens, 10));
      const cachedTx = localStorage.getItem('dreamlabs-transactions-' + userData.id);
      if (cachedTx) setTransactions(JSON.parse(cachedTx));

      // Then fetch latest from server
      fetch('/api/auth/tokens?userId=' + userData.id)
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            setTokensState(data.tokens);
            setTransactions(data.transactions || []);
            localStorage.setItem('dreamlabs-tokens-' + userData.id, String(data.tokens));
            localStorage.setItem('dreamlabs-transactions-' + userData.id, JSON.stringify(data.transactions || []));
          }
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', theme);
      if (theme === 'light') {
        document.documentElement.classList.add('light-theme');
      } else {
        document.documentElement.classList.remove('light-theme');
      }
    }
  }, [theme, mounted]);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('dreamlabs-locale', l);
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem('dreamlabs-theme', t);
  };

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem('dreamlabs-currency', c);
  };

  const setTokens = (val: number) => {
    setTokensState(val);
    if (user) {
      localStorage.setItem('dreamlabs-tokens-' + user.id, String(val));
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        const userData: User = data.user;
        setUser(userData);
        setTokensState(data.tokens);
        setTransactions(data.transactions || []);

        localStorage.setItem('dreamlabs-user', JSON.stringify(userData));
        localStorage.setItem('dreamlabs-tokens-' + userData.id, String(data.tokens));
        localStorage.setItem('dreamlabs-transactions-' + userData.id, JSON.stringify(data.transactions || []));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();

      if (data.success) {
        const userData: User = data.user;
        setUser(userData);
        setTokensState(data.tokens);
        setTransactions(data.transactions || []);

        localStorage.setItem('dreamlabs-user', JSON.stringify(userData));
        localStorage.setItem('dreamlabs-tokens-' + userData.id, String(data.tokens));
        localStorage.setItem('dreamlabs-transactions-' + userData.id, JSON.stringify(data.transactions || []));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setTokensState(0);
    setTransactions([]);
    localStorage.removeItem('dreamlabs-user');
  };

  const deductTokens = (amount: number, description: string): boolean => {
    if (!user) return false;
    if (tokens < amount) return false;

    const newBalance = tokens - amount;
    setTokensState(newBalance);
    localStorage.setItem('dreamlabs-tokens-' + user.id, String(newBalance));

    const tx: TokenTransaction = {
      id: Date.now().toString(),
      type: 'usage',
      amount: -amount,
      description,
      date: new Date().toISOString(),
    };
    const newTx = [tx, ...transactions];
    setTransactions(newTx);
    localStorage.setItem('dreamlabs-transactions-' + user.id, JSON.stringify(newTx));

    syncTokensToServer(user.id, newBalance, tx);
    return true;
  };

  const addTokens = (amount: number, description: string) => {
    if (!user) return;

    const newBalance = tokens + amount;
    setTokensState(newBalance);
    localStorage.setItem('dreamlabs-tokens-' + user.id, String(newBalance));

    const tx: TokenTransaction = {
      id: Date.now().toString(),
      type: 'purchase',
      amount,
      description,
      date: new Date().toISOString(),
    };
    const newTx = [tx, ...transactions];
    setTransactions(newTx);
    localStorage.setItem('dreamlabs-transactions-' + user.id, JSON.stringify(newTx));

    syncTokensToServer(user.id, newBalance, tx);
  };

  const t = getTranslations(locale);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        locale,
        setLocale,
        t,
        theme,
        setTheme,
        currency,
        setCurrency,
        tokens,
        setTokens,
        deductTokens,
        addTokens,
        transactions,
        isNavOpen,
        setIsNavOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
