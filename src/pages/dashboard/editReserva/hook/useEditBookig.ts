"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import type { reserva } from "@/src/entities/reserva";
import { editarReserva, getReservaById, getReservas } from "@/src/shared/api/getReservas";

import {
    buildEditedReservaPayload,
    generateTimeOptions,
    getAvailableEndTimes,
    getDateInputValue,
    getTimeInputValue,
    isEndTimeValid,
    hasReservaScheduleConflict,
} from "@/src/pages/dashboard/editReserva/lib/editbooking";

import type { usuario } from "@/src/entities/usuario";
import { getUsuarioById } from "@/src/shared/api/getUsuario";



export function useEditBooking() {
    const router = useRouter();
    const params = useParams();

    const reservaId = Array.isArray(params?.id)
        ? params.id[0]
        : params?.id;

    const [reservaActual, setReservaActual] = React.useState<reserva | null>(null);

    const [fecha, setFecha] = React.useState("");
    const [startTime, setStartTime] = React.useState("");
    const [endTime, setEndTime] = React.useState("");
    const [motivo, setMotivo] = React.useState("");
    const [estado, setEstado] = React.useState(true);

    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);

    const timeOptions = React.useMemo(() => generateTimeOptions(), []);

    const [usuarioReserva, setUsuarioReserva] = React.useState<usuario | null>(null);

    const availableEndTimes = React.useMemo(() => {
        if (!startTime) return timeOptions;

        return getAvailableEndTimes(startTime, timeOptions);
    }, [startTime, timeOptions]);

    const hasInvalidTime = React.useMemo(() => {
        if (!startTime || !endTime) return false;

        return !isEndTimeValid(startTime, endTime);
    }, [startTime, endTime]);

    const canSubmit = Boolean(
        fecha &&
        startTime &&
        endTime &&
        motivo.trim() &&
        !hasInvalidTime &&
        !saving
    );

    const fillForm = React.useCallback((reservaData: reserva) => {
        setReservaActual(reservaData);

        setFecha(getDateInputValue(reservaData.fecha));
        setStartTime(getTimeInputValue(reservaData.hora_inicio));
        setEndTime(getTimeInputValue(reservaData.hora_fin));
        setMotivo(reservaData.motivo || "");
        setEstado(reservaData.estado);
    }, []);

    const loadData = React.useCallback(async () => {
        if (!reservaId) return;

        try {
            setLoading(true);

            const reservaData = await getReservaById(String(reservaId));

            fillForm(reservaData);

            try {
                const usuarioData = await getUsuarioById(reservaData.id_usuario);
                setUsuarioReserva(usuarioData);
            } catch (error) {
                console.error("Error cargando usuario de la reserva:", error);
                setUsuarioReserva(null);
            }
        } catch (error) {
            console.error("Error cargando reserva:", error);

            toast.error("No se pudo cargar la reserva", {
                description: "Intenta nuevamente más tarde.",
            });
        } finally {
            setLoading(false);
        }
    }, [reservaId, fillForm]);

    React.useEffect(() => {
        loadData();
    }, [loadData]);

    React.useEffect(() => {
        if (!startTime || !endTime) return;

        if (!isEndTimeValid(startTime, endTime)) {
            const nextEndTime = availableEndTimes[0];

            if (nextEndTime) {
                setEndTime(nextEndTime);
            }
        }
    }, [startTime, endTime, availableEndTimes]);

    const handleSave = async () => {
        if (!reservaId || !reservaActual) return;

        if (!canSubmit) {
            toast.error("Completa todos los campos correctamente.");
            return;
        }

        try {
            setSaving(true);

            // 1. Obtener todas las reservas para validar conflictos
            const allReservas = await getReservas();

            // 2. Verificar si existe una reserva activa
            // en la misma sala, misma fecha y con cruce de horario
            const hasConflict = hasReservaScheduleConflict({
                reservas: allReservas,
                reservaActual,
                fecha,
                startTime,
                endTime,
            });

            // 3. Si hay conflicto, no se actualiza la reserva
            if (hasConflict) {
                toast.error("Conflicto de horario", {
                    description:
                        "Ya existe una reserva activa para esta sala en el horario seleccionado.",
                });

                return;
            }

            // 4. Construir el payload de actualización
            const payload = buildEditedReservaPayload({
                reservaActual,
                fecha,
                startTime,
                endTime,
                motivo,
                estado,
            });

            // 5. Enviar actualización
            await editarReserva(String(reservaId), payload);

            toast.success("Reserva actualizada", {
                description: "Los cambios fueron guardados correctamente.",
            });

        } catch (error) {
            console.error("Error editando reserva:", error);

            toast.error("No se pudo editar la reserva", {
                description: "Intenta nuevamente más tarde.",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        router.push("/reservas");
    };

    return {
        reservaId,
        reservaActual,

        fecha,
        setFecha,

        startTime,
        setStartTime,

        endTime,
        setEndTime,

        motivo,
        setMotivo,

        estado,
        setEstado,

        loading,
        saving,

        timeOptions,
        availableEndTimes,
        hasInvalidTime,
        canSubmit,

        handleSave,
        handleCancel,
        usuarioReserva
    };
}