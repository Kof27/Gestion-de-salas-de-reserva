import type { reserva } from "@/src/entities/reserva";
import { apiFetch } from "./apiClient";

const BASE = "/api/reservas";

type ReservaApiResponse = {
    msg?: string;
    reserva: reserva;
};

async function getErrorMessage(response: Response) {
    const text = await response.text().catch(() => "");

    if (!text) {
        return `Error ${response.status}: ${response.statusText}`;
    }

    try {
        const data = JSON.parse(text);

        if (Array.isArray(data.errors)) {
            return `${data.msg || "Error de validación"}: ${data.errors.join(" ")}`;
        }

        return data.msg || data.message || text;
    } catch {
        return text;
    }
}

async function getReservas(): Promise<reserva[]> {
    try {
        const response = await apiFetch(BASE);

        if (!response.ok) {
            throw new Error(await getErrorMessage(response));
        }

        return response.json();
    } catch (error) {
        console.error("Error fetching reservas:", error);
        throw error;
    }
}

async function getReservaById(id_reserva: string | number): Promise<reserva> {
    try {
        if (!id_reserva) {
            throw new Error("El id_reserva es obligatorio.");
        }

        const response = await apiFetch(`${BASE}/${id_reserva}`);

        if (!response.ok) {
            throw new Error(await getErrorMessage(response));
        }

        return response.json();
    } catch (error) {
        console.error("Error fetching reserva:", error);
        throw error;
    }
}

async function createReserva(
    nuevaReserva: Omit<reserva, "id_reserva" | "fecha_creacion">
): Promise<reserva> {
    try {
        const response = await apiFetch(BASE, {
            method: "POST",
            body: JSON.stringify(nuevaReserva),
        });

        if (!response.ok) {
            console.error("Payload que falló:", nuevaReserva);
            throw new Error(await getErrorMessage(response));
        }

        const data: ReservaApiResponse = await response.json();

        return data.reserva;
    } catch (error) {
        console.error("Error creating reserva:", error);
        throw error;
    }
}

async function editarReserva(
    id_reserva: string | number,
    reservaActualizada: Omit<reserva, "id_reserva" | "fecha_creacion">
): Promise<reserva> {
    try {
        if (!id_reserva) {
            throw new Error("El id_reserva es obligatorio.");
        }

        const response = await apiFetch(`${BASE}/${id_reserva}`, {
            method: "PUT",
            body: JSON.stringify(reservaActualizada),
        });

        if (!response.ok) {
            console.error("Payload que falló:", reservaActualizada);
            throw new Error(await getErrorMessage(response));
        }

        const data: ReservaApiResponse = await response.json();

        return data.reserva;
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

        const response = await apiFetch(`${BASE}/${reservaActual.id_reserva}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error(await getErrorMessage(response));
        }

        const data: ReservaApiResponse = await response.json();

        return data.reserva;
    } catch (error) {
        console.error("Error cancelando reserva:", error);
        throw error;
    }
}

export {
    getReservas,
    getReservaById,
    createReserva,
    editarReserva,
    cancelarReserva,
};