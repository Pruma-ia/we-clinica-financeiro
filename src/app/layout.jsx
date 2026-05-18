export const metadata = {
  title: 'We Clínica · Sistema Financeiro',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{
        margin: 0, padding: 0,
        fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif",
        background: '#F3F2ED',
        color: '#1A1918',
        WebkitFontSmoothing: 'antialiased',
      }}>
        {children}
      </body>
    </html>
  )
}
