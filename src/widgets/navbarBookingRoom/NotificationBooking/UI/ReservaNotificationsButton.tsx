"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Clock, MessageSquare, MessageSquareDot, RefreshCcw } from "lucide-react";

import type { usuario } from "@/src/entities/usuario";
import { useReservaNotifications } from "@/src/widgets/navbarBookingRoom/NotificationBooking/hooks/useReservaNotifications";
import { cn } from "@/lib/utils";

interface ReservaNotificationsButtonProps {
    usuarioActual: usuario | null;
}

function formatNotificationDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleString("es-CO", {
        dateStyle: "short",
        timeStyle: "short",
    });
}

export function ReservaNotificationsButton({
    usuarioActual,
}: ReservaNotificationsButtonProps) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const {
        notifications,
        loading,
        error,
        hasNotifications,
        reloadNotifications,
    } = useReservaNotifications(usuarioActual);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const Icon = hasNotifications ? MessageSquareDot : MessageSquare;

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                title="Notificaciones"
                className={cn(
                    "relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                    hasNotifications
                        ? "text-red-500 hover:bg-red-50"
                        : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                )}
            >
                <Icon className="h-4 w-4" />

                {hasNotifications && (
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">
                                Notificaciones
                            </h3>
                            <p className="text-xs text-slate-500">
                                Cambios recientes en tus reservas
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={reloadNotifications}
                            disabled={loading}
                            title="Actualizar notificaciones"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                        >
                            <RefreshCcw
                                className={cn("h-4 w-4", loading && "animate-spin")}
                            />
                        </button>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {loading && (
                            <div className="px-4 py-6 text-center text-sm text-slate-500">
                                Cargando notificaciones...
                            </div>
                        )}

                        {!loading && error && (
                            <div className="px-4 py-6 text-center text-sm text-red-500">
                                {error}
                            </div>
                        )}

                        {!loading && !error && notifications.length === 0 && (
                            <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
                                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                    <Bell className="h-5 w-5" />
                                </div>
                                <p className="text-sm font-semibold text-slate-700">
                                    No tienes notificaciones
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                    Aquí aparecerán las reservas canceladas o actualizadas.
                                </p>
                            </div>
                        )}

                        {!loading &&
                            !error &&
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className="border-b border-slate-100 px-4 py-3 last:border-b-0 hover:bg-slate-50"
                                >
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={cn(
                                                "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                                                notification.tipo === "cancelada"
                                                    ? "bg-red-50 text-red-500"
                                                    : "bg-amber-50 text-amber-600"
                                            )}
                                        >
                                            <MessageSquareDot className="h-4 w-4" />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-slate-900">
                                                {notification.titulo}
                                            </p>

                                            <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                                                {notification.descripcion}
                                            </p>

                                            <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
                                                <Clock className="h-3 w-3" />
                                                <span>
                                                    {formatNotificationDate(
                                                        notification.fecha_hora
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}