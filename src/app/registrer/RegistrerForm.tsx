'use client'
import { useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import styles from './page.module.css'
import { PLANS } from '@/lib/plans'

export default function RegistrerForm() {
  const searchParams = useSearchParams()
  const defaultPlan = searchParams.get('plan') || 'familie'
  const [selectedPlan, setSelectedPlan] = useState(defaultPlan)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const emailRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const chosen = PLANS.find(p => p.id === selectedPlan) ?? PLANS[0]

  function handlePlanClick(planId: string) {
    setSelectedPlan(planId)
    // Smooth scroll til form og fokuser e-post-felt etter en kort delay
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setTimeout(() => emailRef.current?.focus({ preventScroll: true }), 400)
    }, 50)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, plan: selectedPlan }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else setError(data.error || 'Noe gikk galt')
    } catch {
      setError('Noe gikk galt. Prøv igjen.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <a href="/" className={styles.backLink} aria-label="Tilbake til forsiden">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Tilbake til forsiden</span>
        </a>
        <a href="/" className={styles.logo}><svg width="220" height="36" viewBox="0 0 280 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 22 Q10 14 16 22 Q22 30 28 22 Q34 14 40 22" stroke="#0a2a3d" strokeWidth="3" strokeLinecap="round" fill="none"/>
              <path d="M6 31 Q11 26 16 31 Q21 36 26 31 Q31 26 36 31" stroke="#1a6080" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.5"/>
              <text x="52" y="30" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" fontSize="23" fontWeight="600" fill="#0a2a3d" letterSpacing="-0.8">bølgevarsel<tspan fill="#1a6080" fontWeight="400">.no</tspan></text>
            </svg></a>
      </nav>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Velg ditt abonnement</h1>
          <p className={styles.sub}>7 dager gratis. Avslutt når du vil.</p>
        </div>
        <div className={styles.plans}>
          {PLANS.map((plan) => (
            <button key={plan.id} type="button" className={`${styles.plan} ${selectedPlan === plan.id ? styles.selected : ''} ${plan.featured && selectedPlan === plan.id ? styles.featured : ''}`} onClick={() => handlePlanClick(plan.id)} aria-pressed={selectedPlan === plan.id}>
              {plan.featured && <span className={styles.badge}>Mest populær</span>}
              {!plan.smsEnabled && <span className={styles.badge} style={{background:'#f0fdf4',color:'#16a34a'}}>Kun e-post</span>}
              <div className={styles.planName}>{plan.name}</div>
              <div className={styles.planPrice}>{plan.price}<span>kr/mnd</span></div>
              <div className={styles.planDesc}>
                {plan.lokasjoner} lokasjon{plan.lokasjoner > 1 ? 'er' : ''}
                {plan.mottakere > 0 ? ` · ${plan.mottakere} mottaker${plan.mottakere > 1 ? 'e' : ''}` : ' · Kun e-post'}
              </div>
              <ul className={styles.planFeatures}>{plan.features.map(f => <li key={f}>{f}</li>)}</ul>
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className={styles.form} ref={formRef}>
          <div className={styles.formChosen}>
            <span>Du har valgt: <strong>{chosen.name}</strong> — {chosen.price} kr/mnd</span>
          </div>
          <label className={styles.label} htmlFor="email">Din e-postadresse</label>
          <input id="email" ref={emailRef} className={styles.input} type="email" placeholder="hei@eksempel.no" value={email} onChange={e => setEmail(e.target.value)} required/>
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? 'Sender...' : `Start 7 dager gratis med ${chosen.name} →`}
          </button>
          <p className={styles.hint}>Kortet belastes ikke før etter 7 dager — avslutt når som helst</p>
          <p className={styles.legalLinks}>
            Ved å starte godtar du våre <a href="/kjopsvilkar" target="_blank" rel="noopener">kjøpsvilkår</a>.
            Trenger du hjelp? Se <a href="/hjelp" target="_blank" rel="noopener">hjelpesenteret</a>.
          </p>
        </form>
      </div>
    </div>
  )
}
