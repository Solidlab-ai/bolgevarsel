export type Artikkel = {
  tittel: string
  kategori: string
  html: string
}

export const ARTIKLER: Record<string, Artikkel> = {
  'kom-i-gang/hva-er-bolgevarsel': {
    tittel: 'Hva er Bølgevarsel?',
    kategori: 'Kom i gang',
    html: `
<p>Bølgevarsel er en norsk tjeneste som sender deg daglige sjø- og værvarsler tilpasset kyststeder i Norge. Daglig mottar du en rapport (kl. du bestemmer selv) med bølgehøyde, vindstyrke, vindretning og temperatur — slik at du vet hva som venter deg på havet eller ved sjøen.</p>
<h2>Hvem passer tjenesten for?</h2>
<ul>
<li><strong>Båteiere</strong> som vil vite om det er trygt å legge ut</li>
<li><strong>Familier med hytte ved sjøen</strong> som ønsker å planlegge bading og friluftsliv</li>
<li><strong>Fiskere og kajakker</strong> som trenger oppdatert informasjon</li>
<li><strong>Foreldre</strong> som vil holde oversikt over forholdene der barna bader</li>
</ul>
<h2>Hva får du?</h2>
<p>Avhengig av abonnementsplan mottar du:</p>
<ul>
<li>Daglig <strong>e-postrapport</strong> med fullstendig oversikt og timesvarsel</li>
<li>Daglig <strong>SMS-varsel</strong> med kortfattet værinformasjon</li>
<li>Automatisk <strong>kritisk farevarsel</strong> ved kuling og farlige forhold</li>
<li><strong>AI-oppsummering</strong> som forklarer dagens forhold i klartekst, tilpasset aktiviteten din</li>
<li>Tilgang til <strong>Min side</strong> med rapportgenerator, kart og full kontroll over varsler</li>
<li>Bølgehøyde, vind, bølgeperiode, sjø- og lufttemperatur — pluss soloppgang og solnedgang</li>
</ul>
<p>Du velger selv hvilke kyststeder du vil følge, hvilken aktivitetsprofil som passer, og hvem som skal motta varslene.</p>
`,
  },

  'kom-i-gang/velg-plan': {
    tittel: 'Hvilken plan passer for meg?',
    kategori: 'Kom i gang',
    html: `
<p>Vi tilbyr tre abonnementsplaner. Her er en enkel oversikt:</p>
<table style="width:100%;border-collapse:collapse;margin:1rem 0">
<thead><tr style="background:#f0f8fc">
<th style="padding:10px;text-align:left;border-bottom:2px solid #e2e8f0">Plan</th>
<th style="padding:10px;text-align:left;border-bottom:2px solid #e2e8f0">Pris</th>
<th style="padding:10px;text-align:left;border-bottom:2px solid #e2e8f0">Lokasjoner</th>
<th style="padding:10px;text-align:left;border-bottom:2px solid #e2e8f0">SMS</th>
</tr></thead>
<tbody>
<tr><td style="padding:10px;border-bottom:1px solid #f1f5f9"><strong>Basis</strong></td><td style="padding:10px;border-bottom:1px solid #f1f5f9">49 kr/mnd</td><td style="padding:10px;border-bottom:1px solid #f1f5f9">1</td><td style="padding:10px;border-bottom:1px solid #f1f5f9">Kun e-post</td></tr>
<tr><td style="padding:10px;border-bottom:1px solid #f1f5f9"><strong>Standard</strong></td><td style="padding:10px;border-bottom:1px solid #f1f5f9">99 kr/mnd</td><td style="padding:10px;border-bottom:1px solid #f1f5f9">1</td><td style="padding:10px;border-bottom:1px solid #f1f5f9">SMS-farevarsel til deg</td></tr>
<tr><td style="padding:10px"><strong>Familie</strong></td><td style="padding:10px">199 kr/mnd</td><td style="padding:10px">3</td><td style="padding:10px">Opptil 5 mottakere</td></tr>
</tbody>
</table>
<h2>Velg Basis hvis du...</h2>
<ul><li>Bare trenger e-postvarsler til deg selv</li><li>Vil følge ett fast kyststed</li><li>Er ny og vil prøve tjenesten til en lav pris</li></ul>
<h2>Velg Standard hvis du...</h2>
<ul><li>Vil ha kritisk farevarsel på SMS ved kuling og storm</li><li>Ferdes alene på sjøen og vil ha ekstra trygghet</li><li>Er hyttefolk eller hobby-fisker med ett fast farvann</li></ul>
<h2>Velg Familie hvis du...</h2>
<ul><li>Vil at hele familien skal få SMS-varsler — opptil 5 personer</li><li>Har flere lokasjoner (hytta, hjemsted, favorittspot)</li><li>Vil inkludere barn, ektefelle eller foreldre</li></ul>
`,
  },

  'kom-i-gang/registrering': {
    tittel: 'Slik registrerer du deg',
    kategori: 'Kom i gang',
    html: `
<p>Det tar under 2 minutter å komme i gang med Bølgevarsel.</p>
<h2>Steg 1 — Velg plan</h2>
<p>Gå til <a href="/registrer" style="color:#4da8cc">bolgevarsel.no/registrer</a> og velg abonnementsplanen som passer deg. Du kan alltid bytte plan senere.</p>
<h2>Steg 2 — Skriv inn e-postadressen din</h2>
<p>Skriv inn e-postadressen du ønsker å bruke. Denne brukes til å logge inn og motta e-postrapporter.</p>
<h2>Steg 3 — Betal med Vipps eller kort</h2>
<p>Du sendes til en sikker betalingsside. Du kan betale med <strong>Vipps</strong> eller <strong>betalingskort</strong> (Visa/Mastercard via Stripe). Alle planer har <strong>7 dagers gratis prøveperiode</strong> — du belastes ikke før prøveperioden er over. Abonnementet fornyes automatisk hver måned, og du kan si opp når som helst.</p>
<h2>Steg 4 — Sjekk innboksen</h2>
<p>Etter registrering sender vi deg en velkomste-post med en innloggingslenke. Klikk lenken for å komme til Min side.</p>
<h2>Steg 5 — Legg til lokasjon og mottakere</h2>
<p>På Min side legger du til kyststedet du vil følge og telefonnumrene som skal motta SMS-varsler. Ferdig!</p>
<p style="margin-top:1.5rem;padding:1rem;background:#f0f8fc;border-radius:12px;font-size:0.9rem">💡 <strong>Tips:</strong> Du begynner å motta daglige varsler fra neste morgen, kl. du har valgt.</p>
`,
  },

  'kom-i-gang/legg-til-lokasjon': {
    tittel: 'Legg til din kystlokasjon',
    kategori: 'Kom i gang',
    html: `
<p>En lokasjon er stedet du vil motta sjø- og værvarsler for. Du kan velge alle steder langs norskekysten.</p>
<h2>Slik legger du til en lokasjon</h2>
<ol>
<li>Logg inn på <a href="/min-side" style="color:#4da8cc">Min side</a></li>
<li>Finn seksjonen <strong>Mine lokasjoner</strong></li>
<li>Skriv inn stedsnavnet i søkefeltet — f.eks. "Tånes", "Stavanger havn" eller "Lyngdal"</li>
<li>Velg riktig sted fra forslagslisten</li>
<li>Klikk <strong>Legg til</strong></li>
</ol>
<h2>Hvor nøyaktig er lokasjonen?</h2>
<p>Vi bruker koordinatene fra stedsnavnet du velger. Jo mer spesifikt sted du søker, desto mer nøyaktige blir værdataene. For en hytte i en vik kan det lønne seg å søke på det nærmeste tettstedet.</p>
<h2>Antall lokasjoner per plan</h2>
<ul>
<li><strong>Basis:</strong> 1 lokasjon</li>
<li><strong>Standard:</strong> 1 lokasjon</li>
<li><strong>Familie:</strong> opptil 3 lokasjoner</li>
</ul>
<p style="margin-top:1.5rem;padding:1rem;background:#f0f8fc;border-radius:12px;font-size:0.9rem">💡 <strong>Tips:</strong> Du må legge til minst én lokasjon før du kan legge til mottakere.</p>
`,
  },


  'kom-i-gang/csv-import': {
    tittel: 'Importer mottakere fra CSV',
    kategori: 'Kom i gang',
    html: `
<p>Har du mange mottakere? Med CSV-import kan du laste opp en liste med navn, telefonnummer og e-postadresser på én gang. Perfekt for bedrifter, hytteforeninger eller familier med mange mottakere.</p>

<h2>Slik bruker du CSV-import</h2>
<ol>
<li>Logg inn på <a href="/min-side" style="color:#4da8cc">Min side</a></li>
<li>Gå til <strong>Mine mottakere</strong></li>
<li>Klikk på <strong>Importer CSV</strong></li>
<li>Velg hvilken lokasjon alle mottakerne skal knyttes til</li>
<li>Last opp CSV-filen din</li>
<li>Sjekk forhåndsvisningen og klikk <strong>Importer</strong></li>
</ol>

<h2>Format på CSV-filen</h2>
<p>Filen må ha følgende kolonner i første rad (rekkefølge spiller ingen rolle):</p>
<table style="width:100%;border-collapse:collapse;margin:1rem 0">
<tr style="background:#f8fbfc">
  <th style="text-align:left;padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:13px">Kolonne</th>
  <th style="text-align:left;padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:13px">Beskrivelse</th>
  <th style="text-align:left;padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:13px">Påkrevd</th>
</tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:13px"><code>navn</code></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:13px">Fullt navn på mottaker</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:13px">Nei</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:13px"><code>telefon</code></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:13px">Norsk mobilnummer (+47, 47 eller 8 siffer)</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:13px">Ja</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:13px"><code>epost</code></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:13px">E-postadresse</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:13px">Nei</td></tr>
<tr><td style="padding:8px 12px;font-size:13px"><code>sms</code></td><td style="padding:8px 12px;font-size:13px">ja/nei — om mottaker skal ha SMS-varsel</td><td style="padding:8px 12px;font-size:13px">Nei (standard: ja)</td></tr>
</table>

<h2>Eksempel på CSV-fil</h2>
<pre style="background:#f8fbfc;border-radius:8px;padding:1rem;font-size:13px;overflow-x:auto">navn,telefon,epost,sms
Ola Nordmann,+4798765432,ola@eksempel.no,ja
Kari Nordmann,98765432,,ja
Barn uten epost,+4791234567,,nei
Bestefar,004747123456,bestefar@mail.no,ja</pre>

<p><a href="/bolgevarsel-mottakere-eksempel.csv" download style="color:#4da8cc;font-weight:500">Last ned eksempelfil (.csv) →</a></p>

<h2>Støttede telefonnummerformater</h2>
<ul>
<li><code>+4798765432</code> — internasjonalt format</li>
<li><code>4798765432</code> — uten plusstegn</li>
<li><code>98765432</code> — 8-sifret norsk nummer</li>
<li><code>0047 987 65 432</code> — med 00-prefix og mellomrom</li>
</ul>

<h2>Feil ved import</h2>
<p>Dersom en rad har ugyldig telefonnummer eller mangler påkrevde felt, hoppes den over og du får en tydelig feilmelding. Gyldige rader importeres uansett.</p>
`,
  },
  'kom-i-gang/legg-til-mottakere': {
    tittel: 'Legg til mottakere',
    kategori: 'Kom i gang',
    html: `
<p>Mottakere er personene som skal motta varsler for en gitt kystlokasjon — deg selv, familien eller venner.</p>
<h2>Slik legger du til en mottaker</h2>
<ol>
<li>Logg inn på <a href="/min-side" style="color:#4da8cc">Min side</a></li>
<li>Gå til <strong>Mottakere</strong>-fanen</li>
<li>Klikk <strong>+ Legg til mottaker</strong></li>
<li>Fyll inn navn, telefonnummer og lokasjon</li>
<li>Velg SMS- og e-postinnstillinger</li>
<li>Klikk <strong>Legg til mottaker</strong></li>
</ol>
<h2>SMS-innstillinger</h2>
<p>Når du legger til en mottaker kan du velge:</p>
<ul>
<li><strong>Kritisk farevarsel</strong> — sendes alltid ved kuling og farlige forhold. Kan ikke skrus av — din sikkerhet er viktigst.</li>
<li><strong>Daglig SMS-rapport</strong> — daglig oppsummering av sjøforholdene. Av som standard siden SMS er en kostnad — skru på om ønskelig.</li>
</ul>
<h2>E-postrapport</h2>
<p>Har mottakeren en e-postadresse kan de motta en detaljert HTML-rapport med timesvarsel og profilspesifikke tips. E-post er på som standard — det er gratis og gir ekstra verdi.</p>
<h2>Leveringstidspunkt</h2>
<p>Du kan velge eget leveringstidspunkt per mottaker (04:00–12:00). Praktisk for skift- og nattarbeidere som ønsker rapporten etter jobb. Overstyrer abonnementets standard.</p>
<h2>Aktivitetsprofil</h2>
<p>Velg en aktivitetsprofil (surfer, seiler, fisker osv.) for å få en skreddersydd vurdering av forholdene — i både SMS og e-post.</p>
<h2>Antall mottakere per plan</h2>
<ul>
<li><strong>Basis:</strong> Ingen SMS — kun e-post til deg</li>
<li><strong>Standard:</strong> SMS-farevarsel til deg (1 mottaker)</li>
<li><strong>Familie:</strong> opptil 5 mottakere</li>
</ul>
<h2>Pause eller slett mottaker</h2>
<p>Du kan pause en mottaker midlertidig (de får ingen varsler) eller slette dem helt. Kritisk farevarsel stoppes ikke av pause.</p>
`,
  },

  'varsler/nar-sendes-varsel': {
    tittel: 'Når sendes varselet?',
    kategori: 'Varsler og rapporter',
    html: `
<p>Standard leveringstidspunkt er <strong>kl. 12:00 hver morgen</strong>, men du kan selv velge tidspunkt mellom 04:00 og 12:00 — enten for hele abonnementet eller per mottaker.</p>
<h2>Velg ditt eget tidspunkt</h2>
<p>Du kan endre leveringstidspunktet på to steder:</p>
<ul>
<li><strong>Konto-fanen</strong> på Min side — gjelder for hele abonnementet</li>
<li><strong>Per mottaker</strong> — overstyrer abonnementets standard. Praktisk for skiftarbeidere som ønsker rapporten kl. 06:00 etter nattskift, mens resten av familien får den kl. 09:00.</li>
</ul>
<h2>SMS-varsel</h2>
<p>SMS sendes til mottakere med daglig SMS aktivert. Det tar normalt under 1 minutt fra utsending til du mottar meldingen.</p>
<h2>E-postrapport</h2>
<p>Sendes samtidig og inneholder en fullstendig gjennomgang av forholdene med timesvarsel og profilspesifikke tips.</p>
<h2>Kritisk farevarsel</h2>
<p>Farevarsler sendes <strong>automatisk</strong> når vi registrerer kuling eller farlige bølgeforhold — uansett tidspunkt og uavhengig av SMS-innstillingene dine. Kritisk farevarsel kan ikke skrus av.</p>
<p style="margin-top:1.5rem;padding:1rem;background:#fff8e1;border-radius:12px;font-size:0.9rem">⚠️ Tjenesten kjører alle 365 dager i året, inkludert helger og helligdager.</p>
`,
  },

  'varsler/forsta-sms': {
    tittel: 'Forstå SMS-varselet',
    kategori: 'Varsler og rapporter',
    html: `
<p>SMS-varselet er kortfattet og designet for å gi deg det viktigste på sekunder.</p>
<h2>To typer SMS</h2>
<ul>
<li><strong>Daglig rapport</strong> — sendes til mottakere som har daglig SMS aktivert. Inneholder bølger, vind, temperatur og en vurdering tilpasset aktivitetsprofilen din.</li>
<li><strong>Kritisk farevarsel</strong> — sendes alltid til alle aktive mottakere ved kuling eller farlige bølgeforhold, uansett SMS-innstillinger. Kan ikke skrus av.</li>
</ul>
<h2>Eksempel på daglig SMS</h2>
<div style="background:#f8fbfc;border:1px solid #e2e8f0;border-radius:12px;padding:1.2rem;font-family:monospace;font-size:0.9rem;margin:1rem 0;line-height:1.8">
BOLGEVARSEL mandag 6. april<br/>
Tånes: Rolig hav<br/>
Vind 2.1/4.3m/s, Bolger 0.3m | Sjo 6.2C<br/>
Stabile forhold de neste 6 timene<br/>
bolgevarsel.no
</div>
<h2>Eksempel på kritisk farevarsel</h2>
<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:1.2rem;font-family:monospace;font-size:0.9rem;margin:1rem 0;line-height:1.8">
FAREVARSEL - kritiske sjoforhold<br/>
BOLGEVARSEL mandag 6. april<br/>
Tånes: FAREVARSEL - Bli pa land!<br/>
Vind 18.4/24.1m/s, Bolger 3.8m<br/>
bolgevarsel.no
</div>
<h2>Hva betyr feltene?</h2>
<ul>
<li><strong>Vind X/Y m/s</strong> — nåværende vind / maksimal vind</li>
<li><strong>Bølger</strong> — signifikant bølgehøyde i meter</li>
<li><strong>Sjø</strong> — sjøtemperatur i grader</li>
</ul>
<h2>Vindretninger</h2>
<p>N = Nord, S = Sør, O = Øst, V = Vest, NV = Nordvest osv. Vindretningen angir <em>hvor vinden kommer fra</em>.</p>
`,
  },

  'varsler/forsta-epost': {
    tittel: 'Forstå e-postrapporten',
    kategori: 'Varsler og rapporter',
    html: `
<p>E-postrapporten gir en komplett gjennomgang av sjø- og værsituasjonen. Den er mer detaljert enn SMS og inneholder trender fremover i tid.</p>
<h2>Innholdet i rapporten</h2>
<ul>
<li><strong>AI-oppsummering</strong> — en kort tekst som forklarer dagens forhold i klartekst, tilpasset aktivitetsprofilen din</li>
<li><strong>Dagens forhold</strong> — bølgehøyde, vind, bølgeperiode, luft- og sjøtemperatur</li>
<li><strong>Værikon</strong> — himmelforhold (sol, skyer, regn) ved siden av sjøtilstanden</li>
<li><strong>Timesvarsel</strong> — bølgesøyler per time med fargekode og beste tidspunkt på dagen</li>
<li><strong>Soloppgang og solnedgang</strong> for dagen</li>
<li><strong>Farevarsel-status</strong> — om det er varslet om kuling eller farlige forhold</li>
<li><strong>Alle dine lokasjoner</strong> — én seksjon per sted du følger</li>
</ul>
<h2>Farger og emojier</h2>
<p>Rapporten bruker farger for å gjøre det enkelt å vurdere forholdene på et øyeblikk:</p>
<ul>
<li>🟢 Rolige og gode forhold</li>
<li>🟡 Moderat — vær litt forsiktig</li>
<li>🔴 Krevende eller farlige forhold</li>
</ul>
<p style="margin-top:1.5rem;padding:1rem;background:#f0f8fc;border-radius:12px;font-size:0.9rem">💡 Vil du forstå alle forkortelser og fargekoder? Se artikkelen <strong>«Tegnforklaring»</strong> under Varsler og rapporter.</p>
`,
  },

  'varsler/farevarsel': {
    tittel: 'Hva er et farevarsel?',
    kategori: 'Varsler og rapporter',
    html: `
<p>Et farevarsel sendes automatisk når vi registrerer ekstreme sjø- eller værforhold ved en av dine lokasjoner. Dette er et ekstraordinært varsel utenom den daglige rapporten.</p>
<h2>Hva utløser et farevarsel?</h2>
<ul>
<li>Bølgehøyde over 2 meter</li>
<li>Vindstyrke tilsvarende kuling (over 13,9 m/s)</li>
<li>Ekstreme temperaturforhold</li>
</ul>
<h2>Hvem mottar farevarsel?</h2>
<p>Alle aktive mottakere mottar farevarsel via SMS — også de som normalt har SMS skrudd av. Sikkerhet går foran innstillinger.</p>
<p style="margin-top:1.5rem;padding:1rem;background:#fee2e2;border-radius:12px;font-size:0.9rem">🔴 <strong>Viktig:</strong> Farevarsel er ikke en erstatning for offisielle varsler fra Meteorologisk institutt og Kystverket. Følg alltid myndighetenes råd.</p>
`,
  },

  'varsler/pause-sms': {
    tittel: 'Pause eller skru av SMS-varsler',
    kategori: 'Varsler og rapporter',
    html: `
<p>Det er enkelt å pause eller skru av SMS-varsler uten å slette mottakeren.</p>
<h2>Pause en mottaker</h2>
<ol>
<li>Logg inn på <a href="/min-side" style="color:#4da8cc">Min side</a></li>
<li>Finn mottakeren under <strong>Mine mottakere</strong></li>
<li>Klikk ⏸-knappen for å pause</li>
</ol>
<p>Pauset mottaker får ikke SMS-varsler, men kan enkelt aktiveres igjen med ▶-knappen.</p>
<h2>Skru av SMS for en mottaker</h2>
<p>Klikk 📱-knappen for å skru av SMS spesifikt. Mottakeren forblir aktiv og vil motta SMS igjen hvis det sendes farevarsel.</p>
<h2>Skru av alle varsler midlertidig</h2>
<p>Vil du ikke motta noe? Pause alle mottakere individuelt. Du kan alltids aktivere dem igjen med ett klikk per mottaker.</p>
`,
  },

  'konto/logg-inn': {
    tittel: 'Slik logger du inn',
    kategori: 'Konto og abonnement',
    html: `
<p>Bølgevarsel bruker <strong>innloggingslenker via e-post</strong> — du trenger aldri å huske et passord.</p>
<h2>Slik logger du inn</h2>
<ol>
<li>Gå til <a href="/min-side" style="color:#4da8cc">bolgevarsel.no/min-side</a></li>
<li>Skriv inn e-postadressen du registrerte deg med</li>
<li>Klikk <strong>Send innloggingslenke</strong></li>
<li>Sjekk innboksen din og klikk lenken i e-posten</li>
<li>Du er nå logget inn på Min side</li>
</ol>
<h2>Hvor lenge er innloggingslenken gyldig?</h2>
<p>Innloggingslenker er gyldige i <strong>1 time</strong> og kan kun brukes én gang. Hvis lenken er utløpt, kan du enkelt be om en ny.</p>
<h2>Husker du ikke e-posten din?</h2>
<p>Sjekk kvitteringen du mottok fra Stripe etter kjøp — den inneholder e-postadressen din. Du kan også kontakte oss på <a href="mailto:hei@bolgevarsel.no" style="color:#4da8cc">hei@bolgevarsel.no</a>.</p>
<p style="margin-top:1.5rem;padding:1rem;background:#f0f8fc;border-radius:12px;font-size:0.9rem">💡 <strong>Tips:</strong> Sjekk søppelpost hvis du ikke finner innloggings-e-posten.</p>
`,
  },

  'konto/endre-epost': {
    tittel: 'Endre e-postadresse',
    kategori: 'Konto og abonnement',
    html: `
<p>Ønsker du å endre e-postadressen din? Ta kontakt med oss så ordner vi det raskt.</p>
<h2>Slik endrer du e-post</h2>
<p>Send en e-post til <a href="mailto:hei@bolgevarsel.no" style="color:#4da8cc">hei@bolgevarsel.no</a> fra den gamle e-postadressen din og oppgi den nye adressen du ønsker å bruke.</p>
<p>Vi behandler forespørsler innen én virkedag.</p>
`,
  },

  'konto/bytte-plan': {
    tittel: 'Bytte abonnementsplan',
    kategori: 'Konto og abonnement',
    html: `
<p>Du kan bytte abonnementsplan når som helst. Send oss en e-post på <a href="mailto:hei@bolgevarsel.no" style="color:#4da8cc">hei@bolgevarsel.no</a> med hvilken plan du ønsker å bytte til, så ordner vi det for deg.</p>
<p style="padding:0.85rem 1rem;background:#f0f8fc;border-radius:12px;font-size:0.9rem;margin:1rem 0">💡 Vil du bare ta en pause eller avslutte? Det kan du gjøre selv på <a href="/min-side" style="color:#4da8cc">Min side → Konto</a> — se artikkelen «Si opp abonnementet».</p>
<h2>Hva skjer med eksisterende data?</h2>
<p>Lokasjoner og mottakere beholdes ved planbytte. Hvis du bytter til en plan med færre lokasjoner eller mottakere enn du allerede har, vil vi informere deg om hva som må justeres.</p>
<h2>Fakturering ved planbytte</h2>
<p>Ved oppgradering faktureres differansen for gjenværende periode. Ved nedgradering krediteres du for gjenværende periode.</p>
`,
  },

  'konto/si-opp': {
    tittel: 'Si opp abonnementet',
    kategori: 'Konto og abonnement',
    html: `
<p>Du kan avslutte abonnementet ditt når som helst — ingen bindingstid. Det meste kan du styre selv på Min side.</p>
<h2>Frys abonnementet (kortbetaling)</h2>
<p>Betaler du med kort, kan du <strong>fryse</strong> abonnementet midlertidig på <a href="/min-side" style="color:#4da8cc">Min side → Konto</a>. Da stopper varsler og fakturering, og du kan reaktivere med ett klikk når du er klar igjen. Perfekt om du tar en pause utenom båtsesongen.</p>
<h2>Slett konto</h2>
<p>Vil du avslutte helt? Trykk <strong>«Slett konto»</strong> nederst i Konto-fanen. Abonnementet avsluttes, og dataene dine slettes permanent etter 30 dager.</p>
<h2>Vipps-abonnement</h2>
<p>Vipps-avtaler kan ikke fryses, men du har to måter å avslutte på:</p>
<ul>
<li><strong>Slett konto selv</strong> — trykk «Slett konto» nederst på <a href="/min-side" style="color:#4da8cc">Min side → Konto</a>. Abonnementet avsluttes umiddelbart.</li>
<li><strong>Send oss en e-post</strong> — kontakt <a href="mailto:hei@bolgevarsel.no" style="color:#4da8cc">hei@bolgevarsel.no</a> fra e-postadressen din, så ordner vi oppsigelsen innen én virkedag.</li>
</ul>
<h2>Hva skjer etter avslutning?</h2>
<ul>
<li>Du belastes ikke for neste periode</li>
<li>Varsler fortsetter ut inneværende betalingsperiode</li>
<li>Kontoen og dataene dine slettes etter 30 dager</li>
</ul>
<p style="margin-top:1.5rem;padding:1rem;background:#f0f8fc;border-radius:12px;font-size:0.9rem">💡 Vurderer du å avslutte fordi du savner en funksjon? Send oss en e-post på <a href="mailto:hei@bolgevarsel.no" style="color:#4da8cc">hei@bolgevarsel.no</a> — vi tar gjerne imot tilbakemeldinger!</p>
`,
  },

  'konto/betaling': {
    tittel: 'Betaling og faktura',
    kategori: 'Konto og abonnement',
    html: `
<p>Bølgevarsel tilbyr betaling med <strong>Vipps</strong> og <strong>betalingskort</strong>. Kortbetaling håndteres sikkert av <strong>Stripe</strong> — vi lagrer aldri kortinformasjon på egne servere.</p>
<h2>Betalingsmetoder</h2>
<ul>
<li><strong>Vipps</strong> — løpende avtale, du godkjenner i Vipps-appen</li>
<li><strong>Betalingskort</strong> — Visa og Mastercard via Stripe</li>
</ul>
<h2>Gratis prøveperiode</h2>
<p>Alle planer starter med <strong>7 dagers gratis prøveperiode</strong>. Du belastes ikke før prøveperioden er over, og kan avslutte underveis uten kostnad.</p>
<h2>Fakturering</h2>
<p>Abonnementet faktureres månedlig fra den dagen prøveperioden utløper. Du mottar en kvittering på e-post etter hver betaling.</p>
<h2>Finn kvitteringene dine</h2>
<p>Alle kvitteringer (salgsbilag med fakturanummer og MVA-spesifikasjon) ligger samlet på <a href="/min-side" style="color:#4da8cc">Min side → Konto</a>. Klikk en kvittering for å åpne den — du kan lagre den som PDF direkte i nettleseren. Trenger du hjelp, kontakt oss på <a href="mailto:hei@bolgevarsel.no" style="color:#4da8cc">hei@bolgevarsel.no</a>.</p>
`,
  },

  'faq/hvor-noyaktig': {
    tittel: 'Hvor nøyaktig er værdataene?',
    kategori: 'Vanlige spørsmål',
    html: `
<p>Vi henter værvarsler fra <strong>Open-Meteo</strong>, som er en gratis og åpen værtjeneste basert på data fra europeiske og globale værtjenester inkludert ECMWF og Meteo France. Dataene oppdateres flere ganger daglig.</p>
<h2>Nøyaktighet</h2>
<p>For de fleste norske kyststeder er dataene svært gode — spesielt langs åpne kystlinjer. I trange fjorder og sund kan lokale vindeffekter påvirke nøyaktigheten noe.</p>
<h2>Bølgedata</h2>
<p>Bølgehøyde hentes fra havmodeller og er generelt pålitelige for eksponerte kyststeder. I lukkede fjorder bør du ta høyde for at lokale bølgeforhold kan avvike.</p>
<p style="margin-top:1.5rem;padding:1rem;background:#fff8e1;border-radius:12px;font-size:0.9rem">⚠️ Bølgevarsel er et hjelpemiddel for planlegging — ta alltid egne vurderinger og følg offisielle farevarsler fra Meteorologisk institutt.</p>
`,
  },

  'faq/hvilke-lokasjoner': {
    tittel: 'Hvilke lokasjoner kan jeg velge?',
    kategori: 'Vanlige spørsmål',
    html: `
<p>Du kan velge alle steder langs norskekysten — fra Hvaler i sør til Nordkapp i nord. Vi bruker stedsnavn fra Open-Meteos geokodingstjeneste som dekker hele Norge.</p>
<h2>Slik søker du opp et sted</h2>
<p>Søk på stedsnavnet, tettstedet eller kommunen nærmest der du vil overvåke. Jo mer spesifikt, jo bedre. Eksempler:</p>
<ul>
<li>Tånes</li>
<li>Stavanger havn</li>
<li>Henningsvær</li>
<li>Lindesnes</li>
<li>Ålesund</li>
</ul>
<h2>Finner du ikke stedet ditt?</h2>
<p>Prøv å søke på nærmeste tettsted eller kommunenavn. Kontakt oss på <a href="mailto:hei@bolgevarsel.no" style="color:#4da8cc">hei@bolgevarsel.no</a> hvis du ikke finner det du leter etter.</p>
`,
  },

  'faq/sms-ikke-mottatt': {
    tittel: 'Jeg har ikke mottatt SMS — hva gjør jeg?',
    kategori: 'Vanlige spørsmål',
    html: `
<p>De vanligste årsakene til at SMS ikke mottas:</p>
<h2>1. Telefonnummeret er feil registrert</h2>
<p>Logg inn på <a href="/min-side" style="color:#4da8cc">Min side</a> og sjekk at telefonnummeret er korrekt med landkode. Norske numre skal skrives som <code>+4799112233</code>.</p>
<h2>2. Mottakeren er pauset eller deaktivert</h2>
<p>Sjekk at mottakeren viser status <strong>Aktiv</strong> og at SMS er slått på (📱-ikonet er grønt).</p>
<h2>3. Ingen lokasjon er lagt til</h2>
<p>SMS sendes bare hvis det er knyttet en aktiv lokasjon til mottakeren. Sjekk at lokasjon er satt opp under <strong>Mine lokasjoner</strong>.</p>
<h2>4. Nettverk/operatørproblemer</h2>
<p>Av og til kan SMS bli forsinket av nettverksproblemer hos mobiloperatøren. Vent noen minutter og sjekk igjen.</p>
<p>Vedvarer problemet? Kontakt oss på <a href="mailto:hei@bolgevarsel.no" style="color:#4da8cc">hei@bolgevarsel.no</a>.</p>
`,
  },

  'faq/flere-lokasjoner': {
    tittel: 'Kan jeg ha flere lokasjoner?',
    kategori: 'Vanlige spørsmål',
    html: `
<p>Ja! Antall lokasjoner avhenger av abonnementsplanen din:</p>
<ul>
<li><strong>Basis:</strong> 1 lokasjon (kun e-post)</li>
<li><strong>Standard:</strong> 1 lokasjon (med SMS-farevarsel)</li>
<li><strong>Familie:</strong> opptil 3 lokasjoner med SMS</li>
</ul>
<h2>Varsler for flere lokasjoner</h2>
<p>Hvis du har flere lokasjoner får du én samlet e-postrapport med alle stedene, og én samlet SMS per mottaker med informasjon om alle aktive lokasjoner.</p>
<h2>Vil du ha enda flere lokasjoner?</h2>
<p>Ta kontakt på <a href="mailto:hei@bolgevarsel.no" style="color:#4da8cc">hei@bolgevarsel.no</a> — vi kan tilpasse en løsning for spesielle behov.</p>
`,
  },

  'faq/datakilder': {
    tittel: 'Hvilke datakilder bruker dere?',
    kategori: 'Vanlige spørsmål',
    html: `
<p>Bølgevarsel bruker data fra to anerkjente og åpne meteorologiske tjenester:</p>
<h2>Meteorologisk institutt (met.no)</h2>
<p><a href="https://met.no" style="color:#4da8cc" target="_blank">Met.no</a> er Norges offisielle meteorologiske institutt. Vi henter vindstyrke, vindretning og lufttemperatur via deres Locationforecast 2.0 API. Data er lisensiert under <a href="https://creativecommons.org/licenses/by/4.0/" style="color:#4da8cc" target="_blank">CC BY 4.0</a>.</p>
<h2>Open-Meteo Marine API</h2>
<p><a href="https://open-meteo.com" style="color:#4da8cc" target="_blank">Open-Meteo</a> leverer marine-data (bølger og sjøtemperatur) fra globale havmodeller basert på ECMWF — European Centre for Medium-Range Weather Forecasts.</p>
<h2>Hva henter vi fra hvem?</h2>
<table style="width:100%;border-collapse:collapse;margin:1rem 0;font-size:14px">
<tr style="background:#f8fbfc"><th style="padding:8px 12px;text-align:left;border-bottom:1px solid #e2e8f0">Datakilde</th><th style="padding:8px 12px;text-align:left;border-bottom:1px solid #e2e8f0">Hva</th></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">met.no</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Vind, temperatur, nedbør</td></tr>
<tr><td style="padding:8px 12px">Open-Meteo Marine</td><td style="padding:8px 12px">Bølgehøyde, bølgeperiode, sjøtemperatur</td></tr>
</table>
<h2>Oppdateringsfrekvens</h2>
<p>Begge kildene oppdateres flere ganger daglig. Varselet bruker alltid siste tilgjengelige modellkjøring.</p>
`,
  },

  'varsler/rapport-fanen': {
    tittel: 'Bruk rapport-fanen på Min side',
    kategori: 'Varsler og rapporter',
    html: `
<p>Rapport-fanen på Min side lar deg generere en sjørapport på forespørsel — uten å vente til neste morgen.</p>
<h2>Slik bruker du rapport-fanen</h2>
<ol>
<li>Logg inn på <a href="/min-side" style="color:#4da8cc">Min side</a></li>
<li>Klikk på <strong>Rapport</strong>-fanen</li>
<li>Velg lokasjon, periode (1–7 dager) og aktivitetsprofil</li>
<li>Klikk <strong>Generer rapport</strong></li>
</ol>
<h2>Hva vises i rapporten?</h2>
<ul>
<li>AI-oppsummering og daglig vurdering tilpasset aktivitetsprofilen din</li>
<li>Værikon for himmelforhold (sol, skyer, regn) ved siden av sjøtilstanden</li>
<li>Bølgesøyler per time med beste tidspunkt på dagen</li>
<li>Lufttemperatur og sjøtemperatur</li>
<li>Soloppgang og solnedgang</li>
<li>Profilspesifikke tips (våtdrakt, seil, vindstyrke osv.)</li>
</ul>
<h2>Last ned eller send på e-post</h2>
<p>Du kan laste ned rapporten som PDF eller sende den direkte til en e-postadresse.</p>
`,
  },

  'varsler/kritisk-farevarsel': {
    tittel: 'Kritisk farevarsel — alltid på',
    kategori: 'Varsler og rapporter',
    html: `
<p>Kritisk farevarsel er en automatisk SMS som sendes til alle aktive mottakere når vi registrerer farlige sjøforhold. Dette er en sikkerhetsmekanisme som ikke kan skrus av.</p>
<h2>Hva utløser et kritisk farevarsel?</h2>
<ul>
<li>Maksimal vind over ca. 14 m/s (liten kuling)</li>
<li>Bølgehøyde over 3 meter</li>
</ul>
<h2>Hvem mottar det?</h2>
<p>Alle aktive mottakere på abonnementet — også de som ikke har daglig SMS aktivert. Sikkerhet går alltid foran kostnadsbesparelser.</p>
<h2>Hvorfor kan det ikke skrus av?</h2>
<p>Daglig SMS-rapport er valgfri (og av som standard) fordi det er en kostnad. Men kritisk farevarsel handler om sikkerhet til sjøs. En person som ikke ønsker daglige SMS-rapporter skal likevel bli varslet om farlige forhold.</p>
<p style="margin-top:1.5rem;padding:1rem;background:#fee2e2;border-left:4px solid #dc2626;border-radius:0 12px 12px 0;font-size:0.9rem"><strong>Viktig:</strong> Kritisk farevarsel er ikke en erstatning for offisielle varsler fra Meteorologisk institutt og Kystverket. Følg alltid myndighetenes råd ved ekstremvær.</p>
`,
  },

  'kom-i-gang/aktivitetsprofiler': {
    tittel: 'Aktivitetsprofiler — tilpass varselet',
    kategori: 'Kom i gang',
    html: `
<p>Med aktivitetsprofiler tilpasses SMS-varselet og e-postrapporten til akkurat det du driver med på sjøen. En surfer og en fisker har helt ulike behov — og det speiler vi i vurderingen.</p>
<h2>Tilgjengelige profiler</h2>
<table style="width:100%;border-collapse:collapse;margin:1rem 0;font-size:14px">
<tr style="background:#f8fbfc"><th style="padding:8px 12px;text-align:left;border-bottom:1px solid #e2e8f0">Profil</th><th style="padding:8px 12px;text-align:left;border-bottom:1px solid #e2e8f0">Optimalt for</th></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Surfer</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Bølgehøyde 0.5–2.5m, periode ≥9s, svak vind</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Kitesurfer</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Stabil vind 7–15 m/s, maks under 18 m/s</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Windsurfer</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Vind 8–20 m/s, jevn styrke</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Seiler</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Vind 8–15 m/s, bølger under 1.5m</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Fisker</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Lite vind og lave bølger</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Barn/ungdom med båt</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Bølger under 0.8m, svak vind, varm sjø</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Båtfører</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Navigasjonsvurdering basert på Beaufort</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Kajakk/padler</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Vind under 7 m/s, bølger under 0.7m</td></tr>
<tr><td style="padding:8px 12px">Fridykker/snorkling</td><td style="padding:8px 12px">Rolig hav, god sikt, varm sjø</td></tr>
</table>
<h2>Uten profil</h2>
<p>Velger du ingen profil får du en generell sjøvurdering basert på bølgehøyde og vind.</p>
<h2>Sett aktivitetsprofil</h2>
<p>Du setter profil per mottaker — gå til <a href="/min-side" style="color:#4da8cc">Min side → Mottakere</a> og rediger mottakeren.</p>
`,
  },

  'kom-i-gang/leveringstidspunkt': {
    tittel: 'Velg leveringstidspunkt',
    kategori: 'Kom i gang',
    html: `
<p>Du bestemmer selv når du vil motta den daglige sjørapporten. Tidspunktet kan settes for hele abonnementet eller individuelt per mottaker.</p>
<h2>Abonnementets standard</h2>
<p>Standard leveringstidspunkt er kl. 12:00. Du kan endre dette i <strong>Konto</strong>-fanen på Min side — da gjelder det for alle mottakere som ikke har satt eget tidspunkt.</p>
<h2>Per mottaker</h2>
<p>Hvert enkelt familiemedlem eller mottaker kan ha sitt eget tidspunkt. Dette overstyrer abonnementets standard. Eksempel:</p>
<ul>
<li>Far jobber nattskift → mottar rapporten kl. 06:00 etter jobb</li>
<li>Mor vil ha rapporten til frokost → kl. 08:00</li>
<li>Hytta har fellesrapporten → kl. 12:00 (standard)</li>
</ul>
<h2>Tilgjengelige tidspunkter</h2>
<p>Du kan velge mellom 04:00 og 12:00 i halvtimes-intervaller.</p>
<h2>Kritisk farevarsel</h2>
<p>Farevarsler ved farlige sjøforhold sendes alltid umiddelbart — uavhengig av valgt leveringstidspunkt.</p>
`,
  },

  'varsler/tegnforklaring': {
    tittel: 'Tegnforklaring — forkortelser og symboler',
    kategori: 'Varsler og rapporter',
    html: `
<p>Her finner du forklaring på alle forkortelser, symboler og betegnelser du møter i Bølgevarsel — fra vindretninger til bølgebeskrivelser og fareindikator.</p>

<h2>Vindretninger</h2>
<p>Vindretningen angir <strong>hvor vinden kommer fra</strong> — ikke hvor den blåser. En nordavind blåser fra nord mot sør.</p>
<table style="width:100%;border-collapse:collapse;margin:1rem 0;font-size:14px">
<tr style="background:#f8fbfc"><th style="padding:8px 12px;text-align:left;border-bottom:1px solid #e2e8f0">Forkortelse</th><th style="padding:8px 12px;text-align:left;border-bottom:1px solid #e2e8f0">Betyr</th><th style="padding:8px 12px;text-align:left;border-bottom:1px solid #e2e8f0">Grader</th></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><strong>N</strong></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Nord</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">0° / 360°</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><strong>NNO</strong></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Nord-nordøst</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">22,5°</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><strong>NO</strong></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Nordøst</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">45°</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><strong>ONO</strong></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Øst-nordøst</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">67,5°</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><strong>O</strong></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Øst</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">90°</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><strong>OSO</strong></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Øst-sørøst</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">112,5°</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><strong>SO</strong></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Sørøst</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">135°</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><strong>SSO</strong></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Sør-sørøst</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">157,5°</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><strong>S</strong></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Sør</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">180°</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><strong>SSV</strong></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Sør-sørvest</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">202,5°</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><strong>SV</strong></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Sørvest</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">225°</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><strong>VSV</strong></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Vest-sørvest</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">247,5°</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><strong>V</strong></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Vest</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">270°</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><strong>VNV</strong></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Vest-nordvest</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">292,5°</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><strong>NV</strong></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Nordvest</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">315°</td></tr>
<tr><td style="padding:8px 12px"><strong>NNV</strong></td><td style="padding:8px 12px">Nord-nordvest</td><td style="padding:8px 12px">337,5°</td></tr>
</table>

<h2>Vindstyrke — Beaufortskalaen</h2>
<p>Vindstyrken beskrives med Beaufortskalaen, som går fra 0 (stille) til 12 (orkan). I Bølgevarsel bruker vi disse betegnelsene:</p>
<table style="width:100%;border-collapse:collapse;margin:1rem 0;font-size:14px">
<tr style="background:#f8fbfc"><th style="padding:8px 12px;text-align:left;border-bottom:1px solid #e2e8f0">Betegnelse</th><th style="padding:8px 12px;text-align:left;border-bottom:1px solid #e2e8f0">m/s</th><th style="padding:8px 12px;text-align:left;border-bottom:1px solid #e2e8f0">Beskrivelse</th></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><strong>Stille</strong></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">0–2</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Røyk stiger rett opp, speilblankt hav</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><strong>Svak vind</strong></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">2–4</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Vinden kjennes i ansiktet, lett krusning</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><strong>Lett bris</strong></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">4–8</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Blader rører seg, krusning på sjøen</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><strong>Laber bris</strong></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">8–11</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Kvister beveger seg, lette bølger</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><strong>Frisk bris</strong></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">11–14</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Større greiner beveger seg, moderat sjø</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><strong>Liten kuling</strong></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">14–17</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Trær svinger, roff sjø — vær forsiktig</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><strong>Stiv kuling</strong></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">17–21</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Vanskelig å gå mot vinden, høye bølger</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><strong>Sterk kuling</strong></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">21–25</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Kvister brekker, svært roff sjø</td></tr>
<tr><td style="padding:8px 12px"><strong>Storm</strong></td><td style="padding:8px 12px">25+</td><td style="padding:8px 12px">Alvorlige skader mulig — bli på land</td></tr>
</table>

<h2>Bølgebeskrivelser</h2>
<table style="width:100%;border-collapse:collapse;margin:1rem 0;font-size:14px">
<tr style="background:#f8fbfc"><th style="padding:8px 12px;text-align:left;border-bottom:1px solid #e2e8f0">Betegnelse</th><th style="padding:8px 12px;text-align:left;border-bottom:1px solid #e2e8f0">Bølgehøyde</th><th style="padding:8px 12px;text-align:left;border-bottom:1px solid #e2e8f0">Merknader</th></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><strong>Stille hav</strong></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Under 0,3m</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Speilblankt eller svak dønning</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><strong>Lett krusning</strong></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">0,3–0,7m</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Fin dag for de fleste</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><strong>Lette bølger</strong></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">0,7–1,2m</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Greit for erfarne — vær oppmerksom</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><strong>Moderat sjø</strong></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">1,2–2,0m</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Krevende for åpne båter og kajakker</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><strong>Roff sjø</strong></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">2,0–3,0m</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Kun erfarne i egnet fartøy</td></tr>
<tr><td style="padding:8px 12px"><strong>Veldig roff sjø</strong></td><td style="padding:8px 12px">Over 3,0m</td><td style="padding:8px 12px">Farlig — bli på land</td></tr>
</table>
<p style="font-size:13px;color:#6b8fa3">Bølgehøyden som oppgis er <strong>signifikant bølgehøyde</strong> — gjennomsnittet av den høyeste tredjedelen av bølgene. Enkeltbølger kan være høyere.</p>

<h2>Fareindikator 0–5</h2>
<p>Fareindikatoren viser en samlet vurdering av forholdene tilpasset aktivitetsprofilen din:</p>
<table style="width:100%;border-collapse:collapse;margin:1rem 0;font-size:14px">
<tr style="background:#f8fbfc"><th style="padding:8px 12px;text-align:left;border-bottom:1px solid #e2e8f0">Score</th><th style="padding:8px 12px;text-align:left;border-bottom:1px solid #e2e8f0">Farge</th><th style="padding:8px 12px;text-align:left;border-bottom:1px solid #e2e8f0">Betyr</th></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><strong>0</strong></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><span style="color:#94a3b8">■ Grå</span></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Ikke aktuelt — f.eks. for lite vind for seiler</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><strong>1</strong></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><span style="color:#16a34a">■ Grønn</span></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Perfekte forhold</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><strong>2</strong></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><span style="color:#65a30d">■ Lysgrønn</span></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Gode forhold</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><strong>3</strong></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><span style="color:#ca8a04">■ Gul</span></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Akseptable forhold — vær oppmerksom</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><strong>4</strong></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><span style="color:#ea580c">■ Oransje</span></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Krevende forhold — kun erfarne</td></tr>
<tr><td style="padding:8px 12px"><strong>5</strong></td><td style="padding:8px 12px"><span style="color:#dc2626">■ Rød</span></td><td style="padding:8px 12px">Farlige forhold — frarådes</td></tr>
</table>

<h2>Bølgeperiode</h2>
<p>Bølgeperioden (oppgitt i sekunder, f.eks. <strong>9s</strong>) er tid mellom to bølgetopper. Lang periode betyr kraftigere og mer organiserte bølger fra langt unna (dønning). Kort periode betyr lokale vindsbølger:</p>
<ul>
<li><strong>Under 6s</strong> — korte, kaotiske vindsbølger. Ukomfortabelt, selv ved lav høyde.</li>
<li><strong>6–9s</strong> — moderat periode, typisk for kystnære forhold</li>
<li><strong>Over 9s</strong> — lang dønning fra åpent hav. Kan gi store bølger selv med lite vind.</li>
</ul>

<h2>Andre forkortelser</h2>
<table style="width:100%;border-collapse:collapse;margin:1rem 0;font-size:14px">
<tr style="background:#f8fbfc"><th style="padding:8px 12px;text-align:left;border-bottom:1px solid #e2e8f0">Forkortelse</th><th style="padding:8px 12px;text-align:left;border-bottom:1px solid #e2e8f0">Betyr</th></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><strong>m/s</strong></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Meter per sekund — mål for vindstyrke</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><strong>m</strong></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Meter — bølgehøyde</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><strong>s</strong></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Sekunder — bølgeperiode</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><strong>°C</strong></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Grader Celsius — temperatur</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><strong>Sjøtemp</strong></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Sjøtemperatur i overflaten</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><strong>Lufttemp</strong></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Lufttemperatur i 2 meters høyde</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><strong>Vind nå / maks</strong></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Øyeblikkelig vindstyrke / høyeste registrert i dag</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><strong>Bølger snitt / maks</strong></td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">Gjennomsnittlig / høyeste bølgehøyde i dag</td></tr>
<tr><td style="padding:8px 12px"><strong>MET / met.no</strong></td><td style="padding:8px 12px">Meteorologisk institutt — norsk datakilde for vind og temperatur</td></tr>
</table>

<p style="margin-top:1.5rem;padding:1rem;background:#f0f8fc;border-radius:12px;font-size:0.9rem">💡 <strong>Tips:</strong> Vindretning og bølgeretning kan ofte avvike. Vinden kan komme fra nordvest mens bølgene (dønning) kommer fra sørvest etter en storm lenger ute på havet.</p>
`,
  },


  'faq/aktivitetsprofil-sms': {
    tittel: 'Hva betyr aktivitetsprofil på SMS?',
    kategori: 'Vanlige spørsmål',
    html: `
<p>Aktivitetsprofilen påvirker teksten og vurderingen i SMS-varselet. I stedet for en generell "forholdsbeskrivelse" får du en vurdering tilpasset akkurat det du skal gjøre.</p>
<h2>Eksempel: Surfer</h2>
<div style="background:#f8fbfc;border:1px solid #e2e8f0;border-radius:12px;padding:1.2rem;font-family:monospace;font-size:0.9rem;margin:0.5rem 0;line-height:1.7">
Bra surfetorhold<br/>
1.4m / 10s periode<br/>
Vind 5.2/7.1m/s, Bolger 1.4m
</div>
<h2>Eksempel: Fisker</h2>
<div style="background:#f8fbfc;border:1px solid #e2e8f0;border-radius:12px;padding:1.2rem;font-family:monospace;font-size:0.9rem;margin:0.5rem 0;line-height:1.7">
Gode fiskeforhold<br/>
0.6m bolger, Lett bris<br/>
Vind 3.1/5.4m/s, Bolger 0.6m
</div>
<p>Du velger profil per mottaker på <a href="/min-side" style="color:#4da8cc">Min side</a>. Profilen påvirker også e-postrapporten med mer detaljerte tips.</p>
`,
  },

  'varsler/push-varsler': {
    tittel: 'Push-varsler i nettleseren',
    kategori: 'Varsler og rapporter',
    html: `
<p>Push-varsler lar deg få beskjed direkte på enheten din — uten SMS. De dukker opp som et lite varsel på telefon eller PC, akkurat som en app-melding. Push er et gratis supplement til SMS og e-post.</p>
<h2>Slik skrur du på push-varsler</h2>
<ol>
<li>Logg inn på <a href="/min-side" style="color:#4da8cc">Min side</a></li>
<li>Gå til <strong>Konto</strong>-fanen</li>
<li>Finn <strong>Push-varsler</strong> og skru på bryteren</li>
<li>Godkjenn at nettleseren får sende deg varsler</li>
</ol>
<h2>Installer som app for best opplevelse</h2>
<p>Bølgevarsel er en web-app (PWA) du kan installere på hjemskjermen. På Android gjøres dette via Chrome-menyen («Legg til på startskjerm»), og på iPhone via Del-knappen i Safari («Legg til på Hjem-skjerm»). På iPhone må appen være installert på hjemskjermen for at push skal fungere.</p>
<h2>Skru av igjen</h2>
<p>Du kan når som helst skru av bryteren på Min side, eller blokkere varsler i nettleserinnstillingene. Har du blokkert varsler i nettleseren, må du skru dem på igjen der før bryteren virker.</p>
<p style="margin-top:1.5rem;padding:1rem;background:#fee2e2;border-left:4px solid #dc2626;border-radius:0 12px 12px 0;font-size:0.9rem"><strong>Viktig:</strong> Kritisk farevarsel sendes alltid på SMS. Push er et supplement — ikke en erstatning for SMS-farevarsel.</p>
`,
  },

  'konto/min-side': {
    tittel: 'Oversikt over Min side',
    kategori: 'Konto og abonnement',
    html: `
<p>Min side er kontrollsenteret ditt i Bølgevarsel. Her styrer du alt selv — lokasjoner, mottakere, varsler og abonnement.</p>
<h2>Fanene på Min side</h2>
<ul>
<li><strong>Lokasjoner</strong> — legg til og følg kyststeder. Klikk en lokasjon for live sjødata, værikon, AI-oppsummering og kart.</li>
<li><strong>Mottakere</strong> — legg til hvem som skal få varsler, med egen aktivitetsprofil og leveringstidspunkt per person. CSV-import for mange mottakere.</li>
<li><strong>Rapport</strong> — generer en sjørapport på forespørsel for 1–7 dager frem, last ned som PDF eller send på e-post.</li>
<li><strong>Konto</strong> — leveringstidspunkt, push-varsler, kvitteringer, frys/reaktiver abonnement og slett konto.</li>
</ul>
<h2>Hva kan du gjøre selv?</h2>
<ul>
<li>Legge til og fjerne lokasjoner og mottakere</li>
<li>Sette aktivitetsprofil og leveringstidspunkt per mottaker</li>
<li>Skru push-varsler av og på</li>
<li>Åpne og lagre kvitteringer som PDF</li>
<li>Fryse og reaktivere abonnement (kortbetaling), eller slette konto</li>
</ul>
<p style="margin-top:1.5rem;padding:1rem;background:#f0f8fc;border-radius:12px;font-size:0.9rem">💡 <strong>Tips:</strong> Min side fungerer like godt på mobil som på PC, og kan installeres som app på hjemskjermen.</p>
`,
  },

}