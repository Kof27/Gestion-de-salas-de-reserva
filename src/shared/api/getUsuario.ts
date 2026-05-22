import type { usuario } from "@/src/entities/usuario";
import { apiFetch } from "./apiClient";

const BASE = "/api/usuarios";

async function getUsuarios(): Promise<usuario[]> {
    try {
        const response = await apiFetch(BASE);
        if (!response.ok) throw new Error(`Error fetching usuarios: ${response.statusText}`);
        return response.json();
    } catch (error) {
        console.error("Error fetching usuarios:", error);
        throw error;
    }
}

async function getUsuarioById(id_usuario: number | string): Promise<usuario> {
    try {
        if (!id_usuario) throw new Error("El id_usuario es obligatorio.");

        const response = await apiFetch(`${BASE}/${id_usuario}`);
        if (!response.ok) throw new Error(`Error fetching usuario: ${response.statusText}`);
        return response.json();
    } catch (error) {
        console.error("Error fetching usuario:", error);
        throw error;
    }
}

export { getUsuarios, getUsuarioById };
