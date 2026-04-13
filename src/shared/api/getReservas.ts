import { reserva } from "@/src/entities/reserva";

const API_URL = "https://69b73e25ffbcd0286094cde0.mockapi.io/reserva";

async function getReservas(): Promise<reserva[]> {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Error fetching reservas: ${response.statusText}`);
        }

        const data: reserva[] = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching reservas:", error);
        throw error;
    }
}

async function createReserva(reserva: Omit<reserva, "id_reserva" | "fecha_creacion">): Promise<reserva> {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(reserva),
        });

        if (!response.ok) {
            throw new Error(`Error creating reserva: ${response.statusText}`);
        }

        const data: reserva = await response.json();
        return data;
    } catch (error) {
        console.error("Error creating reserva:", error);
        throw error;
    }
}
async function cancelarReserva(reservaActual: reserva): Promise<reserva> {
    try {
        if (!reservaActual.id_reserva) {
            throw new Error("La reserva no tiene un id_reserva válido.");
        }

        const payload: reserva = {
            ...reservaActual,
            estado: false,
        };

        const response = await fetch(`${API_URL}/${reservaActual.id_reserva}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Error cancelando reserva: ${response.statusText}`);
        }

        const data: reserva = await response.json();
        return data;
    } catch (error) {
        console.error("Error cancelando reserva:", error);
        throw error;
    }
}
export { getReservas, createReserva, cancelarReserva };