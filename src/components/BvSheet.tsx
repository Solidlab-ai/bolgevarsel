'use client'

import { useEffect, ReactNode } from 'react'

interface BvSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  /**
   * Mobile-only: bottom-sheet på mobil, vanlig children på desktop.
   * Default: false (vises på alle plattformer som modal)
   */
  mobileOnly?: boolean
  /** Ekstra footer-content under hovedinnholdet (f.eks. action-knapper) */
  footer?: ReactNode
}

/**
 * Bottom-sheet på mobil, modal-style på desktop.
 * Brukes for "Legg til..."-flows og andre fokuserte oppgaver.
 *
 * Mønster: Klikk knapp → sheet glir opp → fokuser oppgave → lukk
 * Erstatter dårlig "form ekspanderer på siden"-mønster.
 */
export default function BvSheet({
  open,
  onClose,
  title,
  children,
  footer,
}: BvSheetProps) {
  // ESC for å lukke
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Lås body-scroll når åpen
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10, 42, 61, 0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998,
          animation: 'bvSheetFadeIn 0.2s ease',
        }}
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="bv-sheet"
        style={{
          position: 'fixed',
          background: 'white',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: "'DM Sans', system-ui, sans-serif",
        }}
      >
        {/* Drag-handle (kun mobil-styling) */}
        <div className="bv-sheet-handle" style={{
          width: 40, height: 4,
          background: 'rgba(10,42,61,0.15)',
          borderRadius: 2,
          margin: '12px auto 0',
        }}/>

        {/* Header med tilbake-pil og tittel */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid rgba(10,42,61,0.06)',
          flexShrink: 0,
        }}>
          <button
            type="button"
            onClick={onClose}
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
          {title && (
            <div style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontStyle: 'italic',
              fontSize: 17,
              fontWeight: 400,
              color: '#0a2a3d',
              flex: 1,
              textAlign: 'center',
              padding: '0 12px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>{title}</div>
          )}
          <div style={{ width: 60 }} aria-hidden="true" />
        </div>

        {/* Innhold (scrollbart) */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '16px',
        }}>
          {children}
        </div>

        {/* Footer (sticky på bunnen) */}
        {footer && (
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid rgba(10,42,61,0.06)',
            background: 'white',
            flexShrink: 0,
            paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
          }}>
            {footer}
          </div>
        )}
      </div>

      <style>{`
        @keyframes bvSheetFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes bvSheetSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes bvSheetFadeInScale {
          from { opacity: 0; transform: translate(-50%, -45%) scale(0.96); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }

        /* Mobile: bottom-sheet */
        @media (max-width: 799px) {
          .bv-sheet {
            bottom: 0;
            left: 0;
            right: 0;
            border-top-left-radius: 20px;
            border-top-right-radius: 20px;
            box-shadow: 0 -8px 32px rgba(10, 42, 61, 0.2);
            max-height: 92vh;
            animation: bvSheetSlideUp 0.28s cubic-bezier(.4,0,.2,1);
          }
        }

        /* Desktop: centered modal */
        @media (min-width: 800px) {
          .bv-sheet {
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            border-radius: 16px;
            box-shadow: 0 24px 60px rgba(10, 42, 61, 0.25);
            width: 92%;
            max-width: 560px;
            max-height: 88vh;
            animation: bvSheetFadeInScale 0.18s ease;
          }
          .bv-sheet-handle {
            display: none;
          }
        }
      `}</style>
    </>
  )
}
