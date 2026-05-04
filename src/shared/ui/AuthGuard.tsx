"use client"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

const PUBLIC_ROUTES = ['/login', '/register']

// Rutas permitidas para id_rol === 1 (Docente)
const DOCENTE_ROUTES = ['/booking', '/booking/myBookings']

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const isPublic = PUBLIC_ROUTES.includes(pathname)

    const [isReady, setIsReady] = useState(() => {
        if (typeof window === 'undefined') return false
        return PUBLIC_ROUTES.includes(window.location.pathname)
    })

    useEffect(() => {
        if (isPublic) {
            setIsReady(true)
            return
        }

        const token = localStorage.getItem('token')
        if (!token) {
            router.replace('/login')
            return
        }

        const usuarioRaw = localStorage.getItem('usuario')
        if (!usuarioRaw) {
            router.replace('/login')
            return
        }

        try {
            const usuario = JSON.parse(usuarioRaw) as { id_rol: number }

            if (usuario.id_rol === 1 && !DOCENTE_ROUTES.includes(pathname)) {
                router.replace('/booking')
                return
            }
        } catch {
            // JSON inválido → sesión corrupta
            router.replace('/login')
            return
        }

        setIsReady(true)
    }, [pathname, isPublic, router])

    if (!isReady) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return <>{children}</>
}
