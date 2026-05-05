import type { Resource } from "@/src/entities/recurso";
import { apiFetch } from "./apiClient";

const BASE = "/api/recursos";

async function getResources(): Promise<Resource[]> {
    try {
        const response = await apiFetch(BASE);
        if (!response.ok) throw new Error(`Error fetching resources: ${response.statusText}`);
        return response.json();
    } catch (error) {
        console.error("Error fetching resources:", error);
        throw error;
    }
}

async function getResourceById(id: string): Promise<Resource> {
    try {
        const response = await apiFetch(`${BASE}/${id}`);
        if (!response.ok) throw new Error(`Error fetching resource: ${response.statusText}`);
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
        const response = await apiFetch(`${BASE}/${id}`, {
            method: "PUT",
            body: JSON.stringify(resource),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error updating resource: ${response.status} ${errorText}`);
        }
        return response.json();
    } catch (error) {
        console.error("Error updating resource:", error);
        throw error;
    }
}

export { getResources, getResourceById, updateResource };
