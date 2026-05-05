'use client'
import { useState, useRef, useEffect } from 'react'
import styles from './Pricing.module.css'
import { PLANS } from '@/lib/plans'

export default function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const formRef = useRef<HTMLDivElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)

  const chosen = PLANS.find(p => p.id === selectedPlan)

  // Når en plan velges: scroll til form og fokuser e-post
  useEffect(() => {
    if (!selectedPlan) return
    const t1 = setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 50)
    const t2 = setTimeout(() => {
      emailRef.current?.focus({ preventScroll: true })
    }, 500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [selectedPlan])

  // Lukk med ESC-tast
  useEffect(() => {
    if (!selectedPlan) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setSelectedPlan(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedPlan])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !selectedPlan) return
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
    <div className={styles.wrap} id="pris">
      <div className={styles.inner}>
        <span className={styles.label}>Priser</span>
        <h2 className={styles.title}>Enkle, transparente<br/>abonnementer</h2>
        <div className={styles.plans}>
          {PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlan(plan.id)}
                aria-pressed={isSelected}
                className={`${styles.plan} ${plan.featured ? styles.featured : ''} ${isSelected ? styles.selected : ''}`}
              >
                {isSelected && <span className={styles.checkmark} aria-hidden="true">✓</span>}
                <div className={styles.planName}>{plan.name}</div>
                <div className={styles.priceRow}>
                  <div className={styles.price}>{plan.price}<span className={styles.suffix}>kr</span></div>
                  <div className={styles.trialBadgePill}>7 dager gratis</div>
                </div>
                <div className={styles.per}>per måned</div>
                <ul className={styles.features}>{plan.features.map((f) => <li key={f}>{f}</li>)}</ul>
                <span className={styles.planBtn}>
                  {isSelected ? 'Valgt' : 'Velg ' + plan.name}
                </span>
              </button>
            )
          })}
        </div>

        {/* Inline e-post-form: dukker opp under planene når en er valgt */}
        <div
          ref={formRef}
          className={`${styles.inlineForm} ${selectedPlan ? styles.inlineFormOpen : ''}`}
          aria-hidden={!selectedPlan}
        >
          {chosen && (
            <form onSubmit={handleSubmit} className={styles.inlineFormInner}>
              <div className={styles.inlineFormHead}>
                <span className={styles.inlineFormLead}>
                  Du har valgt: <strong>{chosen.name}</strong> — {chosen.price} kr/mnd
                </span>
                <span className={styles.inlineFormTrial}>7 dager gratis</span>
                <button
                  type="button"
                  onClick={() => setSelectedPlan(null)}
                  className={styles.inlineFormClose}
                  aria-label="Lukk skjema"
                >
                  ×
                </button>
              </div>
              <div className={styles.inlineFormRow}>
                <input
                  ref={emailRef}
                  type="email"
                  required
                  placeholder="hei@eksempel.no"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.inlineFormInput}
                  aria-label="Din e-postadresse"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className={styles.inlineFormSubmit}
                >
                  {loading ? 'Sender…' : 'Start gratis →'}
                </button>
              </div>
              {error && <p className={styles.inlineFormError}>{error}</p>}
              <p className={styles.inlineFormHint}>
                Kortet belastes ikke før etter 7 dager — avslutt når som helst
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
