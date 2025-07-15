import './globals.css'

export const metadata = {
  title: 'SmartCity360 Dashboard',
  description: 'Smart city management system for complaints, users, and reports.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
