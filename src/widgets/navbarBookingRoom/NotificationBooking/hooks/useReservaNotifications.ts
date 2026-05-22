"use client";

import { useCallback, useEffect, useState } from "react";

import type { usuario } from "@/src/entities/usuario";
import type { ReservaNotification } from "@/src/widgets/navbarBookingRoom/NotificationBooking/lib/bookingNotifications";

import { getLogs } from "@/src/shared/api/apiGetLogs";
import { getReservas } from "@/src/shared/api/getReservas";
import { buildReservaNotifications } from "@/src/widgets/navbarBookingRoom/NotificationBooking/lib/bookingNotifications";
import { getRooms } from "@/src/shared/api/getRooms";


const [logs, reservas, salas] = await Promise.all([
    getLogs(),
    getReservas(),
    getRooms(),
]);

export function useReservaNotifications(usuarioActual: usuario | null) {
    const [notifications, setNotifications] = useState<ReservaNotification[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadNotifications = useCallback(async () => {
        if (!usuarioActual?.id_usuario) return;

        try {
            setLoading(true);
            setError(null);

            const [logs, reservas, salas] = await Promise.all([
                getLogs(),
                getReservas(),
                getRooms(),
            ]);

            const result = buildReservaNotifications({
                logs,
                reservas,
                salas,
                idUsuarioActual: usuarioActual.id_usuario,
            });

            setNotifications(result);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudieron cargar las notificaciones"
            );
        } finally {
            setLoading(false);
        }
    }, [usuarioActual?.id_usuario]);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    return {
        notifications,
        loading,
        error,
        hasNotifications: notifications.length > 0,
        reloadNotifications: loadNotifications,
    };
}