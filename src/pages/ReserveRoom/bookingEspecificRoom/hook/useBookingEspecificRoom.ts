"use client";

import * as React from "react";
import { format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

import { getRoomById } from "@/src/shared/api/getRooms";
import { getReservas, createReserva } from "@/src/shared/api/getReservas";
import { getResources } from "@/src/shared/api/getRecursos";

import type { Sala } from "@/src/entities/room";
import type { reserva } from "@/src/entities/reserva";
import type { Resource } from "@/src/entities/recurso";

import {
    convertReservaToBooking,
    formatHourLabel,
    generateAgendaSlots,
    generateTimeOptions,
    getAvailableEndTimes,
    getNextAvailableBusinessDay,
    isDateDisabled,
    parseTimeToMinutes,
    rangesOverlap,
    type AgendaItem,
    type Booking,
    type TimeSlotStatus,
} from "../lib/bookingSpecificRoomLib";

type UseBookingRoomParams = {
    roomId?: string;
};

export function useBookingRoom({ roomId }: UseBookingRoomParams) {
    const effectiveRoomId = roomId || "1";
    const usuarioStorage = typeof window !== "undefined" ? localStorage.getItem("usuario") : null;
    const usuario = usuarioStorage ? JSON.parse(usuarioStorage) : null;

    const allTimes = React.useMemo(() => generateTimeOptions(), []);
    const agendaSlots = React.useMemo(() => generateAgendaSlots(), []);

    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
        getNextAvailableBusinessDay()
    );
    const [startTime, setStartTime] = React.useState("10:00");
    const [endTime, setEndTime] = React.useState("11:00");
    const [meetingReason, setMeetingReason] = React.useState("");

    const [room, setRoom] = React.useState<Sala | null>(null);
    const [resources, setResources] = React.useState<Resource[]>([]);
    const [bookings, setBookings] = React.useState<Booking[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [submitting, setSubmitting] = React.useState(false);

    const loadData = React.useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [roomData, allRecursos, allReservas] = await Promise.all([
                getRoomById(effectiveRoomId),
                getResources(),
                getReservas(),
            ]);

            setRoom(roomData);
            setResources(
                allRecursos.filter((r) => String(r.id_sala) === String(effectiveRoomId))
            );
            console.log("Reservas recibidas del backend:", allReservas);
            const reservasActivasDeLaSala = allReservas.filter(
                (reservaItem) =>
                    reservaItem.estado === true &&
                    String(reservaItem.id_sala) === String(effectiveRoomId)
            );

            const bookingsConvertidos = reservasActivasDeLaSala.map(convertReservaToBooking);

            setBookings(bookingsConvertidos);
        } catch (err) {
            console.error("Error cargando datos:", err);
            setError("Error al cargar la información de la sala");
            setBookings([]);
        } finally {
            setLoading(false);
        }
    }, [effectiveRoomId]);

    React.useEffect(() => {
        if (effectiveRoomId) {
            loadData();
        }
    }, [effectiveRoomId, loadData]);

    const bookingsForDay = React.useMemo(() => {
        if (!selectedDate) return [];

        return bookings
            .filter((booking) => isSameDay(booking.date, selectedDate))
            .sort((a, b) => parseTimeToMinutes(a.start) - parseTimeToMinutes(b.start));
    }, [selectedDate, bookings]);

    const endTimeOptions = React.useMemo(
        () => getAvailableEndTimes(startTime, allTimes),
        [startTime, allTimes]
    );

    React.useEffect(() => {
        const stillValid = endTimeOptions.includes(endTime);

        if (!stillValid) {
            setEndTime(endTimeOptions[0] ?? "");
        }
    }, [startTime, endTime, endTimeOptions]);

    const hasConflict = React.useMemo(() => {
        if (!selectedDate || !startTime || !endTime) return true;

        if (parseTimeToMinutes(endTime) <= parseTimeToMinutes(startTime)) {
            return true;
        }

        return bookingsForDay.some((booking) =>
            rangesOverlap(startTime, endTime, booking.start, booking.end)
        );
    }, [selectedDate, startTime, endTime, bookingsForDay]);

    const agendaItems: AgendaItem[] = React.useMemo(() => {
        return agendaSlots.map((slot) => {
            const busyBooking = bookingsForDay.find((booking) =>
                rangesOverlap(slot.start, slot.end, booking.start, booking.end)
            );

            const overlapsCurrent =
                startTime &&
                endTime &&
                rangesOverlap(slot.start, slot.end, startTime, endTime);

            let status: TimeSlotStatus = "free";

            if (busyBooking) status = "busy";
            if (!busyBooking && overlapsCurrent) status = "current";

            return {
                ...slot,
                status,
                booking: busyBooking,
            };
        });
    }, [agendaSlots, bookingsForDay, startTime, endTime]);

    const handleConfirmReservation = async () => {
        if (hasConflict || !selectedDate) return;

        try {
            setSubmitting(true);

            const startDateTime = new Date(selectedDate);
            const [horaInicio, minInicio] = startTime.split(":");
            startDateTime.setHours(parseInt(horaInicio), parseInt(minInicio));

            const endDateTime = new Date(selectedDate);
            const [horaFin, minFin] = endTime.split(":");
            endDateTime.setHours(parseInt(horaFin), parseInt(minFin));

            const newReserva = {
                id_sala: effectiveRoomId,
                id_usuario: String(usuario.id_usuario),
                fecha: selectedDate.toISOString(),
                hora_inicio: startDateTime.toISOString(),
                hora_fin: endDateTime.toISOString(),
                estado: true,
                motivo: meetingReason.trim() || "Reunión",
            };
            await createReserva(newReserva);

            toast.success("Reserva confirmada exitosamente", {
                description: `${room?.nombre} · ${format(selectedDate, "d 'de' MMMM yyyy", { locale: es })} · ${formatHourLabel(startTime)} - ${formatHourLabel(endTime)}`,
                style: {
                    background: "#16a34a",
                    color: "#ffffff",
                    border: "1px solid #15803d",
                    fontSize: "14px",
                    fontWeight: "600",
                },
            });

            await loadData();
            setMeetingReason("");
        } catch (err) {
            console.error("Error al crear reserva:", err);

            toast.error("No se pudo realizar la reserva", {
                description: "Intenta de nuevo más tarde.",
                style: {
                    background: "#EF4444",
                    color: "#ffffff",
                    border: "1px solid #DC2626",
                    fontSize: "14px",
                    fontWeight: "600",
                },
            });
        } finally {
            setSubmitting(false);
        }
    };
    const handleSelectDate = React.useCallback((date: Date | undefined) => {
        if (!date) return;

        if (isDateDisabled(date)) {
            return;
        }

        setSelectedDate(date);
    }, []);

    return {
        effectiveRoomId,

        room,
        resources,
        bookings,
        loading,
        error,
        submitting,

        selectedDate,
        setSelectedDate,

        startTime,
        setStartTime,

        endTime,
        setEndTime,

        meetingReason,
        setMeetingReason,

        allTimes,
        endTimeOptions,
        agendaItems,
        hasConflict,

        handleConfirmReservation,
        formatHourLabel,

        isDateDisabled,
        handleSelectDate,
    };
}