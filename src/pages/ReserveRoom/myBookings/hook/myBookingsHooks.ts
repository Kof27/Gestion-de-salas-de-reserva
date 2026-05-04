"use client";

import * as React from "react";

import { getReservas, cancelarReserva } from "@/src/shared/api/getReservas";
import { getRooms } from "@/src/shared/api/getRooms";

import type { reserva } from "@/src/entities/reserva";
import type { Sala } from "@/src/entities/room";
import type { ReservationView } from "../model/reservationView";

import {
    getReservationStatus,
    formatReservationDate,
    formatDateOnly,
    formatTimeOnly,
} from "../lib/myBookingLib";

function sortReservasFromNewestToOldest(reservas: reserva[]) {
    return [...reservas].sort((a, b) => {
        const dateA = new Date(a.hora_inicio).getTime();
        const dateB = new Date(b.hora_inicio).getTime();
        return dateB - dateA;
    });
}

function mapReservasToView(
    reservasData: reserva[],
    roomsData: Sala[]
): ReservationView[] {
    const roomsMap = new Map<string, Sala>();
    roomsData.forEach((room) => {
        if (room.id_sala) roomsMap.set(String(room.id_sala), room);
    });

    return reservasData.map((item) => {
        const room = roomsMap.get(String(item.id_sala));

        return {
            id: item.id_reserva ?? "",
            title: room?.nombre ?? `Sala ${item.id_sala}`,
            location: room?.ubicacion ?? "",
            dateLabel: formatReservationDate(item.hora_inicio, item.hora_fin),
            fecha: formatDateOnly(item.hora_inicio),
            horaInicio: formatTimeOnly(item.hora_inicio),
            horaFin: formatTimeOnly(item.hora_fin),
            status: getReservationStatus(item),
            motivo: item.motivo,
            capacidad: room?.capacidad ?? 0,
            descripcion: room?.descripcion ?? "",
            imagenSala: room?.imagen_sala ?? "",
            estadoSala: room?.estado ?? false,
        };
    });
}

export function useMyReservations() {
    const [rawReservations, setRawReservations] = React.useState<reserva[]>([]);
    const [reservations, setReservations] = React.useState<ReservationView[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [cancellingId, setCancellingId] = React.useState<string | null>(null);

    const loadReservas = React.useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [reservasData, roomsData] = await Promise.all([
                getReservas(),
                getRooms(),
            ]);

            const sortedReservas = sortReservasFromNewestToOldest(reservasData);
            setRawReservations(sortedReservas);
            setReservations(mapReservasToView(sortedReservas, roomsData));
        } catch (err) {
            console.error(err);
            setError("No se pudieron cargar las reservas.");
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        loadReservas();
    }, [loadReservas]);

    const handleCancelReservation = React.useCallback(
        async (id: string) => {
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
                        item.id_reserva === updatedReserva.id_reserva
                            ? updatedReserva
                            : item
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
        },
        [rawReservations]
    );

    const activeReservations = React.useMemo(
        () => reservations.filter((item) => item.status === "active"),
        [reservations]
    );

    const pastReservations = React.useMemo(
        () => reservations.filter((item) => item.status === "past"),
        [reservations]
    );

    const cancelledReservations = React.useMemo(
        () => reservations.filter((item) => item.status === "cancelled"),
        [reservations]
    );

    return {
        reservations,
        loading,
        error,
        cancellingId,
        activeReservations,
        pastReservations,
        cancelledReservations,
        handleCancelReservation,
        reloadReservations: loadReservas,
    };
}
