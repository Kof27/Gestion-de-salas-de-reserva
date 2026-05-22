import type { reserva } from "@/src/entities/reserva";
import type { Sala } from "@/src/entities/room";

export type ReservationStatus = "activa" | "cancelada";
export type FilterStatus = "todas" | "activas" | "canceladas";

export type ReservationView = {
    id: string;
    roomId: string;
    roomName: string;
    location: string;
    userId: string;
    start: string;
    end: string;
    reason: string;
    status: ReservationStatus;
    raw: reserva;
};

export function mapReservaToView(item: reserva, rooms: Sala[]): ReservationView {
    const room = rooms.find((r) => String(r.id_sala) === String(item.id_sala));

    return {
        id: String(item.id_reserva),
        roomId: String(item.id_sala),
        roomName: room?.nombre ?? `Sala ${item.id_sala}`,
        location: room?.ubicacion ?? "Ubicación no disponible",
        userId: String(item.id_usuario),
        start: String(item.hora_inicio),
        end: String(item.hora_fin),
        reason: item.motivo,
        status: item.estado ? "activa" : "cancelada",
        raw: item,
    };
}

export function formatReservationDate(date: string) {
    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return date;

    return parsed.toLocaleString("es-CO", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}