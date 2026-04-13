import { Resource } from "@/src/entities/recurso";

const API_URL = "https://69dd25bd84f912a26404d50c.mockapi.io/recurso_tecnologico";

async function getResources(): Promise<Resource[]> {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Error fetching resources: ${response.statusText}`);
        }

        const data: Resource[] = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching resources:", error);
        throw error;
    }
}

async function getResourceById(id: string): Promise<Resource> {
    try {
        const response = await fetch(`${API_URL}/${id}`);

        if (!response.ok) {
            throw new Error(`Error fetching resource: ${response.statusText}`);
        }

        const data: Resource = await response.json();
        return data;
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
        const response = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(resource),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error updating resource: ${response.status} ${errorText}`);
        }

        const data: Resource = await response.json();
        return data;
    } catch (error) {
        console.error("Error updating resource:", error);
        throw error;
    }
}

export { getResources, getResourceById, updateResource };
