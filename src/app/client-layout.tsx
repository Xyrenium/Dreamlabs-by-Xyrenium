'use client';

import React, { ReactNode } from 'react';
import { AppProvider } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackgroundEffects from '@/components/BackgroundEffects';

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <BackgroundEffects />
      <Navbar />
      {children}
      <Footer />
    </AppProvider>
  );
}
