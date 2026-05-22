import { format, setHours, setMinutes } from "date-fns";
import { es } from "date-fns/locale";
import { addDays, isBefore, startOfDay } from "date-fns";

import type { reserva } from "@/src/entities/reserva";

export type Booking = {
    id: string;
    roomId: string;
    title: string;
    date: Date;
    start: string;
    end: string;
};

export type TimeSlotStatus = "free" | "busy" | "current";

export type AgendaItem = {
    start: string;
    end: string;
    status: TimeSlotStatus;
    booking?: Booking;
};

function normalizeDateOnly(value: string) {
    return String(value).split("T")[0];
}

function normalizeTime(value: string) {
    if (!value) return "";

    if (value.includes("T")) {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) return "";

        return format(date, "HH:mm");
    }

    return value.slice(0, 5);
}

export function convertReservaToBooking(reserva: reserva): Booking {
    const fechaBase = normalizeDateOnly(reserva.fecha);
    const horaInicio = normalizeTime(reserva.hora_inicio);
    const horaFin = normalizeTime(reserva.hora_fin);

    const startDate = new Date(`${fechaBase}T${horaInicio}:00`);

    return {
        id: String(reserva.id_reserva || ""),
        roomId: String(reserva.id_sala),
        title: reserva.motivo,
        date: startDate,
        start: horaInicio,
        end: horaFin,
    };
}

export function parseTimeToMinutes(time: string) {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
}

export function minutesToTime(minutes: number) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatHourLabel(time: string) {
    const [hours, minutes] = time.split(":").map(Number);
    const date = setMinutes(setHours(new Date(), hours), minutes);

    return format(date, "hh:mm a", { locale: es });
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

export function generateAgendaSlots() {
    const slots: { start: string; end: string }[] = [];
    const start = 7 * 60;
    const end = 21 * 60 + 30;
    const duration = 30;

    for (let current = start; current + duration <= end; current += 30) {
        slots.push({
            start: minutesToTime(current),
            end: minutesToTime(current + duration),
        });
    }

    return slots;
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

export function getAvailableEndTimes(startTime: string, allTimes: string[]) {
    const startMinutes = parseTimeToMinutes(startTime);

    return allTimes.filter((time) => parseTimeToMinutes(time) > startMinutes);
}

export function isDateDisabled(date: Date) {
    const today = startOfDay(new Date());
    const targetDate = startOfDay(date);

    const isPastDate = isBefore(targetDate, today);
    const isSunday = targetDate.getDay() === 0;

    return isPastDate || isSunday;
}

export function getNextAvailableBusinessDay(date = new Date()) {
    let currentDate = startOfDay(date);

    while (isDateDisabled(currentDate)) {
        currentDate = addDays(currentDate, 1);
    }

    return currentDate;
}