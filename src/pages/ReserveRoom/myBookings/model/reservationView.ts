import type { Resource } from "@/src/entities/recurso";

export type ReservationStatus = "active" | "past" | "cancelled";

export type ReservationView = {
    id: number | string;
    id_sala: number;
    title: string;
    location: string;
    dateLabel: string;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    status: ReservationStatus;
    motivo: string;
    capacidad: number;
    descripcion: string;
    imagenSala: string;
    estadoSala: boolean;
    recursos: Resource[];
};
