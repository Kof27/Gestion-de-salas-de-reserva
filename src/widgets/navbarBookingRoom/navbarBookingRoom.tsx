"use client";

import React from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { usePathname } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type NavKey = "salas" | "reservas" | "admin";

interface NavbarBookingRoomProps {
    activeTab?: NavKey;
}

const navItems = [
    { key: "salas", label: "Salas disponibles", href: "/booking" },
    { key: "reservas", label: "Mis reservas", href: "/booking/myBookings" },
    { key: "admin", label: "Panel Administrativo", href: "/dashboard" },
] as const;

export default function NavbarBookingRoom({
    activeTab,
}: NavbarBookingRoomProps) {
    const pathname = usePathname();

    const resolvedActiveTab: NavKey =
        activeTab ??
        (pathname === "/bookings"
            ? "salas"
            : pathname === "/booking/myBookings"
                ? "reservas"
                : pathname === "/dashboard"
                    ? "admin"
                    : "salas");

    return (
        <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500 text-white shadow-sm">
                        <Building2 className="h-5 w-5" />
                    </div>
                    <div className="text-xl font-extrabold tracking-tight text-slate-900">
                        UAO - Secretaria
                    </div>
                </div>

                <nav className="hidden items-center gap-8 md:flex">
                    {navItems.map((item) => {
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

                <Avatar className="h-11 w-11 border border-slate-200 shadow-sm">
                    <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80" />
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
            </div>
        </header>
    );
}