"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type NavKey = "salas" | "reservas" | "admin";

interface NavbarBookingRoomProps {
    activeTab?: NavKey;
}

interface Usuario {
    id_usuario: number;
    id_facultad: number;
    id_rol: number;
    nombre: string;
    correo: string;
    estado: boolean;
    fecha_registro: string;
}

const navItems = [
    { key: "salas", label: "Salas disponibles", href: "/booking" },
    { key: "reservas", label: "Mis reservas", href: "/booking/myBookings" },
    { key: "admin", label: "Panel Administrativo", href: "/salas" },
] as const;

export default function NavbarBookingRoom({ activeTab }: NavbarBookingRoomProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [usuario] = useState<Usuario | null>(() => {
        if (typeof window === "undefined") return null;
        try {
            const raw = localStorage.getItem("usuario");
            return raw ? (JSON.parse(raw) as Usuario) : null;
        } catch {
            return null;
        }
    });

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        router.replace("/login");
    };

    const esDocente = Number(usuario?.id_rol) === 1;

    const navItemsFiltrados = esDocente
        ? navItems.filter((item) => item.key !== "admin")
        : navItems;

    const resolvedActiveTab: NavKey =
        activeTab ??
        (pathname === "/booking"
            ? "salas"
            : pathname === "/booking/myBookings"
                ? "reservas"
                : pathname === "/salas"
                    ? "admin"
                    : "salas");

    const inicialCorreo = usuario?.correo
        ? usuario.correo.charAt(0).toUpperCase()
        : "U";

    return (
        <header className="fixed top-0 inset-x-0 z-50 border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 lg:px-8">
                {/* Logo */}
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-white shadow-sm">
                        <Building2 className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-bold tracking-tight text-slate-900">UAO</span>
                </div>

                {/* Nav links */}
                <nav className="hidden items-center gap-6 md:flex">
                    {navItemsFiltrados.map((item) => {
                        const active = resolvedActiveTab === item.key;
                        return (
                            <Link
                                key={item.key}
                                href={item.href}
                                className={cn(
                                    "pb-0.5 text-sm font-semibold transition-colors",
                                    active
                                        ? "border-b-2 border-red-500 text-red-500"
                                        : "text-slate-600 hover:text-slate-900"
                                )}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Avatar + logout */}
                <div className="flex items-center gap-2">
                    <Avatar
                        className="h-9 w-9 border border-slate-200 bg-red-500 text-white shadow-sm cursor-default"
                        title={usuario?.nombre}
                    >
                        <AvatarFallback className="bg-red-500 text-sm font-bold text-white">
                            {inicialCorreo}
                        </AvatarFallback>
                    </Avatar>

                    <button
                        onClick={handleLogout}
                        title="Cerrar sesión"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    >
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </header>
    );
}
