import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>

        {/* Venstre — logo + tagline */}
        <div className={styles.brand}>
          <a href="/" className={styles.logoLink}>
            <svg width="200" height="32" viewBox="0 0 280 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 22 Q10 14 16 22 Q22 30 28 22 Q34 14 40 22" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
              <path d="M6 31 Q11 26 16 31 Q21 36 26 31 Q31 26 36 31" stroke="rgba(125,211,240,0.55)" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
              <text x="52" y="30" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" fontSize="23" fontWeight="600" fill="white" letterSpacing="-0.8">bølgevarsel<tspan fill="#7dd3fc" fontWeight="400">.no</tspan></text>
            </svg>
          </a>
          <p className={styles.tagline}>Daglig bølge- og vindvarsel<br/>for norskekysten — levert når du vil.</p>
          <a href="/registrer" className={styles.cta}>Kom i gang — fra 49 kr/mnd</a>
        </div>

        {/* Midten — lenker */}
        <div className={styles.links}>
          <div className={styles.linksCol}>
            <span className={styles.colLabel}>Tjeneste</span>
            <a href="/varsel">Sjekk bølger live</a>
            <a href="/registrer">Registrer deg</a>
            <a href="/min-side">Min side</a>
            <a href="/#pris">Priser</a>
          </div>
          <div className={styles.linksCol}>
            <span className={styles.colLabel}>Hjelp</span>
            <a href="/hjelp">Hjelpesenter</a>
            <a href="/hjelp/kom-i-gang/aktivitetsprofiler">Aktivitetsprofiler</a>
            <a href="/hjelp/varsler/kritisk-farevarsel">Farevarsel</a>
            <a href="/kontakt">Kontakt oss</a>
          </div>
        </div>

        {/* Høyre — kontakt + kort om */}
        <div className={styles.contact}>
          <span className={styles.colLabel}>Kontakt</span>
          <a href="mailto:hei@bolgevarsel.no" className={styles.email}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1.5 3h11l-5.5 4.5L1.5 3z" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" fill="none" strokeLinejoin="round"/>
              <path d="M1.5 3v8a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5V3" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" fill="none"/>
            </svg>
            hei@bolgevarsel.no
          </a>
          <p className={styles.about}>
            Data fra met.no (CC BY 4.0) og Open-Meteo Marine.
          </p>

          {/* Solidlab venture badge — bygger tillit, kobler til moderselskap */}
          <a
            href="https://solidlab.ai"
            target="_blank"
            rel="noopener"
            className={styles.solidlabBadge}
            aria-label="Bølgevarsel er en venture fra Solidlab.ai"
          >
            <span className={styles.solidlabBadgeDot} aria-hidden="true" />
            <span className={styles.solidlabBadgeLabel}>A venture from</span>
            <span className={styles.solidlabBadgeName}>Solidlab</span>
          </a>
          <a
            href="https://solidlab.ai/trust"
            target="_blank"
            rel="noopener"
            className={styles.solidlabTrust}
          >
            Hvorfor du kan stole på oss
          </a>
        </div>

      </div>

      {/* Bunnlinje */}
      <div className={styles.bottom}>
        <span>© 2026 <a href="https://solidlab.ai" target="_blank" rel="noopener">Solidlab.ai</a></span>
        <span className={styles.bottomDot}>·</span>
        <a href="/personvern">Personvern</a>
        <span className={styles.bottomDot}>·</span>
        <a href="/kjopsvilkar">Kjøpsvilkår</a>
        <span className={styles.bottomDot}>·</span>
        <a href="/om">Om oss</a>
        <span className={styles.bottomDot}>·</span>
        <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">met.no CC BY 4.0</a>
      </div>
    </footer>
  )
}
