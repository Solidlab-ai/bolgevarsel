'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import styles from './ForWho.module.css'

const IkonBolge = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8 Q3 5 5 8 Q7 11 9 8 Q11 5 13 8 Q14 9.5 15 8" stroke="#1a6080" strokeWidth="1.4" strokeLinecap="round" fill="none"/></svg>
const IkonVind = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 6h9a2 2 0 0 0 0-4" stroke="#1a6080" strokeWidth="1.4" strokeLinecap="round" fill="none"/><path d="M2 10h11a2 2 0 0 1 0 4" stroke="#1a6080" strokeWidth="1.4" strokeLinecap="round" fill="none"/><path d="M2 8h7" stroke="#1a6080" strokeWidth="1.4" strokeLinecap="round"/></svg>
const IkonTemp = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v7" stroke="#1a6080" strokeWidth="1.4" strokeLinecap="round"/><circle cx="8" cy="11.5" r="2.5" stroke="#1a6080" strokeWidth="1.4" fill="none"/><path d="M10.5 4h1.5M10.5 6h1" stroke="#1a6080" strokeWidth="1.2" strokeLinecap="round"/></svg>
const IkonSMS = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="2.5" width="14" height="9" rx="2" stroke="#1a6080" strokeWidth="1.4" fill="none"/><path d="M4 7.5h8M4 10h4" stroke="#1a6080" strokeWidth="1.2" strokeLinecap="round"/></svg>
const IkonKalendar = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="11" rx="2" stroke="#1a6080" strokeWidth="1.4" fill="none"/><path d="M1 7h14" stroke="#1a6080" strokeWidth="1.2"/><path d="M5 1v3M11 1v3" stroke="#1a6080" strokeWidth="1.4" strokeLinecap="round"/><circle cx="5.5" cy="10.5" r="1" fill="#1a6080"/><circle cx="8" cy="10.5" r="1" fill="#1a6080"/><circle cx="10.5" cy="10.5" r="1" fill="#1a6080"/></svg>
const IkonSol = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3" stroke="#1a6080" strokeWidth="1.4" fill="none"/><line x1="8" y1="1" x2="8" y2="2.5" stroke="#1a6080" strokeWidth="1.2" strokeLinecap="round"/><line x1="8" y1="13.5" x2="8" y2="15" stroke="#1a6080" strokeWidth="1.2" strokeLinecap="round"/><line x1="1" y1="8" x2="2.5" y2="8" stroke="#1a6080" strokeWidth="1.2" strokeLinecap="round"/><line x1="13.5" y1="8" x2="15" y2="8" stroke="#1a6080" strokeWidth="1.2" strokeLinecap="round"/><line x1="3.1" y1="3.1" x2="4.2" y2="4.2" stroke="#1a6080" strokeWidth="1.2" strokeLinecap="round"/><line x1="11.8" y1="11.8" x2="12.9" y2="12.9" stroke="#1a6080" strokeWidth="1.2" strokeLinecap="round"/><line x1="12.9" y1="3.1" x2="11.8" y2="4.2" stroke="#1a6080" strokeWidth="1.2" strokeLinecap="round"/><line x1="4.2" y1="11.8" x2="3.1" y2="12.9" stroke="#1a6080" strokeWidth="1.2" strokeLinecap="round"/></svg>
const IkonAI = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5C4.4 1.5 1.5 4.4 1.5 8s2.9 6.5 6.5 6.5 6.5-2.9 6.5-6.5S11.6 1.5 8 1.5z" stroke="#1a6080" strokeWidth="1.3" fill="none"/><path d="M5.5 8.5L7 10l3.5-4" stroke="#1a6080" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
const IkonPeriode = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 10 Q3 6 5 10 Q7 14 9 10 Q11 6 13 10" stroke="#1a6080" strokeWidth="1.4" strokeLinecap="round" fill="none"/><path d="M1 5 Q3 3 5 5 Q7 7 9 5 Q11 3 13 5" stroke="#1a6080" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4"/></svg>
const IkonKompass = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="#1a6080" strokeWidth="1.3" fill="none"/><path d="M8 3v1M8 12v1M3 8h1M12 8h1" stroke="#1a6080" strokeWidth="1.2" strokeLinecap="round"/><path d="M8 5.5L9.5 10.5 8 9.5 6.5 10.5Z" fill="#1a6080"/></svg>
const IkonDrakt = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M5 2L2 5v2h2v7h8V7h2V5l-3-3H5z" stroke="#1a6080" strokeWidth="1.3" fill="none" strokeLinejoin="round"/></svg>
const IkonFare = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2L1.5 13h13L8 2z" stroke="#1a6080" strokeWidth="1.3" fill="none" strokeLinejoin="round"/><path d="M8 7v3" stroke="#1a6080" strokeWidth="1.4" strokeLinecap="round"/><circle cx="8" cy="11.5" r="0.7" fill="#1a6080"/></svg>
const IkonKart = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 3l4.5 1.5L10 3l5 1.5v9.5L10 12.5l-4.5 1.5L1 12.5V3z" stroke="#1a6080" strokeWidth="1.3" fill="none" strokeLinejoin="round"/><path d="M5.5 4.5v9M10 3v9" stroke="#1a6080" strokeWidth="1" strokeDasharray="1.5 1.5"/></svg>
const IkonSikt = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><ellipse cx="8" cy="8" rx="6.5" ry="4" stroke="#1a6080" strokeWidth="1.3" fill="none"/><circle cx="8" cy="8" r="2" stroke="#1a6080" strokeWidth="1.3" fill="none"/></svg>
const IkonStrom = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8c2-3 4-3 6 0s4 3 6 0" stroke="#1a6080" strokeWidth="1.4" strokeLinecap="round" fill="none"/><path d="M2 11c2-2 4-2 6 0s4 2 6 0" stroke="#1a6080" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4"/></svg>

