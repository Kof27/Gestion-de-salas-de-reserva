"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { getRooms, updateRoom, deleteRoom } from "@/src/shared/api/getRooms";
import { getResources, updateResource } from "@/src/shared/api/getRecursos";
import { getReservas } from "@/src/shared/api/getReservas";

import type { reserva } from "@/src/entities/reserva";

import {
    buildRoomUpdatePayload,
    getUsuarioFromLocalStorage,
    isSalaEnabled,
    mapSalaToRoomView,
    roomHasActiveReservations,
    type RoomStatus,
    type RoomView,
} from "../lib/dashboardRoomsLib";

export function useDashboardRooms() {
    const [rooms, setRooms] = useState<RoomView[]>([]);
    const [reservas, setReservas] = useState<reserva[]>([]);

    const [roomToDelete, setRoomToDelete] = useState<RoomView | null>(null);
    const [roomToDisable, setRoomToDisable] = useState<RoomView | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingRoomId, setUpdatingRoomId] = useState<number | null>(null);
    const [deletingRoomId, setDeletingRoomId] = useState<number | null>(null);

    const loadRooms = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const usuario = getUsuarioFromLocalStorage();

            if (!usuario?.id_facultad) {
                setRooms([]);
                setReservas([]);
                setError("No se pudo identificar la facultad del usuario.");
                return;
            }

            const [roomsData, reservasData] = await Promise.all([
                getRooms(),
                getReservas(),
            ]);

            const roomsMismaFacultad = roomsData.filter(
                (room) => String(room.id_facultad) === String(usuario.id_facultad)
            );

            setReservas(reservasData);
            setRooms(roomsMismaFacultad.map(mapSalaToRoomView));
        } catch (err) {
            console.error("Error cargando salas:", err);
            setError("No se pudieron cargar las salas.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadRooms();
    }, [loadRooms]);

    const toggleStatus = async (id: number) => {
        const currentRoom = rooms.find((room) => room.id === id);

        if (!currentRoom || !currentRoom.raw.id_sala) return;
        if (updatingRoomId) return;

        const previousStatus = currentRoom.status;

        const nextStatus: RoomStatus =
            previousStatus === "habilitada" ? "inhabilitada" : "habilitada";

        const nextEstado = nextStatus === "habilitada";

        setRooms((prev) =>
            prev.map((room) =>
                room.id === id
                    ? {
                        ...room,
                        status: nextStatus,
                        raw: {
                            ...room.raw,
                            estado: nextEstado,
                        },
                    }
                    : room
            )
        );

        setUpdatingRoomId(id);

        try {
            const updatedPayload = buildRoomUpdatePayload(currentRoom, nextEstado);

            const updatedRoom = await updateRoom(
                currentRoom.raw.id_sala,
                updatedPayload
            );

            setRooms((prev) =>
                prev.map((room) =>
                    room.id === id ? mapSalaToRoomView(updatedRoom) : room
                )
            );

            toast.success("Operación exitosa", {
                description: `La sala "${updatedRoom.nombre}" fue ${isSalaEnabled(updatedRoom.estado)
                        ? "habilitada"
                        : "inhabilitada"
                    } correctamente.`,
            });
        } catch (error) {
            console.error("Error actualizando estado de sala:", error);

            setRooms((prev) =>
                prev.map((room) =>
                    room.id === id
                        ? {
                            ...room,
                            status: previousStatus,
                            raw: {
                                ...room.raw,
                                estado: previousStatus === "habilitada",
                            },
                        }
                        : room
                )
            );

            toast.error("La operación no fue exitosa", {
                description: "No se pudo actualizar el estado de la sala.",
            });
        } finally {
            setUpdatingRoomId(null);
        }
    };

    const requestToggleStatus = (room: RoomView) => {
        const isTryingToDisable = room.status === "habilitada";

        if (isTryingToDisable && roomHasActiveReservations(reservas, room.id)) {
            setRoomToDisable(room);
            return;
        }

        toggleStatus(room.id);
    };

    const confirmDisableRoom = async () => {
        if (!roomToDisable) return;

        const roomId = roomToDisable.id;

        setRoomToDisable(null);

        await toggleStatus(roomId);
    };

    const confirmDelete = (room: RoomView) => {
        setRoomToDelete(room);
    };

    const cancelDelete = () => {
        if (deletingRoomId) return;
        setRoomToDelete(null);
    };

    const cancelDisable = () => {
        if (updatingRoomId) return;
        setRoomToDisable(null);
    };

    const handleDelete = async () => {
        if (!roomToDelete) return;
        if (deletingRoomId) return;

        try {
            setDeletingRoomId(roomToDelete.id);

            const allResources = await getResources();

            const resourcesFromRoom = allResources.filter(
                (resource) => String(resource.id_sala) === String(roomToDelete.id)
            );

            for (const resource of resourcesFromRoom) {
                await updateResource(String(resource.id_recurso), {
                    id_sala: null,
                    nombre: resource.nombre,
                    descripcion: resource.descripcion,
                });
            }

            const refreshedResources = await getResources();

            const stillAssigned = refreshedResources.filter(
                (resource) => String(resource.id_sala) === String(roomToDelete.id)
            );

            if (stillAssigned.length > 0) {
                console.error("Recursos que siguen asignados:", stillAssigned);

                throw new Error(
                    `Todavía hay ${stillAssigned.length} recurso(s) asociados a la sala.`
                );
            }

            await deleteRoom(roomToDelete.id);

            toast.success("Operación exitosa", {
                description: `La sala "${roomToDelete.name}" fue eliminada correctamente y los dispositivos fueron desasignados.`,
            });

            setRooms((prev) => prev.filter((room) => room.id !== roomToDelete.id));
            setRoomToDelete(null);
        } catch (error) {
            console.error("Error eliminando sala:", error);

            toast.error("La operación no fue exitosa", {
                description:
                    error instanceof Error
                        ? error.message
                        : "No se pudo eliminar la sala y desasignar sus dispositivos.",
            });
        } finally {
            setDeletingRoomId(null);
        }
    };

    return {
        rooms,
        roomToDelete,
        roomToDisable,

        loading,
        error,
        updatingRoomId,
        deletingRoomId,

        requestToggleStatus,
        confirmDisableRoom,
        cancelDisable,

        confirmDelete,
        cancelDelete,
        handleDelete,

        reloadRooms: loadRooms,
    };
}