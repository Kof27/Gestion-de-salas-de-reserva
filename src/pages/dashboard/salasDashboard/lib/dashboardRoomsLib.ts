import type { Sala } from "@/src/entities/room";
import type { reserva } from "@/src/entities/reserva";

export type RoomStatus = "habilitada" | "inhabilitada";

export type RoomView = {
    id: number;
    name: string;
    location: string;
    capacity: number;
    status: RoomStatus;
    raw: Sala;
};

export type UsuarioSesion = {
    id_usuario: number;
    id_facultad: number;
    id_rol: number;
    nombre: string;
    correo: string;
};

export function getUsuarioFromLocalStorage(): UsuarioSesion | null {
    if (typeof window === "undefined") return null;

    const storedUser = localStorage.getItem("usuario");

    if (!storedUser) return null;

    try {
        return JSON.parse(storedUser) as UsuarioSesion;
    } catch (error) {
        console.error("Error leyendo usuario desde localStorage:", error);
        return null;
    }
}

export function isSalaEnabled(estado: unknown) {
    if (typeof estado === "boolean") return estado;

    return String(estado).toLowerCase().trim() === "activo";
}

export function mapSalaToRoomView(room: Sala): RoomView {
    return {
        id: Number(room.id_sala ?? 0),
        name: room.nombre,
        location: room.ubicacion,
        capacity: room.capacidad,
        status: isSalaEnabled(room.estado) ? "habilitada" : "inhabilitada",
        raw: {
            ...room,
            estado: isSalaEnabled(room.estado),
        },
    };
}

export function roomHasActiveReservations(
    reservas: reserva[],
    roomId: number
) {
    return reservas.some(
        (reservaItem) =>
            String(reservaItem.id_sala) === String(roomId) &&
            reservaItem.estado === true
    );
}

export function buildRoomUpdatePayload(
    room: RoomView,
    enabled: boolean
): Omit<Sala, "id_sala"> {
    return {
        id_facultad: room.raw.id_facultad,
        capacidad: room.raw.capacidad,
        estado: enabled,
        fecha_creacion: room.raw.fecha_creacion,
        imagen_sala: room.raw.imagen_sala,
        nombre: room.raw.nombre,
        ubicacion: room.raw.ubicacion,
        descripcion: room.raw.descripcion,
    };
}