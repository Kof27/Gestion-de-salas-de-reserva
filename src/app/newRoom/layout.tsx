import type { Metadata } from "next";
import { Inter } from 'next/font/google'
import "@/src/app/globals.css";
import {Navbar} from "@/src/features/navbar/Navbar";

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
        <Navbar />
        {children}
        </body
        >
        </html>
    );
}