const personas = [
  {
    img: '/images/familie-ny.jpg',
    imgAlt: 'Familie med barn i trebåt på norsk kyst',
    tag: 'For familier med hytte og båt',
    tittel: 'Vet du om det er trygt — før ungene er i redningsvesten?',
    beskrivelse: 'Bølgevarsel sender deg rapporten mens du lager frokost. Bølgehøyde, vind, sjøtemperatur og en klar anbefaling — tilpasset barn og båt. Du bestemmer. Med fakta.',
    datapunkter: [
      { ikon: IkonBolge, tekst: 'Bølgehøyde og vindstyrke time for time' },
      { ikon: IkonTemp, tekst: 'Sjøtemperatur — for kaldt for bading?' },
      { ikon: IkonSMS, tekst: 'Nedbørsvarsel — regntøy eller shorts?' },
      { ikon: IkonFare, tekst: 'Kritisk farevarsel til alle på SMS' },
    ],
    funksjoner: ['Aktivitetsprofil: Barn/ungdom med båt', 'Daglig rapport kl. du velger', 'SMS til opptil 5 familiemedlemmer', '7 dagers gratis prøveperiode'],
  },
  {
    img: '/images/baateier-ny.jpg',
    imgAlt: 'Båteier på brygge ved naust med telefon',
    tag: 'For båteiere og hytteeiere',
    tittel: 'Finn den ene gode dagen — ikke håp på at helgen holder',
    beskrivelse: 'Rapportgeneratoren viser deg hele uken frem i tid. AI-en analyserer hvilken dag som er best for din tur og hvorfor. Ikke mer synsing — én tydelig anbefaling.',
    datapunkter: [
      { ikon: IkonKalendar, tekst: '7-dagers rapport med AI-analyse' },
      { ikon: IkonVind, tekst: 'Vindkast og Beaufort-skala' },
      { ikon: IkonSol, tekst: 'Soloppgang og solnedgang' },
      { ikon: IkonAI, tekst: '"Tirsdag er klart best denne uken"' },
    ],
    funksjoner: ['Rapportgenerator opptil 7 dager', 'Aktivitetsprofil: Båtfører', 'Opptil 3 lokasjoner på Familie-plan', 'Nedbørsvarsel inkludert'],
  },
  {
    img: '/images/fisker-ny.jpg',
    imgAlt: 'Erfaren fisker på båt i tidlig morgenblått lys',
    tag: 'For fiskere',
    tittel: 'Opp klokken fem — men bare når det faktisk er verdt det',
    beskrivelse: 'God fisk henger ikke i kalenderen — den henger i forholdene. Bølgevarsel gir deg fiskerens vurdering: bølgehøyde, vindstyrke og sjøtemperatur rett på telefonen.',
    datapunkter: [
      { ikon: IkonBolge, tekst: 'Bølgehøyde og periode' },
      { ikon: IkonVind, tekst: 'Vindstyrke og retning' },
      { ikon: IkonTemp, tekst: 'Sjøtemperatur' },
      { ikon: IkonSMS, tekst: 'SMS fra kl. 04:00' },
    ],
    funksjoner: ['Aktivitetsprofil: Fisker', 'Vurdering: trygt å legge ut?', 'Daglig SMS på valgfritt tidspunkt', 'Kritisk farevarsel alltid på'],
  },
  {
    img: '/images/surfer-ny.jpg',
    imgAlt: 'Surfer på norsk strandbreak med snødekte fjell',
    tag: 'For surfere',
    tittel: 'Periode, retning og offshore-vind — ikke bare bølgehøyde',
    beskrivelse: '5 sekunder periode og onshore vind? Da er det ikke verdt det. Bølgevarsel vet det — og sier det rett ut. AI-oppsummeringen forstår surfing.',
    datapunkter: [
      { ikon: IkonPeriode, tekst: 'Bølgeperiode — choppy eller swell?' },
      { ikon: IkonKompass, tekst: 'Offshore vs. onshore vind' },
      { ikon: IkonDrakt, tekst: 'Drakt-anbefaling etter sjøtemp' },
      { ikon: IkonAI, tekst: 'AI skrevet av en som surfer' },
    ],
    funksjoner: ['Aktivitetsprofil: Surfer', 'Vurdering: offshore/onshore', 'Bølgeperiode og retning', 'Drakt-anbefaling (5/4mm, 3/2mm...)'],
  },
  {
    img: '/images/seiler-ny.jpg',
    imgAlt: 'Par seiler i norsk fjord med dramatiske fjell',
    tag: 'For seilere',
    tittel: 'Riktig seiloppsett — allerede på bryggekanten',
    beskrivelse: 'Storseil og spinnaker, eller reif seilet? Bølgevarsel gir deg seilerens vurdering basert på vindstyrke, vindretning og bølgeforhold.',
    datapunkter: [
      { ikon: IkonVind, tekst: 'Vind 6–12 m/s — ideell seilvindu' },
      { ikon: IkonBolge, tekst: 'Bølgehøyde og periode' },
      { ikon: IkonKart, tekst: 'Opptil 5 lokasjoner langs ruten' },
      { ikon: IkonKalendar, tekst: 'Flerdag-analyse for planlegging' },
    ],
    funksjoner: ['Aktivitetsprofil: Seiler', 'Seiloppsett-anbefaling', 'Pro-plan: 5 lokasjoner langs kysten', 'Flerdag AI-analyse'],
  },
  {
    img: '/images/kajakk-ny.jpg',
    imgAlt: 'Havkajakk-padler i norsk sund mellom dramatiske klipper',
    tag: 'For kajakk og havpadlere',
    tittel: 'Tidevannsstrøm og vindretning — kritisk for paddlere',
    beskrivelse: 'Over 8 m/s og du bør bli på land. Offshore vind driver deg ut. Bølgevarsel gir deg padlerens vurdering — med fokus på sikkerhet.',
    datapunkter: [
      { ikon: IkonVind, tekst: 'Vindstyrke og retning' },
      { ikon: IkonBolge, tekst: 'Bølgehøyde under 0.7m = trygt' },
      { ikon: IkonFare, tekst: 'Farevarsel ved kuling' },
      { ikon: IkonKompass, tekst: 'Offshore vind — største risiko' },
    ],
    funksjoner: ['Aktivitetsprofil: Kajakk/padler', 'Tydelig: trygt / kun erfarne / frarådes', 'SMS-farevarsel kan ikke skrus av', 'Daglig rapport på valgt tidspunkt'],
  },
  {
    img: '/images/fridykker-ny.jpg',
    imgAlt: 'Fridykker under vann i norsk kystfarvann med tare',
    tag: 'For fridykkere',
    tittel: 'Sikt, strøm og temperatur — alt du trenger før du dykker',
    beskrivelse: 'Bølger over 0.4m gir dårlig sikt og overflatestrøm. 6°C krever tørdrakt. Bølgevarsel gir deg dykkervurderingen — ærlig og presis.',
    datapunkter: [
      { ikon: IkonSikt, tekst: 'Sikt-vurdering basert på bølger' },
      { ikon: IkonTemp, tekst: 'Sjøtemperatur og drakt-anbefaling' },
      { ikon: IkonStrom, tekst: 'Strøm fra tidevannet' },
      { ikon: IkonDrakt, tekst: '7mm, 5mm eller tørdrakt?' },
    ],
    funksjoner: ['Aktivitetsprofil: Fridykker', 'Siktforhold basert på bølgehøyde', 'Sjøtemperatur og drakt-anbefaling', 'Strøm- og vindvurdering'],
  },
]

