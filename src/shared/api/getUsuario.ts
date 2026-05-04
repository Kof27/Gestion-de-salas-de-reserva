import { usuario } from "@/src/entities/usuario";

const API_URL = "http://localhost:4000/api/usuarios";

// Obtener token del localStorage
const getToken = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("token");
    }

    return null;
};

// Headers con autenticación
const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
});

async function getUsuarios(): Promise<usuario[]> {
    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: getHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Error fetching usuarios: ${response.statusText}`);
        }

        const data: usuario[] = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching usuarios:", error);
        throw error;
    }
}

async function getUsuarioById(id_usuario: number | string): Promise<usuario> {
    try {
        if (!id_usuario) {
            throw new Error("El id_usuario es obligatorio.");
        }

        const response = await fetch(`${API_URL}/${id_usuario}`, {
            method: "GET",
            headers: getHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Error fetching usuario: ${response.statusText}`);
        }

        const data: usuario = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching usuario:", error);
        throw error;
    }
}

export { getUsuarios, getUsuarioById };