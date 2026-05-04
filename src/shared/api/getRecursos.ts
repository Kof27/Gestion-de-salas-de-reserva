import { Resource } from "@/src/entities/recurso";

const API_URL = "http://localhost:4000/api/recursos";

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

async function getResources(): Promise<Resource[]> {
    try {
        const response = await fetch(API_URL, {
            headers: getHeaders(),
        });

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
        const response = await fetch(`${API_URL}/${id}`, {
            headers: getHeaders(),
        });

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
            headers: getHeaders(),
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