export default function ForWho() {
  const [active, setActive] = useState(0)
  const p = personas[active]

  return (
    <section className={styles.wrap}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <span className={styles.label}>Hvem er det for?</span>
          <h2 className={styles.title}>Laget for alle som<br/>bryr seg om sjøen</h2>
          <p className={styles.subtitle}>Samme tjeneste — tilpasset din aktivitet. Bølgevarsel forstår hva som faktisk betyr noe for deg på sjøen.</p>
        </div>

        <div className={styles.tabs}>
          {personas.map((per, i) => (
            <button key={i} className={`${styles.tab} ${i === active ? styles.tabActive : ''}`} onClick={() => setActive(i)}>
              {per.tag.replace('For ', '')}
            </button>
          ))}
        </div>

        <div className={styles.card}>
          <div className={styles.imgWrap}>
            <Image src={p.img} alt={p.imgAlt} fill className={styles.img} style={{ objectFit: 'cover' }} priority />
            <div className={styles.imgOverlay} />
          </div>
          <div className={styles.cardContent}>
            <span className={styles.tagLabel}>{p.tag}</span>
            <h3 className={styles.cardTitle}>{p.tittel}</h3>
            <p className={styles.cardText}>{p.beskrivelse}</p>

            <div className={styles.datapunkter}>
              {p.datapunkter.map((d, i) => (
                <div key={i} className={styles.datapunkt}>
                  <span className={styles.datapunktIkon}><d.ikon /></span>
                  <span className={styles.datapunktTekst}>{d.tekst}</span>
                </div>
              ))}
            </div>

            <div className={styles.funksjoner}>
              {p.funksjoner.map((f, i) => (
                <div key={i} className={styles.funksjon}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3 3 6-6" stroke="#4da8cc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span>{f}</span>
                </div>
              ))}
            </div>

            <Link href="/registrer" className={styles.cta}>Prøv gratis i 7 dager →</Link>
          </div>
        </div>

        <div className={styles.navRow}>
          <div className={styles.dots}>
            {personas.map((_, i) => (
              <button key={i} className={`${styles.dot} ${i === active ? styles.dotActive : ''}`} onClick={() => setActive(i)} />
            ))}
          </div>
          <div className={styles.arrows}>
            <button className={styles.arrow} onClick={() => setActive(Math.max(0, active - 1))} disabled={active === 0}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button className={styles.arrow} onClick={() => setActive(Math.min(personas.length - 1, active + 1))} disabled={active === personas.length - 1}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
