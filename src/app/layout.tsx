import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  metadataBase: new URL('https://webp.huzi.pk'),
  title: 'WebP Converter & Optimizer - webp.huzi.pk',
  description:
    'Convert images to WebP online. Free, fast, and private image optimization.',
  keywords: [
    'WebP converter',
    'image optimizer',
    'convert to WebP',
    'JPG to WebP',
    'PNG to WebP',
    'online image converter',
    'image compression',
  ],
  authors: [{ name: 'huzi.pk', url: 'https://webp.huzi.pk' }],
  openGraph: {
    title: 'WebP Converter & Optimizer - webp.huzi.pk',
    description:
      'Convert images to WebP online. Free, fast, and private image optimization.',
    url: 'https://webp.huzi.pk',
    siteName: 'webp.huzi.pk',
    images: [
      {
        url: 'https://placehold.co/1200x630.png',
        width: 1200,
        height: 630,
        alt: 'WebP Converter & Optimizer',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WebP Converter & Optimizer - webp.huzi.pk',
    description:
      'Convert images to WebP online. Free, fast, and private image optimization.',
    images: ['https://placehold.co/1200x630.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
