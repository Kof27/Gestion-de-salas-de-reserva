import type { Sala } from "@/src/entities/room";
import { apiFetch } from "./apiClient";

const BASE = "/api/salas";

async function getRooms(): Promise<Sala[]> {
    try {
        const response = await apiFetch(BASE);

        if (!response.ok) {
            throw new Error(`Error fetching rooms: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Datos recibidos desde el backend:", data);
        return data.map((room: any) => ({
            ...room,
            estado: room.estado === "activo",
        }));
    } catch (error) {
        console.error("Error fetching rooms:", error);
        throw error;
    }
}

async function getRoomById(id: string | number): Promise<Sala> {
    try {
        const response = await apiFetch(`${BASE}/${id}`);

        if (!response.ok) {
            throw new Error(`Error fetching room: ${response.statusText}`);
        }

        const data = await response.json();

        return {
            ...data,
            estado: data.estado === "activo",
        };
    } catch (error) {
        console.error("Error fetching room:", error);
        throw error;
    }
}
async function createRoom(room: Omit<Sala, "id_sala" | "estado">): Promise<Sala> {
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

async function updateRoom(id: number | string, room: Omit<Sala, "id_sala">): Promise<Sala> {
    try {
        console.log("ID enviado al backend:", id);
        console.log("URL:", `${BASE}/${id}`);
        console.log("Datos recibidos desde frontend:", room);

        const payload = {
            ...room,
            estado: room.estado ? "activo" : "inactivo",
        };

        console.log("Datos enviados al backend:", payload);

        const response = await apiFetch(`${BASE}/${id}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("Respuesta del backend:", errorBody);
            throw new Error(`Error updating room: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        return {
            ...data,
            estado: data.estado === "activo",
        };
    } catch (error) {
        console.error("Error updating room:", error);
        throw error;
    }
}

async function deleteRoom(id: number): Promise<void> {
    try {
        const response = await apiFetch(`${BASE}/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error(`Error deleting room: ${response.statusText}`);
    } catch (error) {
        console.error("Error deleting room:", error);
        throw error;
    }
}

export { getRooms, getRoomById, createRoom, updateRoom, deleteRoom };
