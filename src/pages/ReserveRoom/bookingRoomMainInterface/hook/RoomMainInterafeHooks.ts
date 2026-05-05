"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getRooms } from "@/src/shared/api/getRooms";
import type { Sala } from "@/src/entities/room";

export type RoomStatusFilter = "all" | "available" | "unavailable";

export function useRoomBooking() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<RoomStatusFilter>("all");
    const [rooms, setRooms] = useState<Sala[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedRoom, setSelectedRoom] = useState<Sala | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchRooms = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await getRooms();
            setRooms(data);
        } catch (err) {
            console.error("Error al cargar las salas:", err);
            setError("Error al cargar las salas");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRooms();
    }, [fetchRooms]);

    const filteredRooms = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        return rooms.filter((room) => {
            const matchesSearch = !normalizedSearch || room.nombre.toLowerCase().includes(normalizedSearch);
            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "available" && room.estado) ||
                (statusFilter === "unavailable" && !room.estado);
            return matchesSearch && matchesStatus;
        });
    }, [search, statusFilter, rooms]);

    const handleReservar = useCallback((room: Sala) => {
        setSelectedRoom(room);
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedRoom(null);
    }, []);

    return {
        search,
        setSearch,
        statusFilter,
        setStatusFilter,

        rooms,
        filteredRooms,

        loading,
        error,

        selectedRoom,
        isModalOpen,

        handleReservar,
        handleCloseModal,
        reloadRooms: fetchRooms,
    };
}