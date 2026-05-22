"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const PUBLIC_ROUTES = ["/login", "/register"];
const DOCENTE_ROUTES = ["/booking", "/booking/myBookings"];

// Returns true only when we can confirm the token is expired.
// On any parse error we return false and let the API return 401 instead.
function isTokenExpired(token: string): boolean {
    try {
        const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(atob(base64)) as { exp?: number };
        return typeof payload.exp === "number" && payload.exp * 1000 < Date.now();
    } catch {
        return false;
    }
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const isPublic = PUBLIC_ROUTES.includes(pathname);

    // Same initialization as the original guard — avoids a flash on public routes.
    const [isReady, setIsReady] = useState(() => {
        if (typeof window === "undefined") return false;
        return PUBLIC_ROUTES.includes(window.location.pathname);
    });

    // Auth check — identical flow to the original, plus JWT expiry validation.
    useEffect(() => {
        if (isPublic) {
            setIsReady(true);
            return;
        }

        const token = localStorage.getItem("token");

        if (!token || isTokenExpired(token)) {
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");
            router.replace("/login");
            return;
        }

        const usuarioRaw = localStorage.getItem("usuario");
        if (!usuarioRaw) {
            router.replace("/login");
            return;
        }

        try {
            const usuario = JSON.parse(usuarioRaw) as { id_rol: number };
            if (Number(usuario.id_rol) === 1 && !DOCENTE_ROUTES.includes(pathname)) {
                router.replace("/booking");
                return;
            }
        } catch {
            router.replace("/login");
            return;
        }

        setIsReady(true);
    }, [pathname, isPublic, router]);

    // Handles 401 responses dispatched by apiFetch.
    useEffect(() => {
        const handleExpired = () => {
            toast.error(
                "Tu sesión ha expirado. Por favor inicia sesión nuevamente.",
                {
                    duration: 4000,
                    style: {
                        background: "#ffffff",
                        color: "#0f172a",
                        border: "1px solid #fca5a5",
                        borderRadius: "0.75rem",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                    },
                }
            );
            router.replace("/login");
        };

        window.addEventListener("auth:expired", handleExpired);
        return () => window.removeEventListener("auth:expired", handleExpired);
    }, [router]);

    if (!isReady) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return <>{children}</>;
}
