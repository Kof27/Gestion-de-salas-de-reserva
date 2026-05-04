"use client";

import { useEffect } from "react";
import {
    X,
    MapPin,
    Users,
    CalendarDays,
    Clock,
    MessageSquare,
    Building2,
    Loader2,
    XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { ReservationView } from "../model/reservationView";
import { statusLabel } from "../lib/myBookingLib";

const statusConfig = {
    active: {
        dot: "bg-emerald-500",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    past: {
        dot: "bg-slate-400",
        badge: "bg-slate-100 text-slate-600 border-slate-200",
    },
    cancelled: {
        dot: "bg-red-500",
        badge: "bg-red-50 text-red-600 border-red-200",
    },
};

interface ReservationModalProps {
    reservation: ReservationView | null;
    onClose: () => void;
    onCancel: (id: string) => Promise<void>;
    cancellingId: string | null;
}

export default function ReservationModal({
    reservation,
    onClose,
    onCancel,
    cancellingId,
}: ReservationModalProps) {
    // Cerrar con Escape
    useEffect(() => {
        if (!reservation) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [reservation, onClose]);

    // Bloquear scroll del body
    useEffect(() => {
        if (reservation) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [reservation]);

    if (!reservation) return null;

    const isCancelling = cancellingId === String(reservation.id);
    const canCancel = reservation.status === "active";
    const cfg = statusConfig[reservation.status];

    const handleCancel = async () => {
        await onCancel(String(reservation.id));
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
                {/* Header: imagen o fallback */}
                {reservation.imagenSala ? (
                    <div className="relative h-52 w-full overflow-hidden rounded-t-2xl">
                        <img
                            src={reservation.imagenSala}
                            alt={reservation.title}
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
                            aria-label="Cerrar"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        <Badge
                            variant="outline"
                            className={cn(
                                "absolute bottom-4 left-4 border font-bold",
                                cfg.badge
                            )}
                        >
                            <span className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", cfg.dot)} />
                            {statusLabel(reservation.status)}
                        </Badge>
                    </div>
                ) : (
                    <div className="relative flex h-32 items-center justify-center rounded-t-2xl bg-slate-100">
                        <Building2 className="h-12 w-12 text-slate-300" />
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-slate-600 transition-colors hover:bg-white"
                            aria-label="Cerrar"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                <div className="p-6 space-y-5">
                    {/* Sala */}
                    <div>
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">
                                    {reservation.title}
                                </h2>
                                {!reservation.imagenSala && (
                                    <Badge
                                        variant="outline"
                                        className={cn("mt-1.5 border font-bold text-xs", cfg.badge)}
                                    >
                                        <span className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", cfg.dot)} />
                                        {statusLabel(reservation.status)}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <div className="mt-3 space-y-2 text-sm text-slate-500">
                            {reservation.location && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                                    <span>{reservation.location}</span>
                                </div>
                            )}
                            {reservation.capacidad > 0 && (
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 shrink-0 text-slate-400" />
                                    <span>Capacidad: {reservation.capacidad} personas</span>
                                </div>
                            )}
                            {reservation.descripcion && (
                                <p className="pt-1 leading-relaxed text-slate-400">
                                    {reservation.descripcion}
                                </p>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Reserva */}
                    <div>
                        <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
                            Detalle de la reserva
                        </p>
                        <div className="space-y-2.5 text-sm text-slate-600">
                            <div className="flex items-center gap-2.5">
                                <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
                                <span>{reservation.fecha}</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <Clock className="h-4 w-4 shrink-0 text-slate-400" />
                                <span>
                                    {reservation.horaInicio} — {reservation.horaFin}
                                </span>
                            </div>
                            <div className="flex items-start gap-2.5">
                                <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                <span className="leading-relaxed">{reservation.motivo}</span>
                            </div>
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2 pt-1">
                        {canCancel && (
                            <Button
                                variant="ghost"
                                className="flex-1 bg-red-50 font-semibold text-red-600 hover:bg-red-100 hover:text-red-700"
                                disabled={isCancelling}
                                onClick={handleCancel}
                            >
                                {isCancelling ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Cancelando...
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Cancelar reserva
                                    </>
                                )}
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            className={cn("font-medium", canCancel ? "flex-1" : "w-full")}
                            onClick={onClose}
                        >
                            Cerrar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
