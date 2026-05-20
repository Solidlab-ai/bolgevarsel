import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister'
import { CookieBanner } from '@/components/CookieBanner'
import './globals.css'

const BASE = 'https://bolgevarsel.no'
const GA_ID = 'G-5FT8K97G4J'

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: 'Bølgevarsel – Daglig sjøvarsel på SMS',
    template: '%s | Bølgevarsel',
  },
  description: 'Få daglig bølge- og værvarsel direkte på SMS — skreddersydd for din kystlokasjon langs norskekysten. Enkelt, pålitelig og norsk.',
  keywords: ['bølgevarsel', 'sjøvarsel', 'bølger SMS', 'værvarsel kyst', 'sjøvær Norge', 'bølgehøyde', 'kystvarsel', 'fiskevarsel', 'havvarsel', 'sjøforhold', 'fiske SMS varsel', 'bølgevarsel fisker'],
  authors: [{ name: 'Bølgevarsel', url: BASE }],
  creator: 'Solidlab.ai',
  publisher: 'Solidlab.ai',
  applicationName: 'Bølgevarsel',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Bølgevarsel',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: false,
  },
  alternates: {
    canonical: BASE,
  },
  openGraph: {
    type: 'website',
    locale: 'nb_NO',
    url: BASE,
    siteName: 'Bølgevarsel',
    title: 'Bølgevarsel – Daglig sjøvarsel på SMS',
    description: 'Få daglig bølge- og værvarsel direkte på SMS — skreddersydd for din kystlokasjon langs norskekysten.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Bølgevarsel – Daglig sjøvarsel på SMS' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bølgevarsel – Daglig sjøvarsel på SMS',
    description: 'Daglig bølge- og værvarsel direkte på SMS for norskekysten.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a2a3d',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no">
      <body>
        {children}
        <ServiceWorkerRegister />
        <CookieBanner />
        <Analytics />
        <SpeedInsights />
        {/* Google Consent Mode v2 — default DENIED til brukeren samtykker.
            Må kjøre FØR gtag.js lastes (beforeInteractive). */}
        <Script id="ga-consent-default" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('consent', 'default', {
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              analytics_storage: 'denied',
              wait_for_update: 500
            });
            // Les tidligere samtykke fra localStorage og oppdater hvis gitt
            try {
              if (localStorage.getItem('bv_cookie_consent') === 'granted') {
                gtag('consent', 'update', { analytics_storage: 'granted' });
              }
            } catch (e) {}
          `}
        </Script>
        {/* Google Analytics 4 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              page_path: window.location.pathname,
              anonymize_ip: true
            });
          `}
        </Script>
      </body>
    </html>
  )
}
