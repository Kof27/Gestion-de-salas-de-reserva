import { Sala } from "@/src/entities/room";

const API_URL = "https://69b73e25ffbcd0286094cde0.mockapi.io/room";

async function getRooms(): Promise<Sala[]> {
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`Error fetching rooms: ${response.statusText}`);
        }
        
        const data: Sala[] = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching rooms:", error);
        throw error;
    }
}

export { getRooms };
