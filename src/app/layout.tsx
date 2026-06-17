import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: {
    default: 'DMV Practice Tests - Free Online Permit & Driver\'s License Practice Tests',
    template: '%s | DMV Practice Tests',
  },
  description:
    'Free DMV practice tests for all 50 states. Prepare for your permit test, driver\'s license exam, or motorcycle test with 200+ realistic questions. Pass on your first try!',
  keywords: [
    'DMV practice test',
    'permit test',
    'driver\'s license test',
    'motorcycle endorsement test',
    'free practice test',
    'DMV written test',
    'knowledge test',
  ],
  authors: [{ name: 'DMV Practice Tests' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://dmvpracticetest.com',
    siteName: 'DMV Practice Tests',
    title: 'Free DMV Practice Tests for All 50 States',
    description:
      'Prepare for your DMV written test with free practice questions for all 50 states. Updated regularly with state-specific content.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free DMV Practice Tests for All 50 States',
    description:
      'Prepare for your DMV written test with free practice questions for all 50 states.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://dmvpracticetest.com'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
