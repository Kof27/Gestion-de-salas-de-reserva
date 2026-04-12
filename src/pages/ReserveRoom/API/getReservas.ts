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

export { getReservas };