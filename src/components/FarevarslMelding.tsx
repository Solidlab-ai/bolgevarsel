'use client'
import { useState, useEffect, useRef } from 'react'
import styles from './HowItWorks.module.css'

const FULL_MESSAGE = 'Kuling varslet fra kl. 14:00 — 20+ m/s fra NV. Unngå sjøen frem til i morgen tidlig.'
const TYPING_SPEED_MS = 38
const INITIAL_DELAY_MS = 800

export default function FarevarslMelding() {
  const [text, setText] = useState('')
  const [done, setDone] = useState(false)
  const [playKey, setPlayKey] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  // Typewriter: kjører hver gang playKey endres
  useEffect(() => {
    setText('')
    setDone(false)

    let ticker: ReturnType<typeof setInterval> | null = null
    const delayTimer = setTimeout(() => {
      let i = 0
      ticker = setInterval(() => {
        i++
        setText(FULL_MESSAGE.slice(0, i))
        if (i >= FULL_MESSAGE.length) {
          if (ticker) clearInterval(ticker)
          setDone(true)
        }
      }, TYPING_SPEED_MS)
    }, INITIAL_DELAY_MS)

    return () => {
      clearTimeout(delayTimer)
      if (ticker) clearInterval(ticker)
    }
  }, [playKey])

  // Restart typewriter når seksjonen kommer i viewport igjen
  useEffect(() => {
    if (!ref.current) return
    let wasInside = false
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !wasInside) {
            wasInside = true
            setPlayKey((k) => k + 1)
          } else if (!e.isIntersecting) {
            wasInside = false
          }
        })
      },
      { threshold: 0.3 },
    )
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} className={styles.fareSms} role="alert" aria-live="polite">
      <div className={styles.fareSmsHeader}>
        <span className={styles.fareSmsLive}>
          <span className={styles.fareSmsLiveDot} />
          LIVE
        </span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 1L11.5 11H0.5L6 1z" stroke="#ef4444" strokeWidth="1.4" fill="none" strokeLinejoin="round"/>
          <path d="M6 4.5V7.5" stroke="#ef4444" strokeWidth="1.4" strokeLinecap="round"/>
          <circle cx="6" cy="9.5" r="0.7" fill="#ef4444"/>
        </svg>
        <strong>FAREVARSEL · TÅNES</strong>
        <span className={styles.fareSmsTime}>nå</span>
      </div>
      <p className={styles.fareSmsBody}>
        {text}
        {!done && <span className={styles.fareSmsCursor} aria-hidden="true">▋</span>}
      </p>
    </div>
  )
}
