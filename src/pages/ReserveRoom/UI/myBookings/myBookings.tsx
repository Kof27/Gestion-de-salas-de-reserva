"use client";

import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
    CalendarDays,
    Loader2,
    MapPin,
    Monitor,
    XCircle,
} from "lucide-react";

import NavbarBookingRoom from "@/src/widgets/navbarBookingRoom/navbarBookingRoom";
import { getReservas, cancelarReserva } from "../../../../shared/api/getReservas";
import { getRooms } from "../../../../shared/api/getRooms";
import type { reserva } from "@/src/entities/reserva";
import type { Sala } from "@/src/entities/room";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type ReservationStatus = "active" | "past" | "cancelled";

type ReservationView = {
    id: string;
    title: string;
    location: string;
    dateLabel: string;
    status: ReservationStatus;
    motivo: string;
};

function getReservationStatus(item: reserva): ReservationStatus {
    if (!item.estado) return "cancelled";

    const now = new Date();
    const endDate = new Date(item.hora_fin);

    if (endDate < now) return "past";

    return "active";
}

function formatReservationDate(start: Date | string, end: Date | string) {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const dayLabel = format(startDate, "EEEE, d MMM", { locale: es });
    const startHour = format(startDate, "hh:mm a", { locale: es });
    const endHour = format(endDate, "hh:mm a", { locale: es });

    return `${dayLabel} • ${startHour} - ${endHour}`;
}

function statusLabel(status: ReservationStatus) {
    switch (status) {
        case "active":
            return "CONFIRMADA";
        case "past":
            return "PASADA";
        case "cancelled":
            return "CANCELADA";
    }
}

