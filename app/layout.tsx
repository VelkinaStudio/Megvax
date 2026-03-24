import type { Metadata } from "next";
import { headers } from "next/headers";
import { Space_Grotesk, Inter } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import { CookieConsent } from "@/components/ui/CookieConsent";
import { I18nProvider } from "@/lib/i18n";
import { AuthProvider } from '@/lib/auth-context';
import "./globals.css";

const spaceGroteskHeading = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Megvax - Manage Your Ads in One Dashboard",
    template: "%s | Megvax"
  },
  description: "Manage your Meta ad campaigns from one place. AI-powered optimizations and automations for better ROAS.",
  keywords: ["meta ads", "facebook ads", "ad management", "ROAS optimization", "AI advertising", "campaign management", "ad automation"],
  authors: [{ name: "Megvax" }],
  creator: "Megvax",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://megvax.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Megvax",
    title: "Megvax - Manage Your Ads in One Dashboard",
    description: "Manage your Meta ad campaigns from one place. AI-powered optimizations and automations for better ROAS.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Megvax - AI-Powered Ad Management Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Megvax - Manage Your Ads in One Dashboard",
    description: "Manage your Meta ad campaigns from one place. AI-powered optimizations and automations for better ROAS.",
    creator: "@megvax",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const locale = headersList.get('x-locale') || 'tr';

  return (
    <html lang={locale}>
      <body
        className={`${spaceGroteskHeading.variable} ${inter.variable} antialiased bg-gray-50 text-gray-900 font-sans overflow-x-hidden`}
      >
        <I18nProvider>
          <AuthProvider>
            <ToastProvider>
              {children}
              <CookieConsent />
            </ToastProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
