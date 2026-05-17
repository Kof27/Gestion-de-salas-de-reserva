import type { Log } from "@/src/entities/log";
import type { reserva } from "@/src/entities/reserva";
import type { Sala } from "@/src/entities/room";
export interface ReservaNotification {
    id: number;
    id_reserva: number | string;
    id_sala: number | string;
    tipo: "cancelada" | "actualizada";
    titulo: string;
    descripcion: string;
    fecha_hora: string;
}

function normalizeText(value: string) {
    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

export function extractReservaIdFromDetalle(detalle: string): string | null {
    const match = detalle.match(/id_reserva\s*=\s*(\d+)/i);
    return match ? match[1] : null;
}

export function isReservaNotificationLog(log: Log) {
    const accion = normalizeText(log.accion ?? "");
    const entidad = normalizeText(log.entidad ?? "");
    const detalle = normalizeText(log.detalle ?? "");

    const isReserva =
        entidad.includes("reserva") ||
        detalle.includes("reserva") ||
        detalle.includes("id_reserva");

    const isCancel =
        accion.includes("cancelar") ||
        accion.includes("cancelada") ||
        detalle.includes("reserva cancelada");

    const isUpdate =
        accion.includes("actualizar") ||
        accion.includes("actualizada") ||
        detalle.includes("reserva actualizada");

    return isReserva && (isCancel || isUpdate);
}

export function buildReservaNotifications(params: {
    logs: Log[];
    reservas: reserva[];
    salas: Sala[];
    idUsuarioActual: number | string;
}): ReservaNotification[] {
    const { logs, reservas, salas, idUsuarioActual } = params;

    return logs
        .filter(isReservaNotificationLog)
        .map((log) => {
            const idReserva = extractReservaIdFromDetalle(log.detalle);

            if (!idReserva) return null;

            const reservaEncontrada = reservas.find(
                (reservaItem) => String(reservaItem.id_reserva) === String(idReserva)
            );

            if (!reservaEncontrada) return null;

            const perteneceAlUsuario =
                String(reservaEncontrada.id_usuario) === String(idUsuarioActual);

            if (!perteneceAlUsuario) return null;

            const salaEncontrada = salas.find(
                (salaItem) => String(salaItem.id_sala) === String(reservaEncontrada.id_sala)
            );

            const nombreSalon =
                salaEncontrada?.nombre ||
                salaEncontrada?.ubicacion ||
                `Sala ${reservaEncontrada.id_sala}`;

            const detalleNormalizado = normalizeText(log.detalle ?? "");
            const accionNormalizada = normalizeText(log.accion ?? "");

            const esCancelada =
                accionNormalizada.includes("cancelar") ||
                accionNormalizada.includes("cancelada") ||
                detalleNormalizado.includes("reserva cancelada");

            const tipo: "cancelada" | "actualizada" = esCancelada
                ? "cancelada"
                : "actualizada";

            return {
                id: log.id_log,
                id_reserva: reservaEncontrada.id_reserva,
                id_sala: reservaEncontrada.id_sala,
                tipo,
                titulo: esCancelada ? "Reserva cancelada" : "Reserva actualizada",
                descripcion: esCancelada
                    ? `Tu reserva en el salón ${nombreSalon} fue cancelada.`
                    : `Tu reserva en el salón ${nombreSalon} fue actualizada.`,
                fecha_hora: String(log.fecha_hora),
            };
        })
        .filter(Boolean)
        .sort((a, b) => {
            return (
                new Date(b!.fecha_hora).getTime() -
                new Date(a!.fecha_hora).getTime()
            );
        }) as ReservaNotification[];
}