import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import ForWho from '@/components/ForWho'
import Pricing from '@/components/Pricing'
import FaqBolger from '@/components/FaqBolger'
import Footer from '@/components/Footer'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Bølgevarsel – Daglig sjøvarsel på SMS',
  description: 'Få daglig bølge- og værvarsel direkte på SMS — skreddersydd for din kystlokasjon langs norskekysten. Enkelt, pålitelig og norsk.',
  alternates: { canonical: 'https://bolgevarsel.no' },
  openGraph: {
    title: 'Bølgevarsel – Daglig sjøvarsel på SMS',
    description: 'Daglig sjøvarsel på SMS for norskekysten. Velg lokasjon og tidspunkt — vi gjør resten.',
    url: 'https://bolgevarsel.no',
  },
}

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Bølgevarsel',
          url: 'https://bolgevarsel.no',
          description: 'Daglig bølge- og sjøvarsel på SMS for norskekysten',
          publisher: {
            '@type': 'Organization',
            name: 'Solidlab.ai',
            url: 'https://bolgevarsel.no',
            contactPoint: { '@type': 'ContactPoint', email: 'hei@bolgevarsel.no', contactType: 'customer support', availableLanguage: 'Norwegian' }
          },
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://bolgevarsel.no/varsel?sok={search_term_string}',
            'query-input': 'required name=search_term_string'
          }
        }) }}
      />
      <Nav />
      <Hero />
      <HowItWorks />
      <ForWho />
      <div className="compass-divider" aria-hidden="true">
        <div className="compass-divider__top" />
        <div className="compass-divider__bottom" />
        <svg className="compass-divider__svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <clipPath id="compassClipTop"><rect x="0" y="0" width="64" height="32" /></clipPath>
            <clipPath id="compassClipBottom"><rect x="0" y="32" width="64" height="32" /></clipPath>
            <g id="compassMark">
              <circle cx="32" cy="32" r="30" strokeWidth="0.6" fill="none"/>
              <circle cx="32" cy="32" r="22" strokeWidth="0.3" fill="none"/>
              <circle cx="32" cy="32" r="14" strokeWidth="0.2" fill="none"/>
              <line x1="32" y1="2" x2="32" y2="10" strokeWidth="0.6" strokeLinecap="round"/>
              <line x1="32" y1="54" x2="32" y2="62" strokeWidth="0.6" strokeLinecap="round"/>
              <line x1="2" y1="32" x2="10" y2="32" strokeWidth="0.6" strokeLinecap="round"/>
              <line x1="54" y1="32" x2="62" y2="32" strokeWidth="0.6" strokeLinecap="round"/>
              <line x1="9.5" y1="9.5" x2="14.5" y2="14.5" strokeWidth="0.3" strokeLinecap="round"/>
              <line x1="49.5" y1="49.5" x2="54.5" y2="54.5" strokeWidth="0.3" strokeLinecap="round"/>
              <line x1="54.5" y1="9.5" x2="49.5" y2="14.5" strokeWidth="0.3" strokeLinecap="round"/>
              <line x1="9.5" y1="54.5" x2="14.5" y2="49.5" strokeWidth="0.3" strokeLinecap="round"/>
              <text x="32" y="7" textAnchor="middle" fontSize="3.2" fontFamily="'DM Sans',sans-serif" fontWeight="600" letterSpacing="0.1">N</text>
              <text x="32" y="61" textAnchor="middle" fontSize="2.4" fontFamily="'DM Sans',sans-serif" fontWeight="500" letterSpacing="0.1">S</text>
              <text x="60.5" y="33.4" textAnchor="middle" fontSize="2.4" fontFamily="'DM Sans',sans-serif" fontWeight="500">Ø</text>
              <text x="3.5" y="33.4" textAnchor="middle" fontSize="2.4" fontFamily="'DM Sans',sans-serif" fontWeight="500">V</text>
            </g>
            <g id="compassNeedle">
              <polygon points="32,8 34.5,32 32,29 29.5,32"/>
              <polygon points="32,56 34.5,32 32,35 29.5,32" opacity="0.45"/>
              <circle cx="32" cy="32" r="1.6"/>
            </g>
          </defs>

          {/* Mørk versjon — synlig i øvre (lyse) halvdel */}
          <g clipPath="url(#compassClipTop)" stroke="#0a2a3d" fill="#0a2a3d">
            <use href="#compassMark" />
          </g>
          <g clipPath="url(#compassClipTop)" stroke="#dc2626" fill="#dc2626">
            <use href="#compassNeedle" />
          </g>

          {/* Lys versjon — synlig i nedre (mørke) halvdel */}
          <g clipPath="url(#compassClipBottom)" stroke="rgba(255,255,255,0.55)" fill="rgba(255,255,255,0.55)">
            <use href="#compassMark" />
          </g>
          <g clipPath="url(#compassClipBottom)" stroke="#ef4444" fill="#ef4444">
            <use href="#compassNeedle" />
          </g>
        </svg>
      </div>
      <Pricing />
      <FaqBolger />
      <Footer />
    </main>
  )
}
