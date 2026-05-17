import type { Resource } from "@/src/entities/recurso";
import type { Sala } from "@/src/entities/room";

export type ResourceView = {
    id: string;
    id_sala: string;
    roomName: string;
    roomLocation: string;
    nombre: string;
    descripcion: string;
    raw: Resource;
};

export type ResourceFormValues = {
    id_sala: string;
    nombre: string;
    descripcion: string;
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
        raw: resource,
    };
}

export function filterResources(params: {
    resources: ResourceView[];
    searchTerm: string;
}) {
    const { resources, searchTerm } = params;

    const normalizedSearch = String(searchTerm ?? "").toLowerCase().trim();

    return resources.filter((resource) => {
        const searchableText = [
            resource.nombre,
            resource.descripcion,
            resource.roomName,
            resource.roomLocation,
        ]
            .map((value) => String(value ?? ""))
            .join(" ")
            .toLowerCase();

        return !normalizedSearch || searchableText.includes(normalizedSearch);
    });
}

export function validateResourceForm(values: ResourceFormValues) {
    const nombre = String(values.nombre ?? "").trim();
    const descripcion = String(values.descripcion ?? "").trim();

    if (!nombre) {
        return "El nombre del recurso es obligatorio.";
    }

    if (!descripcion) {
        return "La descripción del recurso es obligatoria.";
    }

    return null;
}