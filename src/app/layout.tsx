import type { Metadata } from "next";
import { Inter } from 'next/font/google'
import "../app/globals.css";

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
})

export const metadata: Metadata = {
    title: "Gestion de salas Autonoma De Occidente",
    description: "Gestion de salas Autonoma De Occidente",
};

interface MainLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({children}: MainLayoutProps) {
    return (
        <html lang="en" className={inter.className}>
        <body
        >
        {children}
        </body
        >
        </html>
    );
}
