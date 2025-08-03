import './globals.css'

export const metadata = {
  title: 'TRD VLA v2',
  description: 'Ultimate vehicle listing optimization platform with advanced AI agents',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
