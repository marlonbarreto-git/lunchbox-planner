import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LunchBox Planner - Menús escolares nutritivos',
  description: 'Planifica almuerzos escolares nutritivos y deliciosos para tus hijos. Recetas aptas para microondas, listas de compras automáticas y cálculo nutricional personalizado.',
  keywords: ['almuerzo escolar', 'menú niños', 'nutrición infantil', 'lonchera', 'Colombia'],
  authors: [{ name: 'LunchBox Planner' }],
  manifest: '/manifest.json',
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
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
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
