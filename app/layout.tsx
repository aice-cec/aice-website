import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AICE — Artificial Intelligence Club of Engineers',
  description: 'AICE is the AI innovation community of College of Engineering Chengannur.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
