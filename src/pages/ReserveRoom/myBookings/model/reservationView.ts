export type ReservationStatus = "active" | "past" | "cancelled";

export type ReservationView = {
    id: number | string;
    title: string;
    location: string;
    dateLabel: string;
    status: ReservationStatus;
    motivo: string;
};