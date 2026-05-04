"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { getReservas, cancelarReserva } from "@/src/shared/api/getReservas";
import { getRooms } from "@/src/shared/api/getRooms";

import type { FilterStatus, ReservationView } from "../lib/bookingMapper";
import { mapReservaToView } from "../lib/bookingMapper";

export function useAllBookings() {
    const [reservations, setReservations] = useState<ReservationView[]>([]);
    const [reservationToDelete, setReservationToDelete] = useState<ReservationView | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [deletingReservationId, setDeletingReservationId] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<FilterStatus>("todas");

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [reservasData, roomsData] = await Promise.all([getReservas(), getRooms()]);

                setReservations(reservasData.map((item) => mapReservaToView(item, roomsData)));
            } catch (err) {
                console.error("Error cargando reservas:", err);
                setError("No se pudieron cargar las reservas.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const filteredReservations = useMemo(() => {
        return reservations.filter((reservation) => {
            const search = searchTerm.toLowerCase().trim();

            const matchesSearch =
                reservation.roomName.toLowerCase().includes(search) ||
                reservation.location.toLowerCase().includes(search);

            const matchesStatus =
                statusFilter === "todas"
                    ? true
                    : statusFilter === "activas"
                        ? reservation.status === "activa"
                        : reservation.status === "cancelada";

            return matchesSearch && matchesStatus;
        });
    }, [reservations, searchTerm, statusFilter]);

    const openDeleteModal = (reservation: ReservationView) => {
        setReservationToDelete(reservation);
    };

    const closeDeleteModal = () => {
        setReservationToDelete(null);
    };

    const handleDelete = async () => {
        if (!reservationToDelete) return;
        if (deletingReservationId) return;

        try {
            setDeletingReservationId(reservationToDelete.id);

            await cancelarReserva(reservationToDelete.raw);

            setReservations((prev) =>
                prev.map((item) =>
                    item.id === reservationToDelete.id
                        ? {
                            ...item,
                            status: "cancelada",
                            raw: {
                                ...item.raw,
                                estado: false,
                            },
                        }
                        : item
                )
            );

            toast.success("Operación exitosa", {
                description: `La reserva de la sala "${reservationToDelete.roomName}" fue cancelada correctamente.`,
            });

            setReservationToDelete(null);
        } catch (error) {
            console.error("Error cancelando reserva:", error);

            toast.error("La operación no fue exitosa", {
                description: "No se pudo cancelar la reserva.",
            });
        } finally {
            setDeletingReservationId(null);
        }
    };

    return {
        reservations,
        filteredReservations,
        reservationToDelete,
        loading,
        error,
        deletingReservationId,
        searchTerm,
        statusFilter,
        setSearchTerm,
        setStatusFilter,
        openDeleteModal,
        closeDeleteModal,
        handleDelete,
    };
}