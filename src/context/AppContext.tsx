'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  
  // Locale
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
  
  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;
  
  // Currency
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  
  // Tokens
  tokens: number;
  setTokens: (tokens: number) => void;
  deductTokens: (amount: number, description: string) => boolean;
  addTokens: (amount: number, description: string) => void;
  transactions: TokenTransaction[];
  
  // UI
  isNavOpen: boolean;
  setIsNavOpen: (open: boolean) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

const INITIAL_TOKENS = 300;

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [locale, setLocaleState] = useState<Locale>('en');
  const [theme, setThemeState] = useState<Theme>('dark');
  const [currency, setCurrencyState] = useState<Currency>('IDR');
  const [tokens, setTokens] = useState(0);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Load locale
    const savedLocale = localStorage.getItem('dreamlabs-locale') as Locale | null;
    if (savedLocale && ['en', 'id', 'zh'].includes(savedLocale)) {
      setLocaleState(savedLocale);
    } else {
      setLocaleState(detectLocale());
    }
    
    // Load theme
    const savedTheme = localStorage.getItem('dreamlabs-theme') as Theme | null;
    if (savedTheme && ['dark', 'light'].includes(savedTheme)) {
      setThemeState(savedTheme);
    }
    
    // Load currency
    const savedCurrency = localStorage.getItem('dreamlabs-currency') as Currency | null;
    if (savedCurrency && ['IDR', 'USD'].includes(savedCurrency)) {
      setCurrencyState(savedCurrency);
    }
    
    // Load user session
    const savedUser = localStorage.getItem('dreamlabs-user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      
      // Load user's tokens
      const userTokens = localStorage.getItem(`dreamlabs-tokens-${userData.id}`);
      if (userTokens) setTokens(parseInt(userTokens, 10));
      
      // Load user's transactions
      const userTx = localStorage.getItem(`dreamlabs-transactions-${userData.id}`);
      if (userTx) setTransactions(JSON.parse(userTx));
    }
  }, []);

  // Apply theme to document
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

  const login = async (email: string, password: string): Promise<boolean> => {
    // In production, this would call your backend API
    // For now, we simulate login by checking localStorage
    const users = JSON.parse(localStorage.getItem('dreamlabs-users') || '[]');
    const foundUser = users.find((u: { email: string; password: string }) => 
      u.email === email && u.password === password
    );
    
    if (foundUser) {
      const userData: User = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        createdAt: foundUser.createdAt,
      };
      setUser(userData);
      localStorage.setItem('dreamlabs-user', JSON.stringify(userData));
      
      // Load user's tokens
      const userTokens = localStorage.getItem(`dreamlabs-tokens-${userData.id}`);
      if (userTokens) {
        setTokens(parseInt(userTokens, 10));
      } else {
        setTokens(INITIAL_TOKENS);
        localStorage.setItem(`dreamlabs-tokens-${userData.id}`, String(INITIAL_TOKENS));
      }
      
      // Load user's transactions
      const userTx = localStorage.getItem(`dreamlabs-transactions-${userData.id}`);
      if (userTx) {
        setTransactions(JSON.parse(userTx));
      }
      
      return true;
    }
    return false;
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    // In production, this would call your backend API
    const users = JSON.parse(localStorage.getItem('dreamlabs-users') || '[]');
    
    // Check if email already exists
    if (users.find((u: { email: string }) => u.email === email)) {
      return false;
    }
    
    const newUser = {
      id: `user_${Date.now()}`,
      email,
      password, // In production, NEVER store plain text passwords
      name,
      createdAt: new Date().toISOString(),
    };
    
    users.push(newUser);
    localStorage.setItem('dreamlabs-users', JSON.stringify(users));
    
    // Create user session
    const userData: User = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      createdAt: newUser.createdAt,
    };
    setUser(userData);
    localStorage.setItem('dreamlabs-user', JSON.stringify(userData));
    
    // Give initial tokens
    setTokens(INITIAL_TOKENS);
    localStorage.setItem(`dreamlabs-tokens-${newUser.id}`, String(INITIAL_TOKENS));
    
    // Add welcome bonus transaction
    const welcomeTx: TokenTransaction = {
      id: Date.now().toString(),
      type: 'bonus',
      amount: INITIAL_TOKENS,
      description: 'Welcome bonus - 300 free tokens!',
      date: new Date().toISOString(),
    };
    setTransactions([welcomeTx]);
    localStorage.setItem(`dreamlabs-transactions-${newUser.id}`, JSON.stringify([welcomeTx]));
    
    return true;
  };

  const logout = () => {
    setUser(null);
    setTokens(0);
    setTransactions([]);
    localStorage.removeItem('dreamlabs-user');
  };

  const deductTokens = (amount: number, description: string): boolean => {
    if (!user) return false;
    if (tokens < amount) return false;
    
    const newBalance = tokens - amount;
    setTokens(newBalance);
    localStorage.setItem(`dreamlabs-tokens-${user.id}`, String(newBalance));
    
    const tx: TokenTransaction = {
      id: Date.now().toString(),
      type: 'usage',
      amount: -amount,
      description,
      date: new Date().toISOString(),
    };
    const newTx = [tx, ...transactions];
    setTransactions(newTx);
    localStorage.setItem(`dreamlabs-transactions-${user.id}`, JSON.stringify(newTx));
    return true;
  };

  const addTokens = (amount: number, description: string) => {
    if (!user) return;
    
    const newBalance = tokens + amount;
    setTokens(newBalance);
    localStorage.setItem(`dreamlabs-tokens-${user.id}`, String(newBalance));
    
    const tx: TokenTransaction = {
      id: Date.now().toString(),
      type: 'purchase',
      amount,
      description,
      date: new Date().toISOString(),
    };
    const newTx = [tx, ...transactions];
    setTransactions(newTx);
    localStorage.setItem(`dreamlabs-transactions-${user.id}`, JSON.stringify(newTx));
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
