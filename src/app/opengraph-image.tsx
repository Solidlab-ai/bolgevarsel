import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Bølgevarsel – Daglig sjøvarsel rett i appen'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a2a3d 0%, #1a6080 60%, #0d3350 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Georgia, serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Bølger bakgrunn */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, background: 'rgba(0,0,0,0.2)', display: 'flex' }} />

        {/* Logo */}
        <div style={{ fontSize: 52, fontWeight: 300, color: 'white', letterSpacing: '-0.02em', marginBottom: 16, display: 'flex' }}>
          bølge<span style={{ color: '#4da8cc' }}>varsel</span>
        </div>

        {/* Tagline */}
        <div style={{ fontSize: 28, color: 'rgba(255,255,255,0.75)', fontFamily: 'sans-serif', fontWeight: 300, textAlign: 'center', maxWidth: 700, lineHeight: 1.4, display: 'flex' }}>
          Daglig sjøvarsel rett i appen — levert når du vil
        </div>

        {/* SMS-preview boks */}
        <div style={{
          marginTop: 48,
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 16,
          padding: '20px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontFamily: 'sans-serif', display: 'flex' }}>Bølgevarsel · Tånes · mandag</div>
          <div style={{ fontSize: 18, color: 'white', fontFamily: 'sans-serif', display: 'flex' }}>Bølger: 0.4 m · Vind: 3 m/s fra SV · Sjø: 8°C</div>
          <div style={{ fontSize: 18, color: '#4da8cc', fontFamily: 'sans-serif', fontWeight: 500, display: 'flex' }}>✓ Gode forhold — fin dag på sjøen</div>
        </div>
      </div>
    ),
    { ...size }
  )
}
