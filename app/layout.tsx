import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ActualizarProvider } from '@/hooks/ActualizarProvider'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'Mosquito Monitoreo',
  description: 'Sistema de monitoreo de mosquitos en San Isidro',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        {/* ✅ No se necesita preload manual de fuentes, Next.js ya lo maneja */}
      </head>
      <body className={`${inter.className} bg-background text-foreground`}>
        <ActualizarProvider>
          {children}
        </ActualizarProvider>
      </body>
    </html>
  )
}
