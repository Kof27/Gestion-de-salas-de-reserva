"use client";

import * as React from "react";

import { getReservas, cancelarReserva } from "@/src/shared/api/getReservas";
import { getRooms } from "@/src/shared/api/getRooms";
import { getResources } from "@/src/shared/api/getRecursos";

import type { reserva } from "@/src/entities/reserva";
import type { Sala } from "@/src/entities/room";
import type { Resource } from "@/src/entities/recurso";
import type { ReservationView } from "../model/reservationView";
import { toast } from "sonner";

import {
    getReservationStatus,
    formatReservationDate,
    formatDateOnly,
    formatTimeOnly,
} from "../lib/myBookingLib";


function sortReservasFromNewestToOldest(reservas: reserva[]) {
    return [...reservas].sort((a, b) => {
        const dateA = a.fecha_creacion
            ? new Date(a.fecha_creacion).getTime()
            : 0;

        const dateB = b.fecha_creacion
            ? new Date(b.fecha_creacion).getTime()
            : 0;

        return dateB - dateA;
    });
}

function mapReservasToView(
    reservasData: reserva[],
    roomsData: Sala[],
    recursosData: Resource[]
): ReservationView[] {
    const roomsMap = new Map<string, Sala>();
    roomsData.forEach((room) => {
        if (room.id_sala) roomsMap.set(String(room.id_sala), room);
    });

    const recursosBySala = new Map<number, Resource[]>();
    recursosData.forEach((r) => {
        const list = recursosBySala.get(r.id_sala) ?? [];
        list.push(r);
        recursosBySala.set(r.id_sala, list);
    });

    return reservasData.map((item) => {
        const room = roomsMap.get(String(item.id_sala));
        const salaId = Number(item.id_sala);

        return {
            id: item.id_reserva ?? "",
            id_sala: salaId,
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
            recursos: recursosBySala.get(salaId) ?? [],
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

            const usuarioRaw = localStorage.getItem("usuario");
            const idUsuarioActual = usuarioRaw
                ? (JSON.parse(usuarioRaw) as { id_usuario: number }).id_usuario
                : null;

            const [reservasData, roomsData, recursosData] = await Promise.all([
                getReservas(),
                getRooms(),
                getResources(),
            ]);

            const misReservas = idUsuarioActual !== null
                ? reservasData.filter((r) => Number(r.id_usuario) === Number(idUsuarioActual))
                : reservasData;

            const sortedReservas = sortReservasFromNewestToOldest(misReservas);
            setRawReservations(sortedReservas);
            setReservations(mapReservasToView(sortedReservas, roomsData, recursosData));
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
        async (id: string | number) => {
            try {
                const idReserva = String(id);

                setCancellingId(idReserva);

                const reservaOriginal = rawReservations.find(
                    (item) => String(item.id_reserva) === idReserva
                );

                if (!reservaOriginal) {
                    toast.error("No se encontró la reserva seleccionada.");
                    return;
                }

                const updatedReserva = await cancelarReserva(reservaOriginal);

                setRawReservations((prev) =>
                    prev.map((item) =>
                        String(item.id_reserva) === String(updatedReserva.id_reserva)
                            ? updatedReserva
                            : item
                    )
                );

                setReservations((prev) =>
                    prev.map((item) =>
                        String(item.id) === idReserva
                            ? { ...item, status: "cancelled" }
                            : item
                    )
                );

                toast.success("Reserva cancelada exitosamente.");
            } catch (error) {
                console.error("Error cancelando reserva:", error);

                const message = error instanceof Error ? error.message : "";

                const isConnectionError =
                    error instanceof TypeError ||
                    message.includes("Failed to fetch") ||
                    message.includes("NetworkError") ||
                    message.includes("ERR_CONNECTION_REFUSED") ||
                    message.includes("ECONNREFUSED");

                if (isConnectionError) {
                    toast.error("No se pudo conectar con el servidor. Verifica que el backend esté encendido.");
                    return;
                }

                toast.error("No se pudo cancelar la reserva. Intenta nuevamente.");
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
