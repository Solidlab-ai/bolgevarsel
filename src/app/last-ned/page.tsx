import { Metadata } from 'next'
import LastNedClient from './LastNedClient'

export const metadata: Metadata = {
  title: 'Last ned Bølgevarsel — Få appen på telefonen',
  description: 'Installer Bølgevarsel som app på iPhone eller Android. Helt gratis, ingen App Store eller Google Play. Få sjø-rapporter rett på telefonen.',
  openGraph: {
    title: 'Last ned Bølgevarsel',
    description: 'Få sjø-rapporter rett på telefonen — som en vanlig app.',
    images: ['/opengraph-image'],
  },
}

export default function LastNedPage() {
  return <LastNedClient />
}
