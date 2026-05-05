'use client'

import React, { useEffect, useRef, useState } from 'react'

export interface BvSelectOption {
  value: string
  label: string
  /** Valgfri gruppe-tag. Når satt, vises grupperings-headere over disse alternativene. */
  group?: string
}

interface BvSelectProps {
  value: string
  onChange: (value: string) => void
  options: BvSelectOption[]
  placeholder?: string
  ariaLabel?: string
  disabled?: boolean
}

/**
 * Custom dropdown som ser lik ut på desktop og mobil.
 * - Mobil: bottom-sheet med backdrop
 * - Desktop: dropdown under knappen
 * - Aksessibel: ESC, keyboard nav, ARIA
 */
export default function BvSelect({
  value,
  onChange,
  options,
  placeholder = 'Velg...',
  ariaLabel,
  disabled = false,
}: BvSelectProps) {
  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const wrapRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const selected = options.find((o) => o.value === value)

  // Detekter mobil/smal skjerm
  useEffect(() => {
    if (typeof window === 'undefined') return
    const check = () => setIsMobile(window.innerWidth < 800)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Klikk utenfor lukker (kun desktop)
  useEffect(() => {
    if (!open || isMobile) return
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, isMobile])

  // ESC lukker
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHighlightedIndex((i) => Math.min(i + 1, options.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHighlightedIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter' && highlightedIndex >= 0) {
        e.preventDefault()
        const opt = options[highlightedIndex]
        if (opt) {
          onChange(opt.value)
          setOpen(false)
          buttonRef.current?.focus()
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, highlightedIndex, options, onChange])

  // Lås body-scroll på mobil når åpen
  useEffect(() => {
    if (!open || !isMobile) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open, isMobile])

  // Sett highlight til valgt når åpnes + scroll til valgt
  useEffect(() => {
    if (open) {
      const idx = options.findIndex((o) => o.value === value)
      setHighlightedIndex(idx)

      // Scroll til valgt option (etter at DOM har rendret)
      if (idx >= 0) {
        setTimeout(() => {
          const selectedEl = document.querySelector('[role="listbox"] [aria-selected="true"]')
          if (selectedEl) {
            selectedEl.scrollIntoView({ block: 'center', behavior: 'auto' })
          }
        }, 0)
      }
    }
  }, [open, value, options])

  function handleSelect(opt: BvSelectOption) {
    onChange(opt.value)
    setOpen(false)
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%' }}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          width: '100%',
          padding: '8px 12px',
          paddingRight: 32,
          borderRadius: 8,
          border: '0.5px solid rgba(10,42,61,0.12)',
          background: '#f8fbfc',
          fontSize: 14,
          color: selected ? '#0a2a3d' : '#9ca3af',
          textAlign: 'left',
          fontFamily: 'inherit',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          position: 'relative',
          outline: open ? '2px solid #1a6080' : 'none',
          outlineOffset: -1,
          transition: 'outline 0.15s',
        }}
      >
        <span style={{
          display: 'block',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {selected?.label ?? placeholder}
        </span>
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`,
            transition: 'transform 0.2s',
            pointerEvents: 'none',
          }}
        >
          <path d="M3 4.5l3 3 3-3" stroke="#6b8fa3" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      </button>

      {/* Mobile: Bottom sheet med backdrop */}
      {open && isMobile && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(10, 42, 61, 0.5)',
              backdropFilter: 'blur(4px)',
              zIndex: 9998,
              animation: 'bvSelectFadeIn 0.2s ease',
            }}
          />
          <div
            role="listbox"
            aria-label={ariaLabel}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'white',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              boxShadow: '0 -8px 32px rgba(10, 42, 61, 0.2)',
              zIndex: 9999,
              maxHeight: '70vh',
              overflowY: 'auto',
              animation: 'bvSelectSlideUp 0.25s cubic-bezier(.4,0,.2,1)',
              paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
            }}
          >
            {/* Drag-handle */}
            <div style={{
              width: 40, height: 4,
              background: 'rgba(10,42,61,0.15)',
              borderRadius: 2,
              margin: '12px auto 8px',
            }}/>
            {/* Header med tilbake-pil og tittel */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '4px 12px 12px',
              borderBottom: '1px solid rgba(10,42,61,0.06)',
            }}>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tilbake"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  background: 'none',
                  border: 'none',
                  color: '#1a6080',
                  fontSize: 15,
                  fontWeight: 400,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  padding: '8px 8px 8px 4px',
                  margin: '-8px 0 -8px -4px',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M11 4l-5 5 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Tilbake
              </button>
              {ariaLabel && (
                <div style={{
                  fontSize: 12, color: '#6b8fa3',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                }}>{ariaLabel}</div>
              )}
              {/* Tom div for å sentrere tittelen via space-between */}
              <div style={{ width: 60 }} aria-hidden="true" />
            </div>
            {options.map((opt, idx) => {
              const isSelected = opt.value === value
              const prevGroup = idx > 0 ? options[idx - 1].group : undefined
              const showGroupHeader = opt.group && opt.group !== prevGroup
              return (
                <React.Fragment key={opt.value}>
                  {showGroupHeader && (
                    <div style={{
                      padding: '14px 20px 6px',
                      fontSize: 11,
                      color: '#6b8fa3',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      fontWeight: 500,
                      background: '#f8fbfc',
                      borderBottom: '1px solid rgba(10,42,61,0.04)',
                    }}>
                      {opt.group}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleSelect(opt)}
                    role="option"
                    aria-selected={isSelected}
                    style={{
                      width: '100%',
                      padding: '14px 20px',
                      background: isSelected ? '#e8f4f8' : 'white',
                      color: isSelected ? '#1a6080' : '#0a2a3d',
                      border: 'none',
                      fontSize: 15,
                      fontWeight: isSelected ? 500 : 400,
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid rgba(10,42,61,0.04)',
                    }}
                  >
                    {opt.label}
                    {isSelected && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8l3.5 3.5L13 5" stroke="#1a6080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                </React.Fragment>
              )
            })}
          </div>
        </>
      )}

      {/* Desktop: dropdown under knappen */}
      {open && !isMobile && (
        <div
          role="listbox"
          aria-label={ariaLabel}
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: 'white',
            borderRadius: 8,
            border: '1px solid rgba(10,42,61,0.1)',
            boxShadow: '0 8px 24px rgba(10,42,61,0.12), 0 2px 4px rgba(10,42,61,0.04)',
            zIndex: 1000,
            maxHeight: 420,
            overflowY: 'auto',
            animation: 'bvSelectFadeIn 0.15s ease',
          }}
        >
          {options.map((opt, idx) => {
            const isSelected = opt.value === value
            const isHighlighted = idx === highlightedIndex
            const prevGroup = idx > 0 ? options[idx - 1].group : undefined
            const showGroupHeader = opt.group && opt.group !== prevGroup
            return (
              <React.Fragment key={opt.value}>
                {showGroupHeader && (
                  <div style={{
                    padding: '8px 12px 4px',
                    fontSize: 10,
                    color: '#6b8fa3',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    fontWeight: 500,
                    background: '#f8fbfc',
                    borderBottom: '1px solid rgba(10,42,61,0.04)',
                  }}>
                    {opt.group}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleSelect(opt)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  role="option"
                  aria-selected={isSelected}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    background: isHighlighted ? '#f0f8fc' : isSelected ? '#e8f4f8' : 'white',
                    color: isSelected ? '#1a6080' : '#0a2a3d',
                    border: 'none',
                    fontSize: 14,
                    fontWeight: isSelected ? 500 : 400,
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  {opt.label}
                  {isSelected && (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8l3.5 3.5L13 5" stroke="#1a6080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </React.Fragment>
            )
          })}
        </div>
      )}

      <style>{`
        @keyframes bvSelectFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes bvSelectSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
