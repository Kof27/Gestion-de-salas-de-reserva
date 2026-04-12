"use client"
import React from "react";
import { Building2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type NavItem = {
    key: "salas" | "reservas" | "admin";
    label: string;
};

interface NavbarBookingRoomProps {
    activeTab: "salas" | "reservas" | "admin";
    onTabChange: (tab: "salas" | "reservas" | "admin") => void;
    navItems: readonly NavItem[];
}

export default function NavbarBookingRoom({
    activeTab,
    onTabChange,
    navItems,
}: NavbarBookingRoomProps) {
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
                        const active = activeTab === item.key;
                        return (
                            <button
                                key={item.key}
                                onClick={() => onTabChange(item.key)}
                                className={cn(
                                    "relative pb-3 text-base font-semibold transition-colors",
                                    active ? "text-red-500" : "text-slate-600 hover:text-slate-900"
                                )}
                            >
                                {item.label}
                                {active && (
                                    <span className="absolute inset-x-0 -bottom-5.25 h-0.75 rounded-full bg-red-500" />
                                )}
                            </button>
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
