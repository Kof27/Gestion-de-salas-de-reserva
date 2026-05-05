import type { Sala } from "@/src/entities/room";
import { apiFetch } from "./apiClient";

const BASE = "/api/salas";

async function getRooms(): Promise<Sala[]> {
    try {
        const response = await apiFetch(BASE);
        if (!response.ok) throw new Error(`Error fetching rooms: ${response.statusText}`);
        return response.json();
    } catch (error) {
        console.error("Error fetching rooms:", error);
        throw error;
    }
}

async function getRoomById(id: string): Promise<Sala> {
    try {
        const response = await apiFetch(`${BASE}/${id}`);
        if (!response.ok) throw new Error(`Error fetching room: ${response.statusText}`);
        return response.json();
    } catch (error) {
        console.error("Error fetching room:", error);
        throw error;
    }
}

async function createRoom(room: Omit<Sala, "id_sala">): Promise<Sala> {
    try {
        const response = await apiFetch(BASE, {
            method: "POST",
            body: JSON.stringify(room),
        });
        if (!response.ok) throw new Error(`Error creating room: ${response.statusText}`);
        return response.json();
    } catch (error) {
        console.error("Error creating room:", error);
        throw error;
    }
}

async function updateRoom(id: string, room: Omit<Sala, "id_sala">): Promise<Sala> {
    try {
        const response = await apiFetch(`${BASE}/${id}`, {
            method: "PUT",
            body: JSON.stringify(room),
        });
        if (!response.ok) throw new Error(`Error updating room: ${response.statusText}`);
        return response.json();
    } catch (error) {
        console.error("Error updating room:", error);
        throw error;
    }
}

async function deleteRoom(id: string): Promise<void> {
    try {
        const response = await apiFetch(`${BASE}/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error(`Error deleting room: ${response.statusText}`);
    } catch (error) {
        console.error("Error deleting room:", error);
        throw error;
    }
}

export { getRooms, getRoomById, createRoom, updateRoom, deleteRoom };
