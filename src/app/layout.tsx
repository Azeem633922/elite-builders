import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { ClerkProvider } from '@clerk/nextjs';
import { TRPCProvider } from '@/lib/trpc-provider';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'EliteBuilders — AI-Powered MVP Competitions',
  description:
    'A competitive platform where solo builders submit AI-powered MVPs for company-sponsored challenges.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <TRPCProvider>
            {children}
            <Toaster />
          </TRPCProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
