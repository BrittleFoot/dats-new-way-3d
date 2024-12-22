import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: ':)',
    description: ':----------)',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" style={{ colorScheme: 'dark' }} className="dark">
            <body className="antialiased h-[100vh]">{children}</body>
        </html>
    )
}
