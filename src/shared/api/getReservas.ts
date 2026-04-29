import { reserva } from "@/src/entities/reserva";

const API_URL = "http://localhost:4000/api/reservas";

// Obtener token del localStorage
const getToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
    }
    return null;
};

// Headers con autenticación
const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
});

async function getReservas(): Promise<reserva[]> {
    try {
        const response = await fetch(API_URL, {
            headers: getHeaders(),
        });

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
            headers: getHeaders(),
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
            headers: getHeaders(),
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