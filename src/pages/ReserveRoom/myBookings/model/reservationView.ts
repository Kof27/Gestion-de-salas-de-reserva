export type ReservationStatus = "active" | "past" | "cancelled";

export type ReservationView = {
    id: string;
    title: string;
    location: string;
    dateLabel: string;
    status: ReservationStatus;
    motivo: string;
};