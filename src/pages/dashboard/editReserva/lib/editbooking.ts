import { format, setHours, setMinutes } from "date-fns";
import { es } from "date-fns/locale";
import type { Sala } from "@/src/entities/room";

import type { reserva } from "@/src/entities/reserva";

export function minutesToTime(minutes: number) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function parseTimeToMinutes(time: string) {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
}

export function generateTimeOptions() {
    const start = 7 * 60;
    const end = 21 * 60 + 30;
    const times: string[] = [];

    for (let current = start; current <= end; current += 30) {
        times.push(minutesToTime(current));
    }

    return times;
}

export function getAvailableEndTimes(startTime: string, allTimes: string[]) {
    const startMinutes = parseTimeToMinutes(startTime);

    return allTimes.filter((time) => parseTimeToMinutes(time) > startMinutes);
}

export function formatHourLabel(time: string) {
    const [hours, minutes] = time.split(":").map(Number);
    const date = setMinutes(setHours(new Date(), hours), minutes);

    return format(date, "hh:mm a", { locale: es });
}

export function getDateInputValue(dateValue: string) {
    if (!dateValue) return "";

    return dateValue.split("T")[0];
}

export function getTimeInputValue(dateValue: string) {
    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "";

    return format(date, "HH:mm");
}

export function buildIsoDateTime(date: string, time: string) {
    const dateTime = new Date(`${date}T${time}:00`);
    return dateTime.toISOString();
}

export function isEndTimeValid(startTime: string, endTime: string) {
    return parseTimeToMinutes(endTime) > parseTimeToMinutes(startTime);
}

export function buildEditedReservaPayload(params: {
    reservaActual: reserva;
    fecha: string;
    startTime: string;
    endTime: string;
    motivo: string;
    estado: boolean;
}): Omit<reserva, "id_reserva" | "fecha_creacion"> {
    const { reservaActual, fecha, startTime, endTime, motivo, estado } = params;

    return {
        id_sala: reservaActual.id_sala,
        id_usuario: reservaActual.id_usuario,
        fecha: new Date(`${fecha}T00:00:00`).toISOString(),
        hora_inicio: buildIsoDateTime(fecha, startTime),
        hora_fin: buildIsoDateTime(fecha, endTime),
        motivo: motivo.trim() || "Reunión",
        estado,
    };
}
export function rangesOverlap(
    startA: string,
    endA: string,
    startB: string,
    endB: string
) {
    const aStart = parseTimeToMinutes(startA);
    const aEnd = parseTimeToMinutes(endA);
    const bStart = parseTimeToMinutes(startB);
    const bEnd = parseTimeToMinutes(endB);

    return aStart < bEnd && aEnd > bStart;
}

export function getTimeFromIso(dateValue: string) {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "";

    return format(date, "HH:mm");
}

function normalizeLocation(value?: string | null) {
    return String(value || "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
}

export function hasReservaScheduleConflict(params: {
    reservas: reserva[];
    rooms: Sala[];
    reservaActual: reserva;
    fecha: string;
    startTime: string;
    endTime: string;
}) {
    const { reservas, rooms, reservaActual, fecha, startTime, endTime } = params;

    const roomsById = new Map(
        rooms.map((room) => [String(room.id_sala), room])
    );

    const currentRoom = roomsById.get(String(reservaActual.id_sala));
    const currentLocation = normalizeLocation(currentRoom?.ubicacion);

    return reservas.some((reservaItem) => {
        const isSameReserva =
            String(reservaItem.id_reserva) === String(reservaActual.id_reserva);

        if (isSameReserva) return false;

        const isActive = reservaItem.estado === true;
        if (!isActive) return false;

        const reservaFecha = String(reservaItem.fecha).split("T")[0];
        const isSameSelectedDay = reservaFecha === fecha;
        if (!isSameSelectedDay) return false;

        const existingRoom = roomsById.get(String(reservaItem.id_sala));
        const existingLocation = normalizeLocation(existingRoom?.ubicacion);

        const isSameRoom =
            String(reservaItem.id_sala) === String(reservaActual.id_sala);

        const isSameLocation =
            currentLocation !== "" &&
            existingLocation !== "" &&
            currentLocation === existingLocation;

        if (!isSameRoom && !isSameLocation) return false;

        const reservaStartTime = getTimeFromIso(reservaItem.hora_inicio);
        const reservaEndTime = getTimeFromIso(reservaItem.hora_fin);

        return rangesOverlap(
            startTime,
            endTime,
            reservaStartTime,
            reservaEndTime
        );
    });
}