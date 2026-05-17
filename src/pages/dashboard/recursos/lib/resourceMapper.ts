import type { Resource } from "@/src/entities/recurso";
import type { Sala } from "@/src/entities/room";

export type ResourceView = {
    id: string;
    id_sala: string;
    roomName: string;
    roomLocation: string;
    nombre: string;
    descripcion: string;
    tipo: string;
    raw: Resource;
};

export type ResourceFormValues = {
    id_sala: string;
    nombre: string;
    descripcion: string;
    tipo: string;
};

export function mapResourceToView(
    resource: Resource,
    rooms: Sala[]
): ResourceView {
    const room = rooms.find(
        (item) => String(item.id_sala) === String(resource.id_sala)
    );

    return {
        id: String(resource.id_recurso ?? ""),
        id_sala: resource.id_sala ? String(resource.id_sala) : "",
        roomName: room?.nombre ?? "Sin sala asignada",
        roomLocation: room?.ubicacion ?? "No asociado a una sala",
        nombre: String(resource.nombre ?? "Sin nombre"),
        descripcion: String(resource.descripcion ?? "Sin descripción"),
        tipo: String(resource.tipo ?? "Sin tipo"),
        raw: resource,
    };
}

export function getUniqueResourceTypes(resources: ResourceView[]) {
    const types = resources
        .map((resource) => resource.tipo.trim())
        .filter(Boolean);

    return Array.from(new Set(types)).sort((a, b) => a.localeCompare(b));
}

export function filterResources(params: {
    resources: ResourceView[];
    searchTerm: string;
    selectedType: string;
}) {
    const { resources, searchTerm, selectedType } = params;

    const normalizedSearch = searchTerm.toLowerCase().trim();

    return resources.filter((resource) => {
        const matchesType =
            selectedType === "todos" || resource.tipo === selectedType;

        const searchableText = [
            resource.nombre,
            resource.descripcion,
            resource.tipo,
            resource.roomName,
            resource.roomLocation,
        ]
            .join(" ")
            .toLowerCase();

        const matchesSearch =
            !normalizedSearch || searchableText.includes(normalizedSearch);

        return matchesType && matchesSearch;
    });
}

export function validateResourceForm(values: ResourceFormValues) {
    const nombre = String(values.nombre ?? "").trim();
    const descripcion = String(values.descripcion ?? "").trim();
    const tipo = String(values.tipo ?? "").trim();

    if (!nombre) {
        return "El nombre del recurso es obligatorio.";
    }

    if (!descripcion) {
        return "La descripción del recurso es obligatoria.";
    }

    if (!tipo) {
        return "El tipo del recurso es obligatorio.";
    }

    return null;
}