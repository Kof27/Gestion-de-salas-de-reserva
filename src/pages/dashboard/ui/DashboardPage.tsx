"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import  Navbar  from "@/src/widgets/navbar/ui/Navbar";
import { Sidebar } from "@/src/widgets/sidebar/ui/Sidebar";
import { getRooms, updateRoom, deleteRoom } from "@/src/shared/api/getRooms";
import { getResources, updateResource } from "@/src/shared/api/getRecursos";
import type { Sala } from "@/src/entities/room";

type RoomStatus = "habilitada" | "inhabilitada";

type RoomView = {
    id: string;
    name: string;
    location: string;
    capacity: number;
    status: RoomStatus;
    raw: Sala;
};

function getUsuarioFromLocalStorage() {
    if (typeof window === "undefined") return null;

    const storedUser = localStorage.getItem("usuario");

    if (!storedUser) return null;

    try {
        return JSON.parse(storedUser) as {
            id_usuario: number;
            id_facultad: number;
            id_rol: number;
            nombre: string;
            correo: string;
        };
    } catch (error) {
        console.error("Error leyendo usuario desde localStorage:", error);
        return null;
    }
}

export const DashboardPage = () => {
    const [rooms, setRooms] = useState<RoomView[]>([]);
    const [roomToDelete, setRoomToDelete] = useState<RoomView | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingRoomId, setUpdatingRoomId] = useState<string | null>(null);
    const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);

    const mapSalaToRoomView = (room: Sala): RoomView => ({
        id: room.id_sala ?? "",
        name: room.nombre,
        location: room.ubicacion,
        capacity: room.capacidad,
        status: room.estado ? "habilitada" : "inhabilitada",
        raw: room,
    });

    useEffect(() => {
        const loadRooms = async () => {
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

                const roomsMismaFacultad = data.filter(
                    (room) => String(room.id_facultad) === String(usuario.id_facultad)
                );

                setRooms(roomsMismaFacultad.map(mapSalaToRoomView));
            } catch (err) {
                console.error("Error cargando salas:", err);
                setError("No se pudieron cargar las salas.");
            } finally {
                setLoading(false);
            }
        };

        loadRooms();
    }, []);

    const toggleStatus = async (id: string) => {
        const currentRoom = rooms.find((room) => room.id === id);
        if (!currentRoom || !currentRoom.raw.id_sala) return;
        if (updatingRoomId) return;

        const previousStatus = currentRoom.status;
        const nextStatus: RoomStatus =
            previousStatus === "habilitada" ? "inhabilitada" : "habilitada";

        const optimisticRooms = rooms.map((room) =>
            room.id === id
                ? {
                    ...room,
                    status: nextStatus,
                    raw: {
                        ...room.raw,
                        estado: nextStatus === "habilitada",
                    },
                }
                : room
        );

        setRooms(optimisticRooms);
        setUpdatingRoomId(id);

        try {
            const updatedPayload: Omit<Sala, "id_sala"> = {
                id_facultad: currentRoom.raw.id_facultad,
                capacidad: currentRoom.raw.capacidad,
                estado: nextStatus === "habilitada",
                fecha_creacion: currentRoom.raw.fecha_creacion,
                imagen_sala: currentRoom.raw.imagen_sala,
                nombre: currentRoom.raw.nombre,
                ubicacion: currentRoom.raw.ubicacion,
                descripcion: currentRoom.raw.descripcion,
            };

            const updatedRoom = await updateRoom(currentRoom.raw.id_sala, updatedPayload);

            setRooms((prev) =>
                prev.map((room) =>
                    room.id === id ? mapSalaToRoomView(updatedRoom) : room
                )
            );

            toast.success("Operación exitosa", {
                description: `La sala "${updatedRoom.nombre}" fue ${updatedRoom.estado ? "habilitada" : "inhabilitada"
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

    const confirmDelete = (room: RoomView) => {
        setRoomToDelete(room);
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

            console.log(
                "Recursos a desasignar:",
                resourcesFromRoom.map((r) => ({
                    id_recurso: r.id_recurso,
                    nombre: r.nombre,
                    id_sala: r.id_sala,
                }))
            );

            // Desasignar uno por uno
            for (const resource of resourcesFromRoom) {
                const updated = await updateResource(String(resource.id_recurso), {
                    id_sala: 0,
                    nombre: resource.nombre,
                    descripcion: resource.descripcion,
                    tipo: resource.tipo,
                });

                console.log("Recurso actualizado:", updated);
            }

            // Verificar después de actualizar
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
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="flex">
                <Sidebar />

                <main className="flex-1 p-8">
                    <div className="mb-6 flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Gestión de Salas de Reuniones
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Administrar espacios disponibles para tu facultad
                            </p>
                        </div>

                        <Link
                            href="/createRoom"
                            className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600"
                        >
                            + Crear Nueva Sala
                        </Link>
                    </div>

                    {loading ? (
                        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
                            Cargando salas...
                        </div>
                    ) : error ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-red-600">
                            {error}
                        </div>
                    ) : rooms.length === 0 ? (
                        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
                            No hay salas registradas.
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                                            Nombre
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                                            Ubicación
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                                            Capacidad
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                                            Estado
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {rooms.map((room) => {
                                        const isUpdating = updatingRoomId === room.id;

                                        return (
                                            <tr
                                                key={room.id}
                                                className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                                            >
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded bg-red-50">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="h-4 w-4 text-red-400"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={1.5}
                                                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1"
                                                                />
                                                            </svg>
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-800">
                                                            {room.name}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-4 text-sm text-gray-500">
                                                    {room.location}
                                                </td>

                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-4 w-4"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={1.5}
                                                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                                                            />
                                                        </svg>
                                                        {room.capacity}
                                                    </div>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleStatus(room.id)}
                                                            disabled={isUpdating}
                                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${room.status === "habilitada"
                                                                ? "bg-red-500"
                                                                : "bg-gray-300"
                                                                } ${isUpdating ? "cursor-not-allowed opacity-70" : ""}`}
                                                        >
                                                            {isUpdating ? (
                                                                <span className="flex w-full items-center justify-center">
                                                                    <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                                                                </span>
                                                            ) : (
                                                                <span
                                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${room.status === "habilitada"
                                                                        ? "translate-x-6"
                                                                        : "translate-x-1"
                                                                        }`}
                                                                />
                                                            )}
                                                        </button>

                                                        <span
                                                            className={`text-sm ${room.status === "habilitada"
                                                                ? "text-gray-700"
                                                                : "text-gray-400"
                                                                }`}
                                                        >
                                                            {room.status === "habilitada"
                                                                ? "Habilitada"
                                                                : "Inhabilitada"}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => confirmDelete(room)}
                                                            disabled={!!deletingRoomId}
                                                            className="p-1.5 text-gray-400 transition-colors hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="h-4 w-4"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={1.5}
                                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                />
                                                            </svg>
                                                        </button>

                                                        <Link
                                                            href={`/editRoom/${room.id}`}
                                                            className="p-1.5 text-gray-400 transition-colors hover:text-blue-500"
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="h-4 w-4"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={1.5}
                                                                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                                                />
                                                            </svg>
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </div>

            {roomToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/60">
                    <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl">
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8 text-red-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                                />
                            </svg>
                        </div>

                        <h2 className="mb-3 text-xl font-bold text-gray-900">
                            ¿Eliminar Sala de Reuniones?
                        </h2>

                        <p className="mb-7 text-sm leading-relaxed text-gray-500">
                            ¿Está seguro de que desea eliminar la sala{" "}
                            <span className="font-bold text-gray-800">
                                "{roomToDelete.name}"
                            </span>
                            ? Esta acción no se puede deshacer, se perderá todo el historial
                            asociado y los dispositivos serán desasignados.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setRoomToDelete(null)}
                                disabled={!!deletingRoomId}
                                className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={!!deletingRoomId}
                                className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {deletingRoomId ? "Eliminando..." : "Eliminar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};