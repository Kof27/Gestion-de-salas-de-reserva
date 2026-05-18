"use client";

import { useEffect, useState } from "react";
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
    Monitor,
    Tv,
    Video,
    Volume2,
    Wind,
    Projector,
    Wifi,
    Printer,
    Package,
    type LucideIcon,
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

const recursoIconMap: Record<string, LucideIcon> = {
    proyector: Projector,
    computador: Monitor,
    computadora: Monitor,
    pc: Monitor,
    televisor: Tv,
    tv: Tv,
    pantalla: Tv,
    videoconferencia: Video,
    camara: Video,
    audio: Volume2,
    parlante: Volume2,
    sonido: Volume2,
    "aire acondicionado": Wind,
    aire: Wind,
    wifi: Wifi,
    internet: Wifi,
    impresora: Printer,
};

function getRecursoIcon(tipo: string | undefined | null): LucideIcon {
    if (!tipo) return Package;
    const key = tipo.toLowerCase().trim();
    for (const [pattern, Icon] of Object.entries(recursoIconMap)) {
        if (key.includes(pattern)) return Icon;
    }
    return Package;
}

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
    const [internalReservation, setInternalReservation] = useState<ReservationView | null>(reservation);
    const [closing, setClosing] = useState(false);

    useEffect(() => {
        if (reservation) {
            setInternalReservation(reservation);
            setClosing(false);
        } else if (internalReservation) {
            setClosing(true);
            const timeout = setTimeout(() => {
                setInternalReservation(null);
                setClosing(false);
            }, 200);
            return () => clearTimeout(timeout);
        }
    }, [reservation, internalReservation]);

    useEffect(() => {
        if (!reservation) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [reservation, onClose]);

    if (!internalReservation) return null;

    const isCancelling = cancellingId === String(internalReservation.id);
    const canCancel = internalReservation.status === "active";
    const cfg = statusConfig[internalReservation.status];
    const data = internalReservation;

    const handleCancel = async () => {
        await onCancel(String(data.id));
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            {/* Overlay */}
            <div
                className={cn(
                    "absolute inset-0 bg-black/50 backdrop-blur-sm",
                    closing
                        ? "animate-out fade-out duration-200"
                        : "animate-in fade-in duration-200"
                )}
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={cn(
                    "relative z-10 w-full max-w-lg max-h-[95vh] overflow-y-auto rounded-2xl bg-white shadow-2xl sm:max-h-[90vh]",
                    closing
                        ? "animate-out fade-out zoom-out-95 slide-out-to-bottom-4 duration-200"
                        : "animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300"
                )}
            >
                {/* Header */}
                {data.imagenSala ? (
                    <div className="relative h-44 w-full overflow-hidden rounded-t-2xl sm:h-52">
                        <img
                            src={data.imagenSala}
                            alt={data.title}
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
                            aria-label="Cerrar"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <Badge
                            variant="outline"
                            className={cn("absolute bottom-4 left-4 border font-bold", cfg.badge)}
                        >
                            <span className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", cfg.dot)} />
                            {statusLabel(data.status)}
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

                <div className="p-4 space-y-4 sm:p-6 sm:space-y-5">
                    {/* Info sala */}
                    <div>
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                                    {data.title}
                                </h2>
                                {!data.imagenSala && (
                                    <Badge
                                        variant="outline"
                                        className={cn("mt-1.5 border font-bold text-xs", cfg.badge)}
                                    >
                                        <span className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", cfg.dot)} />
                                        {statusLabel(data.status)}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <div className="mt-3 space-y-2 text-sm text-slate-500">
                            {data.location && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                                    <span>{data.location}</span>
                                </div>
                            )}
                            {data.capacidad > 0 && (
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 shrink-0 text-slate-400" />
                                    <span>Capacidad: {data.capacidad} personas</span>
                                </div>
                            )}
                            {data.descripcion && (
                                <p className="pt-1 leading-relaxed text-slate-400">
                                    {data.descripcion}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Recursos de la sala */}
                    {data.recursos.length > 0 && (
                        <>
                            <Separator />
                            <div>
                                <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
                                    Recursos disponibles
                                </p>
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    {data.recursos.map((recurso) => {
                                        const Icon = getRecursoIcon(recurso.tipo);
                                        return (
                                            <div
                                                key={recurso.id_recurso}
                                                className="flex items-center gap-2.5 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5"
                                                title={recurso.descripcion}
                                            >
                                                <Icon className="h-4 w-4 shrink-0 text-red-400" />
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium text-slate-700">
                                                        {recurso.nombre}
                                                    </p>
                                                    {recurso.tipo && (
                                                        <p className="truncate text-xs text-slate-400">
                                                            {recurso.tipo}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}

                    <Separator />

                    {/* Detalle reserva */}
                    <div>
                        <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
                            Detalle de la reserva
                        </p>
                        <div className="space-y-2.5 text-sm text-slate-600">
                            <div className="flex items-center gap-2.5">
                                <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
                                <span>{data.fecha}</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <Clock className="h-4 w-4 shrink-0 text-slate-400" />
                                <span>{data.horaInicio} — {data.horaFin}</span>
                            </div>
                            <div className="flex items-start gap-2.5">
                                <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                <span className="leading-relaxed">{data.motivo}</span>
                            </div>
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-col gap-2 pt-1 sm:flex-row">
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
