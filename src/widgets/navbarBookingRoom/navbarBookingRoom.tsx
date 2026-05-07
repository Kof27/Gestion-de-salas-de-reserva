"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { usePathname } from "next/navigation";

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

export default function NavbarBookingRoom({
    activeTab,
}: NavbarBookingRoomProps) {
    const pathname = usePathname();

    const [usuario, setUsuario] = useState<Usuario | null>(null);

    useEffect(() => {
        const usuarioStorage = localStorage.getItem("usuario");

        if (usuarioStorage) {
            try {
                const usuarioParseado = JSON.parse(usuarioStorage);
                setUsuario(usuarioParseado);
            } catch (error) {
                console.error("Error al leer el usuario desde localStorage:", error);
            }
        }
    }, []);

    const esUsuarioRolUno = usuario?.id_rol === 1;

    const navItemsFiltrados = esUsuarioRolUno
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
        <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500 text-white shadow-sm">
                        <Building2 className="h-5 w-5" />
                    </div>

                    <div className="text-xl font-extrabold tracking-tight text-slate-900">
                        UAO{!esUsuarioRolUno && " - Secretaria"}
                    </div>
                </div>

                <nav className="hidden items-center gap-8 md:flex">
                    {navItemsFiltrados.map((item) => {
                        const active = resolvedActiveTab === item.key;

                        return (
                            <Link
                                key={item.key}
                                href={item.href}
                                className={cn(
                                    "relative pb-3 text-base font-semibold transition-colors",
                                    active
                                        ? "text-red-500"
                                        : "text-slate-600 hover:text-slate-900"
                                )}
                            >
                                {item.label}

                                {active && (
                                    <span className="absolute inset-x-0 -bottom-5 h-0.75 rounded-full bg-red-500" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <Avatar className="h-11 w-11 border border-slate-200 bg-red-500 text-white shadow-sm">
                    <AvatarFallback className="bg-red-500 font-bold text-white">
                        {inicialCorreo}
                    </AvatarFallback>
                </Avatar>
            </div>
        </header>
    );
}