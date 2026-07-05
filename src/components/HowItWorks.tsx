import Link from 'next/link'
import styles from './HowItWorks.module.css'
import FarevarslMelding from './FarevarslMelding'

const steps = [
  {
    num: '01',
    title: 'Velg lokasjon og mottakere',
    desc: 'Søk opp kyststeder langs hele norskekysten. Velg aktivitetsprofil per mottaker — så tilpasses rapporten akkurat det du skal gjøre.',
    details: ['Hele norskekysten støttes', 'Opptil 5 mottakere per lokasjon', '9 aktivitetsprofiler — surfer, seiler, fisker...', 'Eget leveringstidspunkt per mottaker'],
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path d="M13 2C9.13 2 6 5.13 6 9c0 5.25 7 15 7 15s7-9.75 7-15c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="round"/>
        <circle cx="13" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Vi henter og analyserer data',
    desc: 'Ferske data fra met.no og Open-Meteo Marine — bølgehøyde, periode, vindstyrke, nedbør og sjøtemperatur — beregnet nøyaktig for din kyst.',
    details: ['Bølgehøyde, periode og retning', 'Vindstyrke, vindkast og retning', 'Sjøtemperatur og nedbørsvarsel', 'Oppdatert flere ganger daglig'],
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path d="M2 14 Q5 10 8 14 Q11 18 14 14 Q17 10 22 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
        <path d="M2 19 Q5 16 8 19 Q11 22 14 19 Q17 16 22 19" stroke="currentColor" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4"/>
        <circle cx="18" cy="7" r="4" stroke="currentColor" strokeWidth="1.4" fill="none"/>
        <path d="M18 4.5V7M16.5 7H18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Du mottar din daglige sjørapport',
    desc: 'Push-varsel i appen med det viktigste, detaljert rapport på Min side med timesvarsel og profilspesifikke tips — e-post og SMS som backup.',
    details: ['Push-varsel i appen med bølge, vind og temperatur', 'Min side med time-for-time graf', 'Skreddersydd oppsummering per aktivitetsprofil', 'Rapportgenerator — sjekk 7 dager frem'],
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <rect x="7" y="2" width="12" height="20" rx="2.5" stroke="currentColor" strokeWidth="1.6" fill="none"/>
        <path d="M10 8h6M10 11h6M10 14h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
        <circle cx="13" cy="18" r="1.2" fill="currentColor" opacity="0.4"/>
      </svg>
    ),
  },
]

export default function HowItWorks() {
  return (
    <section id="hvordan" className={styles.section}>
      <div className={styles.inner}>

        {/* Header */}
        <div className={styles.header}>
          <span className={styles.label}>Slik fungerer det</span>
          <h2 className={styles.title}>Sett opp én gang —<br/>vi gjør resten</h2>
          <p className={styles.sub}>Velg lokasjon, mottakere og aktivitetsprofil. Deretter kommer rapporten automatisk — tilpasset deg, kl. du bestemmer.</p>
        </div>

        {/* 3 steg */}
        <div className={styles.steps}>
          {steps.map((step) => (
            <div key={step.num} className={styles.step}>
              <div className={styles.stepTop}>
                <div className={styles.stepIcon}>{step.icon}</div>
                <span className={styles.stepNum}>{step.num}</span>
              </div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.desc}</p>
              <ul className={styles.details}>
                {step.details.map((d) => (
                  <li key={d} className={styles.detail}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#4da8cc" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Rapport-preview */}
        <div className={styles.preview}>
          <div className={styles.previewLabel}>Eksempel på daglig rapport</div>
          <div className={styles.previewGrid}>
            <div className={styles.previewStat}><span className={styles.previewVal}>0.4 m</span><span className={styles.previewKey}>Bølgehøyde</span></div>
            <div className={styles.previewStat}><span className={styles.previewVal}>6 s</span><span className={styles.previewKey}>Periode</span></div>
            <div className={styles.previewStat}><span className={styles.previewVal}>3 m/s</span><span className={styles.previewKey}>Vind SV</span></div>
            <div className={styles.previewStat}><span className={styles.previewVal}>8.2°C</span><span className={styles.previewKey}>Sjøtemp</span></div>
            <div className={styles.previewStat}><span className={styles.previewVal}>06:48</span><span className={styles.previewKey}>Soloppgang</span></div>
            <div className={styles.previewStat}><span className={styles.previewVal}>0 mm</span><span className={styles.previewKey}>Nedbør</span></div>
          </div>
          <div className={styles.previewAI}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1C3.7 1 1 3.7 1 7s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6z" stroke="#4da8cc" strokeWidth="1.2" fill="none"/><path d="M4.5 7.5L6.5 9.5l3.5-5" stroke="#4da8cc" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span>Vurdering: <em>Gode forhold for familietur. Bølgene er stabile og vinden svak — perfekt for barn i åpen båt. Sjøtemperaturen er for kald for bading, men rolig farvann hele dagen.</em></span>
          </div>
        </div>

        {/* Farevarsel — hero */}
        <div className={styles.fare}>
          <div className={styles.fareLeft}>
            <div className={styles.fareIconWrap}>
              <svg className={styles.fareIcon} width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M16 3L29.5 27H2.5L16 3z" stroke="#cc7700" strokeWidth="2" strokeLinejoin="round" fill="rgba(204,119,0,0.08)"/>
                <path d="M16 11V20" stroke="#cc7700" strokeWidth="2.2" strokeLinecap="round"/>
                <circle cx="16" cy="24" r="1.4" fill="#cc7700"/>
              </svg>
            </div>
            <div>
              <h3 className={styles.fareTitle}>Kritisk farevarsel</h3>
              <p className={styles.fareSub}>Alltid på — kan ikke skrus av</p>
            </div>
          </div>
          <p className={styles.fareDesc}>Dersom sjøforholdene blir farlige sender vi umiddelbart varsler til alle mottakere — uansett tidspunkt. Kuling, ekstremvær, sterk strøm. Sikkerhet går foran alt.</p>
          <FarevarslMelding />
          <div className={styles.fareTags}>
            {['Kuling', 'Ekstremvær', 'Sterk strøm', 'Sendes umiddelbart', 'Alle mottakere'].map(t => (
              <span key={t} className={styles.fareTag}>{t}</span>
            ))}
          </div>
          <Link href="/registrer" className={styles.fareCta}>Start gratis — farevarsel inkludert →</Link>
        </div>

      </div>
    </section>
  )
}
