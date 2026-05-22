import type { Resource } from "@/src/entities/recurso";
import { apiFetch } from "./apiClient";

const BASE = "/api/recursos";

export type ResourcePayload = Omit<Resource, "id_recurso">;

async function getResources(): Promise<Resource[]> {
    try {
        const response = await apiFetch(BASE);

        if (!response.ok) {
            throw new Error(`Error fetching resources: ${response.statusText}`);
        }

        return response.json();
    } catch (error) {
        console.error("Error fetching resources:", error);
        throw error;
    }
}

async function getResourceById(id: string): Promise<Resource> {
    try {
        const response = await apiFetch(`${BASE}/${id}`);

        if (!response.ok) {
            throw new Error(`Error fetching resource: ${response.statusText}`);
        }

        return response.json();
    } catch (error) {
        console.error("Error fetching resource:", error);
        throw error;
    }
}

async function updateResource(
    id: string,
    resource: Omit<Resource, "id_recurso">
): Promise<Resource> {
    try {
        console.log("ID recibido en updateResource:", id);
        console.log("URL usada:", `${BASE}/${id}`);
        console.log("Datos enviados:", resource);

        const response = await apiFetch(`${BASE}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(resource),
        });

        if (!response.ok) {
            const errorText = await response.text();

            console.error("Respuesta del backend:", errorText);

            throw new Error(
                `Error updating resource: ${response.status} ${errorText}`
            );
        }

        return response.json();
    } catch (error) {
        console.error("Error updating resource:", error);
        throw error;
    }
}

async function createResource(resource: ResourcePayload): Promise<Resource> {
    try {
        const response = await apiFetch(BASE, {
            method: "POST",
            body: JSON.stringify(resource),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error creating resource: ${response.status} ${errorText}`);
        }

        return response.json();
    } catch (error) {
        console.error("Error creating resource:", error);
        throw error;
    }
}

async function deleteResource(id: string | number): Promise<void> {
    try {
        const response = await apiFetch(`${BASE}/${id}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error deleting resource: ${response.status} ${errorText}`);
        }
    } catch (error) {
        console.error("Error deleting resource:", error);
        throw error;
    }
}

export {
    getResources,
    getResourceById,
    updateResource,
    createResource,
    deleteResource,
};