import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LunchBox Planner - Menús escolares nutritivos',
  description: 'Planifica comidas nutritivas y deliciosas para tus hijos. Recetas aptas para microondas, listas de compras automáticas y cálculo nutricional personalizado.',
  keywords: ['almuerzo escolar', 'menú niños', 'nutrición infantil', 'lonchera', 'Colombia', 'desayuno', 'cena'],
  authors: [{ name: 'LunchBox Planner' }],
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#18181b',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  )
}

function ServiceWorkerRegistration() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').then(
                function(registration) {
                  console.log('SW registered');
                },
                function(err) {
                  console.log('SW registration failed');
                }
              );
            });
          }
        `,
      }}
    />
  )
}
