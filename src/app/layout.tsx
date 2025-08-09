import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const logoUrl = 'https://i.postimg.cc/jqBXqV3b/webp-logo.webp';

export const metadata: Metadata = {
  metadataBase: new URL('https://webp.huzi.pk'),
  title: 'Free WebP Converter & Image Optimizer | Convert to WebP Online',
  description:
    'Effortlessly convert your images to the modern, high-performance WebP format. Our free online tool allows you to batch convert JPG, PNG, and GIF files, optimizing them for the web while maintaining quality.',
  keywords: [
    'WebP converter',
    'image optimizer',
    'convert to WebP',
    'JPG to WebP',
    'PNG to WebP',
    'GIF to WebP',
    'online image converter',
    'free image optimizer',
    'image compression',
    'batch image converter',
    'webp.huzi.pk',
  ],
  authors: [{ name: 'huzi.pk', url: 'https://webp.huzi.pk' }],
  openGraph: {
    title: 'Free WebP Converter & Image Optimizer | webp.huzi.pk',
    description:
      'Fast, free, and private batch image conversion to the high-quality WebP format. Optimize your images for better website performance.',
    url: 'https://webp.huzi.pk',
    siteName: 'webp.huzi.pk',
    images: [
      {
        url: logoUrl,
        width: 800,
        height: 800,
        alt: 'WebP Converter & Optimizer Logo',
      },
      {
        url: 'https://placehold.co/1200x630.png',
        width: 1200,
        height: 630,
        alt: 'WebP Converter & Optimizer Tool',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free WebP Converter & Image Optimizer | webp.huzi.pk',
    description:
      'Fast, free, and private batch image conversion to the high-quality WebP format. Optimize your images for better website performance.',
    images: [logoUrl],
  },
  icons: {
    icon: logoUrl,
    shortcut: logoUrl,
    apple: logoUrl,
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
