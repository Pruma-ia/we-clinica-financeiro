import type { Metadata } from 'next'
import { Inter, Barlow } from 'next/font/google'
import Providers from '@/components/Providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'], weight: '400', variable: '--font-sans', display: 'swap' })
const barlow = Barlow({ subsets: ['latin'], weight: '700', variable: '--font-heading', display: 'swap' })

export const metadata: Metadata = {
  title: 'We Clínica · Sistema Financeiro',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${barlow.variable}`}>
      <body className="min-h-screen bg-white text-[#1A1918] font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
