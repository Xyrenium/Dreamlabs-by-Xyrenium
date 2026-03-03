import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import ClientLayout from './client-layout';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'DreamLabs by Xyrenium - AI-Powered Dreams for Every Child',
  description: 'Create magical fairy tales, visualize future dreams, and nurture healthy growth — all powered by AI, designed for families worldwide.',
  keywords: ['AI', 'children', 'fairy tale', 'nutrition', 'stunting prevention', 'dreams', 'Xyrenium'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-sans">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
