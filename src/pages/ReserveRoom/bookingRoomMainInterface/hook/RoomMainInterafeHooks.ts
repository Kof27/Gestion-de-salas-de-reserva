"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getRooms } from "@/src/shared/api/getRooms";
import type { Sala } from "@/src/entities/room";

export function useRoomBooking() {
    const [search, setSearch] = useState("");
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

        if (!normalizedSearch) {
            return rooms;
        }

        return rooms.filter((room) =>
            room.nombre.toLowerCase().includes(normalizedSearch)
        );
    }, [search, rooms]);

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