import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ReactNode } from 'react'
import { openDb } from '@/lib/sqliteDb'
import { Database } from 'sqlite'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Side-Stacker Game',
  description: 'Connect Four with a twist',
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
