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

async function getRoomById(id: string): Promise<Sala> {
    try {
        const response = await fetch(`${API_URL}/${id}`);

        if (!response.ok) {
            throw new Error(`Error fetching room: ${response.statusText}`);
        }

        const data: Sala = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching room:", error);
        throw error;
    }
}

async function createRoom(
    room: Omit<Sala, "id_sala">
): Promise<Sala> {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(room),
        });

        if (!response.ok) {
            throw new Error(`Error creating room: ${response.statusText}`);
        }

        const data: Sala = await response.json();
        return data;
    } catch (error) {
        console.error("Error creating room:", error);
        throw error;
    }
}

async function updateRoom(
    id: string,
    room: Omit<Sala, "id_sala">
): Promise<Sala> {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(room),
        });

        if (!response.ok) {
            throw new Error(`Error updating room: ${response.statusText}`);
        }

        const data: Sala = await response.json();
        return data;
    } catch (error) {
        console.error("Error updating room:", error);
        throw error;
    }
}


export { getRooms, getRoomById, createRoom, updateRoom };