import { Sala } from "@/src/entities/room";

const API_URL = "http://localhost:4000/api/salas";

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

async function getRooms(): Promise<Sala[]> {
    try {
        const response = await fetch(API_URL, {
            headers: getHeaders(),
        });

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
        const response = await fetch(`${API_URL}/${id}`, {
            headers: getHeaders(),
        });

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
            headers: getHeaders(),
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
            headers: getHeaders(),
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

async function deleteRoom(id: string): Promise<void> {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: getHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Error deleting room: ${response.statusText}`);
        }
    } catch (error) {
        console.error("Error deleting room:", error);
        throw error;
    }
}


export { getRooms, getRoomById, createRoom, updateRoom, deleteRoom };