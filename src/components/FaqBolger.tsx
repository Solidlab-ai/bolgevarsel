import styles from './FaqBolger.module.css'

// Spørsmålene matcher faktiske søk ("er det bølger i dag" o.l.) — svarene
// besvarer intensjonen konkret OG posisjonerer Bølgevarsel som løsningen.
// Synlig innhold + FAQPage-schema = mat for Google AI Overviews / Gemini.
const faqer = [
  {
    sporsmal: 'Er det bølger i dag?',
    svar: 'Bølgeforholdene langs norskekysten endrer seg time for time med vind og hav. Bølgevarsel henter ferske sjødata for din kystlokasjon og sender dagens bølgehøyde, vind og sjøvær rett på SMS hver morgen — så du vet svaret før du drar ut.',
  },
  {
    sporsmal: 'Hvor høye er bølgene i dag?',
    svar: 'Bølgehøyden avhenger av vind, bunnforhold og hvor langs kysten du er. Bølgevarsel gir deg konkret bølgehøyde i meter for stedet ditt, basert på data fra met.no og Open-Meteo — oppdatert daglig.',
  },
  {
    sporsmal: 'Hvordan vet jeg om det er trygt å dra på sjøen i dag?',
    svar: 'Se på bølgehøyde, vindstyrke og eventuelle farevarsler samlet. Bølgevarsel sender automatisk farevarsel når forholdene blir krevende, så du får beskjed med en gang — uten å måtte følge med på værdata selv.',
  },
  {
    sporsmal: 'Når på dagen kommer bølgevarselet?',
    svar: 'Du velger selv tidspunkt. De fleste får varselet tidlig om morgenen, klart før dagen på sjøen planlegges. Farevarsler sendes umiddelbart når de utløses.',
  },
  {
    sporsmal: 'Hvilke steder langs kysten dekker Bølgevarsel?',
    svar: 'Hele norskekysten fra Lindesnes til Nordkapp. Du velger dine egne kyststeder — hytta, favorittfiskeplassen eller surfestranda — og får varsel skreddersydd for hvert sted.',
  },
  {
    sporsmal: 'Hva koster det å få bølgevarsel på SMS?',
    svar: 'Bølgevarsel starter på 49 kr/mnd for daglig sjøvarsel på SMS. Du kan velge flere steder og tidspunkt, og farevarsel er alltid inkludert.',
  },
]

export default function FaqBolger() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqer.map((f) => ({
      '@type': 'Question',
      name: f.sporsmal,
      acceptedAnswer: { '@type': 'Answer', text: f.svar },
    })),
  }

  return (
    <section className={styles.section} aria-labelledby="faq-bolger-tittel">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Sjøvær og bølger</p>
        <h2 id="faq-bolger-tittel" className={styles.tittel}>Er det bølger i dag?</h2>
        <p className={styles.ingress}>
          Lurer du på bølgeforholdene langs kysten? Her er svarene på det folk oftest
          lurer på — og hvordan du får dagens sjøvarsel rett på SMS.
        </p>

        <div className={styles.liste}>
          {faqer.map((f, i) => (
            <div key={i} className={styles.item}>
              <h3 className={styles.sporsmal}>{f.sporsmal}</h3>
              <p className={styles.svar}>{f.svar}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
