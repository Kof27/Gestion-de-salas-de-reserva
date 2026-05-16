import { Log } from "@/src/entities/log";
import { apiFetch } from "./apiClient";
const API_BASE = "/api/logs";

async function getErrorMessage(response: Response) {
    const text = await response.text().catch(() => "");

    if (!text) {
        return `Error ${response.status}: ${response.statusText}`;
    }

    try {
        const data = JSON.parse(text);

        if (Array.isArray(data.errors)) {
            return `${data.msg || "Error de validación"}: ${data.errors.join(" ")}`;
        }

        return data.msg || data.message || text;
    } catch {
        return text;
    }
}

export async function getLogs(): Promise<Log[]> {
    try {
        const response = await apiFetch(API_BASE);
        if (!response.ok) {
            throw new Error(await getErrorMessage(response));
        }
        return response.json();
    } catch (error) {
        console.error("Error fetching logs:", error);
        throw error;
    }
}