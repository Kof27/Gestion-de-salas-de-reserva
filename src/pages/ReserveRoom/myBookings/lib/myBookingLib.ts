import { ReservationStatus } from "../model/reservationView";
import type { reserva } from "@/src/entities/reserva";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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

function formatDateOnly(start: Date | string): string {
    return format(new Date(start), "d MMM yyyy", { locale: es });
}

function formatTimeOnly(time: Date | string): string {
    return format(new Date(time), "HH:mm");
}

function statusLabel(status: ReservationStatus) {
    switch (status) {
        case "active":
            return "Confirmada";
        case "past":
            return "Pasada";
        case "cancelled":
            return "Cancelada";
    }
}

export { getReservationStatus, formatReservationDate, formatDateOnly, formatTimeOnly, statusLabel };
