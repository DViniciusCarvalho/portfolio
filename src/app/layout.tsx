import "@/styles/globals.sass";

export const metadata = {
  title: 'Portfolio',
  description: 'Portfolio do Douglas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  )
}
