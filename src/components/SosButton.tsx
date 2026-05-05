'use client'

import { useEffect, useState } from 'react'

interface SosButtonProps {
  variant?: 'nav' | 'header-inline'  // nav = i toppmenyen, header-inline = i min-side egen header
}

/**
 * SOS-knapp som vises kun for Sikkerhet-plan-kunder p\u00e5 /min-side.
 * P\u00e5 forsiden og andre marketing-sider er den skjult.
 * Klikk: starter SOS-flow med countdown (lokalt event hvis allerede p\u00e5 /min-side,
 * ellers redirecter til /min-side?sos=trigger).
 */
export default function SosButton({ variant = 'nav' }: SosButtonProps) {
  const [show, setShow] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (typeof window === 'undefined') return

    // SOS-knapp skal kun vises p\u00e5 /min-side (innlogget-context).
    // P\u00e5 forsiden, /priser osv er den irrelevant og forvirrende.
    if (!window.location.pathname.startsWith('/min-side')) {
      setShow(false)
      return
    }

    // Cache plan i localStorage for å unngå unødvendige API-kall mellom sider
    const cachedPlan = localStorage.getItem('bv_plan')
    const cachedAt = parseInt(localStorage.getItem('bv_plan_cached_at') || '0', 10)
    const fresh = Date.now() - cachedAt < 5 * 60 * 1000 // 5 min cache

    if (cachedPlan && fresh) {
      setShow(cachedPlan === 'sikkerhet')
      return
    }

    // Hent fra session-API. Cookie-basert auth, så fungerer selv uten bv_email i localStorage.
    fetch('/api/min-side/session')
      .then((r) => r.json())
      .then((d) => {
        const plan = d?.subscriber?.plan
        const email = d?.subscriber?.email
        if (plan && email) {
          // Sikre at både plan og email er cachet (Nav.tsx bruker bv_email for "Min side")
          localStorage.setItem('bv_email', email)
          localStorage.setItem('bv_plan', plan)
          localStorage.setItem('bv_plan_cached_at', String(Date.now()))
          setShow(plan === 'sikkerhet')
        } else {
          // Ikke innlogget
          setShow(false)
        }
      })
      .catch(() => {
        setShow(false)
      })
  }, [])

  if (!mounted || !show) return null

  function handleClick(e: React.MouseEvent) {
    // Hvis vi er på /min-side, dispatch event for å åpne modalen direkte (uten reload)
    if (typeof window !== 'undefined' && window.location.pathname === '/min-side') {
      e.preventDefault()
      window.dispatchEvent(new CustomEvent('bv-sos-trigger'))
    }
    // Ellers: vanlig navigasjon til /min-side?sos=trigger
  }

  // Stiler basert på variant
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    textDecoration: 'none',
    transition: 'all 0.15s',
    border: 'none',
    whiteSpace: 'nowrap',
  }

  const navStyle: React.CSSProperties = {
    ...baseStyle,
    padding: '7px 14px',
    background: '#dc2626',
    color: 'white',
    borderRadius: 999,
    fontSize: 13,
    boxShadow: '0 2px 8px rgba(220, 38, 38, 0.25)',
  }

  const headerInlineStyle: React.CSSProperties = {
    ...baseStyle,
    padding: '8px 16px',
    background: '#dc2626',
    color: 'white',
    borderRadius: 999,
    fontSize: 13,
    boxShadow: '0 2px 12px rgba(220, 38, 38, 0.35)',
  }

  const style = variant === 'header-inline' ? headerInlineStyle : navStyle

  return (
    <a
      href="/min-side?sos=trigger"
      onClick={handleClick}
      style={style}
      aria-label="Send SOS-nødvarsel"
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#b91c1c'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#dc2626'
      }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
        <circle cx="7" cy="7" r="6" stroke="white" strokeWidth="1.4" fill="none" />
        <path d="M7 4v3.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="7" cy="9.6" r="0.7" fill="white" />
      </svg>
      SOS
    </a>
  )
}
