import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  metadataBase: new URL('https://webp.huzi.pk'),
  title: 'WebP Image Optimizer | Convert to WebP Online',
  description:
    'Instantly convert and optimize your JPG, PNG, GIF images to the highly efficient WebP format with a single click. Free, fast, and secure online tool.',
  keywords: [
    'WebP converter',
    'Image optimizer',
    'Convert to WebP',
    'JPG to WebP',
    'PNG to WebP',
    'Online image converter',
    'Image compression',
  ],
  authors: [{ name: 'Huzi.pk', url: 'https://webp.huzi.pk' }],
  openGraph: {
    title: 'WebP Image Optimizer | Convert to WebP Online',
    description:
      'Instantly convert and optimize your JPG, PNG, GIF images to the highly efficient WebP format.',
    url: 'https://webp.huzi.pk',
    siteName: 'WebP Image Optimizer',
    images: [
      {
        url: 'https://webp.huzi.pk/og-image.png', // It's good practice to have an OG image
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WebP Image Optimizer | Convert to WebP Online',
    description:
      'Fast, free, and secure tool to convert images to the modern WebP format.',
    // creator: "@yourtwitterhandle", // Optional: add your twitter handle
    images: ['https://webp.huzi.pk/og-image.png'],
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
          defaultTheme="system"
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
