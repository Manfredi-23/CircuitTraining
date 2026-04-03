import type { Metadata, Viewport } from 'next';
import { Kode_Mono } from 'next/font/google';
import './globals.css';

const kodeMono = Kode_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-kode',
});

export const metadata: Metadata = {
  title: '7Bit',
  description: 'Adaptive circuit training for climbers',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '7Bit',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#E4E2DD',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={kodeMono.variable}>
      <head>
        <link rel="apple-touch-icon" href="/images/home-pushups.png" />
      </head>
      <body style={{ fontFamily: 'var(--font-kode), monospace' }}>
        {children}
      </body>
    </html>
  );
}
