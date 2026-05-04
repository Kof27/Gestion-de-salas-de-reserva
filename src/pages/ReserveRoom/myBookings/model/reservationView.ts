export type ReservationStatus = "active" | "past" | "cancelled";

export type ReservationView = {
    id: number | string;
    title: string;
    location: string;
    dateLabel: string;
    fecha: string;        // "7 may 2025"
    horaInicio: string;   // "10:00"
    horaFin: string;      // "11:00"
    status: ReservationStatus;
    motivo: string;
    // Info de la sala para el popup
    capacidad: number;
    descripcion: string;
    imagenSala: string;
    estadoSala: boolean;
};
