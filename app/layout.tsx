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
  subsets: ["latin", "latin-ext"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: {
    default: "MegVax — Tüm Reklamlarınızı Tek Yerden Yönetin",
    template: "%s | MegVax"
  },
  description: "Meta reklam hesaplarınızı tek panelden yönetin. AI destekli optimizasyon ve otomasyon ile ROAS'ınızı artırın.",
  keywords: ["meta reklamları", "facebook reklamları", "reklam yönetimi", "ROAS optimizasyon", "AI reklam", "kampanya yönetimi", "reklam otomasyonu", "meta ads", "ad management"],
  authors: [{ name: "MegVax" }],
  creator: "MegVax",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://megvax.com"),
  alternates: {
    languages: {
      'tr': '/',
      'en': '/?locale=en',
    },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    alternateLocale: "en_US",
    url: "/",
    siteName: "MegVax",
    title: "MegVax — Tüm Reklamlarınızı Tek Yerden Yönetin",
    description: "Meta reklam hesaplarınızı tek panelden yönetin. AI destekli optimizasyon ve otomasyon ile ROAS'ınızı artırın.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "MegVax — AI Destekli Reklam Yönetim Platformu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MegVax — Tüm Reklamlarınızı Tek Yerden Yönetin",
    description: "Meta reklam hesaplarınızı tek panelden yönetin. AI destekli optimizasyon ve otomasyon ile ROAS'ınızı artırın.",
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
        className={`${spaceGroteskHeading.variable} ${inter.variable} antialiased bg-[#FAFAF8] text-[#1A1A1A] font-sans overflow-x-hidden`}
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
