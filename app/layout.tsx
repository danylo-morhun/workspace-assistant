'use server';

import { Inter } from 'next/font/google';
import AppLayout from './components/AppLayout';
import Providers from './components/Providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <body className={inter.className}>
        <Providers>
          <AppLayout>{children}</AppLayout>
        </Providers>
      </body>
    </html>
  );
}