function ReservationCard({
    reservation,
    onCancel,
    cancellingId,
}: {
    reservation: ReservationView;
    onCancel: (id: string) => Promise<void>;
    cancellingId: string | null;
}) {
    const isCancelled = reservation.status === "cancelled";
    const isPast = reservation.status === "past";
    const isActive = reservation.status === "active";
    const isCancelling = cancellingId === reservation.id;

    return (
        <Card className="rounded-[22px] border border-[#f0eceb] bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <CardContent className="p-8">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <Badge
                        className={cn(
                            "rounded-full border-0 px-4 py-1.5 text-[13px] font-bold tracking-tight shadow-none",
                            isActive && "bg-[#e6efe5] text-[#cf1018]",
                            isPast && "bg-[#f1efee] text-[#6b5a57]",
                            isCancelled && "bg-[#fde8e8] text-[#b91c1c]"
                        )}
                    >
                        <span
                            className={cn(
                                "mr-2 inline-block h-2.5 w-2.5 rounded-full",
                                isActive && "bg-[#cf1018]",
                                isPast && "bg-[#9a8a86]",
                                isCancelled && "bg-[#b91c1c]"
                            )}
                        />
                        {statusLabel(reservation.status)}
                    </Badge>

                    <Monitor
                        className={cn(
                            "mt-0.5 h-5 w-5",
                            isActive && "text-[#e2b5af]",
                            isPast && "text-[#c9b7b3]",
                            isCancelled && "text-[#e48d8d]"
                        )}
                    />
                </div>

                <div className="space-y-5">
                    <div>
                        <h3 className="text-[2rem] font-bold leading-[1.05] tracking-[-0.03em] text-[#2d1715] sm:text-[2.1rem]">
                            {reservation.title}
                        </h3>
                    </div>

                    <div className="space-y-3 text-[#6b4c48]">
                        <div className="flex items-center gap-3 text-[1.15rem]">
                            <MapPin className="h-5 w-5 shrink-0" />
                            <span>{reservation.location}</span>
                        </div>

                        <div className="flex items-center gap-3 text-[1.15rem]">
                            <CalendarDays className="h-5 w-5 shrink-0" />
                            <span>{reservation.dateLabel}</span>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                            <span className="font-semibold text-slate-800">Motivo:</span>{" "}
                            {reservation.motivo}
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <Button
                        variant="ghost"
                        disabled={isCancelled || isCancelling || isPast}
                        onClick={() => onCancel(reservation.id)}
                        className={cn(
                            "h-16 w-full rounded-2xl text-[1.15rem] font-bold",
                            isCancelled
                                ? "cursor-not-allowed bg-[#f3f0ef] text-[#9a8a86] hover:bg-[#f3f0ef] opacity-70"
                                : isPast
                                    ? "cursor-not-allowed bg-[#f7ece8] text-[#8d5b55] hover:bg-[#f7ece8] opacity-80"
                                    : "bg-[#f8ddd9] text-[#d11318] hover:bg-[#f4d1cc]"
                        )}
                    >
                        {isCancelling ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Cancelando...
                            </>
                        ) : isCancelled ? (
                            <>
                                <XCircle className="mr-2 h-4 w-4" />
                                Reserva cancelada
                            </>
                        ) : isPast ? (
                            "Reserva finalizada"
                        ) : (
                            "Cancelar Reserva"
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function SummaryBox({ value, label }: { value: string; label: string }) {
    return (
        <div className="flex h-28 w-36 flex-col items-center justify-center rounded-[18px] bg-[#f7f3f2] text-center">
            <span className="text-5xl font-extrabold tracking-[-0.04em] text-[#c9141a]">
                {value}
            </span>
            <span className="mt-1 text-lg font-bold tracking-[0.12em] text-[#6a514c]">
                {label}
            </span>
        </div>
    );
}

function ReservationCardSkeleton() {
    return (
        <Card className="rounded-[22px] border border-[#f0eceb] bg-white shadow-sm">
            <CardContent className="space-y-6 p-8">
                <div className="flex items-start justify-between">
                    <Skeleton className="h-8 w-32 rounded-full" />
                    <Skeleton className="h-5 w-5 rounded-md" />
                </div>

                <div className="space-y-4">
                    <Skeleton className="h-10 w-3/4 rounded-xl" />
                    <Skeleton className="h-6 w-2/3 rounded-xl" />
                    <Skeleton className="h-6 w-1/2 rounded-xl" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                </div>

                <Skeleton className="h-16 w-full rounded-2xl" />
            </CardContent>
        </Card>
    );
}

export default function MyReservationsPage() {
    const [rawReservations, setRawReservations] = React.useState<reserva[]>([]);
    const [reservations, setReservations] = React.useState<ReservationView[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [cancellingId, setCancellingId] = React.useState<string | null>(null);

    React.useEffect(() => {
        async function loadReservas() {
            try {
                setLoading(true);
                setError(null);

                const [reservasData, roomsData] = await Promise.all([
                    getReservas(),
                    getRooms(),
                ]);

                setRawReservations(reservasData);

                const roomsMap = new Map<string, Sala>();
                roomsData.forEach((room) => {
                    if (room.id_sala) {
                        roomsMap.set(String(room.id_sala), room);
                    }
                });

                const mappedReservations: ReservationView[] = reservasData.map((item) => {
                    const room = roomsMap.get(String(item.id_sala));

                    return {
                        id: item.id_reserva ?? "",
                        title: room?.nombre ?? `Sala ${item.id_sala}`,
                        location: room?.ubicacion ?? `Reserva del usuario ${item.id_usuario}`,
                        dateLabel: formatReservationDate(item.hora_inicio, item.hora_fin),
                        status: getReservationStatus(item),
                        motivo: item.motivo,
                    };
                });

                setReservations(mappedReservations);
            } catch (err) {
                console.error(err);
                setError("No se pudieron cargar las reservas.");
            } finally {
                setLoading(false);
            }
        }

        loadReservas();
    }, []);

    async function handleCancelReservation(id: string) {
        try {
            setCancellingId(id);

            const reservaOriginal = rawReservations.find(
                (item) => item.id_reserva === id
            );

            if (!reservaOriginal) {
                throw new Error("No se encontró la reserva a cancelar.");
            }

            const updatedReserva = await cancelarReserva(reservaOriginal);

            setRawReservations((prev) =>
                prev.map((item) =>
                    item.id_reserva === updatedReserva.id_reserva ? updatedReserva : item
                )
            );

            setReservations((prev) =>
                prev.map((item) =>
                    item.id === id ? { ...item, status: "cancelled" } : item
                )
            );
        } catch (error) {
            console.error("Error cancelando reserva:", error);
            alert("No se pudo cancelar la reserva.");
        } finally {
            setCancellingId(null);
        }
    }

    const activeReservations = reservations.filter(
        (item) => item.status === "active"
    );
    const pastReservations = reservations.filter(
        (item) => item.status === "past"
    );
    const cancelledReservations = reservations.filter(
        (item) => item.status === "cancelled"
    );

    return (
        <div className="min-h-screen bg-[#f5f6f8] text-slate-900">
            <NavbarBookingRoom />

            <main className="mx-auto max-w-360 px-8 pb-16 pt-14 lg:px-12">
                <section className="mb-12 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-start">
                    <div className="max-w-3xl">
                        <p className="mb-4 text-sm font-extrabold uppercase tracking-[0.35em] text-slate-900">
                            Gestión de espacios
                        </p>

                        <h1 className="text-6xl font-black tracking-[-0.06em] text-slate-900 sm:text-7xl">
                            Mis Reservas
                        </h1>

                        <p className="mt-5 max-w-2xl text-[1.15rem] leading-9 text-[#6a514c] sm:text-[1.2rem]">
                            Bienvenido a su agenda de espacios. Aquí podrá consultar y gestionar
                            sus próximas sesiones en nuestras instalaciones editoriales.
                        </p>
                    </div>

                    <div className="flex gap-5 lg:pt-24">
                        <SummaryBox
                            value={String(activeReservations.length).padStart(2, "0")}
                            label="ACTIVAS"
                        />
                        <SummaryBox
                            value={String(pastReservations.length).padStart(2, "0")}
                            label="PASADAS"
                        />
                        <SummaryBox
                            value={String(cancelledReservations.length).padStart(2, "0")}
                            label="CANCELADAS"
                        />
                    </div>
                </section>

                {loading ? (
                    <section className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <ReservationCardSkeleton key={index} />
                        ))}
                    </section>
                ) : error ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center text-red-600">
                        {error}
                    </div>
                ) : reservations.length === 0 ? (
                    <div className="rounded-2xl border bg-white p-10 text-center text-slate-500">
                        No hay reservas registradas.
                    </div>
                ) : (
                    <section className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                        {reservations.map((reservation) => (
                            <ReservationCard
                                key={reservation.id}
                                reservation={reservation}
                                onCancel={handleCancelReservation}
                                cancellingId={cancellingId}
                            />
                        ))}
                    </section>
                )}
            </main>
        </div>
    );
}