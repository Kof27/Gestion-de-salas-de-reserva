import type { reserva } from "@/src/entities/reserva";
import { apiFetch } from "./apiClient";

const BASE = "/api/reservas";

async function getReservas(): Promise<reserva[]> {
    try {
        const response = await apiFetch(BASE);
        if (!response.ok) throw new Error(`Error fetching reservas: ${response.statusText}`);
        return response.json();
    } catch (error) {
        console.error("Error fetching reservas:", error);
        throw error;
    }
}

async function getReservaById(id_reserva: string): Promise<reserva> {
    try {
        const response = await apiFetch(`${BASE}/${id_reserva}`);
        if (!response.ok) throw new Error(`Error fetching reserva: ${response.statusText}`);
        return response.json();
    } catch (error) {
        console.error("Error fetching reserva:", error);
        throw error;
    }
}

async function createReserva(
    reserva: Omit<reserva, "id_reserva" | "fecha_creacion">
): Promise<reserva> {
    try {
        const response = await apiFetch(BASE, {
            method: "POST",
            body: JSON.stringify(reserva),
        });
        if (!response.ok) throw new Error(`Error creating reserva: ${response.statusText}`);
        return response.json();
    } catch (error) {
        console.error("Error creating reserva:", error);
        throw error;
    }
}

async function editarReserva(
    id_reserva: string,
    reservaActualizada: Omit<reserva, "id_reserva" | "fecha_creacion">
): Promise<reserva> {
    try {
        const response = await apiFetch(`${BASE}/${id_reserva}`, {
            method: "PUT",
            body: JSON.stringify(reservaActualizada),
        });
        if (!response.ok) throw new Error(`Error editando reserva: ${response.statusText}`);
        return response.json();
    } catch (error) {
        console.error("Error editando reserva:", error);
        throw error;
    }
}

async function cancelarReserva(reservaActual: reserva): Promise<reserva> {
    try {
        if (!reservaActual.id_reserva) {
            throw new Error("La reserva no tiene un id_reserva válido.");
        }

        const payload: Omit<reserva, "id_reserva"> = {
            id_sala: reservaActual.id_sala,
            id_usuario: reservaActual.id_usuario,
            fecha: reservaActual.fecha,
            hora_inicio: reservaActual.hora_inicio,
            hora_fin: reservaActual.hora_fin,
            motivo: reservaActual.motivo,
            estado: false,
            fecha_creacion: reservaActual.fecha_creacion,
        };

        const response = await apiFetch(`${BASE}/${reservaActual.id_reserva}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error(`Error cancelando reserva: ${response.statusText}`);
        return response.json();
    } catch (error) {
        console.error("Error cancelando reserva:", error);
        throw error;
    }
}

export { getReservas, getReservaById, createReserva, editarReserva, cancelarReserva };
