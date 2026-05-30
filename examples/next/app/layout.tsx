import type { Metadata } from 'next'
import 'base-themes/styles.css'
import './styles.css'

export const metadata: Metadata = {
  title: 'Base Themes Next.js Example',
  description: 'SSR smoke example for Base Themes in Next.js.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="light" data-style="enterprise">
      <body>{children}</body>
    </html>
  )
}
