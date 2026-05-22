"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getRooms } from "@/src/shared/api/getRooms";
import type { Sala } from "@/src/entities/room";

export type RoomStatusFilter = "all" | "available" | "unavailable";

type UsuarioSesion = {
    id_usuario: number | string;
    id_facultad: number | string;
    id_rol?: number | string;
    nombre?: string;
    correo?: string;
};

function getUsuarioFromLocalStorage(): UsuarioSesion | null {
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

            const usuario = getUsuarioFromLocalStorage();

            if (!usuario?.id_facultad) {
                setRooms([]);
                setError("No se pudo identificar la facultad del usuario.");
                return;
            }

            const data = await getRooms();

            const roomsMismaFacultad = data.filter((room) => {
                return String(room.id_facultad) === String(usuario.id_facultad);
            });

            setRooms(roomsMismaFacultad);
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
            const matchesSearch =
                !normalizedSearch ||
                room.nombre.toLowerCase().includes(normalizedSearch) ||
                room.ubicacion.toLowerCase().includes(normalizedSearch);

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