export const dynamic = 'force-dynamic'
import { Suspense } from 'react'
import MinSideClient from './MinSideClient'

export const metadata = {
  title: 'Min side – Logg inn',
  description: 'Logg inn på Min side for å administrere abonnement, lokasjoner og mottakere.',
  robots: { index: false, follow: false },
}

export default function MinSide() {
  return (
    <Suspense fallback={
      <div style={{minHeight:'100vh',background:'#e8f4f8',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'DM Sans, sans-serif'}}>
        <p style={{color:'#6b8fa3'}}>Laster inn...</p>
      </div>
    }>
      <MinSideClient />
    </Suspense>
  )
}
