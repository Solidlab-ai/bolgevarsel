export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Kjøpsvilkår – Bølgevarsel',
  description: 'Vilkår for abonnement på Bølgevarsel.no — prøveperiode, fakturering, oppsigelse og angrerett.',
}

export default function Kjopsvilkar() {
  return (
    <div style={{minHeight:'100vh',background:'#e8f4f8',fontFamily:'DM Sans, sans-serif'}}>
      <nav style={{padding:'1.2rem 2.5rem',borderBottom:'1px solid rgba(10,42,61,0.08)',background:'rgba(232,244,248,0.9)'}}>
        <a href="/" style={{fontFamily:"'Fraunces', Georgia, serif",fontSize:'1.3rem',fontWeight:600,color:'#0a2a3d',textDecoration:'none'}}>
          <svg width="220" height="36" viewBox="0 0 280 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 22 Q10 14 16 22 Q22 30 28 22 Q34 14 40 22" stroke="#0a2a3d" strokeWidth="3" strokeLinecap="round" fill="none"/>
            <path d="M6 31 Q11 26 16 31 Q21 36 26 31 Q31 26 36 31" stroke="#1a6080" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.5"/>
            <text x="52" y="30" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" fontSize="23" fontWeight="600" fill="#0a2a3d" letterSpacing="-0.8">bølgevarsel<tspan fill="#1a6080" fontWeight="400">.no</tspan></text>
          </svg>
        </a>
      </nav>
      <div style={{maxWidth:720,margin:'0 auto',padding:'4rem 1.5rem'}}>
        <h1 style={{fontFamily:"'Fraunces', Georgia, serif",fontSize:'2.5rem',fontWeight:300,color:'#0a2a3d',marginBottom:'2rem'}}>Kjøpsvilkår</h1>

        <p style={{color:'#2c4a5e',lineHeight:1.7,marginBottom:'2rem'}}>Disse vilkårene gjelder for kjøp av abonnement på Bølgevarsel.no. Ved å starte abonnement aksepterer du disse vilkårene.</p>

        <h2 style={{fontSize:'1.2rem',fontWeight:500,color:'#0a2a3d',marginTop:'2rem',marginBottom:'0.5rem'}}>1. Tjenesten</h2>
        <p style={{color:'#2c4a5e',lineHeight:1.7}}>Bølgevarsel.no er en abonnementstjeneste som leverer daglige bølge- og værvarsler for kystlokasjoner i Norge på e-post og SMS. Tjenesten leveres av Solidlab.ai (Stå på Pinne AS), organisasjonsnummer 935 233 488, Tunveien 13, 4016 Stavanger.</p>

        <h2 style={{fontSize:'1.2rem',fontWeight:500,color:'#0a2a3d',marginTop:'2rem',marginBottom:'0.5rem'}}>2. Priser og pakker</h2>
        <p style={{color:'#2c4a5e',lineHeight:1.7}}>Vi tilbyr tre abonnementspakker: Basis (49 kr/mnd), Standard (99 kr/mnd) og Familie (199 kr/mnd). Alle priser er inkludert mva. Funksjonsoversikt for hver pakke vises på <a href="/#pris" style={{color:'#1a6080'}}>prisesiden</a>.</p>

        <h2 style={{fontSize:'1.2rem',fontWeight:500,color:'#0a2a3d',marginTop:'2rem',marginBottom:'0.5rem'}}>3. Gratis prøveperiode</h2>
        <p style={{color:'#2c4a5e',lineHeight:1.7}}>Nye kunder får 7 dagers gratis prøveperiode. Du må oppgi gyldig betalingskort ved registrering, men kortet belastes ikke før prøveperioden er over. Sier du opp før prøveperioden er ferdig, blir du ikke belastet.</p>

        <h2 style={{fontSize:'1.2rem',fontWeight:500,color:'#0a2a3d',marginTop:'2rem',marginBottom:'0.5rem'}}>4. Fakturering og fornyelse</h2>
        <p style={{color:'#2c4a5e',lineHeight:1.7}}>Etter prøveperioden fornyes abonnementet automatisk hver måned. Beløpet trekkes fra det registrerte kortet på samme dato hver måned. Betaling håndteres av Stripe — vi lagrer aldri kortdata direkte.</p>

        <h2 style={{fontSize:'1.2rem',fontWeight:500,color:'#0a2a3d',marginTop:'2rem',marginBottom:'0.5rem'}}>5. Oppsigelse</h2>
        <p style={{color:'#2c4a5e',lineHeight:1.7}}>Du kan si opp abonnementet når som helst fra <a href="/min-side" style={{color:'#1a6080'}}>Min side</a>. Oppsigelse trer i kraft ved utløpet av inneværende fakturaperiode — du beholder tilgang ut den perioden du allerede har betalt for. Ingen bindingstid.</p>

        <h2 style={{fontSize:'1.2rem',fontWeight:500,color:'#0a2a3d',marginTop:'2rem',marginBottom:'0.5rem'}}>6. Angrerett</h2>
        <p style={{color:'#2c4a5e',lineHeight:1.7}}>I henhold til angrerettsloven har du 14 dagers angrerett ved kjøp av digitale tjenester. Den gratis prøveperioden gir deg 7 dager til å vurdere tjenesten uten kostnad. Ved oppsigelse i prøveperioden skjer ingen belastning.</p>

        <h2 style={{fontSize:'1.2rem',fontWeight:500,color:'#0a2a3d',marginTop:'2rem',marginBottom:'0.5rem'}}>7. Endring av priser og vilkår</h2>
        <p style={{color:'#2c4a5e',lineHeight:1.7}}>Vi forbeholder oss retten til å endre priser og vilkår. Eventuelle prisendringer varsles minst 30 dager i forveien per e-post, og du har rett til å si opp før endringen trer i kraft.</p>

        <h2 style={{fontSize:'1.2rem',fontWeight:500,color:'#0a2a3d',marginTop:'2rem',marginBottom:'0.5rem'}}>8. Personvern</h2>
        <p style={{color:'#2c4a5e',lineHeight:1.7}}>Behandling av personopplysninger er beskrevet i <a href="/personvern" style={{color:'#1a6080'}}>personvernerklæringen</a>. Data lagres innenfor EU/EØS.</p>

        <h2 style={{fontSize:'1.2rem',fontWeight:500,color:'#0a2a3d',marginTop:'2rem',marginBottom:'0.5rem'}}>9. Ansvar og tjenestekvalitet</h2>
        <p style={{color:'#2c4a5e',lineHeight:1.7}}>Værdata hentes fra met.no og Open-Meteo Marine. Vi gjør vårt beste for å levere nøyaktige varsler, men kan ikke garantere mot feil eller forsinkelser i datakilder. Tjenesten erstatter ikke offisielle farevarsler fra Meteorologisk institutt — bruk alltid sunn fornuft og lokal kunnskap på sjøen.</p>

        <h2 style={{fontSize:'1.2rem',fontWeight:500,color:'#0a2a3d',marginTop:'2rem',marginBottom:'0.5rem'}}>10. Tvister</h2>
        <p style={{color:'#2c4a5e',lineHeight:1.7}}>Ved tvist forsøker vi alltid å finne en minnelig løsning. Lykkes vi ikke, kan saken bringes inn for Forbrukertilsynet eller behandles av norske domstoler etter norsk rett, med Stavanger tingrett som verneting.</p>

        <h2 style={{fontSize:'1.2rem',fontWeight:500,color:'#0a2a3d',marginTop:'2rem',marginBottom:'0.5rem'}}>11. Kontakt</h2>
        <p style={{color:'#2c4a5e',lineHeight:1.7}}>Spørsmål om abonnementet? Send e-post til <a href="mailto:hei@bolgevarsel.no" style={{color:'#1a6080'}}>hei@bolgevarsel.no</a> eller besøk <a href="/hjelp" style={{color:'#1a6080'}}>hjelpesenteret</a>.</p>

        <p style={{color:'#6b8fa3',marginTop:'3rem',fontSize:'0.9rem'}}>Sist oppdatert: 20. mai 2026</p>
      </div>
    </div>
  )
}
